import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface KpiTileProps {
  label: string;
  value: string;
  /** Optional delta chip, e.g. "+12%". */
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: LucideIcon;
  className?: string;
}

/** One number per tile (design-system §7): label · mono value · optional delta + glyph. */
export function KpiTile({ label, value, delta, icon: Icon, className }: KpiTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? (
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </span>
        {delta ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs font-medium",
              delta.direction === "up" && "bg-success-soft text-success",
              delta.direction === "down" && "bg-danger-soft text-danger",
              delta.direction === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            {delta.value}
          </span>
        ) : null}
      </div>
    </div>
  );
}
