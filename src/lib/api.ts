import { createClient } from "@/lib/supabase/client";
import { getActiveCompanyId } from "@/lib/active-company";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

/** Backend is the tenant authority; the active company is sent as a header it validates. */
const COMPANY_HEADER = "x-company-id";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function buildHeaders(extra?: HeadersInit, companyId?: string): Promise<Headers> {
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/json");

  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (companyId) {
    headers.set(COMPANY_HEADER, companyId);
  }
  return headers;
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Selects the active tenant among the user's memberships (validated server-side). */
  companyId?: string;
}

/**
 * Typed fetch wrapper. Attaches the Supabase access token, points at
 * NEXT_PUBLIC_API_URL, JSON-encodes the body, and throws ApiError on non-2xx.
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, companyId, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: await buildHeaders(headers, companyId ?? getActiveCompanyId()),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const parsed: unknown = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message =
      (parsed as { message?: string | string[] } | undefined)?.message?.toString() ??
      res.statusText;
    throw new ApiError(res.status, message, parsed);
  }
  return parsed as T;
}

export const api = {
  get: <T>(path: string, companyId?: string) => apiFetch<T>(path, { companyId }),
  post: <T>(path: string, body?: unknown, companyId?: string) =>
    apiFetch<T>(path, { method: "POST", body, companyId }),
  patch: <T>(path: string, body?: unknown, companyId?: string) =>
    apiFetch<T>(path, { method: "PATCH", body, companyId }),
  delete: <T>(path: string, companyId?: string) =>
    apiFetch<T>(path, { method: "DELETE", companyId }),
};
