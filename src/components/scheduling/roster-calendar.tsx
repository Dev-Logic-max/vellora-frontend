"use client";

import { useMemo } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarOff, Clock, Coffee, MoonStar } from "lucide-react";

import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { cn } from "@/lib/utils";
import { SHIFT_STATUS_STYLE } from "@/features/scheduling/status";
import {
  GRID_END_HOUR,
  GRID_START_HOUR,
  durationMinutes,
  formatTimeInTz,
  zonedParts,
} from "@/lib/schedule-time";
import type { Shift } from "@/features/scheduling/types";

type View = "day" | "week" | "month";

interface RosterCalendarProps {
  view: View;
  anchor: Date;
  /** yyyy-MM-dd per visible day (day/week). */
  days: string[];
  shifts: Shift[];
  tz: string;
  onShiftClick: (shift: Shift) => void;
  onEmptyClick: (dateStr: string, hour: number) => void;
  onDayClick: (dateStr: string) => void;
}

const TODAY = format(new Date(), "yyyy-MM-dd");

function employeeName(s: Shift): string {
  return s.employee ? `${s.employee.firstName} ${s.employee.lastName}` : "Unassigned";
}

/** Net worked hours (duration − break), formatted "6.00h". */
function shiftHours(s: Shift): number {
  const net = Math.max(0, durationMinutes(s.startsAtUtc, s.endsAtUtc) - (s.breakMinutes ?? 0));
  return net / 60;
}

/** A premium shift chip (roster cell / week). Off-days render distinctly. */
function ShiftChip({ shift, tz, onClick }: { shift: Shift; tz: string; onClick: () => void }) {
  const style = SHIFT_STATUS_STYLE[shift.status];
  const isOff = shift.status === "off";
  const isCancelled = shift.status === "cancelled";

  if (isOff) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border bg-surface-subtle px-2 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:bg-surface-3"
      >
        <MoonStar className="size-3 shrink-0" />
        <span className="truncate font-medium">Off day</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group/chip flex w-full flex-col gap-0.5 rounded-lg border px-2 py-1 text-left text-[11px] shadow-accent-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-accent-md",
        style.block,
        "border-current/15",
        isCancelled && "opacity-70",
      )}
    >
      <span className="flex items-center gap-1 font-semibold tabular-nums">
        <span className="grid size-3.5 place-items-center rounded-[4px] bg-current/15 text-[8px] uppercase">
          {style.label[0]}
        </span>
        <span className={cn("truncate", isCancelled && "line-through")}>
          {formatTimeInTz(shift.startsAtUtc, tz).replace(/\s/g, "")}–
          {formatTimeInTz(shift.endsAtUtc, tz).replace(/\s/g, "")}
        </span>
        <span className="opacity-80">({shiftHours(shift).toFixed(2)}h)</span>
      </span>
      {shift.breakMinutes ? (
        <span className="flex items-center gap-1 opacity-80">
          <Coffee className="size-2.5" />
          {shift.breakMinutes}m {shift.notes === "flex-break" ? "flex" : "break"}
        </span>
      ) : null}
    </button>
  );
}

