"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AdminPlatformRequest,
  CreateRequestInput,
  PlatformRequest,
  PlatformRequestStatus,
} from "./types";

const TENANT_KEY = "platform-requests";
const ADMIN_KEY = "admin-requests";

// ── tenant side ────────────────────────────────────────────────────────────────
export function useMyRequests() {
  return useQuery({
    queryKey: [TENANT_KEY],
    queryFn: () => api.get<PlatformRequest[]>("/api/requests"),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => api.post<PlatformRequest>("/api/requests", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TENANT_KEY] }),
  });
}

/** Owner requests deletion of their own company (type-to-confirm the name). */
export function useRequestCompanyDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { confirmName: string; reason?: string }) =>
      api.post<PlatformRequest>("/api/requests/company-deletion", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TENANT_KEY] }),
  });
}

// ── platform side ──────────────────────────────────────────────────────────────
export function useAdminRequests() {
  return useQuery({
    queryKey: [ADMIN_KEY],
    queryFn: () => api.get<AdminPlatformRequest[]>("/api/admin/requests"),
  });
}

export function useRespondRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      response,
    }: {
      id: string;
      status?: PlatformRequestStatus;
      response?: string;
    }) => api.post(`/api/admin/requests/${id}/respond`, { status, response }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [ADMIN_KEY] }),
  });
}

export function useApproveDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/admin/requests/${id}/approve-deletion`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ADMIN_KEY] });
      void qc.invalidateQueries({ queryKey: ["admin-tenants"] });
      void qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
