/** Platform-admin types — mirror the backend (P9-E). */
export interface TenantSummary {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  country: string | null;
  createdAt: string;
  employees: number;
  stores: number;
  ownerName: string | null;
  ownerAvatarUrl: string | null;
  employeeAvatars: { name: string; avatarUrl: string | null }[];
  subscription?: { status: string; plan?: { name: string } | null } | null;
}

export interface TenantDetail extends TenantSummary {
  override?: {
    entitlements: Record<string, boolean>;
    limits: Record<string, number>;
  } | null;
}

export interface AdminPlan {
  id: string;
  key: string;
  name: string;
  tier: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  updatedAt: string;
}

export interface PlatformAuditEntry {
  id: string;
  actorUserId: string;
  action: string;
  targetCompanyId: string | null;
  targetUserId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface ImpersonationState {
  companyId: string;
  companyName: string;
}
