import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion presets — apply consistently for a cohesive premium feel.
 * Reduced-motion is respected globally (CSS `prefers-reduced-motion` + the
 * dashboard `data-motion="off"` toggle), and `MotionConfig reducedMotion="user"`
 * can wrap subtrees; these variants stay subtle regardless.
 */

export const easeOut: Transition["ease"] = [0.22, 1, 0.36, 1];

/** A page/section rising into view. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

/** Container that staggers its children (cards, list rows). */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

/** A card lifting into place — pair with `staggerContainer`. */
export const cardItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } },
};

/** Right-sheet slide-in. */
export const sheetSlide: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.22, ease: easeOut } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.15, ease: easeOut } },
};

/** The shared sliding-selection spring (sidebar, tabs, segmented controls). */
export const slideSpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 38,
  mass: 0.6,
};
