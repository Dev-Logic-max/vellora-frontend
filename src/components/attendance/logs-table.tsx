"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataTableShell,
  type DataTableColumnMeta,
  type TableToolbarConfig,
} from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { formatTimeInTz } from "@/lib/schedule-time";
import type { AttendanceLog } from "@/features/attendance/types";

function workedLabel(log: AttendanceLog): string {
  if (!log.clockOutUtc) return "—";
  const mins = Math.round(
    (new Date(log.clockOutUtc).getTime() - new Date(log.clockInUtc).getTime()) / 60000,
  );
  const breakMins = (log.breaks ?? []).reduce((s, b) => s + (b.minutes ?? 0), 0);
  const net = Math.max(0, mins - breakMins);
  return `${Math.floor(net / 60)}h ${net % 60}m`;
}

/** Late if clock-in is flagged; on-time otherwise; absent when no-show. */
function outcome(log: AttendanceLog): string {
  if (log.status === "flagged") return "late";
  if (!log.clockOutUtc) return "open";
  return "on_time";
}

export function LogsTable({
  logs,
  isLoading,
  tz,
  onCorrect,
  toolbar,
}: {
  logs: AttendanceLog[];
  isLoading?: boolean;
  tz: string;
  onCorrect: (log: AttendanceLog) => void;
  toolbar?: TableToolbarConfig;
}) {
  const columns = useMemo<ColumnDef<AttendanceLog, unknown>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => {
          const e = row.original.employee;
          return (
            <div className="flex items-center gap-3">
              <EmployeeAvatar
                firstName={e?.firstName ?? "?"}
                lastName={e?.lastName ?? ""}
                avatarUrl={e?.avatarUrl ?? null}
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {e ? `${e.firstName} ${e.lastName}` : "Unknown"}
                </p>
                {e?.uniqueCode ? (
                  <p className="truncate font-mono text-xs text-muted-foreground">{e.uniqueCode}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        header: "In",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatTimeInTz(row.original.clockInUtc, tz)}</span>
        ),
      },
      {
        header: "Out",
        cell: ({ row }) =>
          row.original.clockOutUtc ? (
            <span className="tabular-nums">{formatTimeInTz(row.original.clockOutUtc, tz)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        header: "Worked",
        cell: ({ row }) => <span className="tabular-nums">{workedLabel(row.original)}</span>,
      },
      {
        header: "Breaks",
        cell: ({ row }) => {
          const n = (row.original.breaks ?? []).length;
          return <span className="text-muted-foreground tabular-nums">{n || "—"}</span>;
        },
      },
      {
        header: "Method",
        cell: ({ row }) => <span className="capitalize">{row.original.method}</span>,
      },
      {
        header: "Status",
        cell: ({ row }) => <AttendancePill status={outcome(row.original)} />,
      },
      {
        id: "actions",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onCorrect(row.original);
            }}
            aria-label="Request correction"
          >
            <PencilLine />
          </Button>
        ),
      },
    ],
    [tz, onCorrect],
  );

  return (
    <DataTableShell
      columns={columns}
      data={logs}
      isLoading={isLoading}
      toolbar={toolbar}
      empty={
        <EmptyState
          icon={Clock}
          title="No attendance yet"
          description="Punches will appear here as staff clock in from the kiosk or portal."
        />
      }
    />
  );
}
