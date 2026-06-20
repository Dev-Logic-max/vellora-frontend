"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AttendanceData,
  CreateReportDefInput,
  HeadcountData,
  LaborData,
  ReportDef,
  ReportFilters,
  ReportRun,
  TurnoverData,
} from "./types";

const DEFS_KEY = "report-defs";
const DASH_KEY = "report-dashboard";
const INSIGHTS_KEY = "report-insights";

function qs(filters: ReportFilters): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.storeId) params.set("storeId", filters.storeId);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function useHeadcount(filters: ReportFilters) {
  return useQuery({
    queryKey: [DASH_KEY, "headcount", filters],
    queryFn: () => api.get<HeadcountData>(`/api/reports/dashboards/headcount${qs(filters)}`),
  });
}

export function useAttendanceReport(filters: ReportFilters) {
  return useQuery({
    queryKey: [DASH_KEY, "attendance", filters],
    queryFn: () => api.get<AttendanceData>(`/api/reports/dashboards/attendance${qs(filters)}`),
  });
}

export function useTurnover(filters: ReportFilters) {
  return useQuery({
    queryKey: [DASH_KEY, "turnover", filters],
    queryFn: () => api.get<TurnoverData>(`/api/reports/dashboards/turnover${qs(filters)}`),
  });
}

export function useLaborCost(filters: ReportFilters) {
  return useQuery({
    queryKey: [DASH_KEY, "labor", filters],
    queryFn: () => api.get<LaborData>(`/api/reports/dashboards/labor${qs(filters)}`),
  });
}

export function useInsights(storeId?: string) {
  return useQuery({
    queryKey: [INSIGHTS_KEY, storeId ?? "all"],
    queryFn: () =>
      api.get<{ summary: string }>(`/api/reports/insights${storeId ? `?storeId=${storeId}` : ""}`),
    staleTime: 5 * 60_000,
  });
}

// ── saved defs ──────────────────────────────────────────────────────────────
export function useReportDefs() {
  return useQuery({ queryKey: [DEFS_KEY], queryFn: () => api.get<ReportDef[]>("/api/reports/defs") });
}

export function useCreateReportDef() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReportDefInput) => api.post<ReportDef>("/api/reports/defs", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DEFS_KEY] }),
  });
}

export function useRunReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (defId: string) => api.post<ReportRun>(`/api/reports/defs/${defId}/run`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DEFS_KEY] }),
  });
}

export function useReportRuns(defId: string | null) {
  return useQuery({
    queryKey: [DEFS_KEY, defId, "runs"],
    queryFn: () => api.get<ReportRun[]>(`/api/reports/defs/${defId}/runs`),
    enabled: Boolean(defId),
  });
}

export function useExportRun() {
  return useMutation({
    mutationFn: (runId: string) => api.get<{ url: string | null }>(`/api/reports/runs/${runId}/export`),
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}
