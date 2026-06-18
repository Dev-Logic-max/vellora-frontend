"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const MANAGER_ROLES = ["owner", "hr", "area_manager", "store_manager"];
const ADMIN_ROLES = ["owner", "hr"];

export function LeaveView() {
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState("requests");
  const [status, setStatus] = useState<LeaveRequestStatus | "">("");
  const [year] = useState(new Date().getFullYear());

  const canApprove = Boolean(me?.role && MANAGER_ROLES.includes(me.role));
  const canManage = Boolean(me?.role && ADMIN_ROLES.includes(me.role));

  const { data: requests, isLoading } = useLeaveRequests({ status: status || undefined });

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

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList variant="line" className="w-max">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          {canApprove ? <TabsTrigger value="approvals">Approvals</TabsTrigger> : null}
          <TabsTrigger value="balances">Balances</TabsTrigger>
          {canManage ? <TabsTrigger value="policies">Policies</TabsTrigger> : null}
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 pt-2">
          <div className="flex">
            <SelectField
              id="leave-status-filter"
              className="sm:w-44"
              options={LEAVE_STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as LeaveRequestStatus | "")}
            />
          </div>
          <RequestsTable data={requests ?? []} isLoading={isLoading} />
        </TabsContent>

        {canApprove ? (
          <TabsContent value="approvals" className="pt-2">
            <ApprovalsPanel />
          </TabsContent>
        ) : null}

        <TabsContent value="balances" className="pt-2">
          <BalancesPanel year={year} />
        </TabsContent>

        {canManage ? (
          <TabsContent value="policies" className="pt-2">
            <PoliciesPanel canManage={canManage} />
          </TabsContent>
        ) : null}

        <TabsContent value="holidays" className="pt-2">
          <HolidayCalendar canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
