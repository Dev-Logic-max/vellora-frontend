"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Company, CompanyUsage } from "./types";

export function useCompanies() {
  return useQuery({ queryKey: ["companies"], queryFn: () => api.get<Company[]>("/api/companies") });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => api.get<Company>(`/api/companies/${id}`),
    enabled: Boolean(id),
  });
}

export function useCompanyUsage(id: string) {
  return useQuery({
    queryKey: ["company", id, "usage"],
    queryFn: () => api.get<CompanyUsage>(`/api/companies/${id}/usage`),
    enabled: Boolean(id),
  });
}

export interface CompanyOffice {
  label?: string;
  city?: string;
  country?: string;
  address?: string;
}

export interface CustomPricing {
  pricePerEmployee?: number;
  pricePerDevice?: number;
  extraStoragePricePerGb?: number;
  storageLimitGb?: number;
  storageFrom?: string;
  storageTo?: string;
  discountPct?: number;
  discountFrom?: string;
  discountTo?: string;
}

export interface CompanyInput {
  name: string;
  country?: string;
  currency?: string;
  timezone?: string;
  groupId?: string;
  ownerUserId?: string;
  registrationNumber?: string;
  companyEmail?: string;
  phone?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  headOfficeAddress?: string;
  offices?: CompanyOffice[];
  planKey?: string;
  customPricing?: CustomPricing;
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => api.post<Company>("/api/companies", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["companies"] });
      void qc.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CompanyInput>) => api.patch<Company>(`/api/companies/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["companies"] });
      void qc.invalidateQueries({ queryKey: ["company", id] });
    },
  });
}

export function useDeactivateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Company>(`/api/companies/${id}/deactivate`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}
