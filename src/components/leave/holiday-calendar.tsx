"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCreateHoliday, useDeleteHoliday, useHolidays } from "@/features/leave/leave";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HolidayCalendar({ canManage }: { canManage: boolean }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");

  const year = cursor.getFullYear();
  const { data: holidays, isLoading } = useHolidays(year);
  const create = useCreateHoliday();
  const remove = useDeleteHoliday();

  const byDate = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    holidays?.forEach((h) => map.set(h.date, { id: h.id, name: h.name }));
    return map;
  }, [holidays]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-display text-lg font-semibold tabular-nums">
            {format(cursor, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        {canManage ? (
          <div className="flex items-end gap-2">
            <FormField
              id="holiday-date"
              label="Date"
              type="date"
              className="w-40"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <FormField
              id="holiday-name"
              label="Name"
              className="w-44"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button
              disabled={!newDate || !newName || create.isPending}
              onClick={() => {
                void create
                  .mutateAsync({ date: newDate, name: newName })
                  .then(() => {
                    setNewName("");
                    setNewDate("");
                  });
              }}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-7 border-b border-border bg-surface-subtle text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const iso = format(day, "yyyy-MM-dd");
              const holiday = byDate.get(iso);
              const inMonth = isSameMonth(day, cursor);
              return (
                <div
                  key={iso}
                  className={cn(
                    "min-h-20 border-b border-r border-border p-1.5 text-sm last:border-r-0",
                    !inMonth && "bg-surface-subtle/40 text-muted-foreground",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                        isToday(day) && "bg-primary text-primary-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  {holiday ? (
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => canManage && void remove.mutate(holiday.id)}
                      title={canManage ? "Remove holiday" : holiday.name}
                      className="mt-1 line-clamp-2 w-full rounded-md bg-chart-3/15 px-1.5 py-0.5 text-left text-[11px] font-medium text-chart-3"
                    >
                      {holiday.name}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
