import type { ReactNode } from "react";
import { ArrowLeft, CalendarDays, ScanLine, ShieldCheck, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/marketing/wordmark";

const HIGHLIGHTS: { icon: LucideIcon; text: string }[] = [
  { icon: CalendarDays, text: "Schedule every store from one place" },
  { icon: ScanLine, text: "QR clock-in with automatic timesheets" },
  { icon: ShieldCheck, text: "Airtight, multi-tenant data isolation" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Form side */}
      <div className="flex w-full flex-col px-6 py-8 lg:w-1/2">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Wordmark />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </div>

      {/* Branded panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_60%,transparent),transparent)] opacity-50 blur-2xl"
        />
        <span className="font-display text-lg font-semibold tracking-tight text-background">
          Vellora
        </span>

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Run your workforce, not your spreadsheets.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-background/80">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/10">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-background/50">
          © {new Date().getFullYear()} Vellora. Built as a portfolio showcase.
        </p>
      </aside>
    </div>
  );
}
