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
        <h4
          className="shrink-0 text-xs font-semibold tracking-wide text-accent-strong uppercase"
          style={{ textShadow: "0 1px 0 rgb(255 255 255 / 0.7)" }}
        >
          {title}
        </h4>
        {/* Inline accent rule mirroring the sidebar group headers. */}
        <span
          className="h-px flex-1 rounded-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(var(--accent) / 0.55), rgb(var(--accent) / 0.18) 60%, transparent)",
          }}
        />
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
