import { addDays, format, startOfWeek } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import { readCachedTimeFormat } from "@/features/design/apply";

/** Visible time window of the grid + pixels per hour. */
export const GRID_START_HOUR = 0;
export const GRID_END_HOUR = 24;
export const HOUR_PX = 44;
export const SNAP_MINUTES = 15;

/** Wall-clock parts of a UTC instant as seen in a store's timezone. */
export function zonedParts(iso: string, tz: string): { dateStr: string; minutesOfDay: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    minutesOfDay: hour * 60 + minute,
  };
}

/**
 * Formats a UTC instant for display in a store/user timezone, honoring the
 * user's 12h/24h preference (override with `hour12`). Times are ALWAYS stored in
 * UTC; this is the read side.
 */
export function formatTimeInTz(iso: string, tz: string, hour12?: boolean): string {
  const use12 = hour12 ?? readCachedTimeFormat() === "12h";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz || "UTC",
    hour: use12 ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: use12,
  }).format(new Date(iso));
}

/**
 * Converts a wall-clock date + "HH:mm" interpreted in `tz` into a correct UTC
 * ISO instant (DST-aware via date-fns-tz). This is the WRITE side — use it
 * whenever the user picks a local time that must persist as UTC, so the value
 * re-displays correctly from any timezone.
 */
export function localToUtcIso(dateStr: string, timeHHmm: string, tz: string): string {
  // `fromZonedTime` reads the given wall-clock AS being in `tz` and returns the
  // equivalent UTC Date.
  return fromZonedTime(`${dateStr}T${timeHHmm}:00`, tz || "UTC").toISOString();
}

/** Formats a single "HH:mm" (no date/tz) per the 12/24 pref, for the time picker
 * trigger and inline labels. */
export function formatHHmm(hhmm: string, hour12?: boolean): string {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  const use12 = hour12 ?? readCachedTimeFormat() === "12h";
  if (!use12) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function durationMinutes(startIso: string, endIso: string): number {
  return Math.max(0, (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000);
}

/** Shift a UTC instant by whole days + minutes (keeps store-tz wall clock, no DST math). */
export function shiftIso(iso: string, dayDelta: number, minuteDelta: number): string {
  return new Date(new Date(iso).getTime() + (dayDelta * 1440 + minuteDelta) * 60_000).toISOString();
}

export function snap(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

/** The Monday of the week containing `date`, as a Date at local midnight. */
export function weekStartMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** Seven yyyy-MM-dd strings Mon→Sun for the week containing `date`. */
export function weekDates(date: Date): string[] {
  const monday = weekStartMonday(date);
  return Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), "yyyy-MM-dd"));
}

export function ymd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export { addDays };
