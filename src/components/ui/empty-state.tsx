import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** A single primary action (button/link). */
  action?: ReactNode;
  className?: string;
}

/** Designed empty state: soft glyph tile + line + one primary action. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
          <Icon className="size-6" />
        </span>
      ) : null}
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
