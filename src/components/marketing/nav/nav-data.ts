import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  PlaneTakeoff,
  ScanLine,
  type LucideIcon,
} from "lucide-react";

/** Structure only — visible labels come from the `Nav` message namespace by key. */
export type NavLink = { key: string; href: string };
export type FeatureLink = NavLink & { icon: LucideIcon };

export const FEATURE_LINKS: FeatureLink[] = [
  { key: "scheduling", href: "/features#scheduling", icon: CalendarDays },
  { key: "attendance", href: "/features#attendance", icon: ScanLine },
  { key: "leave", href: "/features#leave", icon: PlaneTakeoff },
  { key: "recruiting", href: "/features#recruiting", icon: Briefcase },
  { key: "documents", href: "/features#documents", icon: FileCheck2 },
  { key: "onboarding", href: "/features#onboarding", icon: CheckCircle2 },
];

export const RESOURCE_LINKS: NavLink[] = [
  { key: "blog", href: "/blog" },
  { key: "pricing", href: "/pricing" },
  { key: "help", href: "/contact#help" },
];

export const COMPANY_LINKS: NavLink[] = [
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
  { key: "careers", href: "/about#careers" },
];

export const FEATURE_PROMO_HREF = "/features";
