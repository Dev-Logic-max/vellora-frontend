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
  Settings,
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
}

const ALL_ROLES: MembershipRole[] = ["owner", "hr", "area_manager", "store_manager", "employee"];

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
  { label: "Companies", href: "/companies", icon: Building2, roles: ["owner", "hr"] },
  {
    label: "Stores",
    href: "/stores",
    icon: Store,
    roles: ["owner", "hr", "area_manager", "store_manager"],
  },
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
  { label: "Recruiting", href: "/recruiting", icon: Briefcase, roles: ["owner", "hr"] },
  { label: "Documents", href: "/documents", icon: FileText, roles: ALL_ROLES },
  { label: "Messages", href: "/messages", icon: MessagesSquare, roles: ALL_ROLES },
  { label: "Notifications", href: "/notifications", icon: Bell, roles: ALL_ROLES },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["owner", "hr", "area_manager", "store_manager"],
    soon: true,
  },
  { label: "Billing", href: "/settings/billing", icon: CreditCard, roles: ["owner"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["owner", "hr"] },
];

/** Nav filtered to a role. With no membership yet, only the dashboard shows. */
export function navForRole(role: MembershipRole | undefined): NavItem[] {
  if (!role) {
    return NAV_ITEMS.filter((item) => item.href === "/dashboard");
  }
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
