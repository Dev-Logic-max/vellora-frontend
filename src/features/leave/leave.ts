"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  BlackoutDate,
  ConflictResult,
  CreateRequestInput,
  Holiday,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "./types";

const REQUESTS_KEY = "leave-requests";
const BALANCES_KEY = "leave-balances";
const TYPES_KEY = "leave-types";
const HOLIDAYS_KEY = "holidays";

function toQuery(q: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

// ── requests ──────────────────────────────────────────────────────────────────
export function useLeaveRequests(filters: {
  status?: LeaveRequestStatus;
  employeeId?: string;
  mine?: boolean;
}) {
  return useQuery({
    queryKey: [REQUESTS_KEY, filters],
    queryFn: () =>
      api.get<LeaveRequest[]>(
        `/api/leave/requests${toQuery({
          status: filters.status,
          employeeId: filters.employeeId,
          mine: filters.mine ? "true" : undefined,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) =>
      api.post<LeaveRequest>("/api/leave/requests", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
      void qc.invalidateQueries({ queryKey: [BALANCES_KEY] });
    },
  });
}

export function useRequestConflicts(id: string | null) {
  return useQuery({
    queryKey: [REQUESTS_KEY, "conflicts", id],
    queryFn: () => api.get<ConflictResult>(`/api/leave/requests/${id}/conflicts`),
    enabled: Boolean(id),
  });
}

export function useDecideLeave() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
    void qc.invalidateQueries({ queryKey: [BALANCES_KEY] });
  };
  return {
    approve: useMutation({
      mutationFn: ({ id, note }: { id: string; note?: string }) =>
        api.post<LeaveRequest>(`/api/leave/requests/${id}/approve`, { note }),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ id, note }: { id: string; note?: string }) =>
        api.post<LeaveRequest>(`/api/leave/requests/${id}/reject`, { note }),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: (id: string) => api.post<LeaveRequest>(`/api/leave/requests/${id}/cancel`),
      onSuccess: invalidate,
    }),
  };
}

// ── balances ──────────────────────────────────────────────────────────────────
export function useLeaveBalances(filters: { employeeId?: string; year?: number }) {
  return useQuery({
    queryKey: [BALANCES_KEY, filters],
    queryFn: () =>
      api.get<LeaveBalance[]>(
        `/api/leave/balances${toQuery({
          employeeId: filters.employeeId,
          year: filters.year ? String(filters.year) : undefined,
        })}`,
      ),
  });
}

// ── policies (types) ──────────────────────────────────────────────────────────
export function useLeaveTypes() {
  return useQuery({
    queryKey: [TYPES_KEY],
    queryFn: () => api.get<LeaveType[]>("/api/leave/types"),
  });
}

export function useUpsertLeaveType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<LeaveType> & { id?: string }) =>
      id
        ? api.patch<LeaveType>(`/api/leave/types/${id}`, body)
        : api.post<LeaveType>("/api/leave/types", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TYPES_KEY] }),
  });
}

// ── holidays ──────────────────────────────────────────────────────────────────
export function useHolidays(year?: number, storeId?: string) {
  return useQuery({
    queryKey: [HOLIDAYS_KEY, year, storeId],
    queryFn: () =>
      api.get<Holiday[]>(
        `/api/leave/holidays${toQuery({ year: year ? String(year) : undefined, storeId })}`,
      ),
  });
}

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; name: string; storeId?: string; recurring?: boolean }) =>
      api.post<Holiday>("/api/leave/holidays", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [HOLIDAYS_KEY] }),
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/leave/holidays/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [HOLIDAYS_KEY] }),
  });
}

export function useBlackoutDates() {
  return useQuery({
    queryKey: ["blackout-dates"],
    queryFn: () => api.get<BlackoutDate[]>("/api/leave/blackout-dates"),
  });
}
