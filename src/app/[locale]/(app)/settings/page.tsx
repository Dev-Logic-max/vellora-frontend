"use client";

import { CreditCard, Palette, ShieldCheck, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Link } from "@/i18n/navigation";

interface SettingLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const LINKS: SettingLink[] = [
  {
    href: "/permissions",
    label: "Permissions",
    description: "Control which roles can access each module.",
    icon: ShieldCheck,
  },
  {
    href: "/settings/design",
    label: "Design",
    description: "Theme, layout, and component preferences.",
    icon: Palette,
  },
  {
    href: "/settings/billing",
    label: "Billing",
    description: "Plan, invoices, and usage.",
    icon: CreditCard,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your company configuration." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-accent-md"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-3 font-display font-semibold text-foreground group-hover:text-primary">
              {label}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
