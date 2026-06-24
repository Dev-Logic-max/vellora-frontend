"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarOff, Plus, ScrollText, Sun, Wallet } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import type { FilterValues } from "@/components/ui/filter-modal";
import { ApprovalsPanel } from "@/components/leave/approvals-panel";
import { BalancesPanel } from "@/components/leave/balances-panel";
import { HolidayCalendar } from "@/components/leave/holiday-calendar";
import { LeaveRequestSheet } from "@/components/leave/leave-request-sheet";
import { PoliciesPanel } from "@/components/leave/policies-panel";
import { RequestsTable } from "@/components/leave/requests-table";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useLeaveRequests } from "@/features/leave/leave";
import { LEAVE_STATUS_OPTIONS } from "@/features/leave/status";
import type { LeaveRequestStatus } from "@/features/leave/types";

type TabKey = "requests" | "approvals" | "balances" | "policies" | "holidays";

const MANAGER_ROLES = ["owner", "hr", "area_manager", "store_manager"];
const ADMIN_ROLES = ["owner", "hr"];

export function LeaveView() {
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState<TabKey>("requests");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [year] = useState(new Date().getFullYear());

  const canApprove = Boolean(me?.role && MANAGER_ROLES.includes(me.role));
  const canManage = Boolean(me?.role && ADMIN_ROLES.includes(me.role));

  const status = (filters.status as LeaveRequestStatus | undefined) || undefined;
  const { data: requests, isLoading } = useLeaveRequests({ status });

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const name = `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (r.type?.name ?? "").toLowerCase().includes(q);
    });
  }, [requests, search]);

  const tabs = useMemo<SegmentedTab<TabKey>[]>(
    () => [
      { value: "requests", label: "Requests", icon: CalendarOff },
      ...(canApprove
        ? [{ value: "approvals" as const, label: "Approvals", icon: CalendarCheck }]
        : []),
      { value: "balances", label: "Balances", icon: Wallet },
      ...(canManage ? [{ value: "policies" as const, label: "Policies", icon: ScrollText }] : []),
      { value: "holidays", label: "Holidays", icon: Sun },
    ],
    [canApprove, canManage],
  );

  const statusFilterOptions = LEAVE_STATUS_OPTIONS.filter((o) => o.value !== "") as {
    value: string;
    label: string;
  }[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave"
        description="Time off requests, approvals, balances, and holidays."
        actions={
          <LeaveRequestSheet
            trigger={
              <Button>
                <Plus className="size-4" />
                Request leave
              </Button>
            }
          />
        }
      />

      <SegmentedTabs tabs={tabs} value={tab} onValueChange={setTab} layoutGroup="leave-tabs" />

      {tab === "requests" ? (
        <RequestsTable
          data={filteredRequests}
          isLoading={isLoading}
          toolbar={{
            searchValue: search,
            onSearchChange: setSearch,
            searchPlaceholder: "Search employee or leave type…",
            filters: [{ key: "status", label: "Status", type: "select", options: statusFilterOptions }],
            filterValues: filters,
            onFilterChange: setFilters,
          }}
        />
      ) : null}

      {tab === "approvals" && canApprove ? <ApprovalsPanel /> : null}
      {tab === "balances" ? <BalancesPanel year={year} canManage={canManage} /> : null}
      {tab === "policies" && canManage ? <PoliciesPanel canManage={canManage} /> : null}
      {tab === "holidays" ? <HolidayCalendar canManage={canManage} /> : null}
    </div>
  );
}
