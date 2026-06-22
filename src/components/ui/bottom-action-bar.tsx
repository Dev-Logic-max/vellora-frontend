"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomActionBarProps {
  /** When true the bar slides up from the bottom; hidden otherwise. */
  open: boolean;
  /** Left-side message (e.g. "3 unsaved changes" or a hint). */
  message?: ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  saving?: boolean;
  /** Hide individual actions. */
  showReset?: boolean;
  showCancel?: boolean;
  className?: string;
}

/**
 * A floating action bar that pops up from the bottom of the page (Save / Reset /
 * Cancel). Sticks above the content with a soft accent shadow; reduced-motion
 * snaps. Used by the design tabs, permissions, and admin save flows.
 */
export function BottomActionBar({
  open,
  message,
  onSave,
  onReset,
  onCancel,
  saveLabel = "Save changes",
  saving = false,
  showReset = true,
  showCancel = true,
  className,
}: BottomActionBarProps) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
          className={cn(
            "sticky bottom-4 z-30 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-surface/95 px-4 py-3 shadow-accent-lg backdrop-blur-sm",
            className,
          )}
        >
          <span className="min-w-0 truncate text-sm text-muted-foreground">{message}</span>
          <div className="flex shrink-0 items-center gap-2">
            {showCancel && onCancel ? (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="size-4" /> Cancel
              </Button>
            ) : null}
            {showReset && onReset ? (
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="size-4" /> Reset
              </Button>
            ) : null}
            {onSave ? (
              <Button size="sm" onClick={onSave} disabled={saving}>
                <Save className="size-4" /> {saving ? "Saving…" : saveLabel}
              </Button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
