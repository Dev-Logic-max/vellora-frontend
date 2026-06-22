"use client";

import { useState } from "react";
import { Ban, MonitorSmartphone, Plus, QrCode as QrIcon, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { QrCode } from "@/components/attendance/qr-code";
import { TerminalCreateSheet } from "@/components/attendance/terminal-create-sheet";
import { useStores } from "@/features/org/stores";
import { useTerminalAction, useTerminalQr, useTerminals } from "@/features/attendance/devices";
import type { Terminal } from "@/features/attendance/types";

function QrDialog({ terminal, onClose }: { terminal: Terminal; onClose: () => void }) {
  const { data: qr, isLoading } = useTerminalQr(terminal.id, true);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{terminal.label} — clock-in QR</DialogTitle>
          <DialogDescription>
            Rotates automatically. Staff scan this to clock in at the store.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-2">
          {isLoading || !qr ? (
            <Skeleton className="size-[200px] rounded-xl" />
          ) : (
            <QrCode payload={qr.payload} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TerminalsPanel() {
  const { data: terminals, isLoading } = useTerminals();
  const { data: stores } = useStores();
  const action = useTerminalAction();

  const [qrTerminal, setQrTerminal] = useState<Terminal | null>(null);

  const storeName = (id: string) => stores?.find((s) => s.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Store terminals</h3>
        <TerminalCreateSheet
          trigger={
            <Button variant="outline" size="sm">
              <Plus />
              New terminal
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !terminals || terminals.length === 0 ? (
        <EmptyState
          icon={MonitorSmartphone}
          title="No terminals yet"
          description="Add a kiosk to display the rotating clock-in QR at a store."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {terminals.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{t.label}</p>
                <p className="truncate text-xs text-muted-foreground">{storeName(t.storeId)}</p>
              </div>
              <div className="flex items-center gap-2">
                <AttendancePill status={t.status} />
                {t.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => setQrTerminal(t)}>
                    <QrIcon />
                    QR
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={action.isPending}
                    onClick={() => action.mutate({ id: t.id, action: "authorize" })}
                  >
                    <ShieldCheck />
                    Authorize
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={action.isPending}
                  aria-label="Block terminal"
                  onClick={() => action.mutate({ id: t.id, action: "block" })}
                >
                  <Ban />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {qrTerminal ? <QrDialog terminal={qrTerminal} onClose={() => setQrTerminal(null)} /> : null}
    </div>
  );
}
