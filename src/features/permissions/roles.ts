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

export const TENANT_ROLES: RoleMeta[] = [
  {
    key: "owner",
    label: "Owner",
    short: "Owner",
    blurb: "Full control of the company — billing, settings, and every module.",
    icon: Crown,
    level: 1,
    tone: "bg-[var(--chart-3)]/12 text-[var(--chart-3)] border-[var(--chart-3)]/25",
    dot: "var(--chart-3)",
  },
  {
    key: "hr",
    label: "HR",
    short: "HR",
    blurb: "People operations across all stores — hiring, records, leave, docs.",
    icon: UserCog,
    level: 2,
    tone: "bg-accent-soft text-accent-strong border-accent/25",
    dot: "var(--accent)",
  },
  {
    key: "area_manager",
    label: "Area manager",
    short: "Area mgr",
    blurb: "Oversees a cluster of stores in their scope.",
    icon: MapIcon,
    level: 3,
    tone: "bg-[var(--chart-2)]/12 text-[var(--chart-2)] border-[var(--chart-2)]/25",
    dot: "var(--chart-2)",
  },
  {
    key: "store_manager",
    label: "Store manager",
    short: "Store mgr",
    blurb: "Runs a single store — its team, schedule, and attendance.",
    icon: Store,
    level: 4,
    tone: "bg-[var(--chart-4)]/12 text-[var(--chart-4)] border-[var(--chart-4)]/25",
    dot: "var(--chart-4)",
  },
  {
    key: "employee",
    label: "Employee",
    short: "Employee",
    blurb: "Self-service — own shifts, punches, leave, and documents.",
    icon: User,
    level: 5,
    tone: "bg-muted text-muted-foreground border-border",
    dot: "var(--muted-foreground)",
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
    label: "Super admin",
    blurb: "Vellora platform owner — cross-tenant control over every company.",
    icon: Crown,
    tone: "bg-[var(--chart-1)]/12 text-[var(--chart-1)] border-[var(--chart-1)]/25",
    dot: "var(--chart-1)",
  },
  {
    key: "platform_admin",
    label: "Platform admin",
    blurb: "Manages tenants, plans, and feature flags across the platform.",
    icon: Building2,
    tone: "bg-[var(--chart-5)]/12 text-[var(--chart-5)] border-[var(--chart-5)]/25",
    dot: "var(--chart-5)",
  },
  {
    key: "operations",
    label: "Operations",
    blurb: "Support & operations — read-mostly cross-tenant visibility.",
    icon: UserCog,
    tone: "bg-[var(--chart-2)]/12 text-[var(--chart-2)] border-[var(--chart-2)]/25",
    dot: "var(--chart-2)",
  },
];
