import { useTranslations } from "next-intl";

import { RevealGroup, RevealItem } from "@/components/marketing/reveal";

// NOTE: These metrics are illustrative PLACEHOLDERS for the portfolio demo.
// Replace with real, verifiable numbers before any production / customer-facing use.
type Stat = { value: string; label: string };

export function StatsBand() {
  const t = useTranslations("Stats");
  const stats = t.raw("items") as Stat[];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="rounded-2xl bg-foreground px-6 py-12 text-background sm:px-12">
        <RevealGroup className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4" stagger={0.1}>
          {stats.map(({ value, label }) => (
            <RevealItem key={label} className="flex flex-col items-center">
              <dl>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {value}
                </dd>
              </dl>
              <p className="mt-2 text-sm text-background/70">{label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
