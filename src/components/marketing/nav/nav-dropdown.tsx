"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Desktop nav dropdown with hover-intent (a short close delay so the cursor can
 * travel into the panel) plus keyboard focus support and a Framer Motion
 * fade/slide. Used for both the wide Features mega-menu and the small dropdowns.
 */
export function NavDropdown({
  label,
  children,
  panelClassName,
}: {
  label: string;
  children: ReactNode;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLLIElement>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <li
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          open && "text-foreground",
        )}
      >
        {label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 6 }}
            transition={{ duration: 0.17, ease: "easeOut" }}
            className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3"
          >
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl ring-1 shadow-foreground/5 ring-foreground/5",
                panelClassName,
              )}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
