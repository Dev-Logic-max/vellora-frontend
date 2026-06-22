"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarOff } from "lucide-react";

import { DataTableShell, type TableToolbarConfig } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { LeavePill } from "@/components/leave/leave-pill";
import type { LeaveRequest } from "@/features/leave/types";

const columns: ColumnDef<LeaveRequest, unknown>[] = [
  {
    header: "Employee",
    cell: ({ row }) => {
      const e = row.original.employee;
      return (
        <span className="font-medium text-foreground">
          {e ? `${e.firstName} ${e.lastName}` : row.original.employeeId}
        </span>
      );
    },
  },
  { header: "Type", accessorFn: (r) => r.type?.name ?? "—" },
  {
    header: "Dates",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.startDate} → {row.original.endDate}
      </span>
    ),
  },
  {
    header: "Days",
    cell: ({ row }) => <span className="tabular-nums">{row.original.days}</span>,
  },
  { header: "Status", cell: ({ row }) => <LeavePill status={row.original.status} /> },
];

export function RequestsTable({
  data,
  isLoading,
  toolbar,
}: {
  data: LeaveRequest[];
  isLoading: boolean;
  toolbar?: TableToolbarConfig;
}) {
  return (
    <DataTableShell
      columns={columns}
      data={data}
      isLoading={isLoading}
      toolbar={toolbar}
      empty={
        <EmptyState
          icon={CalendarOff}
          title="No leave requests"
          description="Requests will appear here once submitted."
        />
      }
    />
  );
}
