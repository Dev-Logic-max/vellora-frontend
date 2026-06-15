"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

type Billing = "monthly" | "annual";

// Structure (placeholder prices, layout flags) — copy comes from messages by index.
const PLAN_META: { price: Record<Billing, string>; cadence: boolean; popular?: boolean }[] = [
  { price: { monthly: "$29", annual: "$24" }, cadence: true },
  { price: { monthly: "$79", annual: "$65" }, cadence: true, popular: true },
  { price: { monthly: "$199", annual: "$165" }, cadence: true },
  { price: { monthly: "Custom", annual: "Custom" }, cadence: false },
];

type PlanCopy = { name: string; description: string; cta: string; features: string[] };

export function Pricing() {
  const t = useTranslations("Pricing");
  const plans = t.raw("plans") as PlanCopy[];
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">{t("subtitle")}</p>

        {/* Billing toggle — visual only */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBilling(option)}
              aria-pressed={billing === option}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                billing === option
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(option)}
              {option === "annual" && (
                <span className="ml-1.5 text-xs text-primary">{t("save")}</span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      <RevealGroup className="mt-12 grid gap-6 lg:grid-cols-4" stagger={0.07}>
        {plans.map((plan, i) => {
          const meta = PLAN_META[i];
          return (
            <RevealItem key={plan.name}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-6",
                  meta.popular
                    ? "border-primary shadow-lg ring-1 shadow-primary/5 ring-primary"
                    : "hover-lift border-border ring-1 ring-foreground/5",
                )}
              >
                {meta.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {t("mostPopular")}
                  </Badge>
                )}

                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold tracking-tight text-foreground">
                    {meta.price[billing]}
                  </span>
                  {meta.cadence && (
                    <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
                  )}
                </div>
                <p className="mt-1 h-4 text-xs text-muted-foreground">
                  {meta.cadence && billing === "annual" ? t("billedAnnually") : " "}
                </p>

                <Button
                  variant={meta.popular ? "default" : "outline"}
                  size="lg"
                  className="mt-6 w-full"
                  render={<Link href="/signup" />}
                >
                  {plan.cta}
                </Button>

                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("tailored")}{" "}
        <Link
          href="/contact"
          className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto p-0")}
        >
          {t("talk")}
        </Link>
      </p>
    </section>
  );
}
