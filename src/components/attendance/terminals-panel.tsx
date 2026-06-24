"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  MonitorSmartphone,
  Pause,
  Play,
  Plus,
  QrCode as QrIcon,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldGroup } from "@/components/ui/field-group";
import { FormSheet } from "@/components/ui/form-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePill } from "@/components/attendance/attendance-pill";
import { QrCode } from "@/components/attendance/qr-code";
import { TerminalCreateSheet } from "@/components/attendance/terminal-create-sheet";
import { useStores } from "@/features/org/stores";
import {
  useDeleteTerminal,
  useTerminalAction,
  useTerminalQr,
  useTerminals,
} from "@/features/attendance/devices";
import { useCurrentUser } from "@/features/session/use-current-user";
import { TERMINAL_STATUS_LABELS } from "@/features/attendance/status";
import type { Terminal } from "@/features/attendance/types";

/** Live QR with a depleting TTL bar that auto-refreshes a few seconds before
 * the code expires (point 19). Refetch cadence is driven by the QR's own
 * `ttlSeconds` so the on-screen code is always current. */
function LiveQr({ terminal }: { terminal: Terminal }) {
  // Refetch shortly before expiry (TTL−5s, min 10s). We don't know the TTL until
  // the first response — derive the interval during render once it's known
  // (adjust-state-during-render, not an effect) so there are no cascading renders.
  const [knownTtl, setKnownTtl] = useState<number | null>(null);
  const intervalMs = knownTtl ? Math.max(10, knownTtl - 5) * 1000 : 60_000;
  const { data: qr, isLoading } = useTerminalQr(terminal.id, true, intervalMs);
  if (qr?.ttlSeconds && qr.ttlSeconds !== knownTtl) setKnownTtl(qr.ttlSeconds);

  const [remaining, setRemaining] = useState(0);
  const ttl = qr?.ttlSeconds ?? 180;

  // Tick down the visible countdown against the QR's expiry.
  useEffect(() => {
    if (!qr?.expiresAt) return;
    const tick = () => {
      const ms = new Date(qr.expiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.round(ms / 1000)));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [qr?.expiresAt]);

  const pct = Math.min(100, Math.max(0, (remaining / ttl) * 100));

  return (
    <div className="flex flex-col items-center gap-3">
      {isLoading || !qr ? (
        <Skeleton className="size-[200px] rounded-xl" />
      ) : (
        <QrCode payload={qr.payload} size={188} />
      )}
      {/* Depleting TTL bar. */}
      <div className="w-full max-w-[212px] space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-accent-strong transition-[width] duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>Refreshes automatically</span>
          <span>{remaining}s</span>
        </div>
      </div>
    </div>
  );
}

function QrDialog({ terminal, onClose }: { terminal: Terminal; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{terminal.label} — clock-in QR</DialogTitle>
          <DialogDescription>
            Rotates automatically. Staff scan this with their phone to clock in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-2">
          <LiveQr terminal={terminal} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Manage-terminal right sheet (point 20): status + lifecycle actions. Deactivate
 * and Delete are owner / super-admin only. */
function ManageTerminalSheet({
  terminal,
  storeName,
  open,
  onOpenChange,
}: {
  terminal: Terminal;
  storeName: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const action = useTerminalAction();
  const del = useDeleteTerminal();
  const { data: me } = useCurrentUser();
  const isSuperAdmin = me?.role === "owner" || me?.platformRole === "super_admin";

  const close = () => onOpenChange(false);

  const run = async (
    label: string,
    fn: () => Promise<unknown>,
  ): Promise<void> => {
    try {
      await fn();
      toast.success(label);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Manage terminal"
      subtitle="Authorize, freeze, or remove this store terminal."
      footer={
        isSuperAdmin ? (
          <div className="flex items-center gap-2">
            {terminal.status === "inactive" ? (
              <Button
                variant="outline"
                disabled={action.isPending}
                onClick={() =>
                  run("Terminal reactivated", () =>
                    action.mutateAsync({ id: terminal.id, action: "reactivate" }),
                  )
                }
              >
                <Play />
                Reactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={action.isPending}
                onClick={() =>
                  run("Terminal deactivated", () =>
                    action.mutateAsync({ id: terminal.id, action: "deactivate" }),
                  )
                }
              >
                <Pause />
                Deactivate
              </Button>
            )}
            <Button
              variant="destructive"
              disabled={del.isPending}
              onClick={async () => {
                await run("Terminal deleted", () => del.mutateAsync(terminal.id));
                close();
              }}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        <FieldGroup title="Terminal" cols={1}>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                <MonitorSmartphone className="size-4.5" />
              </span>
              <div>
                <p className="font-medium text-foreground">{terminal.label}</p>
                <p className="text-xs text-muted-foreground">{storeName}</p>
              </div>
            </div>
            <AttendancePill
              status={terminal.status}
              label={TERMINAL_STATUS_LABELS[terminal.status]}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Status & access" cols={1}>
          <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            <Row label="Store">{storeName}</Row>
            <Row label="Status">{TERMINAL_STATUS_LABELS[terminal.status]}</Row>
            <Row label="Last seen">
              {terminal.lastSeen ? new Date(terminal.lastSeen).toLocaleString() : "—"}
            </Row>
            <Row label="Created">{new Date(terminal.createdAt).toLocaleDateString()}</Row>
            {terminal.deactivatedAt ? (
              <Row label="Deactivated">{new Date(terminal.deactivatedAt).toLocaleString()}</Row>
            ) : null}
          </dl>
          {!isSuperAdmin ? (
            <p className="rounded-lg bg-info-soft px-3 py-2 text-xs text-info">
              Only an owner / super admin can deactivate or delete a terminal.
            </p>
          ) : null}
        </FieldGroup>

        <FieldGroup title="Authorization" cols={1}>
          {terminal.status === "active" ? (
            <Button
              variant="outline"
              className="w-full"
              disabled={action.isPending}
              onClick={() =>
                run("Terminal blocked", () =>
                  action.mutateAsync({ id: terminal.id, action: "block" }),
                )
              }
            >
              <Ban />
              Block (security)
            </Button>
          ) : terminal.status === "blocked" || terminal.status === "pending" ? (
            <Button
              className="w-full"
              disabled={action.isPending}
              onClick={() =>
                run("Terminal authorized", () =>
                  action.mutateAsync({ id: terminal.id, action: "authorize" }),
                )
              }
            >
              <ShieldCheck />
              Authorize terminal
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              This terminal is frozen. Reactivate it to resume clock-ins.
            </p>
          )}
        </FieldGroup>
      </div>
    </FormSheet>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function TerminalsPanel() {
  const { data: terminals, isLoading } = useTerminals();
  const { data: stores } = useStores();
  const action = useTerminalAction();

  const [qrTerminal, setQrTerminal] = useState<Terminal | null>(null);
  const [manageTerminal, setManageTerminal] = useState<Terminal | null>(null);

  const storeName = (id: string) => stores?.find((s) => s.id === id)?.name ?? "—";

  // Keep a live reference to the managed terminal as the list refetches.
  const managed = useMemo(
    () => (manageTerminal ? terminals?.find((t) => t.id === manageTerminal.id) ?? manageTerminal : null),
    [manageTerminal, terminals],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Store terminals</h3>
          <p className="text-xs text-muted-foreground">One terminal per store.</p>
        </div>
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
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                  <MonitorSmartphone className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{t.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{storeName(t.storeId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AttendancePill status={t.status} label={TERMINAL_STATUS_LABELS[t.status]} />
                {t.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => setQrTerminal(t)}>
                    <QrIcon />
                    QR
                  </Button>
                ) : t.status === "pending" || t.status === "blocked" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={action.isPending}
                    onClick={() => action.mutate({ id: t.id, action: "authorize" })}
                  >
                    <ShieldCheck />
                    Authorize
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Manage terminal"
                  onClick={() => setManageTerminal(t)}
                >
                  <Settings2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {qrTerminal ? <QrDialog terminal={qrTerminal} onClose={() => setQrTerminal(null)} /> : null}
      {managed ? (
        <ManageTerminalSheet
          terminal={managed}
          storeName={storeName(managed.storeId)}
          open={Boolean(manageTerminal)}
          onOpenChange={(o) => {
            if (!o) setManageTerminal(null);
          }}
        />
      ) : null}
    </div>
  );
}
