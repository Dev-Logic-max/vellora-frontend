"use client";

import { RotateCw, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for everything under a locale. Renders a friendly
 * reason instead of a blank 500. `digest` is the server-side error id (shown so
 * a user can quote it). Unexpected errors are logged for Sentry/console.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <ServerCrash className="size-7" />
      </span>
      <h1 className="font-display text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while loading this page. You can retry, or head back to your
        dashboard.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-faint">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex items-center gap-2">
        <Button onClick={reset}>
          <RotateCw className="size-4" />
          Try again
        </Button>
        <Button render={<Link href="/dashboard" />} variant="outline">
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
