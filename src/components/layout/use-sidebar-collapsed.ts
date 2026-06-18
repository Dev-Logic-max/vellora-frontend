"use client";

import { useSyncExternalStore } from "react";

const KEY = "vellora:sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(KEY) === "1";
}

// Server + initial hydration render expanded; no layout shift, no mismatch.
function getServerSnapshot() {
  return false;
}

/**
 * Sidebar collapse state, persisted to localStorage. Uses useSyncExternalStore
 * so reads are hydration-safe (no setState-in-effect, no SSR mismatch).
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    localStorage.setItem(KEY, collapsed ? "0" : "1");
    listeners.forEach((listener) => listener());
  };

  return [collapsed, toggle];
}
