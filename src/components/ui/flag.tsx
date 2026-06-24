"use client";

import * as Flags from "country-flag-icons/react/3x2";

import { cn } from "@/lib/utils";

type FlagComponent = (props: { title?: string; className?: string }) => React.ReactElement;

/**
 * Rounded country flag (3x2 SVG from `country-flag-icons`). Falls back to a
 * neutral chip with the code when the country isn't in the set. `code` is an
 * ISO-3166-1 alpha-2 (case-insensitive).
 */
export function Flag({
  code,
  className,
}: {
  code: string | null | undefined;
  className?: string;
}) {
  const cc = code?.toUpperCase();
  const Cmp = cc ? (Flags as Record<string, FlagComponent>)[cc] : undefined;
  if (!Cmp) {
    return (
      <span
        className={cn(
          "inline-flex h-3.5 w-5 items-center justify-center rounded-[3px] bg-muted text-[8px] font-semibold text-muted-foreground",
          className,
        )}
      >
        {cc ?? "—"}
      </span>
    );
  }
  return <Cmp title={cc} className={cn("h-3.5 w-5 rounded-[3px] object-cover", className)} />;
}
