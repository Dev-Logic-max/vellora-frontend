"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { SelectField } from "@/components/ui/select-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnomaliesList } from "@/components/attendance/anomalies-list";
import { CorrectionSheet } from "@/components/attendance/correction-sheet";
import { CorrectionsPanel } from "@/components/attendance/corrections-panel";
import { DevicesPanel } from "@/components/attendance/devices-panel";
import { LogsTable } from "@/components/attendance/logs-table";
import { TerminalsPanel } from "@/components/attendance/terminals-panel";
import { useStores } from "@/features/org/stores";
import { useLogs } from "@/features/attendance/attendance";
import { LOG_STATUS_OPTIONS } from "@/features/attendance/status";
import { downloadAttendanceCsv } from "@/features/attendance/export";
import type { AttendanceLog, AttendanceLogStatus } from "@/features/attendance/types";

const TABS = [
  { value: "logs", label: "Logs" },
  { value: "anomalies", label: "Anomalies" },
  { value: "corrections", label: "Corrections" },
  { value: "terminals", label: "Terminals & devices" },
];

export function AttendanceView() {
  const { data: stores } = useStores();
  const [tab, setTab] = useState("logs");
  const [storeId, setStoreId] = useState<string | undefined>();
  const [status, setStatus] = useState<AttendanceLogStatus | "">("");
  const [search, setSearch] = useState("");

  const [correcting, setCorrecting] = useState<AttendanceLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const tz = stores?.find((s) => s.id === storeId)?.timezone ?? "UTC";
  const { data: logs, isLoading } = useLogs({ storeId, status: status || undefined });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      const name = `${l.employee?.firstName ?? ""} ${l.employee?.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (l.employee?.uniqueCode ?? "").toLowerCase().includes(q);
    });
  }, [logs, search]);

  const storeOptions = stores?.map((s) => ({ value: s.id, label: s.name })) ?? [];

  const openCorrection = (log: AttendanceLog) => {
    setCorrecting(log);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        description="Timesheets, anomalies, and the devices staff clock in from."
        actions={
          <Button variant="outline" onClick={() => void downloadAttendanceCsv({ storeId })}>
            <Download />
            Export
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList variant="line" className="w-max">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="logs" className="space-y-4 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or ID…"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Combobox
              className="sm:w-56"
              options={storeOptions}
              value={storeId}
              onChange={setStoreId}
              placeholder="All stores"
            />
            <SelectField
              id="log-status-filter"
              className="sm:w-44"
              placeholder="All statuses"
              options={LOG_STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceLogStatus | "")}
            />
          </div>
          <LogsTable logs={filteredLogs} isLoading={isLoading} tz={tz} onCorrect={openCorrection} />
        </TabsContent>

        <TabsContent value="anomalies" className="pt-2">
          <AnomaliesList />
        </TabsContent>

        <TabsContent value="corrections" className="pt-2">
          <CorrectionsPanel />
        </TabsContent>

        <TabsContent value="terminals" className="space-y-8 pt-2">
          <TerminalsPanel />
          <DevicesPanel />
        </TabsContent>
      </Tabs>

      <CorrectionSheet log={correcting} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
