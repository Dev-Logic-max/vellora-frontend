"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Store, StoreActivity, StoreAnalytics, StoreSettings } from "./types";

export function useStores() {
  return useQuery({ queryKey: ["stores"], queryFn: () => api.get<Store[]>("/api/stores") });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ["store", id],
    queryFn: () => api.get<Store>(`/api/stores/${id}`),
    enabled: Boolean(id),
  });
}

export function useStoreActivities(id: string) {
  return useQuery({
    queryKey: ["store", id, "activities"],
    queryFn: () => api.get<StoreActivity[]>(`/api/stores/${id}/activities`),
    enabled: Boolean(id),
  });
}

export interface StoreInput {
  name: string;
  code?: string;
  category?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  timezone?: string;
  capacity?: number;
  headStore?: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  settings?: StoreSettings;
}

export function useStoreAnalytics(id: string) {
  return useQuery({
    queryKey: ["store", id, "analytics"],
    queryFn: () => api.get<StoreAnalytics>(`/api/stores/${id}/analytics`),
    enabled: Boolean(id),
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StoreInput) => api.post<Store>("/api/stores", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useUpdateStore(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StoreInput>) => api.patch<Store>(`/api/stores/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["stores"] });
      void qc.invalidateQueries({ queryKey: ["store", id] });
    },
  });
}

export function useArchiveStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Store>(`/api/stores/${id}/archive`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useCreateActivity(storeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; color?: string }) =>
      api.post<StoreActivity>(`/api/stores/${storeId}/activities`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["store", storeId, "activities"] }),
  });
}
