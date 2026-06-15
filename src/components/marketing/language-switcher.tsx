"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

export function LanguageSwitcher({
  align = "start",
  placement = "bottom",
}: {
  align?: "start" | "end";
  placement?: "top" | "bottom";
}) {
  const locale = useLocale();
  const t = useTranslations("LanguageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectLocale = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  const offset = reduce ? 0 : placement === "top" ? 6 : -6;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("label")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Globe className="size-4" />
        <span className="uppercase">{locale}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offset }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl ring-1 shadow-foreground/5 ring-foreground/5",
              align === "end" ? "right-0" : "left-0",
              placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
            )}
          >
            {routing.locales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => selectLocale(l)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-muted",
                    l === locale ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {LABELS[l]}
                  {l === locale && <Check className="size-4 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
