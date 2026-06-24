"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Coffee,
  Loader2,
  LogIn,
  LogOut,
  ShieldAlert,
  Smartphone,
  Square,
} from "lucide-react";

import { useKioskPunch } from "@/features/attendance/attendance";
import { useMyDeviceStatus } from "@/features/attendance/device-registration";
import { createClient } from "@/lib/supabase/client";
import { readDeviceToken, getFingerprint } from "@/lib/device-identity";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type PunchAction = "clock_in" | "clock_out" | "break_start" | "break_end";

const ACTIONS: { key: PunchAction; label: string; icon: typeof LogIn; tone: string }[] = [
  { key: "clock_in", label: "Check in", icon: LogIn, tone: "bg-emerald-600 hover:bg-emerald-500" },
  {
    key: "break_start",
    label: "Start break",
    icon: Coffee,
    tone: "bg-amber-500 hover:bg-amber-400",
  },
  { key: "break_end", label: "End break", icon: Square, tone: "bg-sky-600 hover:bg-sky-500" },
  {
    key: "clock_out",
    label: "Check out",
    icon: LogOut,
    tone: "bg-rose-600 hover:bg-rose-500",
  },
];

/**
 * The scan flow: requires a session (redirects to login with `next` back here),
 * checks the employee's registered device, then performs the chosen punch with
 * the scanned QR token. An expired QR / unregistered device is surfaced clearly.
 */
export function ScanClient() {
  const params = useParams();
  const search = useSearchParams();
  const locale = (params.locale as string) || "en";
  const token = search.get("t") ?? "";

  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const punch = useKioskPunch();
  const { data: device, isLoading: deviceLoading } = useMyDeviceStatus();

  // Auth gate: if not signed in, bounce to login and return here afterwards.
  useEffect(() => {
    let active = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!active) return;
        if (!data.session) {
          const here = `/${locale}/attendance/scan${token ? `?t=${encodeURIComponent(token)}` : ""}`;
          window.location.assign(`/${locale}/login?next=${encodeURIComponent(here)}`);
          return;
        }
        setAuthed(true);
        setAuthChecked(true);
      });
    return () => {
      active = false;
    };
  }, [locale, token]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const doPunch = async (action: PunchAction) => {
    setResult(null);
    try {
      const fingerprint = device?.requireFingerprint ? await getFingerprint() : undefined;
      await punch.mutateAsync({
        token,
        action,
        deviceToken: readDeviceToken() ?? undefined,
        fingerprint,
      });
      setResult({ ok: true, text: `${labelFor(action)} recorded.` });
    } catch (e) {
      setResult({ ok: false, text: e instanceof ApiError ? e.message : "Action failed." });
    }
  };

  const clock = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now],
  );

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0b1220] px-4 py-10 text-white">
      {/* Ambient indigo glow (platform brand). */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative w-full max-w-md space-y-7">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-indigo-200 uppercase">
            <Smartphone className="size-3.5" />
            Vellora attendance
          </span>
          <p className="mt-5 font-display text-6xl font-bold tabular-nums">{clock}</p>
          <p className="mt-1 text-sm text-white/50">
            {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {!token ? (
          <Banner
            icon={ShieldAlert}
            tone="error"
            title="No QR detected"
            text="Scan the terminal QR at your store to clock in."
          />
        ) : !authChecked || !authed ? (
          <div className="flex items-center justify-center gap-2 py-8 text-white/60">
            <Loader2 className="size-4 animate-spin" />
            Checking your session…
          </div>
        ) : deviceLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-white/60">
            <Loader2 className="size-4 animate-spin" />
            Verifying your device…
          </div>
        ) : !device?.registered ? (
          <Banner
            icon={Smartphone}
            tone="warning"
            title="Device not registered"
            text="Register this device from My Profile → Device before you can clock in. This is a one-time step."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {ACTIONS.map(({ key, label, icon: Icon, tone }) => (
                <button
                  key={key}
                  type="button"
                  disabled={punch.isPending}
                  onClick={() => doPunch(key)}
                  className={cn(
                    "flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-60",
                    tone,
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              ))}
            </div>

            {punch.isPending ? (
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Loader2 className="size-4 animate-spin" />
                Recording…
              </div>
            ) : null}

            {result ? (
              <Banner
                icon={result.ok ? CheckCircle2 : ShieldAlert}
                tone={result.ok ? "success" : "error"}
                title={result.ok ? "Done" : "Couldn't record"}
                text={result.text}
              />
            ) : null}
          </>
        )}

        <p className="text-center text-[11px] text-white/30">
          The QR rotates regularly. If an action fails, scan the terminal again.
        </p>
      </div>
    </div>
  );
}

function Banner({
  icon: Icon,
  tone,
  title,
  text,
}: {
  icon: typeof LogIn;
  tone: "success" | "warning" | "error";
  title: string;
  text: string;
}) {
  const tones: Record<string, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  };
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3.5", tones[tone])}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm opacity-80">{text}</p>
      </div>
    </div>
  );
}

function labelFor(action: PunchAction): string {
  return {
    clock_in: "Check-in",
    clock_out: "Check-out",
    break_start: "Break start",
    break_end: "Break end",
  }[action];
}
