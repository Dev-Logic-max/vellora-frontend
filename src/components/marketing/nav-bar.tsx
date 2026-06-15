"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/marketing/wordmark";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { NavDropdown } from "@/components/marketing/nav/nav-dropdown";
import { FeaturesMenu, SimpleMenu } from "@/components/marketing/nav/features-menu";
import { MobileMenu } from "@/components/marketing/nav/mobile-menu";
import { COMPANY_LINKS, RESOURCE_LINKS } from "@/components/marketing/nav/nav-data";

export function NavBar() {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Wordmark />

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          <NavDropdown label={t("features")} panelClassName="p-3">
            <FeaturesMenu />
          </NavDropdown>
          <li>
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("pricing")}
            </Link>
          </li>
          <NavDropdown label={t("resources")}>
            <SimpleMenu links={RESOURCE_LINKS} group="resources_links" />
          </NavDropdown>
          <NavDropdown label={t("company")}>
            <SimpleMenu links={COMPANY_LINKS} group="company_links" />
          </NavDropdown>
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher align="end" />
          <Button variant="ghost" size="lg" render={<Link href="/login" />}>
            {t("signIn")}
          </Button>
          <Button size="lg" render={<Link href="/signup" />}>
            {t("getStarted")}
          </Button>
        </div>

        <MobileMenu />
      </nav>
    </header>
  );
}
