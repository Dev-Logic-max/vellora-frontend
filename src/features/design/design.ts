"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ActiveDesign, ThemePack, UpdateDesignInput } from "./types";

const DESIGN_KEY = "platform-design";

/** Active platform design (Aurora defaults if unset/unavailable). */
export function usePlatformDesign() {
  return useQuery({
    queryKey: [DESIGN_KEY],
    queryFn: () => api.get<ActiveDesign>("/api/platform-design"),
    staleTime: 5 * 60_000,
  });
}

/** Save theme key + token overrides (platform-admin). */
export function useUpdateDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDesignInput) =>
      api.patch<ActiveDesign>("/api/platform-design", input),
    onSuccess: (data) => qc.setQueryData([DESIGN_KEY], data),
  });
}

/** Restore pure Aurora. */
export function useResetDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ActiveDesign>("/api/platform-design/reset"),
    onSuccess: (data) => qc.setQueryData([DESIGN_KEY], data),
  });
}

/**
 * Theme packs surfaced in the Theme Packs tab. Only Aurora is live in v1.1;
 * the rest are "coming soon" (plan-gated `theme_packs` when shipped).
 */
export const THEME_PACKS: ThemePack[] = [
  {
    key: "aurora",
    label: "Aurora",
    description: "Multi-accent premium light — the default. Free on every plan.",
    swatches: ["79 70 229", "20 184 166", "139 92 246", "250 250 251"],
    status: "active",
  },
  {
    key: "midnight",
    label: "Midnight",
    description: "Deep dark theme with indigo glow. Coming soon.",
    swatches: ["99 102 241", "45 212 191", "20 20 22", "250 250 250"],
    status: "soon",
  },
  {
    key: "royal",
    label: "Royal",
    description: "Violet-led luxury palette. Coming soon.",
    swatches: ["147 51 234", "168 85 247", "126 34 206", "250 245 255"],
    status: "soon",
  },
  {
    key: "slate",
    label: "Slate",
    description: "Neutral, understated professional. Coming soon.",
    swatches: ["71 85 105", "100 116 139", "148 163 184", "248 250 252"],
    status: "soon",
  },
];
