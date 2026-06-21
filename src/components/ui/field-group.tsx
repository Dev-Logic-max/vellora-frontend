import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FieldGroupProps {
  /** Sub-heading shown before the divider rule. */
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * A labeled form section: a small sub-heading with a thin rule extending to the
 * right, then a grid of fields. The standard grouping used in the multi-step
 * creation modals.
 */
export function FieldGroup({ title, children, className }: FieldGroupProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <h4 className="shrink-0 text-xs font-semibold tracking-wide text-foreground-2 uppercase">
          {title}
        </h4>
        <span className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">{children}</div>
    </section>
  );
}

/** Helper to span a field across both grid columns (full width). */
export function FullWidth({ children }: { children: ReactNode }) {
  return <div className="col-span-2">{children}</div>;
}
