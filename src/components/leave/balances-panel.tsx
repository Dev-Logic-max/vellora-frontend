"use client";

import { useState } from "react";
import { Settings2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ManageBalanceModal } from "@/components/leave/manage-balance-modal";
import { useLeaveBalances } from "@/features/leave/leave";

export function BalancesPanel({ year, canManage }: { year: number; canManage?: boolean }) {
  const { data, isLoading } = useLeaveBalances({ year });
  const [manageOpen, setManageOpen] = useState(false);
  const [manageEmployeeId, setManageEmployeeId] = useState<string | undefined>();

  const openManage = (employeeId?: string) => {
    setManageEmployeeId(employeeId);
    setManageOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!data?.length) {
    return (
      <>
        <EmptyState
          icon={Wallet}
          title="No balances yet"
          description="Set entitlements per employee to track time off."
          action={
            canManage ? (
              <Button onClick={() => openManage()}>
                <Settings2 />
                Manage balance
              </Button>
            ) : undefined
          }
        />
        {canManage ? (
          <ManageBalanceModal
            open={manageOpen}
            onOpenChange={setManageOpen}
            year={year}
            employeeId={manageEmployeeId}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => openManage()}>
            <Settings2 />
            Manage balance
          </Button>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((b) => {
        const entitled = Number(b.entitled);
        const taken = Number(b.taken);
        const pending = Number(b.pending);
        const remaining = entitled - taken - pending;
        const takenPct = entitled ? (taken / entitled) * 100 : 0;
        const pendingPct = entitled ? (pending / entitled) * 100 : 0;
        return (
          <div key={b.id} className="group rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate font-medium text-foreground">
                {b.employee ? `${b.employee.firstName} ${b.employee.lastName}` : b.employeeId}
              </p>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{b.type?.name}</span>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => openManage(b.employeeId)}
                    aria-label="Manage balance"
                    className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent-soft hover:text-accent-strong"
                  >
                    <Settings2 className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {remaining}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ {entitled} left</span>
            </p>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${takenPct}%` }} />
              <div className="h-full bg-warning" style={{ width: `${pendingPct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{taken} taken</span>
              <span>{pending} pending</span>
            </div>
          </div>
        );
      })}
      </div>
      {canManage ? (
        <ManageBalanceModal
          open={manageOpen}
          onOpenChange={setManageOpen}
          year={year}
          employeeId={manageEmployeeId}
        />
      ) : null}
    </div>
  );
}