/* ── WEEK: employee-roster grid ──────────────────────────────────────────── */
function WeekRoster({
  days,
  shifts,
  tz,
  onShiftClick,
  onEmptyClick,
}: Pick<RosterCalendarProps, "days" | "shifts" | "tz" | "onShiftClick" | "onEmptyClick">) {
  // Group by employee (stable order by name); unassigned last.
  const rows = useMemo(() => {
    const map = new Map<string, { name: string; shifts: Shift[]; ref: Shift["employee"] }>();
    for (const s of shifts) {
      const key = s.employeeId ?? "unassigned";
      if (!map.has(key)) map.set(key, { name: employeeName(s), shifts: [], ref: s.employee });
      map.get(key)!.shifts.push(s);
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => (a.id === "unassigned" ? 1 : a.name.localeCompare(b.name)));
  }, [shifts]);

  const cellShifts = (empId: string, dateStr: string) =>
    shifts.filter(
      (s) =>
        (s.employeeId ?? "unassigned") === empId &&
        zonedParts(s.startsAtUtc, tz).dateStr === dateStr,
    );

  const totalHours = (empId: string) =>
    shifts
      .filter((s) => (s.employeeId ?? "unassigned") === empId && s.status !== "off")
      .reduce((sum, s) => sum + shiftHours(s), 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="bg-rail text-rail-foreground">
            <th className="sticky left-0 z-10 bg-rail px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
              Employee
            </th>
            {days.map((d) => {
              const date = parseISO(d);
              const weekend = [0, 6].includes(date.getDay());
              return (
                <th
                  key={d}
                  className={cn(
                    "px-2 py-2 text-center text-xs font-semibold",
                    weekend && "bg-white/5",
                    d === TODAY && "text-[rgb(var(--accent))]",
                  )}
                >
                  <div className="uppercase">{format(date, "EEE")}</div>
                  <div className="text-[10px] font-normal opacity-70 tabular-nums">
                    {format(date, "dd/MM")}
                  </div>
                </th>
              );
            })}
            <th className="px-3 py-2 text-center text-xs font-semibold uppercase">Total h</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={days.length + 2} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No shifts this week. Click a cell to add one.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 z-10 bg-surface px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <EmployeeAvatar
                      firstName={row.ref?.firstName ?? "?"}
                      lastName={row.ref?.lastName ?? ""}
                      avatarUrl={row.ref?.avatarUrl ?? null}
                      className="size-8"
                    />
                    <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
                  </div>
                </td>
                {days.map((d) => {
                  const cs = cellShifts(row.id, d);
                  const weekend = [0, 6].includes(parseISO(d).getDay());
                  return (
                    <td
                      key={d}
                      onClick={() => cs.length === 0 && onEmptyClick(d, 9)}
                      className={cn(
                        "min-w-[110px] border-l border-border p-1.5 align-top transition-colors",
                        weekend && "bg-surface-subtle/50",
                        cs.length === 0 && "cursor-pointer hover:bg-accent-soft/40",
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        {cs.map((s) => (
                          <ShiftChip key={s.id} shift={s} tz={tz} onClick={() => onShiftClick(s)} />
                        ))}
                      </div>
                    </td>
                  );
                })}
                <td className="border-l border-border px-3 py-3 text-center text-sm font-semibold text-foreground tabular-nums">
                  {totalHours(row.id).toFixed(1)}h
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── DAY: single-day employee timeline ───────────────────────────────────── */
const DAY_HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);

function DayRoster({
  dateStr,
  shifts,
  tz,
  onShiftClick,
  onEmptyClick,
}: {
  dateStr: string;
  shifts: Shift[];
  tz: string;
  onShiftClick: (s: Shift) => void;
  onEmptyClick: (dateStr: string, hour: number) => void;
}) {
  const rows = useMemo(() => {
    const map = new Map<string, { name: string; ref: Shift["employee"] }>();
    for (const s of shifts) {
      const key = s.employeeId ?? "unassigned";
      if (!map.has(key)) map.set(key, { name: employeeName(s), ref: s.employee });
    }
    return [...map.entries()].map(([id, v]) => ({ id, ...v }));
  }, [shifts]);

  // Current-time indicator (only if viewing today).
  const nowLeft = useMemo(() => {
    if (dateStr !== TODAY) return null;
    const { minutesOfDay } = zonedParts(new Date().toISOString(), tz);
    return (minutesOfDay / (24 * 60)) * 100;
  }, [dateStr, tz]);

  const span = (s: Shift) => {
    const startM = zonedParts(s.startsAtUtc, tz).minutesOfDay;
    const endM = zonedParts(s.endsAtUtc, tz).minutesOfDay || 24 * 60;
    return { left: (startM / 1440) * 100, width: (Math.max(30, endM - startM) / 1440) * 100 };
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <div className="min-w-[900px]">
        {/* Hour header */}
        <div className="flex border-b border-border bg-rail text-rail-foreground">
          <div className="w-44 shrink-0 px-4 py-2 text-xs font-semibold tracking-wide uppercase">
            Employees
          </div>
          <div className="relative flex flex-1">
            {DAY_HOURS.map((h) => (
              <div key={h} className="flex-1 py-2 text-center text-[10px] opacity-70 tabular-nums">
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No shifts for this day.
          </div>
        ) : (
          rows.map((row) => {
            const rowShifts = shifts.filter((s) => (s.employeeId ?? "unassigned") === row.id);
            return (
              <div key={row.id} className="flex border-b border-border last:border-0">
                <div className="w-44 shrink-0 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <EmployeeAvatar
                      firstName={row.ref?.firstName ?? "?"}
                      lastName={row.ref?.lastName ?? ""}
                      avatarUrl={row.ref?.avatarUrl ?? null}
                      className="size-7"
                    />
                    <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
                  </div>
                </div>
                <div
                  className="relative flex-1 self-stretch"
                  style={{ minHeight: 52 }}
                  onClick={(ev) => {
                    if (ev.target !== ev.currentTarget) return;
                    const rect = ev.currentTarget.getBoundingClientRect();
                    const hour = Math.floor(((ev.clientX - rect.left) / rect.width) * 24);
                    onEmptyClick(dateStr, hour);
                  }}
                >
                  {/* hour gridlines */}
                  {DAY_HOURS.map((h) => (
                    <span
                      key={h}
                      className="pointer-events-none absolute inset-y-0 border-l border-border/50"
                      style={{ left: `${(h / 24) * 100}%` }}
                    />
                  ))}
                  {nowLeft != null ? (
                    <span
                      className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-[rgb(var(--accent))]"
                      style={{ left: `${nowLeft}%` }}
                    />
                  ) : null}
                  {rowShifts.map((s) => {
                    const { left, width } = span(s);
                    const style = SHIFT_STATUS_STYLE[s.status];
                    const off = s.status === "off";
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onShiftClick(s)}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        className={cn(
                          "absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 overflow-hidden rounded-lg border px-2 py-1 text-[11px] shadow-accent-sm transition-shadow hover:shadow-accent-md",
                          off
                            ? "border-dashed border-border bg-surface-subtle text-muted-foreground"
                            : cn(style.block, "border-current/15"),
                        )}
                      >
                        {off ? <MoonStar className="size-3 shrink-0" /> : null}
                        <span className="truncate font-medium tabular-nums">
                          {off
                            ? "Off day"
                            : `${formatTimeInTz(s.startsAtUtc, tz).replace(/\s/g, "")}–${formatTimeInTz(s.endsAtUtc, tz).replace(/\s/g, "")}`}
                        </span>
                        {!off && s.breakMinutes ? (
                          <span className="flex shrink-0 items-center gap-0.5 rounded bg-current/15 px-1">
                            <Coffee className="size-2.5" />
                            {s.breakMinutes}m
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── MONTH: day cells with shift/employee/off-day pills ───────────────────── */
function MonthRoster({
  anchor,
  shifts,
  tz,
  onDayClick,
}: {
  anchor: Date;
  shifts: Shift[];
  tz: string;
  onDayClick: (dateStr: string) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  const cells: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) cells.push(d);

  const dayShifts = (dateStr: string) =>
    shifts.filter((s) => zonedParts(s.startsAtUtc, tz).dateStr === dateStr);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="grid grid-cols-7 border-b border-border bg-rail text-rail-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-3 py-2 text-center text-xs font-semibold tracking-wide uppercase">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const ds = dayShifts(dateStr);
          const working = ds.filter((s) => s.status !== "off");
          const offCount = ds.length - working.length;
          const outside = !isSameMonth(date, anchor);
          const avatars = working.slice(0, 3);
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(dateStr)}
              className={cn(
                "min-h-[112px] border-r border-b border-border p-2 text-left align-top transition-colors last:border-r-0 hover:bg-accent-soft/30 [&:nth-child(7n)]:border-r-0",
                outside && "bg-surface-subtle/40",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                  dateStr === TODAY
                    ? "bg-primary text-primary-foreground shadow-accent-sm"
                    : outside
                      ? "text-faint"
                      : "text-foreground",
                )}
              >
                {format(date, "d")}
              </span>
              {working.length > 0 ? (
                <div className="mt-1.5 space-y-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-strong">
                    <Clock className="size-2.5" />
                    {working.length} shift{working.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex -space-x-1.5">
                    {avatars.map((s) => (
                      <EmployeeAvatar
                        key={s.id}
                        firstName={s.employee?.firstName ?? "?"}
                        lastName={s.employee?.lastName ?? ""}
                        avatarUrl={s.employee?.avatarUrl ?? null}
                        className="size-5 ring-2 ring-surface"
                      />
                    ))}
                    {working.length > 3 ? (
                      <span className="grid size-5 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground ring-2 ring-surface">
                        +{working.length - 3}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {offCount > 0 ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <CalendarOff className="size-2.5" />
                  {offCount} off
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Style-2 calendar — employee roster (week), single-day timeline (day), and a
 * pill-rich month grid. Visual alternative to the hour time-grid (same data). */
export function RosterCalendar({
  view,
  anchor,
  days,
  shifts,
  tz,
  onShiftClick,
  onEmptyClick,
  onDayClick,
}: RosterCalendarProps) {
  if (view === "month") {
    return <MonthRoster anchor={anchor} shifts={shifts} tz={tz} onDayClick={onDayClick} />;
  }
  if (view === "day") {
    return (
      <DayRoster
        dateStr={days[0]}
        shifts={shifts}
        tz={tz}
        onShiftClick={onShiftClick}
        onEmptyClick={onEmptyClick}
      />
    );
  }
  return (
    <WeekRoster
      days={days}
      shifts={shifts}
      tz={tz}
      onShiftClick={onShiftClick}
      onEmptyClick={onEmptyClick}
    />
  );
}
