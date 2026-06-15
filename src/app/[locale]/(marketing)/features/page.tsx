import type { ReactNode } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  MessageSquare,
  ScanLine,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { PageHeader } from "@/components/marketing/page-header";
import { FinalCta } from "@/components/marketing/final-cta";
import { ScheduleMockup } from "@/components/marketing/mockups/schedule-mockup";
import { AttendanceMockup } from "@/components/marketing/mockups/attendance-mockup";
import { LeaveMockup } from "@/components/marketing/mockups/leave-mockup";
import { AtsMockup } from "@/components/marketing/mockups/ats-mockup";

export const metadata: Metadata = {
  title: "Features — Vellora",
  description:
    "Scheduling, attendance, leave, recruiting, and more — one platform for every store.",
};

type Module = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  mockup: ReactNode;
};

const MODULES: Module[] = [
  {
    id: "scheduling",
    eyebrow: "Scheduling",
    title: "Plan every shift, across every location",
    description:
      "Drag-and-drop rosters, reusable templates, and demand-aware coverage keep each store staffed without the back-and-forth.",
    points: ["Reusable weekly templates", "Coverage & cost guardrails", "One-tap shift transfers"],
    mockup: <ScheduleMockup />,
  },
  {
    id: "attendance",
    eyebrow: "Attendance",
    title: "QR clock-in that builds timesheets for you",
    description:
      "Employees scan a store QR to clock in and out. Hours, breaks, and overtime are captured accurately and ready for payroll.",
    points: ["Store-bound QR check-in", "Automatic timesheets", "Anomaly flags & corrections"],
    mockup: <AttendanceMockup />,
  },
  {
    id: "leave",
    eyebrow: "Leave & approvals",
    title: "Time-off that runs itself",
    description:
      "Configurable policies, balances, and approval chains route requests to the right manager — nothing gets lost.",
    points: ["Accruals & carryover", "Multi-step approvals", "Public-holiday calendars"],
    mockup: <LeaveMockup />,
  },
  {
    id: "recruiting",
    eyebrow: "Recruiting (ATS)",
    title: "Hire for your stores, faster",
    description:
      "Post jobs, screen candidates, and schedule interviews from one pipeline — with a public careers site built in.",
    points: ["Branded careers site", "Candidate pipeline", "Interview scheduling"],
    mockup: <AtsMockup />,
  },
];

const MORE: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FileCheck2,
    title: "Documents",
    description: "Library, e-signature, expiry tracking, and role-based access.",
  },
  {
    icon: CheckCircle2,
    title: "Onboarding",
    description: "Task templates assigned automatically with progress tracking.",
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description: "Authenticated in-app chat and notifications across stores.",
  },
  {
    icon: CalendarDays,
    title: "Reports & analytics",
    description: "Headcount, attendance, turnover, and labor-cost dashboards.",
  },
  {
    icon: ScanLine,
    title: "Time tracking",
    description: "Accurate hours, breaks, and overtime, ready for payroll export.",
  },
  {
    icon: Sparkles,
    title: "AI assistance",
    description: "Resume parsing, JD drafting, and anomaly summaries with Gemini.",
  },
];

function ModuleSection({ module, reversed }: { module: Module; reversed: boolean }) {
  return (
    <Reveal
      id={module.id}
      className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      <div className={cn(reversed && "lg:order-2")}>
        <span className="text-sm font-semibold text-primary">{module.eyebrow}</span>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
          {module.title}
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">{module.description}</p>
        <ul className="mt-6 space-y-3">
          {module.points.map((point) => (
            <li key={point} className="flex items-center gap-3 text-sm text-foreground">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-3.5" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn(reversed && "lg:order-1")}>{module.mockup}</div>
    </Reveal>
  );
}

export default async function FeaturesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-12 sm:pt-28">
        <PageHeader
          eyebrow="Features"
          title="One platform for your entire workforce"
          subtitle="Everything operations and HR teams need to run multi-store businesses — built to work together, not bolted on."
        />
      </section>

      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-20 sm:gap-28 sm:py-28">
          {MODULES.map((module, i) => (
            <ModuleSection key={module.id} module={module} reversed={i % 2 === 1} />
          ))}
        </div>
      </section>

      <section id="security" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">And much more</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Built for the whole employee lifecycle
          </h2>
        </Reveal>
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MORE.map(({ icon: Icon, title, description }) => (
            <RevealItem key={title}>
              <Card className="hover-lift h-full p-6">
                <CardHeader className="px-0">
                  <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="font-display text-lg">{title}</CardTitle>
                  <CardDescription className="mt-1 leading-relaxed">{description}</CardDescription>
                </CardHeader>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Enterprise-grade security
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Multi-tenant isolation with row-level security, role-based access, encrypted storage,
              and audit trails — so every company&apos;s data stays its own.
            </p>
          </div>
        </Reveal>
      </section>

      <FinalCta />
    </>
  );
}
