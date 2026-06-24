import { Suspense } from "react";

import { ScanClient } from "@/components/attendance/scan-client";

export const metadata = {
  title: "Clock in — Vellora",
};

/**
 * QR-scan attendance landing (point 19). An employee opens this by scanning a
 * store terminal QR with their phone camera. The client component handles the
 * full flow: login-if-needed → validate the QR token + registered device →
 * show the punch action screen. Standalone (no app shell) for a focused screen.
 *
 * Wrapped in Suspense because ScanClient reads `useSearchParams()` (the `t`
 * token) — required for static prerendering.
 */
export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0b1220]" />}>
      <ScanClient />
    </Suspense>
  );
}
