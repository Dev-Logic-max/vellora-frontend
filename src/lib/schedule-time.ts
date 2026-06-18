import { addDays, format, startOfWeek } from "date-fns";

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

export function formatTimeInTz(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz || "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
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
