"use client";

import { useState } from "react";
import { ArrowLeft, Check, Clock, ShieldCheck, UserCheck, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  useActivationRequests,
  useApproveActivation,
  useRejectActivation,
} from "@/features/employees/employees";
import type { ActivationRequest, ActivationRequestStatus } from "@/features/employees/types";

const TABS: SegmentedTab[] = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: Check },
  { value: "rejected", label: "Rejected", icon: X },
];

export function ActivationRequestsPanel() {
  const [tab, setTab] = useState<ActivationRequestStatus>("pending");
  const { data, isLoading } = useActivationRequests(tab);
  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User activations"
        description="Approve or reject logins created for your company. Only active users count toward your plan."
        actions={
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Employees
          </Link>
        }
      />

      <div className="scrollbar-thin overflow-x-auto pb-1">
        <SegmentedTabs
          tabs={TABS}
          value={tab}
          onValueChange={(v) => setTab(v as ActivationRequestStatus)}
          layoutGroup="activation-tabs"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState status={tab} />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ status }: { status: ActivationRequestStatus }) {
  const copy = {
    pending: "No users are waiting for activation right now.",
    approved: "No approved activations yet.",
    rejected: "No rejected activations.",
  }[status];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft/50 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          <UserCheck className="size-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">All clear</h3>
        <p className="text-sm text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

function RequestCard({ request: r }: { request: ActivationRequest }) {
  const approve = useApproveActivation();
  const reject = useRejectActivation();
  const name = r.employeeName || r.email;
  const cooldown =
    r.status === "rejected" && r.cooldownUntil && new Date(r.cooldownUntil) > new Date();

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4">
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          r.status === "pending"
            ? "bg-amber-400"
            : r.status === "approved"
              ? "bg-emerald-400"
              : "bg-rose-400",
        )}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
        <div className="flex min-w-0 items-center gap-3">
          <EntityAvatar name={name} className="avatar-ring size-11 rounded-full" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-foreground">{name}</p>
              <RoleTag role={r.requestedRole} />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {r.email}
              {r.uniqueCode ? ` · ${r.uniqueCode}` : ""}
            </p>
          </div>
        </div>

        {r.status === "pending" ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const reason = window.prompt("Reason for rejecting (optional)?") ?? undefined;
                void reject.mutate({ requestId: r.id, reason });
              }}
              disabled={reject.isPending}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <X />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => approve.mutate(r.id)}
              disabled={approve.isPending}
            >
              <ShieldCheck />
              {approve.isPending ? "Approving…" : "Approve & invite"}
            </Button>
          </div>
        ) : (
          <div className="text-right text-xs text-muted-foreground">
            {r.status === "approved" ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <Check className="size-3.5" /> Approved
              </span>
            ) : (
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 font-medium text-rose-700">
                  <X className="size-3.5" /> Rejected
                </span>
                {cooldown ? (
                  <p className="text-[11px] text-muted-foreground">
                    Can re-apply after {new Date(r.cooldownUntil!).toLocaleString()}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
      {r.status === "rejected" && r.rejectReason ? (
        <p className="mt-2 ml-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {r.rejectReason}
        </p>
      ) : null}
    </div>
  );
}
