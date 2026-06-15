"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-reveal primitives built on Framer Motion.
 * - Subtle fade-up (respecting prefers-reduced-motion: when reduced, we only fade).
 * - `Reveal` for single blocks; `RevealGroup` + `RevealItem` for staggered grids.
 */

const VIEWPORT = { once: true, margin: "-80px" } as const;

export function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children?: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay } },
  };
  return (
    <motion.div
      id={id}
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  const variants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
