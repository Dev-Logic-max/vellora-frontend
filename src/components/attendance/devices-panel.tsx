"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { RegistrationGuideDialog } from "@/components/attendance/registration-guide-dialog";
import { useDeviceAction, useDevices } from "@/features/attendance/devices";
import type { Device } from "@/features/attendance/types";

const STATUS_LABELS: Record<string, string> = {
  registered: "Registered",
  pending: "Pending",
  reset: "Not registered",
  blocked: "Blocked",
};

export function DevicesPanel() {
  const { data: devices, isLoading } = useDevices();
  const action = useDeviceAction();

  const columns = useMemo<ColumnDef<Device, unknown>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => {
          const e = row.original.employee;
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {e ? `${e.firstName} ${e.lastName}` : "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{row.original.label}</p>
            </div>
          );
        },
      },
      {
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.employee?.uniqueCode ?? "—"}
          </span>
        ),
      },
      {
        header: "Platform",
        cell: ({ row }) => row.original.platform ?? "—",
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <AttendancePill status={row.original.status} label={STATUS_LABELS[row.original.status]} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            disabled={action.isPending || row.original.status === "reset"}
            onClick={() => action.mutate({ id: row.original.id, action: "reset" })}
          >
            <RotateCcw />
            Reset
          </Button>
        ),
      },
    ],
    [action],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Employee devices</h3>
        <RegistrationGuideDialog />
      </div>
      <DataTableShell
        columns={columns}
        data={devices ?? []}
        isLoading={isLoading}
        empty={
          <EmptyState
            icon={Smartphone}
            title="No devices registered"
            description="Employees bind a device from the portal to clock in by QR."
          />
        }
      />
    </div>
  );
}
