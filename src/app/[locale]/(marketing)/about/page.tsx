import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Compass, Gauge, Heart, Sparkles, type LucideIcon } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { PageHeader } from "@/components/marketing/page-header";
import { StatsBand } from "@/components/marketing/stats-band";
import { FinalCta } from "@/components/marketing/final-cta";

export const metadata: Metadata = {
  title: "About — Vellora",
  description: "Why we're building modern workforce management for multi-store teams.",
};

const VALUES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Heart,
    title: "Built for the floor",
    description: "We design for the managers and staff who run real stores, not just head office.",
  },
  {
    icon: Compass,
    title: "Clarity over clutter",
    description: "One restrained, premium interface — generous whitespace, no noise.",
  },
  {
    icon: Gauge,
    title: "Fast by default",
    description: "Every workflow should take minutes, not meetings. Speed is a feature.",
  },
  {
    icon: Sparkles,
    title: "Thoughtful AI",
    description: "We add intelligence where it genuinely saves time, never as a gimmick.",
  },
];

// PLACEHOLDER team — replace with real people/photos later.
const TEAM = [
  { name: "A. Rivera", role: "Founder & CEO" },
  { name: "J. Chen", role: "Head of Product" },
  { name: "M. Okafor", role: "Engineering Lead" },
  { name: "S. Park", role: "Design Lead" },
  { name: "L. Romano", role: "Customer Success" },
  { name: "D. Müller", role: "Head of Operations" },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-12 sm:pt-28">
        <PageHeader
          eyebrow="About Vellora"
          title="Workforce software that respects people's time"
          subtitle="We're building the HR and operations platform we wished existed when running multi-store teams."
        />
      </section>

      {/* Story */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16">
        <Reveal className="space-y-4 leading-relaxed text-pretty text-muted-foreground">
          <p>
            Vellora started with a simple frustration: running people operations across many
            locations still means juggling spreadsheets, group chats, and paper sign-in sheets.
            Managers lose hours every week to admin that software should have handled.
          </p>
          <p>
            So we set out to build one modern workspace for scheduling, attendance, leave, and
            hiring — fast enough for a busy store manager, structured enough for HR, and secure
            enough for a multi-country business. This site is a portfolio showcase of that vision.
          </p>
        </Reveal>
      </section>

      {/* Mission */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <Reveal className="rounded-3xl border border-border bg-foreground px-6 py-14 text-center text-background sm:px-12">
          <p className="text-sm font-semibold text-background/60">Our mission</p>
          <p className="mx-auto mt-3 max-w-3xl font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Give every multi-store team the tools to run their workforce with the clarity and
            confidence of a single great storefront.
          </p>
        </Reveal>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">What we value</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Principles behind the product
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <RevealItem
              key={title}
              className="hover-lift rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/5"
            >
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <StatsBand />

      {/* Team */}
      <section id="careers" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">Our team</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            The people building Vellora
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A small, senior team — names below are placeholders for this showcase.
          </p>
        </Reveal>
        <RevealGroup className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {TEAM.map((member) => (
            <RevealItem key={member.name} className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 font-display text-lg font-semibold text-primary">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <FinalCta />
    </>
  );
}
