"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { cn } from "@/lib/utils";

/**
 * Real, scannable QR rendered to a canvas via the `qrcode` lib. The payload is a
 * URL/token a phone camera can open. High error-correction ("H") keeps it dense
 * and robust (no large empty gaps). Foreground/background are configurable so the
 * kiosk can theme it; default is high-contrast dark-on-white for scannability.
 */
export function QrCode({
  payload,
  size = 200,
  className,
  dark = "#0b1220",
  light = "#ffffff",
  showCode = false,
}: {
  payload: string;
  size?: number;
  className?: string;
  /** Module (dot) color. Keep dark for reliable scanning. */
  dark?: string;
  /** Background color. Keep light for reliable scanning. */
  light?: string;
  /** Render the raw payload beneath (for manual fallback / debugging). */
  showCode?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    QRCode.toCanvas(canvas, payload, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark, light },
    }).catch(() => setError(true));
  }, [payload, size, dark, light]);

  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div
        className="overflow-hidden rounded-xl border border-border bg-white p-3 shadow-sm"
        style={{ width: size + 24, height: size + 24 }}
        role="img"
        aria-label="Clock-in QR code"
      >
        {error ? (
          <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted-foreground">
            Couldn&apos;t render QR
          </div>
        ) : (
          <canvas ref={canvasRef} width={size} height={size} className="block" />
        )}
      </div>
      {showCode ? (
        <code className="max-w-full truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
          {payload}
        </code>
      ) : null}
    </div>
  );
}
