"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SearchResult } from "./types";

export function useSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => api.get<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 1,
    staleTime: 10_000,
  });
}
