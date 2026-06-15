import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { DashboardMockup } from "@/components/marketing/mockups/dashboard-mockup";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden">
      {/* Soft brand glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[40rem] max-w-5xl bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)] opacity-60 blur-2xl"
      />

      <RevealGroup
        className="mx-auto w-full max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24"
        stagger={0.09}
      >
        <RevealItem>
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary" />
            {t("badge")}
          </span>
        </RevealItem>

        <RevealItem>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
            {t("title")}
          </h1>
        </RevealItem>

        <RevealItem>
          <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </RevealItem>

        <RevealItem>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-6 text-[0.95rem]" render={<Link href="/signup" />}>
              {t("ctaPrimary")}
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 text-[0.95rem]"
              render={<Link href="/contact" />}
            >
              {t("ctaSecondary")}
            </Button>
          </div>
        </RevealItem>

        <RevealItem>
          <p className="mt-5 text-xs text-muted-foreground">{t("trust")}</p>
        </RevealItem>

        <RevealItem className="mx-auto mt-14 max-w-5xl sm:mt-20">
          <DashboardMockup />
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
