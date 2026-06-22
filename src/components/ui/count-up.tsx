"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Animated number that counts up from `from` → `value` on mount (and whenever
 * `value` changes). Dependency-free (rAF + ease-out). Honors reduced motion by
 * rendering the final value directly. Use for dashboard/report KPIs and meters.
 */
export function CountUp({
  value,
  from = 0,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(from);
  const fromRef = useRef(from);

  useEffect(() => {
    if (reduce) return; // reduced motion → render `value` directly (below)
    const start = performance.now();
    const startVal = fromRef.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      // setState happens inside a rAF callback (async), not synchronously in the effect.
      setDisplay(startVal + (value - startVal) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value; // next change animates from here
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);

  const shown = reduce ? value : display;
  const formatted = shown.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
