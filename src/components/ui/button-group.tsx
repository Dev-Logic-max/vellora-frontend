"use client";

import { createElement, type ComponentType } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ButtonGroupOption {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  /** Tailwind classes applied when this option is active (theme-independent
   * accents, e.g. emerald for "working", rose for "off"). */
  activeClass?: string;
}

/**
 * A row of distinct selectable buttons (not a sliding-tab control). Each option
 * can carry its own icon + active color so semantically-different choices
 * (working vs off, break types, statuses) read at a glance. Replaces SegmentedTabs
 * where the user wants separate colored buttons.
 */
export function ButtonGroup({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const cols =
    options.length === 2
      ? "grid-cols-2"
      : options.length === 3
        ? "grid-cols-3"
        : options.length === 4
          ? "grid-cols-4"
          : "grid-cols-2";
  return (
    <div className={cn("grid gap-2", cols, className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border-2 font-medium transition-all",
              size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
              active
                ? (o.activeClass ?? "border-primary bg-accent-soft text-accent-strong")
                : "border-border bg-surface text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            {o.icon ? createElement(o.icon, { className: "size-4 shrink-0" }) : null}
            {o.label}
            {active && !o.icon ? <Check className="size-3.5" /> : null}
          </button>
        );
      })}
    </div>
  );
}
