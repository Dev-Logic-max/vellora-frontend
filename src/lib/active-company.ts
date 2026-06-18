const KEY = "vellora:active-company";

/** The company the user has switched to (sent as x-company-id; backend validates). */
export function getActiveCompanyId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(KEY) ?? undefined;
}

export function setActiveCompanyId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(KEY, id);
  else localStorage.removeItem(KEY);
}
