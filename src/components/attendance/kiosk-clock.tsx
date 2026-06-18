"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Coffee, LogIn, LogOut, Square, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { QrCode } from "@/components/attendance/qr-code";
import { useClock, useSyncBatch } from "@/features/attendance/attendance";
import { useTerminalQr, useTerminals } from "@/features/attendance/devices";
import { useEmployees } from "@/features/employees/employees";
import { useStores } from "@/features/org/stores";
import { ApiError } from "@/lib/api";
import { clearQueue, enqueue, readQueue, type QueuedEvent } from "@/lib/offline-queue";
import { cn } from "@/lib/utils";

type Action = "clock_in" | "clock_out" | "break_start" | "break_end";
interface Toast {
  text: string;
  tone: "success" | "error";
}

export function KioskClock() {
  const { data: stores } = useStores();
  const { data: terminals } = useTerminals();
  const { clockIn, clockOut, breakStart, breakEnd } = useClock();
  const sync = useSyncBatch();

  const [storeId, setStoreId] = useState<string | undefined>();
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [queued, setQueued] = useState(() => readQueue().length);
  const [toast, setToast] = useState<Toast | null>(null);
  const [now, setNow] = useState(() => new Date());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: employeePage } = useEmployees({
    page: 1,
    pageSize: 100,
    storeId,
    status: "active",
  });
  const employees = useMemo(() => employeePage?.data ?? [], [employeePage]);

  const activeTerminal = terminals?.find((t) => t.storeId === storeId && t.status === "active");
  const { data: qr } = useTerminalQr(activeTerminal?.id, Boolean(activeTerminal));

  const flush = useCallback(() => {
    const events = readQueue();
    if (events.length === 0) return;
    sync
      .mutateAsync(events)
      .then(() => {
        clearQueue();
        setQueued(0);
      })
      .catch(() => undefined);
  }, [sync]);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      flush();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(tick);
    };
  }, [flush]);

  const showToast = (text: string, tone: Toast["tone"]) => {
    setToast({ text, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const employeeName = useMemo(() => {
    const e = employees.find((x) => x.id === employeeId);
    return e ? `${e.firstName} ${e.lastName}` : "employee";
  }, [employees, employeeId]);

  const punch = (action: Action) => {
    if (!employeeId) {
      showToast("Select an employee first.", "error");
      return;
    }
    const atUtc = new Date().toISOString();
    if (!online) {
      const event: QueuedEvent = {
        kind: action,
        employeeId,
        storeId,
        terminalId: activeTerminal?.id,
        method: "terminal",
        atUtc,
      };
      setQueued(enqueue(event).length);
      showToast(`Saved offline — will sync (${labelFor(action)}).`, "success");
      return;
    }

    const onOk = () => showToast(`${labelFor(action)} — ${employeeName}.`, "success");
    const onErr = (e: unknown) =>
      showToast(e instanceof ApiError ? e.message : "Action failed.", "error");

    if (action === "clock_in") {
      if (!storeId) return showToast("Select a store first.", "error");
      clockIn
        .mutateAsync({ employeeId, storeId, terminalId: activeTerminal?.id, method: "terminal" })
        .then(onOk)
        .catch(onErr);
    } else if (action === "clock_out") {
      clockOut.mutateAsync({ employeeId }).then(onOk).catch(onErr);
    } else if (action === "break_start") {
      breakStart.mutateAsync({ employeeId }).then(onOk).catch(onErr);
    } else {
      breakEnd.mutateAsync({ employeeId }).then(onOk).catch(onErr);
    }
  };

  const storeOptions = stores?.map((s) => ({ value: s.id, label: s.name })) ?? [];
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName}`,
    hint: e.uniqueCode ?? undefined,
  }));

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-display text-5xl font-semibold text-foreground tabular-nums">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {qr ? (
          <div className="flex justify-center">
            <QrCode payload={qr.payload} size={172} />
          </div>
        ) : null}

        <div className="space-y-3">
          <Combobox
            options={storeOptions}
            value={storeId}
            onChange={(v) => {
              setStoreId(v);
              setEmployeeId(undefined);
            }}
            placeholder="Select store"
            allowClear={false}
          />
          <Combobox
            options={employeeOptions}
            value={employeeId}
            onChange={setEmployeeId}
            placeholder="Select employee"
            disabled={!storeId}
            allowClear={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-16 text-base" onClick={() => punch("clock_in")}>
            <LogIn />
            Clock in
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 text-base"
            onClick={() => punch("clock_out")}
          >
            <LogOut />
            Clock out
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-14"
            onClick={() => punch("break_start")}
          >
            <Coffee />
            Start break
          </Button>
          <Button size="lg" variant="secondary" className="h-14" onClick={() => punch("break_end")}>
            <Square />
            End break
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs">
          {online ? (
            <span className="text-muted-foreground">Online</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-medium text-warning">
              <WifiOff className="size-3" />
              Offline{queued ? ` · ${queued} queued` : ""}
            </span>
          )}
        </div>
      </div>

      {toast ? (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg",
            toast.tone === "success"
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger",
          )}
          role="status"
        >
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

function labelFor(action: Action): string {
  return {
    clock_in: "Clocked in",
    clock_out: "Clocked out",
    break_start: "Break started",
    break_end: "Break ended",
  }[action];
}
