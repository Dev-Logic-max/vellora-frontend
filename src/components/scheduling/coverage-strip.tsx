"use client";

import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoverage } from "@/features/scheduling/scheduling";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function tone(required: number, scheduled: number): string {
  if (required === 0) return "bg-muted";
  if (scheduled >= required) return "bg-success/60";
  if (scheduled === 0) return "bg-danger/60";
  return "bg-warning/60";
}

/** Per-hour required-vs-scheduled heatmap for the visible days (04-shifts §5). */
export function CoverageStrip({
  storeId,
  days,
}: {
  storeId: string | undefined;
  days: string[];
}) {
  const { data, isLoading } = useCoverage({
    storeId,
    from: days[0],
    to: days[days.length - 1],
  });

  if (!storeId) return null;
  if (isLoading) return <Skeleton className="h-24 w-full" />;

  const cells = data?.cells ?? [];
  const cellFor = (date: string, hour: number) =>
    cells.find((c) => c.date === date && c.hour === hour);

  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Coverage
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-success/60" /> met
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-warning/60" /> short
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-danger/60" /> none
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {days.map((date) => (
          <div key={date} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-[10px] text-muted-foreground">
              {format(parseISO(date), "EEE")}
            </span>
            <div className="flex flex-1 gap-px">
              {HOURS.map((h) => {
                const c = cellFor(date, h);
                const required = c?.required ?? 0;
                const scheduled = c?.scheduled ?? 0;
                return (
                  <div
                    key={h}
                    title={`${date} ${h}:00 — ${scheduled}/${required}`}
                    className={cn("h-4 flex-1 rounded-[2px]", tone(required, scheduled))}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
