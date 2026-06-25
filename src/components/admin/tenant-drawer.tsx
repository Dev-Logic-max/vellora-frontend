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
import { FieldGroup } from "@/components/ui/field-group";
import { FormSheet } from "@/components/ui/form-sheet";
import { PlanTag } from "@/components/ui/plan-tag";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

/**
 * Tenant configuration sheet (platform). A standardized `lg` right-sheet:
 * gradient header, grouped sections (plan assignment, lifecycle status,
 * impersonation), and a footer Close. Cross-tenant — gated by the PlatformGuard.
 */
export function TenantDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: tenant, isLoading } = useTenant(id);
  const { data: plans } = useAdminPlans();
  const assignPlan = useAssignPlan();
  const setStatus = useSetTenantStatus();
  const impersonate = useStartImpersonation();
  const [planId, setPlanId] = useState("");

  return (
    <FormSheet
      open={Boolean(id)}
      onOpenChange={(open) => !open && onClose()}
      title={tenant?.name ?? "Tenant"}
      subtitle="Platform configuration"
    >
      {isLoading || !tenant ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Snapshot */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle/40 px-4 py-3">
            <StatusPill status={tenant.status} />
            <span className="text-sm text-muted-foreground">
              {tenant.employees} employees · {tenant.stores ?? 0} stores
            </span>
          </div>

          {/* Plan assignment */}
          <FieldGroup title="Plan">
            <div className="col-span-full space-y-2">
              <p className="text-sm text-foreground-2">
                Current: <PlanTag plan={tenant.subscription?.plan?.name} />
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
            </div>
          </FieldGroup>

          {/* Lifecycle status */}
          <FieldGroup title="Lifecycle status">
            <div className="col-span-full flex flex-wrap gap-2">
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
          </FieldGroup>

          {/* Impersonation */}
          <FieldGroup title="Impersonation">
            <div className="col-span-full space-y-2">
              <p className="text-xs text-muted-foreground">
                Start an audited impersonation session to view this tenant&apos;s workspace. A banner
                shows while active.
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
            </div>
          </FieldGroup>
        </div>
      )}
    </FormSheet>
  );
}
