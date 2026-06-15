import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/marketing/reveal";

type Item = { question: string; answer: string };

export function Faq() {
  const t = useTranslations("Faq");
  const items = t.raw("items") as Item[];

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {t("title")}
        </h2>
      </Reveal>

      <Reveal>
        <Accordion defaultValue={["item-0"]} className="mt-12">
          {items.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`}>
              <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
