import type { ReactNode } from "react";

import "../../dashboard.css"; // Aurora dashboard theme (scoped to .app-shell)
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

/**
 * Guard for the authenticated app: no Supabase session → bounce to /login.
 * Tenant resolution + role come from the backend (GET /me) inside AppShell.
 */
export default async function AppGroupLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale: locale as Locale });
  }

  return <AppShell>{children}</AppShell>;
}
