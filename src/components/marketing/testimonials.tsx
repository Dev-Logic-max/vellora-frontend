import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

// PLACEHOLDER testimonials — neutral names/roles only (translated copy lives in messages).
// Replace with real, attributed customer quotes (with permission) before launch.
type Item = { quote: string; name: string; role: string };

export function Testimonials() {
  const t = useTranslations("Testimonials");
  const items = t.raw("items") as Item[];

  return (
    <section className="border-t border-border bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {t("title")}
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map(({ quote, name, role }) => (
            <RevealItem key={name}>
              <Card className="hover-lift h-full p-6">
                <CardContent className="flex h-full flex-col px-0">
                  <Quote className="size-6 text-primary/40" />
                  <p className="mt-4 leading-relaxed text-pretty text-foreground">{quote}</p>
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="font-display text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
