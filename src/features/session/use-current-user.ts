"use client";

import { useQuery } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import type { CurrentUser } from "./types";

export const CURRENT_USER_KEY = ["current-user"] as const;

/**
 * Resolves the signed-in principal (identity + memberships + active tenant) from
 * the backend `GET /api/me`. The backend is the source of truth for tenancy.
 */
export function useCurrentUser() {
  return useQuery<CurrentUser, ApiError>({
    queryKey: CURRENT_USER_KEY,
    queryFn: () => api.get<CurrentUser>("/api/me"),
    staleTime: 60_000,
    retry: false,
  });
}
