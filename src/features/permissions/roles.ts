import {
  Crown,
  Building2,
  UserCog,
  Map as MapIcon,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";

import type { MembershipRole, PlatformRole } from "@/features/session/types";

/**
 * Central role catalogue for the Permissions matrix + Admin role-hierarchy view.
 * Colors are keyed to the chart palette so they read consistently with RoleTag.
 * `level` orders the hierarchy (1 = highest authority).
 */
export interface RoleMeta {
  key: MembershipRole;
  label: string;
  short: string;
  /** One-line description of what the role does (hierarchy card). */
  blurb: string;
  icon: LucideIcon;
  level: number;
  /** Tailwind classes: soft fill + text + border, themed via chart vars. */
  tone: string;
  /** Solid accent var for the hierarchy rail / dot. */
  dot: string;
}

// FIXED role colors (theme-independent) — must match `RoleTag`'s ROLE_CLASSES so
// a role reads the same hue in the matrix, hierarchy, tables, and chips.
export const TENANT_ROLES: RoleMeta[] = [
  {
    key: "owner",
    label: "Owner",
    short: "Owner",
    blurb: "Full control of the company — billing, settings, and every module.",
    icon: Crown,
    level: 1,
    tone: "bg-amber-50 text-amber-700 border-amber-300/60",
    dot: "#d97706",
  },
  {
    key: "hr",
    label: "HR - Manager",
    short: "HR - Manager",
    blurb: "People operations across all stores — hiring, records, leave, docs.",
    icon: UserCog,
    level: 2,
    tone: "bg-violet-50 text-violet-700 border-violet-300/60",
    dot: "#7c3aed",
  },
  {
    key: "area_manager",
    label: "Area Manager",
    short: "Area Manager",
    blurb: "Oversees a cluster of stores in their scope.",
    icon: MapIcon,
    level: 3,
    tone: "bg-sky-50 text-sky-700 border-sky-300/60",
    dot: "#0284c7",
  },
  {
    key: "store_manager",
    label: "Store Manager",
    short: "Store Manager",
    blurb: "Runs a single store — its team, schedule, and attendance.",
    icon: Store,
    level: 4,
    tone: "bg-teal-50 text-teal-700 border-teal-300/60",
    dot: "#0d9488",
  },
  {
    key: "employee",
    label: "Employee",
    short: "Employee",
    blurb: "Self-service — own shifts, punches, leave, and documents.",
    icon: User,
    level: 5,
    tone: "bg-slate-100 text-slate-600 border-slate-300/60",
    dot: "#64748b",
  },
];

/** Quick lookup by role key. */
export const ROLE_META: Record<MembershipRole, RoleMeta> = Object.fromEntries(
  TENANT_ROLES.map((r) => [r.key, r]),
) as Record<MembershipRole, RoleMeta>;

/** The roles shown as permission-matrix columns (owner is fixed/full-access). */
export const MATRIX_ROLES: MembershipRole[] = TENANT_ROLES.map((r) => r.key);

/** Roles whose attendance/staff lists exclude the company leadership. */
export const STAFF_ROLES: MembershipRole[] = ["hr", "area_manager", "store_manager", "employee"];

// ── Platform plane (shown in the Admin role hierarchy, above tenant roles) ──
export interface PlatformRoleMeta {
  key: PlatformRole;
  label: string;
  blurb: string;
  icon: LucideIcon;
  tone: string;
  dot: string;
}

export const PLATFORM_ROLES_META: PlatformRoleMeta[] = [
  {
    key: "super_admin",
    label: "Super Admin",
    blurb: "Vellora platform owner — cross-tenant control over every company.",
    icon: Crown,
    tone: "bg-rose-50 text-rose-700 border-rose-300/60",
    dot: "#e11d48",
  },
  {
    key: "platform_admin",
    label: "Platform Admin",
    blurb: "Manages tenants, plans, and feature flags across the platform.",
    icon: Building2,
    tone: "bg-indigo-50 text-indigo-700 border-indigo-300/60",
    dot: "#4f46e5",
  },
  {
    key: "operations",
    label: "Operations",
    blurb: "Support & operations — read-mostly cross-tenant visibility.",
    icon: UserCog,
    tone: "bg-cyan-50 text-cyan-700 border-cyan-300/60",
    dot: "#0891b2",
  },
];
