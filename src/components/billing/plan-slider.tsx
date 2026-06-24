"use client";

import { useRef } from "react";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Plan } from "@/features/billing/types";

export type PlanInterval = "month" | "year";

/** Card accent palette cycled by tier so each plan reads distinctly + lightly. */
const CARD_TONES = [
  { ring: "border-slate-200", soft: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" },
  { ring: "border-sky-200", soft: "bg-sky-50/70", text: "text-sky-700", dot: "bg-sky-500" },
  { ring: "border-violet-200", soft: "bg-violet-50/70", text: "text-violet-700", dot: "bg-violet-500" },
  { ring: "border-emerald-200", soft: "bg-emerald-50/70", text: "text-emerald-700", dot: "bg-emerald-500" },
];

function priceLabel(plan: Plan, interval: PlanInterval) {
  const raw = interval === "year" ? plan.priceYear : plan.priceMonth;
  const n = Number(raw ?? 0);
  if (n === 0) return { amount: "Free", unit: "" };
  return { amount: `${plan.currency === "USD" ? "$" : ""}${n}`, unit: interval === "year" ? "/yr" : "/mo" };
}

interface PlanSliderProps {
  plans: Plan[];
  /** Selected plan key (controlled). */
  value?: string;
  onSelect?: (key: string) => void;
  interval: PlanInterval;
  onIntervalChange?: (interval: PlanInterval) => void;
  /** Hide the monthly/yearly toggle (e.g. when shown read-only). */
  hideToggle?: boolean;
  className?: string;
}

/**
 * Horizontal slider of vertical plan cards. ~3 visible on desktop, 2 on tablet,
 * 1 on mobile (scroll-snap). Prev/next buttons scroll a page; a monthly/yearly
 * toggle flips pricing. Used in registration, the company-create modal and the
 * Pricing page. Selecting a card calls `onSelect(key)`.
 */
export function PlanSlider({
  plans,
  value,
  onSelect,
  interval,
  onIntervalChange,
  hideToggle,
  className,
}: PlanSliderProps) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {!hideToggle && onIntervalChange ? (
        <div className="flex items-center justify-between gap-3">
          <IntervalToggle value={interval} onChange={onIntervalChange} />
          {plans.length > 2 ? (
            <div className="hidden items-center gap-1 sm:flex">
              <SliderButton dir={-1} onClick={() => scrollBy(-1)} />
              <SliderButton dir={1} onClick={() => scrollBy(1)} />
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={scroller}
        className="scrollbar-thin -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
      >
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            tone={CARD_TONES[i % CARD_TONES.length]}
            interval={interval}
            selected={value === plan.key}
            onSelect={() => onSelect?.(plan.key)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  tone,
  interval,
  selected,
  onSelect,
}: {
  plan: Plan;
  tone: (typeof CARD_TONES)[number];
  interval: PlanInterval;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = priceLabel(plan, interval);
  const features = plan.highlights ?? [];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        // 1 card on mobile, 2 on sm, 3 on lg — scroll-snap to each.
        "group relative flex w-[78%] shrink-0 snap-start flex-col rounded-2xl border-2 p-4 text-left transition-all duration-200 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]",
        selected
          ? "border-primary bg-accent-soft/50 shadow-[0_8px_30px_-12px_rgb(var(--accent-strong)/0.5)]"
          : cn("bg-surface hover:-translate-y-0.5 hover:shadow-md", tone.ring),
      )}
    >
      {plan.popular ? (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-primary to-accent-strong px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm">
          <Sparkles className="size-3" />
          Popular
        </span>
      ) : null}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{plan.name}</h3>
          {plan.tagline ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.tagline}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
          )}
        >
          {selected ? <Check className="size-3" /> : null}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-1">
        <span className="font-display text-2xl font-bold text-foreground">{price.amount}</span>
        {price.unit ? (
          <span className="mb-1 text-xs font-medium text-muted-foreground">{price.unit}</span>
        ) : null}
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-border/70 pt-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-foreground">
            <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", tone.dot)} />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

/** Monthly ⇄ Yearly pill toggle with a "save" hint on yearly. */
function IntervalToggle({
  value,
  onChange,
}: {
  value: PlanInterval;
  onChange: (interval: PlanInterval) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-sm">
      {(["month", "year"] as const).map((it) => (
        <button
          key={it}
          type="button"
          onClick={() => onChange(it)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === it
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {it === "month" ? "Monthly" : "Yearly"}
          {it === "year" ? <span className="ml-1 opacity-80">·2 mo free</span> : null}
        </button>
      ))}
    </div>
  );
}

function SliderButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === -1 ? "Previous plans" : "More plans"}
      className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent-strong"
    >
      {dir === -1 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
    </button>
  );
}
