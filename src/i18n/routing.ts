import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Add more locales here — message files + switcher pick them up automatically.
  locales: ["en", "es", "fr", "de", "it"],
  defaultLocale: "en",
  // No locale ever appears in the URL (/login, /dashboard for every language);
  // the active locale is resolved + persisted via the next-intl cookie.
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
