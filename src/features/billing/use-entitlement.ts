"use client";

import { useEntitlements } from "./billing";

/**
 * Returns whether the active company's plan unlocks `feature`. Drives the
 * `LockedFeature` upgrade prompt across the app. UI gate only — the backend
 * PlanGuard is the real enforcement (api-conventions §Tenant & access).
 *
 * While loading we optimistically allow (`true`) so gated UI doesn't flash an
 * upgrade prompt before entitlements resolve.
 */
export function useEntitlement(feature: string): { allowed: boolean; loading: boolean } {
  const { data, isLoading } = useEntitlements();
  if (isLoading || !data) return { allowed: true, loading: isLoading };
  return { allowed: data.entitlements[feature] === true, loading: false };
}
