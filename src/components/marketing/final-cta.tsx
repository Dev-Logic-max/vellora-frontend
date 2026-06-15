import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/marketing/reveal";

export function FinalCta() {
  const t = useTranslations("FinalCta");

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-foreground px-6 py-16 text-center text-background sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 max-w-2xl bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_45%,transparent),transparent)] opacity-50 blur-2xl"
        />
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-background/70">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-11 px-6 text-[0.95rem]",
            )}
          >
            {t("ctaPrimary")}
            <ArrowRight />
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-11 px-6 text-[0.95rem] text-background hover:bg-background/10 hover:text-background",
            )}
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
