"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import { useInsights } from "@/features/reports/reports";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * AI insight summary (Gemini) for the current store scope. Themed gradient
 * surface wrapped in an animated "gemini" gradient border (like the Gemini
 * search bar). Dismissable via the close button.
 */
export function InsightCard({ storeId }: { storeId?: string }) {
  const { data, isLoading } = useInsights(storeId);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="gemini-border overflow-hidden rounded-2xl">
      <div
        className="relative rounded-[calc(1rem-1.5px)] p-5"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgb(var(--accent) / 0.14), rgb(var(--tertiary-accent) / 0.10) 55%, rgb(var(--secondary-accent) / 0.12))",
        }}
      >
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss insights"
          className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface/70 hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-surface/70 text-accent-strong shadow-sm">
            <Sparkles className="size-4" />
          </span>
          <h3 className="font-display text-sm font-semibold text-foreground">AI insights</h3>
          <span className="rounded-full bg-surface/70 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-strong uppercase">
            Gemini
          </span>
        </div>

        {isLoading ? (
          <Skeleton className="mt-3 h-12 w-full" />
        ) : (
          <p className="mt-2 pr-6 text-sm leading-relaxed text-foreground-2">{data?.summary}</p>
        )}
      </div>
    </div>
  );
}
