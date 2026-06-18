"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEmployeePreferences, useUpdatePreferences } from "@/features/employees/employees";
import type { EmployeePreferences } from "@/features/employees/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type Day = (typeof DAYS)[number];

export function PreferencesTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useEmployeePreferences(employeeId);
  const update = useUpdatePreferences(employeeId);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Seed editable state the first time preferences load (React's "adjust state
  // when a prop changes during render" pattern — no effect, no ref).
  const [seenData, setSeenData] = useState<EmployeePreferences | null>(null);
  if (data && data !== seenData) {
    setSeenData(data);
    setAvailability((data.availability as Record<string, boolean>) ?? {});
  }

  const toggle = (day: Day) => {
    setAvailability((prev) => ({ ...prev, [day]: !prev[day] }));
    setSaved(false);
  };

  const save = async () => {
    await update.mutateAsync({ availability });
    setSaved(true);
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold text-foreground">Weekly availability</h2>
        <p className="text-sm text-muted-foreground">
          Days this person can be scheduled — feeds shift suggestions.
        </p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={cn(
                "h-9 w-14 rounded-lg border text-sm font-medium capitalize transition-colors",
                availability[day]
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save preferences"}
        </Button>
        {saved ? <span className="text-sm text-success">Saved</span> : null}
      </div>
    </div>
  );
}
