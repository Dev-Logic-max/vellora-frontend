"use client";

import { useNotificationsRealtime } from "@/features/notifications/notifications";

/** Side-effect-only: subscribes to live notification events. Render once in the shell. */
export function RealtimeNotifications() {
  useNotificationsRealtime();
  return null;
}
