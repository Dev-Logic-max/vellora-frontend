"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock,
  Flag,
  Inbox,
  LifeBuoy,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { GradientHeaderCard } from "@/components/ui/gradient-header-card";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import {
  ActionStatusTag,
  PriorityTag,
  RequestStatusTag,
  RequestTypeTag,
} from "@/components/requests/request-tags";
import { RequestDetailSheet } from "@/components/admin/request-detail-sheet";
import { cn } from "@/lib/utils";
import { useAdminRequests } from "@/features/requests/requests";
import type { AdminPlatformRequest, PlatformRequestType } from "@/features/requests/types";

type RequestFilter = "all" | "approvals" | "reports" | "queries";

const FILTERS: SegmentedTab<RequestFilter>[] = [
  { value: "all", label: "All", icon: Inbox },
  { value: "approvals", label: "Approvals", icon: ShieldCheck },
  { value: "reports", label: "Reports", icon: Flag },
  { value: "queries", label: "Queries", icon: LifeBuoy },
];

const TYPES_BY_FILTER: Record<RequestFilter, PlatformRequestType[] | null> = {
  all: null,
  approvals: ["company_deletion"],
  reports: ["report", "billing"],
  queries: ["query", "support", "feature"],
};

/**
 * Admin → Requests. The live tenant→platform inbox (platform_requests). Stat
 * tiles, a category filter, and a table with colored category/priority/record-
 * status/action-status tags. Rows open a detail sheet to respond / resolve /
 * approve-deletion.
 */
export function RequestsTab() {
  const { data, isLoading } = useAdminRequests();
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = data ?? [];
    const types = TYPES_BY_FILTER[filter];
    return types ? list.filter((r) => types.includes(r.type)) : list;
  }, [data, filter]);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      pending: list.filter((r) => r.status === "received" || r.status === "in_review").length,
      approvals: list.filter((r) => r.type === "company_deletion").length,
      reports: list.filter((r) => r.type === "report" || r.type === "billing").length,
      resolved: list.filter((r) => r.status === "resolved").length,
    };
  }, [data]);

  const columns = useMemo<ColumnDef<AdminPlatformRequest, unknown>[]>(
    () => [
      {
        header: "Request",
        accessorKey: "subject",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.original.subject}</p>
            <p className="truncate text-xs text-muted-foreground">
              {new Date(row.original.createdAt).toLocaleString()}
            </p>
          </div>
        ),
      },
      {
        header: "Company",
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <EntityAvatar
              name={row.original.companyName}
              className="size-7 rounded-lg"
              textClassName="text-[10px]"
            />
            <span className="truncate text-foreground">{row.original.companyName ?? "—"}</span>
          </span>
        ),
      },
      {
        header: "Category",
        cell: ({ row }) => <RequestTypeTag type={row.original.type} module={row.original.module} />,
      },
      {
        header: "Priority",
        cell: ({ row }) => <PriorityTag priority={row.original.priority} />,
      },
      {
        header: "Status",
        cell: ({ row }) => <RequestStatusTag status={row.original.status} />,
      },
      {
        header: "Action",
        cell: ({ row }) => <ActionStatusTag status={row.original.actionStatus} />,
      },
      {
        id: "actions",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpenId(row.original.id)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent-soft"
            >
              Review
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const open = (data ?? []).find((r) => r.id === openId) ?? null;

  return (
    <div className="space-y-6">
      <GradientHeaderCard
        title="Platform requests"
        description="One inbox for everything tenants send up to the platform — approvals, reports, and user queries. Review, respond, and keep an audit trail."
        icon={<Inbox className="size-5" />}
        pattern="hexagons"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Pending" value={stats.pending} icon={Clock} tone="bg-amber-50 text-amber-600" />
        <StatTile
          label="Approvals"
          value={stats.approvals}
          icon={ShieldCheck}
          tone="bg-violet-50 text-violet-600"
        />
        <StatTile label="Reports" value={stats.reports} icon={Flag} tone="bg-rose-50 text-rose-600" />
        <StatTile
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <SegmentedTabs
        tabs={FILTERS}
        value={filter}
        onValueChange={setFilter}
        layoutGroup="admin-requests"
      />

      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox is clear"
          description="Tenant approvals, reports and queries will land here for review."
        />
      ) : (
        <DataTableShell columns={columns} data={rows} isLoading={isLoading} />
      )}

      <RequestDetailSheet
        request={open}
        open={Boolean(openId)}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <span className={cn("flex size-9 items-center justify-center rounded-lg", tone)}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold text-foreground tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
