import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Add more locales here — message files + switcher pick them up automatically.
  locales: ["en", "es", "fr", "de", "it"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
