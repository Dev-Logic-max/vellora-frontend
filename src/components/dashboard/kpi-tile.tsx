import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Decor = "bubbles" | "hexagon" | "dots";

interface KpiTileProps {
  label: string;
  value: string;
  /** Optional delta chip, e.g. "+12%". */
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: LucideIcon;
  /** Optional sparkline series — renders a tiny accent-tinted trend line. */
  sparkline?: number[];
  /** Light themed background motif in the bottom-right corner. */
  decor?: Decor;
  className?: string;
}

/** Decorative, low-opacity motif anchored bottom-right (theme-tinted). */
function CardDecor({ kind }: { kind: Decor }) {
  if (kind === "bubbles") {
    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-3 -bottom-3 size-24 text-accent opacity-[0.07]"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <circle cx="74" cy="74" r="26" />
        <circle cx="40" cy="84" r="12" />
        <circle cx="86" cy="40" r="9" />
      </svg>
    );
  }
  if (kind === "hexagon") {
    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-5 size-28 text-accent opacity-[0.06]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      >
        <polygon points="50,8 88,29 88,71 50,92 12,71 12,29" />
        <polygon points="50,26 72,38 72,62 50,74 28,62 28,38" />
      </svg>
    );
  }
  // dots
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute right-2 bottom-2 size-20 opacity-[0.12]"
      viewBox="0 0 60 60"
    >
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={12 + c * 14}
            cy={12 + r * 14}
            r="2.2"
            fill={`rgb(var(--chart-${((r + c) % 4) + 1}))`}
          />
        )),
      )}
    </svg>
  );
}

/** Tiny inline sparkline (accent-tinted) — dependency-free SVG polyline. */
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 96;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  );
}

/**
 * Premium KPI card (design-system §7): label · mono value · optional delta +
 * glyph, with a soft accent edge + glow on hover and an optional sparkline.
 */
export function KpiTile({
  label,
  value,
  delta,
  icon: Icon,
  sparkline,
  decor,
  className,
}: KpiTileProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-accent-sm transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 hover:shadow-accent-md",
        className,
      )}
    >
      {/* Soft accent top edge (premium lift). */}
      <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />
      {decor ? <CardDecor kind={decor} /> : null}

      <div className="relative z-10 flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? (
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-strong transition-colors group-hover:bg-accent/15">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </span>
          {delta ? (
            <span
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-xs font-medium",
                delta.direction === "up" && "border-success/25 bg-success-soft text-success",
                delta.direction === "down" && "border-danger/25 bg-danger-soft text-danger",
                delta.direction === "neutral" && "border-border bg-muted text-muted-foreground",
              )}
            >
              {delta.value}
            </span>
          ) : null}
        </div>
        {sparkline ? <Sparkline data={sparkline} /> : null}
      </div>
    </div>
  );
}
