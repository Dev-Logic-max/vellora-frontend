"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface Step {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  preview: React.ReactNode;
}

const STEPS: Step[] = [
  {
    key: "stores",
    eyebrow: "Step 1",
    title: "Create your stores",
    description: "Add each location — capacity, hours and managers — so everything else can hang off it.",
    href: "/stores",
    cta: "Add a store",
    preview: <StorePreview />,
  },
  {
    key: "shifts",
    eyebrow: "Step 2",
    title: "Plan the schedule",
    description: "Drag shifts onto the calendar, set breaks, and publish the week to your team.",
    href: "/scheduling",
    cta: "Open scheduling",
    preview: <ShiftPreview />,
  },
  {
    key: "onboarding",
    eyebrow: "Step 3",
    title: "Onboard your people",
    description: "Assign first-day checklists and track completion across every new hire.",
    href: "/onboarding",
    cta: "Set up onboarding",
    preview: <OnboardingPreview />,
  },
];

/** Onboarding GUIDE shown on an empty dashboard — Stores → Shifts → Onboarding.
 * Manual (Back / Next), never auto-advances or auto-hides; the user dismisses it
 * with the close button (or after reaching the last step). Reduced-motion safe. */
export function OnboardingShowcase() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();

  if (dismissed) return null;

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const go = (next: number) => {
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-accent-sm sm:p-8">
      {/* soft themed backdrop */}
      <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-tertiary-accent/10 blur-3xl" />

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss guide"
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-accent-strong uppercase">
            <Sparkles className="size-3.5" /> Setup guide · {step.eyebrow}
          </p>
          <div className="mt-2 min-h-30">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-display text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={step.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-accent-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-accent-md"
            >
              <Plus className="size-4" />
              {step.cta}
            </Link>

            {/* Manual Back / Next (Next becomes Done/close on the last step). */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => go(Math.max(0, index - 1))}
                disabled={index === 0}
                aria-label="Previous step"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent-soft hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="size-4" />
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-strong transition-colors hover:bg-accent hover:text-(--accent-foreground,white)"
                >
                  <Check className="size-4" /> Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => go(Math.min(STEPS.length - 1, index + 1))}
                  aria-label="Next step"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent-soft hover:text-accent-strong"
                >
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>

            {/* progress dots (click to jump) */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  aria-label={`Show ${s.title}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Animated preview */}
        <div className="relative h-56">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step.key}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28 * dir, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28 * dir, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {step.preview}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Mini UI previews (decorative; theme-tinted) ─────────────────────────── */
function PreviewCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface-subtle/60 p-3 shadow-sm">
      {children}
    </div>
  );
}

function StorePreview() {
  return (
    <PreviewCard>
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
          <Store className="size-4" />
        </span>
        <span className="text-sm font-semibold text-foreground">New store</span>
      </div>
      {[
        { label: "Name", value: "Downtown Flagship" },
        { label: "Capacity", value: "24 staff" },
        { label: "Hours", value: "09:00 – 21:00" },
      ].map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}
          className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-1.5"
        >
          <span className="text-xs text-muted-foreground">{r.label}</span>
          <span className="text-xs font-medium text-foreground">{r.value}</span>
        </motion.div>
      ))}
      <div className="mt-auto flex items-center gap-1.5 text-xs text-success">
        <MapPin className="size-3.5" /> Location set
      </div>
    </PreviewCard>
  );
}

function ShiftPreview() {
  const blocks = [
    { who: "Sara", time: "09–13", cls: "bg-accent-soft text-accent-strong border-accent/25", col: 0, top: 0 },
    { who: "Omar", time: "13–18", cls: "bg-success-soft text-success border-success/25", col: 1, top: 20 },
    { who: "Lina", time: "10–16", cls: "bg-warning-soft text-warning border-warning/25", col: 2, top: 8 },
  ];
  return (
    <PreviewCard>
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
          <CalendarDays className="size-4" />
        </span>
        <span className="text-sm font-semibold text-foreground">This week</span>
      </div>
      <div className="relative grid flex-1 grid-cols-3 gap-1.5">
        {blocks.map((b, i) => (
          <div key={b.who} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.13, duration: 0.32 }}
              style={{ marginTop: b.top }}
              className={cn("rounded-lg border px-2 py-1.5", b.cls)}
            >
              <p className="text-[11px] font-semibold tabular-nums">{b.time}</p>
              <p className="flex items-center gap-1 text-[10px] opacity-80">
                <Clock className="size-2.5" /> {b.who}
              </p>
            </motion.div>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

function OnboardingPreview() {
  const tasks = ["Sign contract", "Store tour", "Uniform & badge", "POS training"];
  return (
    <PreviewCard>
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
          <ClipboardList className="size-4" />
        </span>
        <span className="text-sm font-semibold text-foreground">Day-1 checklist</span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3" /> New hire
        </span>
      </div>
      {tasks.map((t, i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 + i * 0.12, duration: 0.28 }}
          className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5"
        >
          <CheckCircle2 className={cn("size-4", i < 2 ? "text-success" : "text-faint")} />
          <span className={cn("text-xs", i < 2 ? "text-muted-foreground line-through" : "text-foreground")}>
            {t}
          </span>
        </motion.div>
      ))}
    </PreviewCard>
  );
}
