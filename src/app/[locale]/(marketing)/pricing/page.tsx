import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { ComparisonTable } from "@/components/marketing/comparison-table";

export const metadata: Metadata = {
  title: "Pricing — Vellora",
  description: "Simple plans that scale with your stores. Start free, upgrade as you grow.",
};

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Pricing />

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:pb-28">
        <ComparisonTable />
      </section>

      <div className="border-t border-border bg-muted/20">
        <Faq />
      </div>

      <FinalCta />
    </>
  );
}
