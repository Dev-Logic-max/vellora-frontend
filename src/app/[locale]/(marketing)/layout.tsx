import type { ReactNode } from "react";

import { NavBar } from "@/components/marketing/nav-bar";
import { Newsletter } from "@/components/marketing/newsletter";
import { Footer } from "@/components/marketing/footer";

// The parent [locale] layout already calls setRequestLocale, so this shared
// chrome (nav + newsletter + footer) renders with the correct locale.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="flex-1">{children}</main>
      <Newsletter />
      <Footer />
    </>
  );
}
