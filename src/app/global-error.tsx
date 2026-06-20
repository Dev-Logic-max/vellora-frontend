"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the ROOT layout (where the locale
 * `error.tsx` can't catch). Must render its own <html>/<body>. Kept minimal +
 * dependency-free so it works even if app chrome failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
            The application hit an unexpected error. Please reload the page.
          </p>
          {error.digest ? (
            <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
              Ref: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#4f46e5",
              color: "white",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
