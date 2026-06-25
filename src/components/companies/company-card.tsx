"use client";

import { ArrowRight, Store, Users } from "lucide-react";

import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Flag } from "@/components/ui/flag";
import { PlanTag } from "@/components/ui/plan-tag";
import { StatusPill } from "@/components/ui/status-pill";
import { useRouter } from "@/i18n/navigation";
import { countryCode } from "@/lib/geo/countries";
import type { Company } from "@/features/org/types";

/**
 * A premium company card (default companies view). Banner strip + overlapping
 * logo, name + flag, owner, plan tag, store/employee stats, and an Open button
 * that routes to the company detail page. 2-up on large screens (grid handled by
 * the parent).
 */
export function CompanyCard({ company }: { company: Company }) {
  const router = useRouter();
  const cc = countryCode(company.country);
  const open = () => router.push(`/companies/${company.id}`);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      {/* Banner strip — image or theme gradient. */}
      <div className="relative h-24 w-full overflow-hidden">
        {company.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.bannerUrl} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="size-full"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgb(var(--accent) / 0.85), rgb(var(--tertiary-accent) / 0.7) 55%, rgb(var(--secondary-accent) / 0.8))",
            }}
          />
        )}
        <span className="absolute right-3 top-3">
          <StatusPill status={company.status} />
        </span>
      </div>

      <div className="px-5 pb-5">
        {/* Logo overlapping the banner; name + flag. */}
        <div className="-mt-7 flex items-end gap-3">
          <EntityAvatar
            name={company.name}
            src={company.logoUrl}
            className="size-14 rounded-xl ring-4 ring-surface"
          />
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-base font-semibold text-foreground">
                {company.name}
              </h3>
              {cc ? <Flag code={cc} className="h-3 w-4.5 shrink-0 rounded-xs" /> : null}
            </div>
            <PlanTag plan={company.planName} className="mt-1" />
          </div>
        </div>

        {/* Owner */}
        <div className="mt-4 flex items-center gap-2">
          {company.ownerName ? (
            <>
              <EntityAvatar
                name={company.ownerName}
                src={company.ownerAvatarUrl}
                className="size-6 rounded-full"
                textClassName="text-[9px]"
              />
              <span className="truncate text-sm text-foreground-2">{company.ownerName}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No owner</span>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-subtle/40 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Store className="size-3.5" /> Stores
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold text-foreground tabular-nums">
              {company.storeCount ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-subtle/40 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" /> Employees
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-foreground tabular-nums">
                {company.employeeCount ?? 0}
              </span>
              <AvatarStack
                items={company.employeeAvatars ?? []}
                total={company.employeeCount ?? 0}
                max={3}
              />
            </div>
          </div>
        </div>

        <Button onClick={open} className="mt-4 w-full">
          Open
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
