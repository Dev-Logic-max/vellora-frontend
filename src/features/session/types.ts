/**
 * Mirrors the backend `GET /api/me` payload (AuthenticatedUser). Phase 1 will
 * regenerate these from the OpenAPI spec via openapi-typescript; hand-typed here
 * so Phase 0 stays self-contained.
 */
export type MembershipRole = "owner" | "hr" | "area_manager" | "store_manager" | "employee";
export type ScopeType = "group" | "company" | "area" | "store" | "self";

export interface MembershipContext {
  companyId: string;
  role: MembershipRole;
  scopeType: ScopeType;
  scopeIds: string[];
}

export interface CurrentUser {
  supabaseUid: string;
  userId: string;
  email: string;
  name: string | null;
  memberships: MembershipContext[];
  companyId?: string;
  role?: MembershipRole;
  scopeType?: ScopeType;
  scopeIds?: string[];
}
