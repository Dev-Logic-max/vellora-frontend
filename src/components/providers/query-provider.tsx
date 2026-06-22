"use client";

import { useState, type ReactNode } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api";

/** Don't retry client errors (4xx) — a retry won't change a 401/403/404/422. */
function retry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

/**
 * On an auth failure (401 = expired/invalid session) anywhere, bounce to login
 * with a `?reason` so the page can explain why. Centralized so every query +
 * mutation gets consistent session handling instead of each screen guessing.
 */
function handleAuthError(error: unknown): void {
  if (typeof window === "undefined") return;
  if (error instanceof ApiError && error.status === 401) {
    const path = window.location.pathname;
    // Avoid redirect loops if we're already on an auth page.
    if (!path.includes("/login") && !path.includes("/signup")) {
      // Remember where the user was so we can return them there after re-login.
      const next = encodeURIComponent(path + window.location.search);
      window.location.assign(`/login?reason=session-expired&next=${next}`);
    }
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry,
          },
          mutations: { retry: false },
        },
        queryCache: new QueryCache({ onError: handleAuthError }),
        mutationCache: new MutationCache({ onError: handleAuthError }),
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
