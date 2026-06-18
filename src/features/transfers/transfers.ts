"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { CreateTransferInput, Transfer, TransferStatus } from "./types";

const KEY = "transfers";

export function useTransfers(filters: { status?: TransferStatus; employeeId?: string } = {}) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.employeeId) params.set("employeeId", filters.employeeId);
      const qs = params.toString();
      return api.get<Transfer[]>(`/api/transfers${qs ? `?${qs}` : ""}`);
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransferInput) => api.post<Transfer>("/api/transfers", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDecideTransfer() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: [KEY] });
  return {
    approve: useMutation({
      mutationFn: (id: string) => api.post<Transfer>(`/api/transfers/${id}/approve`),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: (id: string) => api.post<Transfer>(`/api/transfers/${id}/reject`),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: (id: string) => api.post<Transfer>(`/api/transfers/${id}/cancel`),
      onSuccess: invalidate,
    }),
  };
}
