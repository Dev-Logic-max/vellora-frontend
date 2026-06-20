"use client";

import { useState } from "react";
import { ClipboardList, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeDrawer } from "@/components/onboarding/employee-drawer";
import { ProgressRing } from "@/components/onboarding/progress-ring";
import { useEmployees } from "@/features/employees/employees";
import { useAssign, useOnboardingOverview } from "@/features/onboarding/onboarding";
import type { OverviewRow } from "@/features/onboarding/types";

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function OverviewPanel({ canManage }: { canManage: boolean }) {
  const { data, isLoading } = useOnboardingOverview();
  const { data: employeesPage } = useEmployees({ pageSize: 200 });
  const assignAll = useAssign();
  const [selected, setSelected] = useState<OverviewRow | null>(null);
  const [open, setOpen] = useState(false);

  const openDrawer = (row: OverviewRow) => {
    setSelected(row);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="In progress" value={data?.kpis.inProgress ?? 0} />
        <Kpi label="Completed" value={data?.kpis.completed ?? 0} />
        <Kpi label="Not started" value={data?.kpis.notStarted ?? 0} />
      </div>

      {canManage ? (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={assignAll.isPending || !employeesPage?.data.length}
            onClick={() =>
              assignAll.mutate({
                employeeIds: employeesPage?.data.map((e) => e.id) ?? [],
                onlyMissing: true,
              })
            }
          >
            <UserPlus className="size-4" />
            Assign to all
          </Button>
        </div>
      ) : null}

      {!data?.employees.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No onboarding in progress"
          description="Assign checklist tasks to employees to track progress here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.employees.map((row) => (
            <button
              key={row.employeeId}
              type="button"
              onClick={() => openDrawer(row)}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:bg-surface-subtle"
            >
              <ProgressRing value={row.progress} />
              <div>
                <p className="font-medium text-foreground">
                  {row.employee
                    ? `${row.employee.firstName} ${row.employee.lastName}`
                    : row.employeeId}
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {row.done}/{row.total} tasks done
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <EmployeeDrawer
        employeeId={selected?.employeeId ?? null}
        name={
          selected?.employee
            ? `${selected.employee.firstName} ${selected.employee.lastName}`
            : "Employee"
        }
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
