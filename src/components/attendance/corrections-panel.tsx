"use client";

import { ArrowRight, Check, FileEdit, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCorrections, useResolveCorrection } from "@/features/attendance/attendance";
import type { Correction } from "@/features/attendance/types";

function fmt(field: string, value: string | null): string {
  if (!value) return "—";
  if (field.endsWith("_utc")) return new Date(value).toLocaleString();
  return value;
}

export function CorrectionsPanel() {
  const { data: corrections, isLoading, isError } = useCorrections("requested");
  const resolve = useResolveCorrection();

  if (isError) return <p className="text-sm text-destructive">Couldn&apos;t load corrections.</p>;
  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  if (!corrections || corrections.length === 0)
    return (
      <EmptyState
        icon={FileEdit}
        title="No pending corrections"
        description="Edit requests against a punch land here for manager approval."
      />
    );

  return (
    <ul className="space-y-2">
      {corrections.map((c: Correction) => {
        const e = c.log?.employee;
        return (
          <li
            key={c.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-foreground">
                {e ? `${e.firstName} ${e.lastName}` : "Attendance log"}
                <span className="ml-2 font-mono text-xs text-muted-foreground">{c.field}</span>
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-md bg-danger-soft px-2 py-0.5 text-danger line-through">
                  {fmt(c.field, c.oldValue)}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="rounded-md bg-success-soft px-2 py-0.5 text-success">
                  {fmt(c.field, c.newValue)}
                </span>
              </div>
              {c.reason ? <p className="text-xs text-muted-foreground">“{c.reason}”</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate({ id: c.id, action: "approve" })}
              >
                <Check />
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate({ id: c.id, action: "reject" })}
              >
                <X />
                Reject
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
