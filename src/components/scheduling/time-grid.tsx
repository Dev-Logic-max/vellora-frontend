"use client";

import { useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { ShiftBlock } from "@/components/scheduling/shift-block";
import { GRID_END_HOUR, GRID_START_HOUR, HOUR_PX, snap, zonedParts } from "@/lib/schedule-time";
import type { Shift } from "@/features/scheduling/types";

interface TimeGridProps {
  days: string[]; // yyyy-MM-dd, one column each
  shifts: Shift[];
  tz: string;
  onShiftClick: (shift: Shift) => void;
  onMove: (shift: Shift, dayDelta: number, minuteDelta: number) => void;
  onResize: (shift: Shift, minutesDelta: number) => void;
  onEmptyClick: (dateStr: string, hour: number) => void;
}

const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);
const TODAY = format(new Date(), "yyyy-MM-dd");

export function TimeGrid({
  days,
  shifts,
  tz,
  onShiftClick,
  onMove,
  onResize,
  onEmptyClick,
}: TimeGridProps) {
  const colsRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const totalHeight = HOURS.length * HOUR_PX;

  const byDay = (dateStr: string) =>
    shifts.filter((s) => zonedParts(s.startsAtUtc, tz).dateStr === dateStr);

  const onDragEnd = (event: DragEndEvent) => {
    const shift = event.active.data.current?.shift as Shift | undefined;
    if (!shift) return;
    const colWidth = (colsRef.current?.offsetWidth ?? 1) / days.length;
    const dayDelta = colWidth ? Math.round(event.delta.x / colWidth) : 0;
    const minuteDelta = snap((event.delta.y / HOUR_PX) * 60);
    if (dayDelta !== 0 || minuteDelta !== 0) onMove(shift, dayDelta, minuteDelta);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex overflow-hidden rounded-xl border border-border bg-surface">
        {/* Hour axis */}
        <div className="w-14 shrink-0 border-r border-border pt-6">
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_PX }}
              className="relative -top-2 pr-2 text-right text-[10px] text-muted-foreground tabular-nums"
            >
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div ref={colsRef} className="grid flex-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((dateStr) => {
            const date = parseISO(dateStr);
            return (
              <div key={dateStr} className="border-r border-border last:border-r-0">
                <div
                  className={cn(
                    "sticky top-0 z-20 flex h-6 items-center justify-center border-b border-border bg-surface text-xs font-medium",
                    dateStr === TODAY ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {format(date, days.length > 1 ? "EEE d" : "EEEE, MMM d")}
                </div>
                <div
                  className="relative"
                  style={{ height: totalHeight }}
                  onClick={(e) => {
                    if (e.target !== e.currentTarget) return;
                    const offsetY = e.nativeEvent.offsetY;
                    const hour = Math.floor(offsetY / HOUR_PX) + GRID_START_HOUR;
                    onEmptyClick(dateStr, hour);
                  }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ top: (h - GRID_START_HOUR) * HOUR_PX, height: HOUR_PX }}
                      className="pointer-events-none absolute inset-x-0 border-b border-border/60"
                    />
                  ))}
                  {byDay(dateStr).map((shift) => (
                    <ShiftBlock
                      key={shift.id}
                      shift={shift}
                      tz={tz}
                      onClick={() => onShiftClick(shift)}
                      onResize={(delta) => onResize(shift, delta)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
