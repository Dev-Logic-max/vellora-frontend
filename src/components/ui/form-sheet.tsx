"use client";

import type { ReactElement, ReactNode } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  /** Small gradient subtitle (dark→light, theme-tinted) under the title. */
  subtitle?: string;
  children: ReactNode;
  /** Footer action buttons (right side). A Cancel button is added automatically. */
  footer?: ReactNode;
  /** Hide the auto Cancel button (e.g. read-only sheets). */
  hideCancel?: boolean;
  className?: string;
}

/**
 * The standardized right-sheet (formalized in UI-3): a gradient-tinted header
 * with title + small subtitle, a scrollable body, and a footer with actions +
 * Cancel. Use for every functional right sidebar/sheet.
 */
export function FormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  subtitle,
  children,
  footer,
  hideCancel,
  className,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger render={trigger as ReactElement} /> : null}
      <SheetContent
        className={cn("w-full gap-0 p-0 sm:max-w-lg", className)}
        showCloseButton={false}
      >
        {/* Header — theme-tinted gradient wash. */}
        <div className="bg-linear-to-br from-accent-soft via-surface to-surface border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 bg-linear-to-r from-accent-strong to-foreground-2 bg-clip-text text-sm text-transparent">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Scrollable body (scrollbar hidden, still scrollable). */}
        <div className="scrollbar-none flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer — actions + Cancel. */}
        {footer || !hideCancel ? (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
            {!hideCancel ? (
              <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
            ) : null}
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
