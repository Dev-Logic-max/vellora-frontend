"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { applyTimeFormat, readCachedTimeFormat } from "@/features/design/apply";

/**
 * General preferences. Currently the time-format (12h / 24h) toggle — times are
 * always STORED in UTC; this only changes how they're displayed everywhere
 * (tables, pickers, schedule). Persisted to the user's local prefs.
 */
export default function PreferencesPage() {
  // Initialize from cache (no setState-in-effect — React-Compiler safe).
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">(() => readCachedTimeFormat());

  const change = (fmt: "12h" | "24h") => {
    setTimeFormat(fmt);
    applyTimeFormat(fmt);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Preferences" description="Personalize how Vellora displays for you." />

      <section className="max-w-xl rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
            Time & format
          </h3>
          <span className="h-px flex-1 bg-linear-to-r from-accent/30 to-transparent" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="size-4 text-primary" />
              Time format
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Stored in UTC; shown in your store/local timezone. Choose 12-hour (AM/PM) or 24-hour.
            </p>
          </div>
          <SegmentedTabs
            tabs={[
              { value: "12h", label: "12-hour" },
              { value: "24h", label: "24-hour" },
            ]}
            value={timeFormat}
            onValueChange={(v) => change(v as "12h" | "24h")}
            layoutGroup="time-format"
            size="sm"
          />
        </div>

        <p className="mt-4 rounded-lg bg-surface-subtle/60 px-3 py-2 text-xs text-muted-foreground">
          Example:{" "}
          <span className="font-medium text-foreground">
            {timeFormat === "12h" ? "2:30 PM" : "14:30"}
          </span>
        </p>
      </section>
    </div>
  );
}
