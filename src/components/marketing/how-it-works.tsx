import { useTranslations } from "next-intl";
import { BarChart3, CalendarClock, Store, type LucideIcon } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

const ICONS: LucideIcon[] = [Store, CalendarClock, BarChart3];

type Step = { title: string; description: string };

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="company" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {t("title")}
        </h2>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = ICONS[i];
          return (
            <RevealItem key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-sm font-medium text-muted-foreground">
                  {t("stepLabel", { number: i + 1 })}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                {step.description}
              </p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
