import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CalendarOff,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Briefcase,
  LayoutDashboard,
  MessagesSquare,
  Palette,
  Settings,
  ShieldCheck,
  Shuffle,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { MembershipRole } from "@/features/session/types";

export interface NavItem {
  label: string;
  /** Locale-relative path (used with the i18n-aware Link). */
  href: string;
  icon: LucideIcon;
  /** Roles that may see this item (UI hint only — the API guards are the gate). */
  roles: MembershipRole[];
  /** Not built yet → rendered disabled with a "Soon" pill. */
  soon?: boolean;
  /** Shown only to users with a platform_role (cross-tenant operators). */
  platformOnly?: boolean;
}

export interface NavGroup {
  /** Uppercase sub-heading shown above the group (hidden when collapsed). */
  title: string;
  items: NavItem[];
}

const ALL_ROLES: MembershipRole[] = ["owner", "hr", "area_manager", "store_manager", "employee"];

/** Grouped navigation (4–8 per group). `navGroupsForRole` filters by role +
 * platform access and drops any group left empty. */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        roles: ["owner", "hr", "area_manager", "store_manager"],
      },
    ],
  },
  {
    title: "Workforce",
    items: [
      {
        label: "Employees",
        href: "/employees",
        icon: Users,
        roles: ["owner", "hr", "area_manager", "store_manager"],
      },
      { label: "Scheduling", href: "/scheduling", icon: CalendarDays, roles: ALL_ROLES },
      { label: "Attendance", href: "/attendance", icon: Clock, roles: ALL_ROLES },
      { label: "Leave", href: "/leave", icon: CalendarOff, roles: ALL_ROLES },
      { label: "Onboarding", href: "/onboarding", icon: ClipboardList, roles: ALL_ROLES },
      {
        label: "Transfers",
        href: "/transfers",
        icon: Shuffle,
        roles: ["owner", "hr", "area_manager", "store_manager"],
      },
    ],
  },
  {
    title: "Organization",
    items: [
      { label: "Companies", href: "/companies", icon: Building2, roles: ["owner", "hr"] },
      {
        label: "Stores",
        href: "/stores",
        icon: Store,
        roles: ["owner", "hr", "area_manager", "store_manager"],
      },
      { label: "Recruiting", href: "/recruiting", icon: Briefcase, roles: ["owner", "hr"] },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Messages", href: "/messages", icon: MessagesSquare, roles: ALL_ROLES },
      { label: "Documents", href: "/documents", icon: FileText, roles: ALL_ROLES },
      { label: "Notifications", href: "/notifications", icon: Bell, roles: ALL_ROLES },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Billing", href: "/settings/billing", icon: CreditCard, roles: ["owner"] },
      { label: "Design", href: "/settings/design", icon: Palette, roles: ["owner"] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["owner", "hr"] },
      {
        label: "Admin",
        href: "/admin",
        icon: ShieldCheck,
        roles: ALL_ROLES,
        platformOnly: true,
      },
    ],
  },
];

/**
 * Grouped nav filtered to a role. With no membership yet, only the dashboard
 * shows. Platform-only items (Admin) appear when `isPlatform`. Empty groups are
 * dropped so headings never render without items.
 */
export function navGroupsForRole(
  role: MembershipRole | undefined,
  isPlatform = false,
): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.platformOnly && !isPlatform) return false;
      if (!role) return item.href === "/dashboard";
      return item.roles.includes(role);
    }),
  })).filter((group) => group.items.length > 0);
}

/** Flat list of every nav item visible to a role (e.g. for mobile/search). */
export function navItemsForRole(
  role: MembershipRole | undefined,
  isPlatform = false,
): NavItem[] {
  return navGroupsForRole(role, isPlatform).flatMap((group) => group.items);
}
