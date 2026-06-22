"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SegmentedTab<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Optional trailing count badge. */
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** "pill" = filled segmented control (default). "line" = underline tabs. */
  variant?: "pill" | "line";
  className?: string;
  /** Unique id so multiple tab rows on one page don't share the sliding layout. */
  layoutGroup?: string;
  size?: "sm" | "md";
}

/**
 * Themed tabs with a SLIDING active indicator (shared layout animation) — the
 * signature interaction. Supports inline icons + count badges. Reduced-motion
 * snaps instantly. Use for module sub-tabs and segmented toggles.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  variant = "pill",
  className,
  layoutGroup = "segmented-tabs",
  size = "md",
}: SegmentedTabsProps<T>) {
  const reduceMotion = useReducedMotion();
  // Slightly softer spring → a smooth glide (no jerk) between tabs.
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 360, damping: 34, mass: 0.8 };

  const isPill = variant === "pill";

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1",
        isPill
          ? "rounded-xl border border-border bg-surface-subtle p-1"
          : "border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 font-medium whitespace-nowrap transition-colors focus-visible:outline-none",
              size === "sm" ? "text-xs" : "text-sm",
              isPill
                ? cn(
                    "rounded-lg",
                    size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5",
                    // Active = soft accent gradient chip → accent-strong text.
                    active
                      ? "text-accent-strong"
                      : "text-muted-foreground hover:text-foreground",
                  )
                : cn(
                    "rounded-md",
                    size === "sm" ? "px-2.5 pb-2" : "px-3 pb-2.5",
                    active ? "text-accent-strong" : "text-muted-foreground hover:text-foreground",
                  ),
            )}
          >
            {/* Sliding active indicator — selected tab is a solid gradient
                (dark → light) button, like a default action button. Sits at z-0
                (NOT a negative z, which would hide it behind the tablist's own
                background); the label/icon ride above it via `relative z-10`. */}
            {active &&
              (isPill ? (
                <motion.span
                  layoutId={`${layoutGroup}-pill`}
                  transition={spring}
                  className="absolute inset-0 z-0 rounded-lg border border-accent/25 bg-surface shadow-accent-sm"
                  style={{
                    // Soft, light accent gradient (beautiful, not heavy) over white.
                    backgroundImage:
                      "linear-gradient(135deg, rgb(var(--accent) / 0.22), rgb(var(--tertiary-accent) / 0.14) 55%, rgb(var(--accent) / 0.10))",
                  }}
                />
              ) : (
                <motion.span
                  layoutId={`${layoutGroup}-underline`}
                  transition={spring}
                  className="absolute inset-x-0 -bottom-px z-0 h-0.5 rounded-full bg-accent"
                />
              ))}
            {Icon ? (
              <Icon
                data-tab-icon
                className={cn("relative z-10", size === "sm" ? "size-3.5" : "size-4")}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
            {tab.count != null ? (
              <span
                className={cn(
                  "relative z-10 ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums",
                  active ? "bg-accent/15 text-accent-strong" : "bg-muted text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
