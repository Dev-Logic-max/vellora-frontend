"use client";

import { UserCog } from "lucide-react";
import { useState } from "react";

import {
  useAdminPlans,
  useAssignPlan,
  useSetTenantStatus,
  useStartImpersonation,
  useTenant,
} from "@/features/admin/admin";
import { setImpersonation } from "@/features/admin/impersonation";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

export function TenantDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: tenant, isLoading } = useTenant(id);
  const { data: plans } = useAdminPlans();
  const assignPlan = useAssignPlan();
  const setStatus = useSetTenantStatus();
  const impersonate = useStartImpersonation();
  const [planId, setPlanId] = useState("");

  return (
    <Sheet open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{tenant?.name ?? "Tenant"}</SheetTitle>
          <SheetDescription>{tenant?.slug ?? "—"}</SheetDescription>
        </SheetHeader>

        {isLoading || !tenant ? (
          <div className="space-y-3 px-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-6 px-4 pb-8">
            <div className="flex items-center justify-between">
              <StatusPill status={tenant.status} />
              <span className="text-sm text-muted-foreground">
                {tenant.employees} employees
              </span>
            </div>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Plan
              </h3>
              <p className="text-sm text-foreground">
                Current: {tenant.subscription?.plan?.name ?? "Free"}
              </p>
              <div className="flex gap-2">
                <SelectField
                  id="assign-plan"
                  className="flex-1"
                  options={(plans ?? []).map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="Select plan…"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                />
                <Button
                  size="sm"
                  className="self-end"
                  disabled={!planId || assignPlan.isPending}
                  onClick={() => assignPlan.mutate({ id: tenant.id, planId })}
                >
                  Assign
                </Button>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Button
                    key={s.value}
                    size="sm"
                    variant={tenant.status === s.value ? "default" : "outline"}
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: tenant.id, status: s.value })}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Impersonate
              </h3>
              <p className="text-xs text-muted-foreground">
                Start an audited impersonation session. A banner shows while active.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={impersonate.isPending}
                onClick={() =>
                  impersonate.mutate(tenant.id, {
                    onSuccess: (state) => {
                      setImpersonation(state);
                      onClose();
                    },
                  })
                }
              >
                <UserCog className="size-4" />
                Impersonate
              </Button>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
