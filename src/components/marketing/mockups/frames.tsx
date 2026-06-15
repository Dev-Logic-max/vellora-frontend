import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A faux browser window used to frame desktop product mockups. */
export function BrowserFrame({
  url = "app.vellora.com",
  children,
  className,
}: {
  url?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 shadow-foreground/5 ring-foreground/5",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto w-full max-w-xs truncate rounded-md bg-background px-3 py-1 text-center text-[11px] text-muted-foreground ring-1 ring-border">
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

/** A faux phone shell used to frame mobile product mockups. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto w-[16rem] overflow-hidden rounded-[2rem] border-[6px] border-foreground/90 bg-background shadow-2xl shadow-foreground/10",
        className,
      )}
    >
      <div className="relative">
        {/* notch */}
        <div className="absolute top-2 left-1/2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/20" />
        {children}
      </div>
    </div>
  );
}
