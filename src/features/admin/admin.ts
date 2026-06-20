"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AdminPlan,
  FeatureFlag,
  ImpersonationState,
  PlatformAuditEntry,
  TenantDetail,
  TenantSummary,
} from "./types";

const TENANTS_KEY = "admin-tenants";
const FLAGS_KEY = "admin-flags";
const AUDIT_KEY = "admin-audit";
const PLANS_KEY = "admin-plans";

export function useTenants() {
  return useQuery({ queryKey: [TENANTS_KEY], queryFn: () => api.get<TenantSummary[]>("/api/admin/tenants") });
}

export function useTenant(id: string | null) {
  return useQuery({
    queryKey: [TENANTS_KEY, id],
    queryFn: () => api.get<TenantDetail>(`/api/admin/tenants/${id}`),
    enabled: Boolean(id),
  });
}

export function useAdminPlans() {
  return useQuery({ queryKey: [PLANS_KEY], queryFn: () => api.get<AdminPlan[]>("/api/admin/plans") });
}

export function useSetTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.post(`/api/admin/tenants/${id}/status`, { status }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TENANTS_KEY] }),
  });
}

export function useAssignPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, planId }: { id: string; planId: string }) =>
      api.post(`/api/admin/tenants/${id}/plan`, { planId }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TENANTS_KEY] }),
  });
}

export function useSetOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      entitlements,
      limits,
    }: {
      id: string;
      entitlements: Record<string, boolean>;
      limits: Record<string, number>;
    }) => api.post(`/api/admin/tenants/${id}/override`, { entitlements, limits }),
    onSuccess: (_d, vars) => void qc.invalidateQueries({ queryKey: [TENANTS_KEY, vars.id] }),
  });
}

export function useFlags() {
  return useQuery({ queryKey: [FLAGS_KEY], queryFn: () => api.get<FeatureFlag[]>("/api/admin/flags") });
}

export function useSetFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.post<FeatureFlag>("/api/admin/flags", { key, enabled }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [FLAGS_KEY] }),
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: [AUDIT_KEY],
    queryFn: () => api.get<PlatformAuditEntry[]>("/api/admin/audit"),
  });
}

export function useStartImpersonation() {
  return useMutation({
    mutationFn: (companyId: string) =>
      api.post<ImpersonationState>("/api/admin/impersonate/start", { companyId }),
  });
}

export function useStopImpersonation() {
  return useMutation({
    mutationFn: (companyId: string) =>
      api.post("/api/admin/impersonate/stop", { companyId }),
  });
}
