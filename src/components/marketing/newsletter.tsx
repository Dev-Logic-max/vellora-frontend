"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // UI-only for now — wiring comes later.
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {submitted ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="size-4" />
            {t("success")}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex w-full max-w-sm items-center gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="h-10"
            />
            <Button type="submit" size="lg" className="h-10 shrink-0 px-4">
              {t("button")}
              <ArrowRight />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
