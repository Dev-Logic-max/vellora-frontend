import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CalendarOff,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Permission-matrix module metadata: icon + which sidebar group it belongs to,
 * in sidebar order. Keys mirror the backend MODULES catalogue
 * (permission-defaults.ts). Modules absent here fall back to a generic icon.
 */
export interface ModuleMeta {
  key: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

/** Group order matches the sidebar (nav-config NAV_GROUPS). */
export const MODULE_GROUP_ORDER = [
  "Overview",
  "Workforce",
  "Organization",
  "Communication",
  "Administration",
] as const;

/** In sidebar sequence; drives the matrix row order + grouping. */
export const MODULE_CATALOG: ModuleMeta[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "reports", label: "Reports", icon: BarChart3, group: "Overview" },

  { key: "employees", label: "Employees", icon: Users, group: "Workforce" },
  { key: "shifts", label: "Scheduling", icon: CalendarDays, group: "Workforce" },
  { key: "attendance", label: "Attendance", icon: Clock, group: "Workforce" },
  { key: "leave", label: "Leave", icon: CalendarOff, group: "Workforce" },
  { key: "onboarding", label: "Onboarding", icon: ClipboardList, group: "Workforce" },

  { key: "companies", label: "Companies", icon: Building2, group: "Organization" },
  { key: "stores", label: "Stores", icon: Store, group: "Organization" },
  { key: "recruiting", label: "Recruiting", icon: Briefcase, group: "Organization" },

  { key: "messaging", label: "Messages", icon: MessagesSquare, group: "Communication" },
  { key: "documents", label: "Documents", icon: FileText, group: "Communication" },
  { key: "notifications", label: "Notifications", icon: Bell, group: "Communication" },

  { key: "billing", label: "Billing", icon: CreditCard, group: "Administration" },
  { key: "settings", label: "Settings", icon: Settings, group: "Administration" },
];

const META_BY_KEY = new Map(MODULE_CATALOG.map((m) => [m.key, m]));

/** Lookup with a humanized fallback for unknown/new module keys. */
export function moduleMeta(key: string): ModuleMeta {
  return (
    META_BY_KEY.get(key) ?? {
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: Settings,
      group: "Other",
    }
  );
}

export interface ModuleGroup {
  title: string;
  modules: ModuleMeta[];
}

/**
 * Groups the given module keys (from the API matrix) into sidebar-ordered groups,
 * each with its modules in sidebar sequence. Unknown keys land in an "Other" group.
 */
export function groupModules(keys: string[]): ModuleGroup[] {
  const order = new Map(MODULE_CATALOG.map((m, i) => [m.key, i]));
  const present = keys
    .map(moduleMeta)
    .sort((a, b) => (order.get(a.key) ?? 999) - (order.get(b.key) ?? 999));

  const byGroup = new Map<string, ModuleMeta[]>();
  for (const m of present) {
    const list = byGroup.get(m.group) ?? [];
    list.push(m);
    byGroup.set(m.group, list);
  }

  const groups: ModuleGroup[] = [];
  for (const title of MODULE_GROUP_ORDER) {
    const modules = byGroup.get(title);
    if (modules?.length) groups.push({ title, modules });
  }
  // Any leftover groups (e.g. "Other") after the known ones.
  for (const [title, modules] of byGroup) {
    if (!MODULE_GROUP_ORDER.includes(title as (typeof MODULE_GROUP_ORDER)[number])) {
      groups.push({ title, modules });
    }
  }
  return groups;
}
