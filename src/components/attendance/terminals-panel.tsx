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
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { QrCode } from "@/components/attendance/qr-code";
import { useStores } from "@/features/org/stores";
import {
  useCreateTerminal,
  useTerminalAction,
  useTerminalQr,
  useTerminals,
} from "@/features/attendance/devices";
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
  const create = useCreateTerminal();
  const action = useTerminalAction();

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [storeId, setStoreId] = useState("");
  const [qrTerminal, setQrTerminal] = useState<Terminal | null>(null);

  const storeName = (id: string) => stores?.find((s) => s.id === id)?.name ?? "—";
  const storeOptions = stores?.map((s) => ({ value: s.id, label: s.name })) ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !storeId) return;
    create.mutateAsync({ storeId, label }).then(() => {
      setLabel("");
      setStoreId("");
      setAdding(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Store terminals</h3>
        <Button variant="outline" size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus />
          New terminal
        </Button>
      </div>

      {adding ? (
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-end"
        >
          <FormField
            id="terminal-label"
            label="Label"
            placeholder="Front counter iPad"
            className="sm:w-56"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <SelectField
            id="terminal-store"
            label="Store"
            className="sm:w-48"
            placeholder="Select store"
            options={storeOptions}
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          />
          <Button type="submit" disabled={create.isPending || !label || !storeId}>
            Add
          </Button>
        </form>
      ) : null}

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
