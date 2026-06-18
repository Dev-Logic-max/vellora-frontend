import type { MembershipRole } from "@/features/session/types";

export type CompanyStatus = "pending" | "active" | "inactive" | "suspended" | "deleted";
export type StoreStatus = "pending" | "active" | "inactive" | "suspended" | "archived";
export type BillingMode = "consolidated" | "per_company";

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
  headOfficeAddress: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on the list endpoint (the caller's role in that company). */
  role?: MembershipRole;
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

export interface Store {
  id: string;
  companyId: string;
  name: string;
  code: string | null;
  category: string | null;
  status: StoreStatus;
  country: string | null;
  address: string | null;
  postalCode: string | null;
  timezone: string;
  capacity: number;
  headStore: boolean;
  openingHours: Record<string, unknown>;
  managerUserId: string | null;
  createdAt: string;
  updatedAt: string;
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
