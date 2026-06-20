"use client";

import { Sparkles } from "lucide-react";

import { useInsights } from "@/features/reports/reports";
import { Skeleton } from "@/components/ui/skeleton";

/** AI insight summary (Gemini) for the current store scope. */
export function InsightCard({ storeId }: { storeId?: string }) {
  const { data, isLoading } = useInsights(storeId);
  return (
    <div className="rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 p-5 text-white">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4" />
        <h3 className="font-display text-sm font-semibold">AI insights</h3>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-12 w-full bg-white/20" />
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-white/90">{data?.summary}</p>
      )}
    </div>
  );
}
