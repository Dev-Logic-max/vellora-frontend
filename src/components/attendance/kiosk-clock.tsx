"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, ShieldCheck, WifiOff } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { QrCode } from "@/components/attendance/qr-code";
import { useSyncBatch } from "@/features/attendance/attendance";
import { useTerminalQr, useTerminals } from "@/features/attendance/devices";
import { useStores } from "@/features/org/stores";
import { clearQueue, readQueue } from "@/lib/offline-queue";
import { cn } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Store kiosk display (point 19). Shows the store clock + the rotating clock-in
 * QR a phone scans to open the scan flow (`/attendance/scan?t=<token>`). Themed
 * to the platform (dark indigo). The QR auto-refreshes a few seconds before it
 * expires, with a depleting TTL bar. Offline punches still queue + sync.
 */
export function KioskClock() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { data: stores } = useStores();
  const { data: terminals } = useTerminals();
  const sync = useSyncBatch();

  const [storeId, setStoreId] = useState<string | undefined>();
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [queued, setQueued] = useState(() => readQueue().length);
  const [now, setNow] = useState(() => new Date());

  const activeTerminal = terminals?.find((t) => t.storeId === storeId && t.status === "active");

  // Refetch the QR a little before it expires (driven by the TTL the API returns).
  // Two-pass query: a `state` query reads the TTL first, then we set the refetch
  // interval from it — derived during render (no effect), so no cascading renders.
  const [knownTtl, setKnownTtl] = useState<number | null>(null);
  const intervalMs = knownTtl ? Math.max(10, knownTtl - 5) * 1000 : 60_000;
  const { data: qr } = useTerminalQr(activeTerminal?.id, Boolean(activeTerminal), intervalMs);
  if (qr?.ttlSeconds && qr.ttlSeconds !== knownTtl) setKnownTtl(qr.ttlSeconds);

  // Countdown for the TTL bar.
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!qr?.expiresAt) return;
    const tick = () =>
      setRemaining(Math.max(0, Math.round((new Date(qr.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [qr?.expiresAt]);

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

  const store = stores?.find((s) => s.id === storeId);
  const storeOptions = stores?.map((s) => ({ value: s.id, label: s.name })) ?? [];

  // The QR encodes the scan URL a phone camera opens (token validated server-side).
  const scanUrl = useMemo(
    () => (qr ? `${APP_URL}/${locale}/attendance/scan?t=${encodeURIComponent(qr.payload)}` : ""),
    [qr, locale],
  );
  const ttl = qr?.ttlSeconds ?? 180;
  const pct = Math.min(100, Math.max(0, (remaining / ttl) * 100));

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#0b1220] px-6 py-6 text-white sm:px-10">
      <div className="pointer-events-none absolute -top-48 -left-24 size-[520px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-48 size-[520px] rounded-full bg-violet-600/15 blur-3xl" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between">
        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
          Terminal
        </span>
        <div className="w-56">
          <Combobox
            options={storeOptions}
            value={storeId}
            onChange={setStoreId}
            placeholder="Select store"
            allowClear={false}
          />
        </div>
      </div>

      {/* Main */}
      <div className="relative grid flex-1 items-center gap-10 lg:grid-cols-2">
        {/* Clock */}
        <div className="text-center lg:text-left">
          {store ? (
            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200">
              {store.code ?? store.name}
            </span>
          ) : null}
          <h1 className="mt-4 font-display text-3xl font-semibold text-white/90 sm:text-4xl">
            {store?.name ?? "Select a store"}
          </h1>
          <p className="mt-2 font-display text-7xl font-bold tabular-nums sm:text-8xl">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <p className="mt-3 text-lg text-white/50">
            {now.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-6 inline-flex items-center gap-2">
            {online ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                <ShieldCheck className="size-4" />
                Authorized terminal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-200">
                <WifiOff className="size-4" />
                Offline{queued ? ` · ${queued} queued` : ""}
              </span>
            )}
          </div>
        </div>

        {/* QR card */}
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl backdrop-blur">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
            Scan with your phone
          </p>
          <div className="mt-5 flex justify-center">
            {qr && scanUrl ? (
              <QrCode payload={scanUrl} size={232} />
            ) : (
              <div className="flex size-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/40">
                {activeTerminal ? "Loading QR…" : "No active terminal for this store"}
              </div>
            )}
          </div>
          {qr ? (
            <div className="mt-5 space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/40 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {remaining}s
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className={cn("relative text-center text-xs text-white/30")}>
        Staff scan this code with their phone camera to clock in — no shared device needed.
      </p>
    </div>
  );
}
