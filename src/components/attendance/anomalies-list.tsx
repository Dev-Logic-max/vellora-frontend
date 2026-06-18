"use client";

import { AlertTriangle, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { useAnomalies, useResolveAnomaly } from "@/features/attendance/attendance";
import { ANOMALY_TYPE_LABELS, SEVERITY_STYLES } from "@/features/attendance/status";
import { cn } from "@/lib/utils";

export function AnomaliesList() {
  const { data: anomalies, isLoading, isError } = useAnomalies("open");
  const resolve = useResolveAnomaly();

  if (isError) return <p className="text-sm text-destructive">Couldn&apos;t load anomalies.</p>;
  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  if (!anomalies || anomalies.length === 0)
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No open anomalies"
        description="Late arrivals, early leaves and over-hours show up here for review."
      />
    );

  return (
    <ul className="space-y-2">
      {anomalies.map((a) => (
        <li
          key={a.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                SEVERITY_STYLES[a.severity],
              )}
            >
              <AlertTriangle className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {ANOMALY_TYPE_LABELS[a.type] ?? a.type}
                {a.employee ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {a.employee.firstName} {a.employee.lastName}
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {a.note ?? new Date(a.detectedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AttendancePill status={a.severity} label={a.severity} />
            <Button
              variant="outline"
              size="sm"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate({ id: a.id, status: "resolved" })}
            >
              <Check />
              Resolve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate({ id: a.id, status: "dismissed" })}
            >
              <X />
              Dismiss
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
