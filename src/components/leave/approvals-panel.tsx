"use client";

import { CalendarOff, Check, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalTimeline } from "@/components/leave/approval-timeline";
import { useDecideLeave, useLeaveRequests, useRequestConflicts } from "@/features/leave/leave";
import type { LeaveRequest } from "@/features/leave/types";

function ConflictHint({ id }: { id: string }) {
  const { data } = useRequestConflicts(id);
  if (!data || data.alreadyOff === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
      <Users className="size-3" />
      {data.alreadyOff} already off
    </span>
  );
}

function ApprovalCard({ request }: { request: LeaveRequest }) {
  const { approve, reject } = useDecideLeave();
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {request.employee
              ? `${request.employee.firstName} ${request.employee.lastName}`
              : request.employeeId}
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {request.type?.name ?? "Leave"} · {request.startDate} → {request.endDate} ·{" "}
            <span className="font-medium text-foreground">{request.days} days</span>
          </p>
          {request.reason ? (
            <p className="text-sm text-muted-foreground">“{request.reason}”</p>
          ) : null}
          <ConflictHint id={request.id} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reject.mutate({ id: request.id })}
            disabled={reject.isPending}
          >
            <X className="size-4" />
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => approve.mutate({ id: request.id })}
            disabled={approve.isPending}
          >
            <Check className="size-4" />
            Approve
          </Button>
        </div>
      </div>
      {request.approverChain?.length > 1 ? (
        <div className="mt-4 border-t border-border pt-3">
          <ApprovalTimeline chain={request.approverChain} />
        </div>
      ) : null}
    </div>
  );
}

export function ApprovalsPanel() {
  const { data, isLoading } = useLeaveRequests({ status: "requested" });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (!data?.length) {
    return (
      <EmptyState
        icon={CalendarOff}
        title="No pending requests"
        description="Approvals you can action will show up here."
      />
    );
  }
  return (
    <div className="space-y-3">
      {data.map((r) => (
        <ApprovalCard key={r.id} request={r} />
      ))}
    </div>
  );
}
