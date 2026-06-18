"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Company, Group } from "./types";

export function useGroups() {
  return useQuery({ queryKey: ["groups"], queryFn: () => api.get<Group[]>("/api/groups") });
}

export function useGroupCompanies(id: string) {
  return useQuery({
    queryKey: ["group", id, "companies"],
    queryFn: () => api.get<Company[]>(`/api/groups/${id}/companies`),
    enabled: Boolean(id),
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; billingMode?: "consolidated" | "per_company" }) =>
      api.post<Group>("/api/groups", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useAttachCompany(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) =>
      api.post<void>(`/api/groups/${groupId}/companies/${companyId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["group", groupId, "companies"] });
      void qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useDetachCompany(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) =>
      api.delete<void>(`/api/groups/${groupId}/companies/${companyId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["group", groupId, "companies"] });
      void qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
