import { useTranslations } from "next-intl";
import { Github, Linkedin, Twitter, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/marketing/wordmark";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";

type Column = {
  id: "product" | "solutions" | "company" | "resources" | "legal";
  links: { key: string; href: string }[];
};

const COLUMNS: Column[] = [
  {
    id: "product",
    links: [
      { key: "features", href: "/features" },
      { key: "pricing", href: "/pricing" },
      { key: "security", href: "/features#security" },
      { key: "roadmap", href: "/blog" },
    ],
  },
  {
    id: "solutions",
    links: [
      { key: "retail", href: "/features#scheduling" },
      { key: "hospitality", href: "/features#attendance" },
      { key: "franchises", href: "/features#leave" },
      { key: "enterprise", href: "/pricing" },
    ],
  },
  {
    id: "company",
    links: [
      { key: "about", href: "/about" },
      { key: "careers", href: "/about#careers" },
      { key: "contact", href: "/contact" },
      { key: "blog", href: "/blog" },
    ],
  },
  {
    id: "resources",
    links: [
      { key: "help", href: "/contact#help" },
      { key: "guides", href: "/blog" },
      { key: "changelog", href: "/blog" },
      { key: "status", href: "/contact" },
    ],
  },
  {
    id: "legal",
    links: [
      { key: "privacy", href: "/legal/privacy" },
      { key: "terms", href: "/legal/terms" },
      { key: "cookies", href: "/legal/cookies" },
      { key: "dpa", href: "/legal/dpa" },
    ],
  },
];

const SOCIALS: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "X / Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "GitHub", icon: Github, href: "#" },
];

type ColumnCopy = Record<string, { heading: string; links: Record<string, string> }>;

export function Footer() {
  const t = useTranslations("Footer");
  const columns = t.raw("columns") as ColumnCopy;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          {/* Brand */}
          <div className="lg:pr-8">
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("description")}</p>
            <ul className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.id}>
              <h3 className="text-sm font-semibold text-foreground">
                {columns[column.id].heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.id}-${link.key}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {columns[column.id].links[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>{t("rights", { year: new Date().getFullYear() })}</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              {t("operational")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <LanguageSwitcher align="end" placement="top" />
            <Link href="/legal/terms" className="transition-colors hover:text-foreground">
              {t("columns.legal.links.terms")}
            </Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
              {t("columns.legal.links.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
