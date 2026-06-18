"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  CoverageResponse,
  Shift,
  ShiftInput,
  ShiftTemplate,
  Suggestion,
} from "./types";

export interface ShiftQuery {
  storeId?: string;
  from?: string;
  to?: string;
  status?: string;
  employeeId?: string;
}

function toQuery(q: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

const SHIFTS_KEY = "shifts";

export function useShifts(query: ShiftQuery, enabled = true) {
  return useQuery({
    queryKey: [SHIFTS_KEY, query],
    queryFn: () =>
      api.get<Shift[]>(`/api/scheduling/shifts${toQuery(query as Record<string, string | undefined>)}`),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ShiftInput) => api.post<Shift>("/api/scheduling/shifts", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ShiftInput }) =>
      api.patch<Shift>(`/api/scheduling/shifts/${id}`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

export function useAssignShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employeeId }: { id: string; employeeId: string | null }) =>
      api.post<Shift>(`/api/scheduling/shifts/${id}/assign`, { employeeId }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

export function useShiftAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "cancel" }) =>
      api.post<Shift>(`/api/scheduling/shifts/${id}/${action}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ removed: boolean }>(`/api/scheduling/shifts/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

export function usePublishShifts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeId: string; from: string; to: string }) =>
      api.post<{ published: number }>("/api/scheduling/publish", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

// ── templates ─────────────────────────────────────────────────────────────────
export function useTemplates() {
  return useQuery({
    queryKey: ["shift-templates"],
    queryFn: () => api.get<ShiftTemplate[]>("/api/scheduling/templates"),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ShiftTemplate>) =>
      api.post<ShiftTemplate>("/api/scheduling/templates", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["shift-templates"] }),
  });
}

export function useApplyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storeId, weekStart }: { id: string; storeId: string; weekStart: string }) =>
      api.post<{ created: number }>(`/api/scheduling/templates/${id}/apply`, { storeId, weekStart }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

export function useCopyWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeId: string; fromWeekStart: string; toWeekStart: string }) =>
      api.post<{ created: number }>("/api/scheduling/copy-week", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [SHIFTS_KEY] }),
  });
}

// ── coverage & suggestions ──────────────────────────────────────────────────────
export function useCoverage(query: { storeId?: string; from: string; to: string }) {
  return useQuery({
    queryKey: ["coverage", query],
    queryFn: () =>
      api.get<CoverageResponse>(
        `/api/scheduling/coverage${toQuery(query as Record<string, string | undefined>)}`,
      ),
    enabled: Boolean(query.storeId),
  });
}

export function useSuggestions(query: { storeId?: string; from: string; to: string }) {
  return useQuery({
    queryKey: ["suggestions", query],
    queryFn: () =>
      api.get<Suggestion[]>(
        `/api/scheduling/suggestions${toQuery(query as Record<string, string | undefined>)}`,
      ),
    enabled: Boolean(query.storeId),
  });
}
