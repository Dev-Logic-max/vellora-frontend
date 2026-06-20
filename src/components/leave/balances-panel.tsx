"use client";

import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveBalances } from "@/features/leave/leave";

export function BalancesPanel({ year }: { year: number }) {
  const { data, isLoading } = useLeaveBalances({ year });

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
      <EmptyState
        icon={Wallet}
        title="No balances yet"
        description="Set entitlements per employee to track time off."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((b) => {
        const entitled = Number(b.entitled);
        const taken = Number(b.taken);
        const pending = Number(b.pending);
        const remaining = entitled - taken - pending;
        const takenPct = entitled ? (taken / entitled) * 100 : 0;
        const pendingPct = entitled ? (pending / entitled) * 100 : 0;
        return (
          <div key={b.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">
                {b.employee ? `${b.employee.firstName} ${b.employee.lastName}` : b.employeeId}
              </p>
              <span className="text-xs text-muted-foreground">{b.type?.name}</span>
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
  );
}
