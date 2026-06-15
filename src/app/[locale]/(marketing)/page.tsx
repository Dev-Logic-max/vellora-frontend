import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { FeatureHighlights } from "@/components/marketing/feature-highlights";
import { FeatureDeepDives } from "@/components/marketing/feature-deep-dives";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { StatsBand } from "@/components/marketing/stats-band";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <LogoCloud />
      <FeatureHighlights />
      <FeatureDeepDives />
      <HowItWorks />
      <StatsBand />
      <Pricing />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
