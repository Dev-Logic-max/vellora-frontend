"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ActiveDesign, UpdateDesignInput } from "./types";

const DESIGN_KEY = "platform-design";

/** Active platform design (accent preset + optional overrides). */
export function usePlatformDesign() {
  return useQuery({
    queryKey: [DESIGN_KEY],
    queryFn: () => api.get<ActiveDesign>("/api/platform-design"),
    staleTime: 5 * 60_000,
  });
}

/** Save the selected accent (themeKey) + any token overrides (platform-admin). */
export function useUpdateDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDesignInput) =>
      api.patch<ActiveDesign>("/api/platform-design", input),
    onSuccess: (data) => qc.setQueryData([DESIGN_KEY], data),
  });
}

/** Restore the default (indigo accent, no overrides). */
export function useResetDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ActiveDesign>("/api/platform-design/reset"),
    onSuccess: (data) => qc.setQueryData([DESIGN_KEY], data),
  });
}
