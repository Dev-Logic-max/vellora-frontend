"use client";

import { Download, FileBarChart, Play, Plus } from "lucide-react";
import { useState } from "react";

import {
  useCreateReportDef,
  useExportRun,
  useReportDefs,
  useReportRuns,
  useRunReport,
} from "@/features/reports/reports";
import type { ReportDef, ReportType } from "@/features/reports/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

const TYPE_OPTIONS = [
  { value: "headcount", label: "Headcount" },
  { value: "attendance", label: "Attendance" },
  { value: "turnover", label: "Turnover" },
  { value: "labor", label: "Labor cost" },
];

const SCHEDULE_OPTIONS = [
  { value: "", label: "Manual" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function ReportRow({ def }: { def: ReportDef }) {
  const run = useRunReport();
  const exportRun = useExportRun();
  const { data: runs } = useReportRuns(def.id);
  const latest = runs?.[0];

  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div>
        <p className="text-sm font-medium text-foreground">{def.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {def.type} · {def.schedule ?? "manual"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {latest ? <StatusPill status={latest.status} /> : null}
        {latest?.status === "ready" ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Download"
            disabled={exportRun.isPending}
            onClick={() => exportRun.mutate(latest.id)}
          >
            <Download className="size-4" />
          </Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={run.isPending} onClick={() => run.mutate(def.id)}>
          <Play className="size-3.5" />
          Run
        </Button>
      </div>
    </div>
  );
}

export function SavedReportsPanel() {
  const { data, isLoading } = useReportDefs();
  const create = useCreateReportDef();
  const [name, setName] = useState("");
  const [type, setType] = useState<ReportType>("attendance");
  const [schedule, setSchedule] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <FormField
          id="report-name"
          label="Report name"
          className="w-52"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekly attendance"
        />
        <SelectField
          id="report-type"
          label="Type"
          className="w-40"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as ReportType)}
        />
        <SelectField
          id="report-schedule"
          label="Schedule"
          className="w-36"
          options={SCHEDULE_OPTIONS}
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />
        <Button
          disabled={!name || create.isPending}
          onClick={() =>
            create.mutate(
              {
                name,
                type,
                schedule: (schedule || undefined) as "daily" | "weekly" | "monthly" | undefined,
              },
              { onSuccess: () => setName("") },
            )
          }
        >
          <Plus className="size-4" />
          Save report
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : !data?.length ? (
        <EmptyState
          icon={FileBarChart}
          title="No saved reports"
          description="Save a report definition to run it on demand or on a schedule."
        />
      ) : (
        <div className="space-y-2">
          {data.map((def) => (
            <ReportRow key={def.id} def={def} />
          ))}
        </div>
      )}
    </div>
  );
}
