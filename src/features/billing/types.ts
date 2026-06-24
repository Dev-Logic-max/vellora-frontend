/**
 * Billing types — mirror the backend (15-billing). Hand-typed to match the
 * `/api/billing/*` contract (kept in sync manually like the other features).
 */
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";
export type InvoiceStatus = "draft" | "open" | "paid" | "void";
export type BillingInterval = "month" | "year";

export interface Plan {
  id: string;
  key: string;
  name: string;
  tier: number;
  priceMonth: string;
  priceYear: string;
  currency: string;
  entitlementsJson: Record<string, boolean>;
  limitsJson: Record<string, number>;
  // Card presentation (Pricing module / registration cards).
  tagline?: string | null;
  description?: string | null;
  highlights?: string[];
  popular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

/** Editable plan fields sent to the Pricing-module update/create endpoints. */
export interface PlanUpsertInput {
  key?: string;
  name?: string;
  tier?: number;
  priceMonth?: string;
  priceYear?: string;
  currency?: string;
  tagline?: string | null;
  description?: string | null;
  highlights?: string[];
  popular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  limits?: Record<string, number>;
  entitlements?: Record<string, boolean>;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  plan?: Plan;
}

export interface UsageMeter {
  metric: string;
  used: number;
  /** -1 = unlimited. */
  limit: number;
}

export interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  hostedUrl: string | null;
  pdfUrl: string | null;
  issuedAt: string | null;
  paidAt: string | null;
}

export interface EffectiveAccess {
  planKey: string;
  planName: string;
  entitlements: Record<string, boolean>;
  limits: Record<string, number>;
}

export interface CheckoutInput {
  planKey: string;
  interval: BillingInterval;
}
