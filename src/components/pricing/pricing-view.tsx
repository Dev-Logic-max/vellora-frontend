"use client";

import { useState } from "react";
import { Eye, Pencil, ShieldAlert, Sparkles, Tags } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanSlider, type PlanInterval } from "@/components/billing/plan-slider";
import { PlanEditDialog } from "@/components/pricing/plan-edit-dialog";
import { cn } from "@/lib/utils";
import { useAdminPlans } from "@/features/billing/billing";
import { useCurrentUser } from "@/features/session/use-current-user";
import type { Plan } from "@/features/billing/types";

/**
 * Pricing module (super-admin). Edit the global plan catalogue — prices, caps,
 * features, popular/active flags — that powers the registration + company-create
 * cards. Backend PlatformGuard is the real gate.
 */
export function PricingView() {
  const { data: me, isLoading: meLoading } = useCurrentUser();
  const isPlatform = Boolean(me?.platformRole);
  const { data: plans, isLoading } = useAdminPlans();
  const [interval, setInterval] = useState<PlanInterval>("month");
  const [editing, setEditing] = useState<Plan | null>(null);

  if (!meLoading && !isPlatform) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pricing" description="Plan catalogue." />
        <EmptyState
          icon={ShieldAlert}
          title="Platform access only"
          description="The pricing catalogue is restricted to Vellora platform operators."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        description="The plan catalogue shown on registration and company creation. Edits are live."
      />

      {/* Live preview of the public cards (active plans only). */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Eye className="size-4 text-muted-foreground" />
          Customer preview
        </div>
        <PlanSlider
          plans={(plans ?? []).filter((p) => p.isActive)}
          interval={interval}
          onIntervalChange={setInterval}
        />
      </section>

      {/* Editable plan rows. */}
      <section className="space-y-3">
        <h2 className="font-display text-sm font-semibold text-foreground">All plans</h2>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plans
              .slice()
              .sort((a, b) => (a.sortOrder ?? a.tier) - (b.sortOrder ?? b.tier))
              .map((plan) => (
                <PlanAdminCard key={plan.id} plan={plan} onEdit={() => setEditing(plan)} />
              ))}
          </div>
        ) : (
          <EmptyState icon={Tags} title="No plans yet" description="Seed the catalogue to begin." />
        )}
      </section>

      <PlanEditDialog plan={editing} open={Boolean(editing)} onClose={() => setEditing(null)} />
    </div>
  );
}

function PlanAdminCard({ plan, onEdit }: { plan: Plan; onEdit: () => void }) {
  const limits = plan.limitsJson ?? {};
  const cap = (n?: number) => (n === undefined ? "—" : n < 0 ? "∞" : n);
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-surface p-4 transition-shadow hover:shadow-sm",
        plan.isActive ? "border-border" : "border-dashed border-border opacity-70",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-base font-semibold text-foreground">{plan.name}</h3>
            {plan.popular ? <Sparkles className="size-3.5 text-primary" /> : null}
          </div>
          <p className="text-xs text-muted-foreground">{plan.tagline ?? plan.key}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit plan">
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="mt-2 flex items-end gap-1">
        <span className="font-display text-xl font-bold text-foreground">
          {Number(plan.priceMonth) === 0 ? "Free" : `$${Number(plan.priceMonth)}`}
        </span>
        {Number(plan.priceMonth) > 0 ? (
          <span className="mb-0.5 text-xs text-muted-foreground">/mo</span>
        ) : null}
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border/70 pt-3 text-center">
        <Cap label="Employees" value={cap(limits.employees)} />
        <Cap label="Stores" value={cap(limits.stores)} />
        <Cap label="Devices" value={cap(limits.devices)} />
      </dl>

      {!plan.isActive ? (
        <span className="mt-3 inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Hidden
        </span>
      ) : null}
    </div>
  );
}

function Cap({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="font-display text-sm font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  );
}
