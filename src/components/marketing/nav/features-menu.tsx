"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  FEATURE_LINKS,
  FEATURE_PROMO_HREF,
  type NavLink,
} from "@/components/marketing/nav/nav-data";

type LinkCopy = Record<string, { title: string; description: string }>;

/** Contents of the wide Features mega-menu: grouped links + a promo card. */
export function FeaturesMenu() {
  const t = useTranslations("Nav");
  const copy = t.raw("features_links") as LinkCopy;

  return (
    <div className="grid w-[44rem] max-w-[calc(100vw-2rem)] grid-cols-[1fr_15rem] gap-2">
      {/* Grouped module links */}
      <ul className="grid grid-cols-2 gap-1">
        {FEATURE_LINKS.map(({ key, href, icon: Icon }) => (
          <li key={key}>
            <Link
              href={href}
              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{copy[key].title}</span>
                <span className="block text-xs text-muted-foreground">{copy[key].description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Featured promo card */}
      <Link
        href={FEATURE_PROMO_HREF}
        className="group flex flex-col justify-between rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted"
      >
        <div>
          {/* Small decorative "image" — a tokenized gradient thumbnail. */}
          <div className="mb-3 aspect-[16/10] overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklch,var(--primary)_40%,var(--background)))] ring-1 ring-foreground/10" />
          <span className="text-xs font-semibold text-primary">{t("promo.eyebrow")}</span>
          <p className="mt-1 font-display text-sm font-semibold text-foreground">
            {t("promo.title")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("promo.description")}</p>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {t("promo.cta")}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}

/** Contents of a small dropdown — a simple list of titled links. */
export function SimpleMenu({
  links,
  group,
}: {
  links: NavLink[];
  group: "resources_links" | "company_links";
}) {
  const t = useTranslations("Nav");
  const copy = t.raw(group) as LinkCopy;

  return (
    <ul className="grid w-60 gap-1">
      {links.map(({ key, href }) => (
        <li key={key}>
          <Link href={href} className="block rounded-xl p-3 transition-colors hover:bg-muted">
            <span className="block text-sm font-medium text-foreground">{copy[key].title}</span>
            <span className="block text-xs text-muted-foreground">{copy[key].description}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
