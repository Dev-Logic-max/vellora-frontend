"use client";

import { useSyncExternalStore } from "react";

import type { ImpersonationState } from "./types";

const KEY = "vellora:impersonation";
const listeners = new Set<() => void>();

// Cached snapshot — useSyncExternalStore requires getSnapshot to return a
// REFERENTIALLY STABLE value when the data is unchanged. Re-parsing localStorage
// on every call returns a new object each time and triggers an infinite render
// loop ("Maximum update depth exceeded"). We memoize by the raw string.
let cachedRaw: string | null = null;
let cachedValue: ImpersonationState | null = null;

function read(): ImpersonationState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = raw ? (JSON.parse(raw) as ImpersonationState) : null;
  return cachedValue;
}

function emit() {
  listeners.forEach((l) => l());
}

export function setImpersonation(state: ImpersonationState | null): void {
  if (typeof window === "undefined") return;
  if (state) localStorage.setItem(KEY, JSON.stringify(state));
  else localStorage.removeItem(KEY);
  // Refresh the cache eagerly so the next snapshot reflects the write.
  cachedRaw = state ? JSON.stringify(state) : null;
  cachedValue = state;
  emit();
}

/** Reactive read of the current impersonation state (null when not impersonating). */
export function useImpersonation(): ImpersonationState | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => null,
  );
}
