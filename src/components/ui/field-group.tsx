import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FieldGroupProps {
  /** Sub-heading shown before the divider rule. */
  title: string;
  children: ReactNode;
  /** Grid columns for the body (default 2). */
  cols?: 1 | 2;
  className?: string;
}

/**
 * A labeled form section: an accent-tinted sub-heading (dot + text, mirroring the
 * sidebar group headers) with a thin accent rule extending right, then a grid of
 * fields. The standard grouping used in the multi-step creation modals.
 */
export function FieldGroup({ title, children, cols = 2, className }: FieldGroupProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2.5">
        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
        <h4 className="shrink-0 text-xs font-semibold tracking-wide text-accent-strong uppercase [text-shadow:0_0_12px_rgb(var(--accent)/0.18)]">
          {title}
        </h4>
        <span className="h-px flex-1 bg-linear-to-r from-accent/30 to-transparent" />
      </div>
      <div className={cn("grid gap-x-3 gap-y-3.5", cols === 2 ? "grid-cols-2" : "grid-cols-1")}>
        {children}
      </div>
    </section>
  );
}

/** Helper to span a field across both grid columns (full width). */
export function FullWidth({ children }: { children: ReactNode }) {
  return <div className="col-span-2">{children}</div>;
}
