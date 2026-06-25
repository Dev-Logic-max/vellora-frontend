import type { MembershipRole } from "@/features/session/types";

export type CompanyStatus = "pending" | "active" | "inactive" | "suspended" | "deleted";
export type StoreStatus = "pending" | "active" | "inactive" | "suspended" | "archived";
export type BillingMode = "consolidated" | "per_company";

/** Per-company feature toggles (mirrors backend CompanySettings). */
export interface CompanySettings {
  /** Require a device fingerprint match (secondary to registration) to clock in. */
  requireDeviceFingerprint?: boolean;
}

export interface Company {
  id: string;
  groupId: string | null;
  name: string;
  country: string;
  currency: string;
  timezone: string;
  status: CompanyStatus;
  planId: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  ownerUserId: string | null;
  category: string | null;
  registrationNumber: string | null;
  companyEmail: string | null;
  phone: string | null;
  state: string | null;
  city: string | null;
  postalCode: string | null;
  headOfficeAddress: string | null;
  offices: { label?: string; city?: string; country?: string; address?: string }[];
  settings?: CompanySettings;
  createdAt: string;
  updatedAt: string;
  /** Present on the list endpoint (the caller's role in that company). */
  role?: MembershipRole;
  /** Directory aggregates (present on the list endpoint). */
  storeCount?: number;
  employeeCount?: number;
  ownerName?: string | null;
  ownerAvatarUrl?: string | null;
  planName?: string | null;
  /** Sample of employee avatars for the overlapping stack (up to 4). */
  employeeAvatars?: { name: string; avatarUrl: string | null }[];
}

export interface CompanyUsage {
  stores: number;
  members: number;
}

export interface Group {
  id: string;
  name: string;
  logoUrl: string | null;
  ownerUserIds: string[];
  billingMode: BillingMode;
  createdAt: string;
  updatedAt: string;
}

/** Per-store operational toggles (mirrors backend store settings). */
export interface StoreSettings {
  /** Link this store to a (future) POS system. */
  posEnabled?: boolean;
  /** Expose a public storefront profile. */
  publicProfile?: boolean;
  /** Notify managers when traffic hits peak thresholds. */
  peakAlerts?: boolean;
  /** Reporting currency override (defaults to the company currency). */
  currency?: string;
  /** Monthly revenue target used by analytics. */
  monthlyTarget?: number;
}

export interface Store {
  id: string;
  companyId: string;
  name: string;
  code: string | null;
  category: string | null;
  status: StoreStatus;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  timezone: string;
  capacity: number;
  headStore: boolean;
  logoUrl: string | null;
  bannerUrl: string | null;
  settings: StoreSettings;
  openingHours: Record<string, unknown>;
  managerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Directory aggregates (present on the list endpoint). */
  employeeCount?: number;
  employeeAvatars?: { name: string; avatarUrl: string | null }[];
}

/** Mock store analytics (revenue/profit/visitors/peak hours — POS placeholder). */
export interface StoreAnalytics {
  storeId: string;
  currency: string;
  period: string;
  revenueMtd: number;
  profitMtd: number;
  marginPct: number;
  laborCost: number;
  visitorsMtd: number;
  target: number;
  revenueChangePct: number;
  profitChangePct: number;
  visitorsChangePct: number;
  shiftsThisWeek: number;
  hoursScheduled: number;
  avgBasket: number;
  trend: { month: number; revenue: number; profit: number; visitors: number }[];
  hourly: { hour: number; traffic: number }[];
  peakHours: number[];
}

export interface StoreActivity {
  id: string;
  storeId: string;
  name: string;
  color: string;
  defaultStaffing: number;
  activeDays: string[];
}

export interface MatrixCell {
  role: MembershipRole;
  resource: string;
  action: string;
  allowed: boolean;
  source: "default" | "override";
}

export interface SearchResult {
  type: "company" | "store" | "employee";
  id: string;
  label: string;
  href: string;
}

export type Entitlements = Record<string, boolean>;
