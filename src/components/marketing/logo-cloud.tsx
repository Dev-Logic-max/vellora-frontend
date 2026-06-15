import { useTranslations } from "next-intl";
import { Building2, Coffee, Dumbbell, ShoppingBag, Store, UtensilsCrossed } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

// Placeholder industry "logos" — swap for real customer logos later.
const INDUSTRIES = [
  { label: "Retail Co.", icon: ShoppingBag },
  { label: "Café Group", icon: Coffee },
  { label: "Restaurants", icon: UtensilsCrossed },
  { label: "Franchise", icon: Store },
  { label: "Fitness", icon: Dumbbell },
  { label: "Hospitality", icon: Building2 },
];

export function LogoCloud() {
  const t = useTranslations("LogoCloud");

  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Reveal>
          <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("title")}
          </p>
        </Reveal>
        <RevealGroup
          className="mt-8 grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
          stagger={0.06}
        >
          {INDUSTRIES.map(({ label, icon: Icon }) => (
            <RevealItem
              key={label}
              className="flex items-center justify-center gap-2 text-muted-foreground opacity-70 grayscale transition-opacity hover:opacity-100"
            >
              <Icon className="size-5" />
              <span className="font-display text-sm font-semibold tracking-tight">{label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
