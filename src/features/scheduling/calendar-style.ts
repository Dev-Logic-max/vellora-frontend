"use client";

import { usePlatformDesign } from "@/features/design/design";

export type CalendarStyle = "grid" | "roster";
export const DEFAULT_CALENDAR_STYLE: CalendarStyle = "grid";
const STORAGE_KEY = "vellora-calendar-style";

export const CALENDAR_STYLE_OPTIONS: { value: CalendarStyle; label: string; hint: string }[] = [
  { value: "grid", label: "Time grid", hint: "Hour-by-hour columns" },
  { value: "roster", label: "Roster", hint: "Employees × days" },
];

export function cacheCalendarStyle(style: CalendarStyle) {
  try {
    localStorage.setItem(STORAGE_KEY, style);
  } catch {
    /* ignore */
  }
}

export function readCachedCalendarStyle(): CalendarStyle {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "roster" || v === "grid" ? v : DEFAULT_CALENDAR_STYLE;
  } catch {
    return DEFAULT_CALENDAR_STYLE;
  }
}

/**
 * Resolves the active calendar style. Reads the platform-design setting once
 * loaded (backend persists `calendarStyle`); falls back to the localStorage
 * cache so the choice survives before the backend value arrives.
 */
export function useCalendarStyle(): CalendarStyle {
  const { data } = usePlatformDesign();
  const fromServer = data?.calendarStyle;
  if (fromServer === "roster" || fromServer === "grid") return fromServer;
  return readCachedCalendarStyle();
}
