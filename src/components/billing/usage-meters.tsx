"use client";

import { useUsage } from "@/features/billing/billing";
import type { UsageMeter } from "@/features/billing/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  employees: "Employees",
  stores: "Stores",
  devices: "Devices",
  storage_gb: "Storage (GB)",
  ai_calls: "AI calls",
};

/** Bar color ramps green → amber → red as usage approaches the cap. */
function barColor(ratio: number): string {
  if (ratio >= 1) return "bg-danger";
  if (ratio >= 0.8) return "bg-warning";
  return "bg-success";
}

function Meter({ meter }: { meter: UsageMeter }) {
  const unlimited = meter.limit < 0;
  const ratio = unlimited ? 0 : meter.limit === 0 ? 1 : meter.used / meter.limit;
  const pct = Math.min(100, Math.round(ratio * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{LABELS[meter.metric] ?? meter.metric}</span>
        <span className="font-mono tabular-nums text-foreground">
          {meter.used}
          {unlimited ? " / ∞" : ` / ${meter.limit}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", unlimited ? "bg-success" : barColor(ratio))}
          style={{ width: unlimited ? "8%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function UsageMeters() {
  const { data, isLoading } = useUsage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </>
        ) : (
          (data ?? []).map((meter) => <Meter key={meter.metric} meter={meter} />)
        )}
      </CardContent>
    </Card>
  );
}
