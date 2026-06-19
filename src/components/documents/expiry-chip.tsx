"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/** Expiry chip (08-documents §7): amber within 30d, red once expired. */
export function ExpiryChip({
  expiresAt,
  className,
}: {
  expiresAt: string | null;
  className?: string;
}) {
  // Snapshot "now" once at mount via a lazy initializer — keeps render pure.
  const [now] = useState(() => Date.now());

  if (!expiresAt) return null;
  const exp = new Date(expiresAt).getTime();
  const days = Math.ceil((exp - now) / 86_400_000);

  let style = "bg-success-soft text-success";
  let label = `Valid · ${days}d`;
  if (days <= 0) {
    style = "bg-danger-soft text-danger";
    label = "Expired";
  } else if (days <= 30) {
    style = "bg-warning-soft text-warning";
    label = `Expires in ${days}d`;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
