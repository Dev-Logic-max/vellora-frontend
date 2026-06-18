"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  Anomaly,
  AnomalyStatus,
  AttendanceLog,
  ClockInput,
  Correction,
  CorrectionStatus,
  LogFilters,
  PunchInput,
} from "./types";

function toQuery(q: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

const LOGS_KEY = "attendance-logs";
const ANOMALIES_KEY = "anomalies";
const CORRECTIONS_KEY = "corrections";

export function useLogs(filters: LogFilters, enabled = true) {
  return useQuery({
    queryKey: [LOGS_KEY, filters],
    queryFn: () =>
      api.get<AttendanceLog[]>(
        `/api/attendance/logs${toQuery(filters as Record<string, string | undefined>)}`,
      ),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useClock() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: [LOGS_KEY] });
  return {
    clockIn: useMutation({
      mutationFn: (input: ClockInput) => api.post<AttendanceLog>("/api/attendance/clock-in", input),
      onSuccess: invalidate,
    }),
    clockOut: useMutation({
      mutationFn: (input: PunchInput) =>
        api.post<AttendanceLog>("/api/attendance/clock-out", input),
      onSuccess: invalidate,
    }),
    breakStart: useMutation({
      mutationFn: (input: PunchInput) => api.post("/api/attendance/break/start", input),
      onSuccess: invalidate,
    }),
    breakEnd: useMutation({
      mutationFn: (input: PunchInput) => api.post("/api/attendance/break/end", input),
      onSuccess: invalidate,
    }),
  };
}

export function useSyncBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (events: unknown[]) =>
      api.post<{ applied: number; failed: number }>("/api/attendance/sync", { events }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [LOGS_KEY] }),
  });
}

// ── anomalies ─────────────────────────────────────────────────────────────────
export function useAnomalies(status?: AnomalyStatus) {
  return useQuery({
    queryKey: [ANOMALIES_KEY, status ?? "all"],
    queryFn: () =>
      api.get<Anomaly[]>(`/api/attendance/anomalies${status ? `?status=${status}` : ""}`),
  });
}

export function useResolveAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status?: AnomalyStatus; note?: string }) =>
      api.post<Anomaly>(`/api/attendance/anomalies/${id}/resolve`, { status, note }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ANOMALIES_KEY] });
      void qc.invalidateQueries({ queryKey: [LOGS_KEY] });
    },
  });
}

// ── corrections ───────────────────────────────────────────────────────────────
export function useCorrections(status: CorrectionStatus = "requested") {
  return useQuery({
    queryKey: [CORRECTIONS_KEY, status],
    queryFn: () => api.get<Correction[]>(`/api/attendance/corrections?status=${status}`),
  });
}

export function useRequestCorrection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      logId,
      field,
      newValue,
      reason,
    }: {
      logId: string;
      field: string;
      newValue: string;
      reason?: string;
    }) => api.post<Correction>(`/api/attendance/${logId}/corrections`, { field, newValue, reason }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [CORRECTIONS_KEY] }),
  });
}

export function useResolveCorrection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.post<Correction>(`/api/attendance/corrections/${id}/${action}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [CORRECTIONS_KEY] });
      void qc.invalidateQueries({ queryKey: [LOGS_KEY] });
    },
  });
}
