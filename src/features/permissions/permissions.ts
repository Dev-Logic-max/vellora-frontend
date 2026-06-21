"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { MembershipRole } from "@/features/session/types";
import type { MatrixCell } from "@/features/org/types";

export interface PermissionEntry {
  role: MembershipRole;
  resource: string;
  allowed: boolean;
}

/**
 * Permission matrix for a company. When `companyId` is provided we hit the
 * cross-tenant admin endpoint (platform users only); otherwise the caller's
 * active company. This powers the super-admin company picker on /permissions.
 */
export function usePermissionMatrix(companyId?: string | null) {
  return useQuery({
    queryKey: companyId ? ["permissions", "tenant", companyId] : ["permissions", "matrix"],
    queryFn: () =>
      companyId
        ? api.get<MatrixCell[]>(`/api/admin/tenants/${companyId}/permissions`)
        : api.get<MatrixCell[]>("/api/permissions"),
  });
}

export function useUpdatePermissions(companyId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries: PermissionEntry[]) =>
      companyId
        ? api.put<MatrixCell[]>(`/api/admin/tenants/${companyId}/permissions`, { entries })
        : api.put<MatrixCell[]>("/api/permissions", { entries }),
    onSuccess: () => {
      if (companyId) {
        void qc.invalidateQueries({ queryKey: ["permissions", "tenant", companyId] });
      } else {
        void qc.invalidateQueries({ queryKey: ["permissions", "matrix"] });
      }
    },
  });
}
