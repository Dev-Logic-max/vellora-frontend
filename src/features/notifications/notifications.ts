"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getSocket } from "@/lib/realtime";
import type {
  Notification,
  NotifPreference,
  NotifPreferenceInput,
  NotifPriority,
} from "./types";

const LIST_KEY = "notifications";
const COUNT_KEY = "notifications-unread";
const PREFS_KEY = "notif-preferences";

function toQuery(q: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function useNotifications(filters: {
  unread?: boolean;
  category?: string;
  priority?: NotifPriority;
} = {}) {
  return useQuery({
    queryKey: [LIST_KEY, filters],
    queryFn: () =>
      api.get<Notification[]>(
        `/api/notifications${toQuery({
          unread: filters.unread ? "true" : undefined,
          category: filters.category,
          priority: filters.priority,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [COUNT_KEY],
    queryFn: () => api.get<{ count: number }>("/api/notifications/unread-count"),
    refetchInterval: 60_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => invalidate(qc),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/notifications/read-all"),
    onSuccess: () => invalidate(qc),
  });
}

// ── preferences ────────────────────────────────────────────────────────────
export function useNotifPreferences() {
  return useQuery({
    queryKey: [PREFS_KEY],
    queryFn: () => api.get<NotifPreference[]>("/api/notifications/preferences"),
  });
}

export function useUpdatePreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NotifPreferenceInput) =>
      api.put<NotifPreference>("/api/notifications/preferences", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [PREFS_KEY] }),
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: [LIST_KEY] });
  void qc.invalidateQueries({ queryKey: [COUNT_KEY] });
}

/**
 * Subscribes the socket to live notification events: appends new ones to the
 * cache, bumps the unread badge, and surfaces a subtle toast for high/urgent.
 * Mount once (in a provider near the shell).
 */
export function useNotificationsRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    void getSocket().then((socket) => {
      if (!socket || !active) return;

      const onNew = (n: Notification) => {
        void qc.invalidateQueries({ queryKey: [LIST_KEY] });
        void qc.invalidateQueries({ queryKey: [COUNT_KEY] });
        if (n.priority === "high" || n.priority === "urgent") {
          toast(n.title, { description: n.body ?? undefined });
        }
      };
      const onRead = () => invalidate(qc);

      socket.on("notification:new", onNew);
      socket.on("notification:read", onRead);
      socket.on("notification:read-all", onRead);
      cleanup = () => {
        socket.off("notification:new", onNew);
        socket.off("notification:read", onRead);
        socket.off("notification:read-all", onRead);
      };
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [qc]);
}
