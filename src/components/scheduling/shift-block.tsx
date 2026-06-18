"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { SHIFT_STATUS_STYLE } from "@/features/scheduling/status";
import {
  GRID_START_HOUR,
  HOUR_PX,
  durationMinutes,
  formatTimeInTz,
  snap,
  zonedParts,
} from "@/lib/schedule-time";
import type { Shift } from "@/features/scheduling/types";

interface ShiftBlockProps {
  shift: Shift;
  tz: string;
  onClick: () => void;
  onResize: (minutesDelta: number) => void;
}

export function ShiftBlock({ shift, tz, onClick, onResize }: ShiftBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: { shift },
  });
  const [resizeDelta, setResizeDelta] = useState(0);

  const { minutesOfDay } = zonedParts(shift.startsAtUtc, tz);
  const duration = durationMinutes(shift.startsAtUtc, shift.endsAtUtc);
  const top = ((minutesOfDay - GRID_START_HOUR * 60) / 60) * HOUR_PX;
  const height = Math.max(22, (duration / 60) * HOUR_PX + (resizeDelta / 60) * HOUR_PX);
  const style = SHIFT_STATUS_STYLE[shift.status];

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const move = (ev: PointerEvent) => setResizeDelta(snap(((ev.clientY - startY) / HOUR_PX) * 60));
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const delta = snap(((ev.clientY - startY) / HOUR_PX) * 60);
      setResizeDelta(0);
      if (delta !== 0) onResize(delta);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const name = shift.employee
    ? `${shift.employee.firstName} ${shift.employee.lastName}`
    : "Unassigned";

  return (
    <div
      ref={setNodeRef}
      style={{
        top,
        height,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        "absolute inset-x-1 z-10 overflow-hidden rounded-md border-l-2 pl-2 pr-1 py-1 text-[11px] shadow-sm transition-shadow",
        style.block,
        isDragging && "z-30 opacity-80 shadow-lg",
      )}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        onClick={onClick}
        className="block w-full cursor-grab text-left active:cursor-grabbing"
      >
        <span
          className={cn("absolute top-0 bottom-0 left-0 w-0.5", style.bar)}
          style={{ left: "-2px" }}
        />
        <p className="truncate font-medium tabular-nums">
          {formatTimeInTz(shift.startsAtUtc, tz)}
        </p>
        <p className="truncate opacity-90">{name}</p>
        {shift.role ? <p className="truncate opacity-70">{shift.role}</p> : null}
      </button>
      <span
        onPointerDown={startResize}
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize rounded-b-md hover:bg-black/10"
      />
    </div>
  );
}
