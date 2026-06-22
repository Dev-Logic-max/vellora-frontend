"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * A slim progress bar with a GRADIENT fill (not a flat color) that animates its
 * width from 0 on mount (entrance). Defaults to the theme accent→tertiary wash;
 * pass `from`/`to` CSS colors to override (e.g. for a status meter). Clamps 0–100.
 */
export function ProgressBar({
  value,
  from = "rgb(var(--accent))",
  to = "rgb(var(--tertiary-accent))",
  animate = true,
  className,
  trackClassName,
}: {
  value: number;
  from?: string;
  to?: string;
  /** Animate the fill in from 0 on mount. */
  animate?: boolean;
  className?: string;
  trackClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const reduce = useReducedMotion();
  const shouldAnimate = animate && !reduce;
  // Start at 0 only when we'll animate; otherwise render the final width directly.
  const [width, setWidth] = useState(shouldAnimate ? 0 : pct);

  useEffect(() => {
    if (!shouldAnimate) return;
    // rAF (async) so the CSS transition runs from the initial 0 → pct.
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct, shouldAnimate]);

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-subtle",
        trackClassName,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", className)}
        style={{
          width: `${shouldAnimate ? width : pct}%`,
          backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
        }}
      />
    </div>
  );
}
