"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MembershipRole } from "@/features/session/types";
import type { MatrixCell } from "./types";

export function usePermissionMatrix() {
  return useQuery({
    queryKey: ["permissions", "matrix"],
    queryFn: () => api.get<MatrixCell[]>("/api/permissions"),
  });
}

export interface PermissionEntry {
  role: MembershipRole;
  resource: string;
  allowed: boolean;
}

export function useUpdatePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries: PermissionEntry[]) => api.put<MatrixCell[]>("/api/permissions", { entries }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["permissions", "matrix"] }),
  });
}
