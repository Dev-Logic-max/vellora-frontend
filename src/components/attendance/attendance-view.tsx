"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock, Download, MonitorSmartphone, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import type { FilterValues } from "@/components/ui/filter-modal";
import { AnomaliesList } from "@/components/attendance/anomalies-list";
import { CorrectionSheet } from "@/components/attendance/correction-sheet";
import { CorrectionsPanel } from "@/components/attendance/corrections-panel";
import { DevicesPanel } from "@/components/attendance/devices-panel";
import { FingerprintToggleCard } from "@/components/attendance/fingerprint-toggle-card";
import { LogDetailSheet } from "@/components/attendance/log-detail-sheet";
import { LogsTable } from "@/components/attendance/logs-table";
import { TerminalsPanel } from "@/components/attendance/terminals-panel";
import { useStores } from "@/features/org/stores";
import { useDeleteLog, useLogs } from "@/features/attendance/attendance";
import { LOG_STATUS_OPTIONS } from "@/features/attendance/status";
import { downloadAttendanceCsv } from "@/features/attendance/export";
import type { AttendanceLog, AttendanceLogStatus } from "@/features/attendance/types";

type TabKey = "logs" | "anomalies" | "corrections" | "terminals";

const TABS: SegmentedTab<TabKey>[] = [
  { value: "logs", label: "Logs", icon: Clock },
  { value: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { value: "corrections", label: "Corrections", icon: Wrench },
  { value: "terminals", label: "Terminals & devices", icon: MonitorSmartphone },
];

export function AttendanceView() {
  const { data: stores } = useStores();
  const [tab, setTab] = useState<TabKey>("logs");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});

  const storeId = filters.storeId || undefined;
  const status = (filters.status as AttendanceLogStatus | undefined) || undefined;

  const [correcting, setCorrecting] = useState<AttendanceLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewing, setViewing] = useState<AttendanceLog | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleting, setDeleting] = useState<AttendanceLog | null>(null);
  const deleteLog = useDeleteLog();

  const tz = stores?.find((s) => s.id === storeId)?.timezone ?? "UTC";
  const { data: logs, isLoading } = useLogs({ storeId, status });

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

  const openView = (log: AttendanceLog) => {
    setViewing(log);
    setViewOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLog.mutateAsync(deleting.id);
      toast.success("Attendance record deleted");
      setDeleting(null);
    } catch {
      toast.error("Couldn't delete the record");
    }
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

      <SegmentedTabs tabs={TABS} value={tab} onValueChange={setTab} layoutGroup="attendance-tabs" />

      {tab === "logs" ? (
        <LogsTable
          logs={filteredLogs}
          isLoading={isLoading}
          tz={tz}
          onCorrect={openCorrection}
          onView={openView}
          onDelete={setDeleting}
          toolbar={{
            searchValue: search,
            onSearchChange: setSearch,
            searchPlaceholder: "Search employee or ID…",
            filters: [
              { key: "storeId", label: "Store", type: "select", options: storeOptions },
              { key: "status", label: "Status", type: "select", options: LOG_STATUS_OPTIONS },
            ],
            filterValues: filters,
            onFilterChange: setFilters,
          }}
        />
      ) : null}

      {tab === "anomalies" ? <AnomaliesList /> : null}
      {tab === "corrections" ? <CorrectionsPanel /> : null}
      {tab === "terminals" ? (
        <div className="space-y-8">
          <FingerprintToggleCard />
          <TerminalsPanel />
          <DevicesPanel />
        </div>
      ) : null}

      <CorrectionSheet log={correcting} open={sheetOpen} onOpenChange={setSheetOpen} />
      <LogDetailSheet log={viewing} tz={tz} open={viewOpen} onOpenChange={setViewOpen} />

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete attendance record?</DialogTitle>
            <DialogDescription>
              This permanently removes the punch
              {deleting?.employee
                ? ` for ${deleting.employee.firstName} ${deleting.employee.lastName}`
                : ""}{" "}
              and its breaks. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLog.isPending}>
              <Trash2 />
              {deleteLog.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
