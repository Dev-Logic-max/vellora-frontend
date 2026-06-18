import type { ShiftStatus } from "./types";

interface StatusStyle {
  /** Left status rail color. */
  bar: string;
  /** Block background + text. */
  block: string;
  label: string;
}

/** Calendar status colors (04-shifts §8 / design-colors §3). */
export const SHIFT_STATUS_STYLE: Record<ShiftStatus, StatusStyle> = {
  draft: {
    bar: "bg-warning",
    block: "bg-warning-soft text-warning",
    label: "Planning",
  },
  assigned: {
    bar: "bg-primary",
    block: "bg-primary/10 text-primary",
    label: "Assigned",
  },
  published: {
    bar: "bg-[var(--chart-2)]",
    block: "bg-[var(--chart-2)]/10 text-[var(--chart-2)]",
    label: "Published",
  },
  approved: {
    bar: "bg-success",
    block: "bg-success-soft text-success",
    label: "Approved",
  },
  cancelled: {
    bar: "bg-danger",
    block:
      "bg-danger-soft text-danger [background-image:repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.05)_5px,rgba(0,0,0,0.05)_10px)]",
    label: "Cancelled",
  },
  off: {
    bar: "bg-muted-foreground/40",
    block: "bg-muted text-muted-foreground",
    label: "Off",
  },
};

export const SHIFT_STATUS_OPTIONS: { value: ShiftStatus; label: string }[] = (
  Object.keys(SHIFT_STATUS_STYLE) as ShiftStatus[]
).map((value) => ({ value, label: SHIFT_STATUS_STYLE[value].label }));
