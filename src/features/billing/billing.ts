"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  CheckoutInput,
  EffectiveAccess,
  Invoice,
  Plan,
  PlanUpsertInput,
  Subscription,
  UsageMeter,
} from "./types";

const SUB_KEY = "billing-subscription";
const PLANS_KEY = "billing-plans";
const PUBLIC_PLANS_KEY = "public-plans";
const ADMIN_PLANS_KEY = "admin-plans";
const USAGE_KEY = "billing-usage";
const INVOICES_KEY = "billing-invoices";
const ENTITLEMENTS_KEY = "billing-entitlements";

export function usePlans() {
  return useQuery({
    queryKey: [PLANS_KEY],
    queryFn: () => api.get<Plan[]>("/api/billing/plans"),
    staleTime: 5 * 60_000,
  });
}

/** Public plan catalogue (active plans) — registration + company-create cards.
 * Unauthenticated-safe (no token required). */
export function usePublicPlans() {
  return useQuery({
    queryKey: [PUBLIC_PLANS_KEY],
    queryFn: () => api.get<Plan[]>("/api/plans"),
    staleTime: 5 * 60_000,
  });
}

/** All plans incl. inactive (Pricing module, super-admin). */
export function useAdminPlans() {
  return useQuery({
    queryKey: [ADMIN_PLANS_KEY],
    queryFn: () => api.get<Plan[]>("/api/admin/plans"),
    staleTime: 60_000,
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanUpsertInput }) =>
      api.put<Plan>(`/api/admin/plans/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY] });
      void qc.invalidateQueries({ queryKey: [PUBLIC_PLANS_KEY] });
      void qc.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanUpsertInput) => api.post<Plan>("/api/admin/plans", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY] });
      void qc.invalidateQueries({ queryKey: [PUBLIC_PLANS_KEY] });
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: [SUB_KEY],
    queryFn: () => api.get<Subscription | null>("/api/billing/subscription"),
  });
}

export function useUsage() {
  return useQuery({
    queryKey: [USAGE_KEY],
    queryFn: () => api.get<UsageMeter[]>("/api/billing/usage"),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: [INVOICES_KEY],
    queryFn: () => api.get<Invoice[]>("/api/billing/invoices"),
  });
}

/** Effective entitlements + limits for the active company (backend-authoritative). */
export function useEntitlements() {
  return useQuery({
    queryKey: [ENTITLEMENTS_KEY],
    queryFn: () => api.get<EffectiveAccess>("/api/billing/entitlements"),
    staleTime: 60_000,
  });
}

/** Start Stripe Checkout for a plan and redirect the browser to the session URL. */
export function useCheckout() {
  return useMutation({
    mutationFn: (input: CheckoutInput) =>
      api.post<{ url: string }>("/api/billing/checkout", input),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });
}

/** Open the Stripe Customer Portal. */
export function usePortal() {
  return useMutation({
    mutationFn: () => api.post<{ url: string }>("/api/billing/portal"),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });
}

export function useInvoiceDownload() {
  return useMutation({
    mutationFn: (id: string) => api.get<{ url: string }>(`/api/billing/invoices/${id}/pdf`),
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}

export const billingKeys = { invalidate: [SUB_KEY, USAGE_KEY, INVOICES_KEY] };
export function useInvalidateBilling() {
  const qc = useQueryClient();
  return () => billingKeys.invalidate.forEach((key) => void qc.invalidateQueries({ queryKey: [key] }));
}
