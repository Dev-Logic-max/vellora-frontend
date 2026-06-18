"use client";

/**
 * Tiny localStorage-backed queue for clock events captured while offline
 * (05-attendance §6). Flushed to POST /attendance/sync when connectivity
 * returns. Deliberately dependency-free — no IndexedDB wrapper for v0.
 */
const KEY = "vellora.attendance.queue";

export interface QueuedEvent {
  kind: "clock_in" | "clock_out" | "break_start" | "break_end";
  employeeId: string;
  storeId?: string;
  terminalId?: string;
  method?: "qr" | "manual" | "terminal";
  atUtc: string;
  paid?: boolean;
}

export function readQueue(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as QueuedEvent[];
  } catch {
    return [];
  }
}

export function enqueue(event: QueuedEvent): QueuedEvent[] {
  const next = [...readQueue(), event];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearQueue(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
