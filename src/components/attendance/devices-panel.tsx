"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { History, Power, RotateCcw, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { FieldGroup } from "@/components/ui/field-group";
import { FormSheet } from "@/components/ui/form-sheet";
import { RoleTag } from "@/components/ui/role-tag";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { RegistrationGuideDialog } from "@/components/attendance/registration-guide-dialog";
import {
  useDeviceRegistrations,
  useRegistrationAction,
  useRegistrationHistory,
} from "@/features/attendance/device-registration";
import type { MembershipRole } from "@/features/session/types";
import type { DeviceRegistration, DeviceRegistrationAction } from "@/features/attendance/types";

const STATUS_LABELS: Record<string, string> = {
  active: "Registered",
  disabled: "Disabled",
  revoked: "Not registered",
};

const ACTION_LABELS: Record<DeviceRegistrationAction, string> = {
  registered: "Registered",
  revoked: "Removed",
  disabled: "Disabled",
  enabled: "Re-enabled",
  re_registered: "Re-registered",
};

/** History timeline for one employee's device registrations. */
function HistorySheet({
  reg,
  open,
  onOpenChange,
}: {
  reg: DeviceRegistration;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data: logs, isLoading } = useRegistrationHistory(open ? reg.employeeId : undefined);
  const name = reg.employee
    ? `${reg.employee.firstName} ${reg.employee.lastName}`
    : "Employee";

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Device history"
      subtitle={`Registration trail for ${name}.`}
    >
      <FieldGroup title="Timeline" cols={1}>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !logs || logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {logs.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute top-1 -left-[23px] size-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{ACTION_LABELS[log.action]}</p>
                  <time className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
                {log.deviceLabel ? (
                  <p className="text-sm text-muted-foreground">{log.deviceLabel}</p>
                ) : null}
                {log.note ? <p className="text-xs text-muted-foreground">{log.note}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </FieldGroup>
    </FormSheet>
  );
}

export function DevicesPanel() {
  const { data: registrations, isLoading } = useDeviceRegistrations();
  const action = useRegistrationAction();
  const [historyReg, setHistoryReg] = useState<DeviceRegistration | null>(null);

  const run = (label: string, fn: () => Promise<unknown>) =>
    fn()
      .then(() => toast.success(label))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Action failed"));

  const columns = useMemo<ColumnDef<DeviceRegistration, unknown>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => {
          const e = row.original.employee;
          const name = e ? `${e.firstName} ${e.lastName}` : "—";
          return (
            <div className="flex items-center gap-3">
              <EntityAvatar name={name} src={e?.avatarUrl} className="size-9 rounded-lg" />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.original.label ?? row.original.platform ?? "Device"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: "User ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.employee?.uniqueCode ?? "—"}
          </span>
        ),
      },
      {
        header: "User role",
        cell: ({ row }) => {
          const role = row.original.employee?.membershipRole as MembershipRole | undefined;
          return role && role !== "owner" ? (
            <RoleTag role={role} />
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        header: "Registered",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {new Date(row.original.registeredAt).toLocaleDateString()}
          </span>
        ),
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
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="History"
                onClick={() => setHistoryReg(r)}
              >
                <History />
              </Button>
              {r.status === "active" ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Disable device"
                    disabled={action.isPending}
                    onClick={() =>
                      run("Device disabled", () =>
                        action.mutateAsync({ id: r.id, action: "disable" }),
                      )
                    }
                  >
                    <Power />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Reset device"
                    disabled={action.isPending}
                    onClick={() =>
                      run("Registration reset", () =>
                        action.mutateAsync({ id: r.id, action: "revoke" }),
                      )
                    }
                  >
                    <RotateCcw />
                  </Button>
                </>
              ) : r.status === "disabled" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={action.isPending}
                    onClick={() =>
                      run("Device re-enabled", () =>
                        action.mutateAsync({ id: r.id, action: "enable" }),
                      )
                    }
                  >
                    <ShieldCheck />
                    Enable
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove registration"
                    disabled={action.isPending}
                    onClick={() =>
                      run("Registration removed", () =>
                        action.mutateAsync({ id: r.id, action: "revoke" }),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </>
              ) : (
                <span className="px-2 text-xs text-muted-foreground">Removed</span>
              )}
            </div>
          );
        },
      },
    ],
    [action],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Employee devices</h3>
          <p className="text-xs text-muted-foreground">
            One registered device per employee. Reset to let them register a new one.
          </p>
        </div>
        <RegistrationGuideDialog />
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <DataTableShell
          columns={columns}
          data={registrations ?? []}
          empty={
            <EmptyState
              icon={Smartphone}
              title="No devices registered"
              description="Employees register a device from Settings → Device to clock in by QR."
            />
          }
        />
      )}

      {historyReg ? (
        <HistorySheet
          reg={historyReg}
          open={Boolean(historyReg)}
          onOpenChange={(o) => {
            if (!o) setHistoryReg(null);
          }}
        />
      ) : null}
    </div>
  );
}
