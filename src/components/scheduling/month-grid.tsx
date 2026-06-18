"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { cn } from "@/lib/utils";
import { SHIFT_STATUS_STYLE } from "@/features/scheduling/status";
import { zonedParts } from "@/lib/schedule-time";
import type { Shift } from "@/features/scheduling/types";

const TODAY = format(new Date(), "yyyy-MM-dd");
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGrid({
  month,
  shifts,
  tz,
  onDayClick,
}: {
  month: Date;
  shifts: Shift[];
  tz: string;
  onDayClick: (dateStr: string) => void;
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const byDay = (dateStr: string) =>
    shifts.filter((s) => zonedParts(s.startsAtUtc, tz).dateStr === dateStr);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid grid-cols-7 border-b border-border text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayShifts = byDay(dateStr);
          const inMonth = isSameMonth(day, month);
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(dateStr)}
              className={cn(
                "min-h-24 border-r border-b border-border p-1.5 text-left align-top transition-colors last:border-r-0 hover:bg-surface-subtle",
                !inMonth && "bg-muted/30 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium tabular-nums",
                  dateStr === TODAY && "rounded bg-primary px-1.5 py-0.5 text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayShifts.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px]",
                      SHIFT_STATUS_STYLE[s.status].block,
                    )}
                  >
                    {s.employee ? s.employee.firstName : s.role ?? "Shift"}
                  </div>
                ))}
                {dayShifts.length > 3 ? (
                  <div className="px-1 text-[10px] text-muted-foreground">
                    +{dayShifts.length - 3} more
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
