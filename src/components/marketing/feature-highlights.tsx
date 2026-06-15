import { useTranslations } from "next-intl";
import { CalendarClock, QrCode, ShieldCheck, type LucideIcon } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

// Icons are paired with translated copy by index.
const ICONS: LucideIcon[] = [CalendarClock, QrCode, ShieldCheck];

type Item = { title: string; description: string };

export function FeatureHighlights() {
  const t = useTranslations("Highlights");
  const items = t.raw("items") as Item[];

  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <RevealItem key={item.title}>
              <Card className="hover-lift h-full p-6">
                <CardHeader className="px-0">
                  <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="font-display text-lg">{item.title}</CardTitle>
                  <CardDescription className="mt-1 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
