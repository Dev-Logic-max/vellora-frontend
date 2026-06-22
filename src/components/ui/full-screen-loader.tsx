"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

/**
 * A full-viewport overlay with a centered spinner and a light blurred backdrop.
 * Rendered via a portal to <body> so it always covers the whole screen (a parent
 * `transform`, e.g. a Framer motion wrapper, would otherwise scope `position:
 * fixed`). Shown briefly during auth transitions before redirecting.
 *
 * `delay` waits before showing — so a fast sign-in (which redirects almost
 * instantly) never flashes the overlay; it only appears if things take longer.
 */
export function FullScreenLoader({
  label = "Signing you in…",
  delay = 500,
}: {
  label?: string;
  delay?: number;
}) {
  // Starts hidden; a timer (async) flips it on after `delay`. No synchronous
  // setState in the effect → keeps the React-Compiler lint happy.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-200 flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <span className="size-10 animate-spin rounded-full border-[3px] border-accent-soft border-t-primary" />
      <p className="text-sm font-medium text-foreground-2">{label}</p>
    </motion.div>,
    document.body,
  );
}
