"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, Eye, PencilLine, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataTableShell,
  type DataTableColumnMeta,
  type TableToolbarConfig,
} from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import type { MembershipRole } from "@/features/session/types";
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
  onView,
  onDelete,
  toolbar,
}: {
  logs: AttendanceLog[];
  isLoading?: boolean;
  tz: string;
  onCorrect: (log: AttendanceLog) => void;
  onView: (log: AttendanceLog) => void;
  onDelete: (log: AttendanceLog) => void;
  toolbar?: TableToolbarConfig;
}) {
  const columns = useMemo<ColumnDef<AttendanceLog, unknown>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => {
          const e = row.original.employee;
          const name = e ? `${e.firstName} ${e.lastName}` : "Unknown";
          return (
            <div className="flex items-center gap-3">
              <EntityAvatar name={name} src={e?.avatarUrl} className="size-9 rounded-lg" />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{name}</p>
                {e?.uniqueCode ? (
                  <p className="truncate font-mono text-xs text-muted-foreground">{e.uniqueCode}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        header: "User role",
        cell: ({ row }) => {
          // Staff perform attendance — owners/admins excluded from the role chip.
          const role = row.original.employee?.membershipRole as MembershipRole | undefined;
          return role && role !== "owner" ? (
            <RoleTag role={role} />
          ) : (
            <span className="text-muted-foreground">—</span>
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
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(row.original);
              }}
              aria-label="View detail"
            >
              <Eye />
            </Button>
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
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
              aria-label="Delete log"
            >
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    [tz, onCorrect, onView, onDelete],
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
