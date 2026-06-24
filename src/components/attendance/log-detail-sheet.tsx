"use client";

import { Clock } from "lucide-react";

import { EntityAvatar } from "@/components/ui/entity-avatar";
import { FieldGroup } from "@/components/ui/field-group";
import { FormSheet } from "@/components/ui/form-sheet";
import { RoleTag } from "@/components/ui/role-tag";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { formatTimeInTz } from "@/lib/schedule-time";
import type { MembershipRole } from "@/features/session/types";
import type { AttendanceLog } from "@/features/attendance/types";

function worked(log: AttendanceLog): string {
  if (!log.clockOutUtc) return "—";
  const mins = Math.round(
    (new Date(log.clockOutUtc).getTime() - new Date(log.clockInUtc).getTime()) / 60000,
  );
  const breakMins = (log.breaks ?? []).reduce((s, b) => s + (b.minutes ?? 0), 0);
  const net = Math.max(0, mins - breakMins);
  return `${Math.floor(net / 60)}h ${net % 60}m`;
}

/** Read-only detail of one attendance log (point 18 view action): employee,
 * times in the store tz, method, and breaks. */
export function LogDetailSheet({
  log,
  tz,
  open,
  onOpenChange,
}: {
  log: AttendanceLog | null;
  tz: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!log) return null;
  const e = log.employee;
  const name = e ? `${e.firstName} ${e.lastName}` : "Unknown";
  const role = e?.membershipRole as MembershipRole | undefined;
  const breaks = log.breaks ?? [];

  return (
    <FormSheet open={open} onOpenChange={onOpenChange} title="Attendance detail" subtitle={name}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <EntityAvatar name={name} src={e?.avatarUrl} className="size-11 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              {e?.uniqueCode ? (
                <span className="font-mono text-xs text-muted-foreground">{e.uniqueCode}</span>
              ) : null}
              {role && role !== "owner" ? <RoleTag role={role} /> : null}
            </div>
          </div>
        </div>

        <FieldGroup title="Punch" cols={2}>
          <Stat label="Clock in" value={formatTimeInTz(log.clockInUtc, tz)} />
          <Stat
            label="Clock out"
            value={log.clockOutUtc ? formatTimeInTz(log.clockOutUtc, tz) : "—"}
          />
          <Stat label="Worked" value={worked(log)} />
          <Stat label="Method" value={log.method} className="capitalize" />
          <div className="col-span-2">
            <p className="mb-1 text-xs text-muted-foreground">Status</p>
            <AttendancePill status={log.status} />
          </div>
        </FieldGroup>

        <FieldGroup title={`Breaks (${breaks.length})`} cols={1}>
          {breaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No breaks recorded.</p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {breaks.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3.5" />
                    {formatTimeInTz(b.startUtc, tz)}
                    {b.endUtc ? ` – ${formatTimeInTz(b.endUtc, tz)}` : ""}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {b.minutes}m{b.paid ? " · paid" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </FieldGroup>

        {log.notes ? (
          <FieldGroup title="Notes" cols={1}>
            <p className="text-sm text-muted-foreground">{log.notes}</p>
          </FieldGroup>
        ) : null}
      </div>
    </FormSheet>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-medium text-foreground tabular-nums ${className ?? ""}`}>{value}</p>
    </div>
  );
}
