"use client";

import { Ban, FileQuestion, LockKeyhole, RotateCw, ServerCrash, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Resolved {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Map any thrown error → a clear, human reason (uses the backend message when present). */
function resolve(error: unknown): Resolved & { status?: number } {
  if (error instanceof ApiError) {
    const msg = error.message;
    switch (error.status) {
      case 401:
        return {
          status: 401,
          icon: LockKeyhole,
          title: "Sign in required",
          description: "Your session has expired or you're not signed in.",
        };
      case 403:
        return {
          status: 403,
          icon: Ban,
          title: "Access denied",
          // 403 covers permission, scope, AND plan limits — surface the API reason.
          description: msg || "You don't have permission to view this, or your plan doesn't include it.",
        };
      case 404:
        return {
          status: 404,
          icon: FileQuestion,
          title: "Not found",
          description: msg || "This item doesn't exist or is outside your access.",
        };
      case 429:
        return {
          status: 429,
          icon: ServerCrash,
          title: "Too many requests",
          description: "Please wait a moment and try again.",
        };
      default:
        return {
          status: error.status,
          icon: ServerCrash,
          title: "Something went wrong",
          description: msg || "An unexpected error occurred.",
        };
    }
  }
  return {
    icon: ServerCrash,
    title: "Something went wrong",
    description: error instanceof Error ? error.message : "An unexpected error occurred.",
  };
}

interface ErrorStateProps {
  error: unknown;
  /** Retry handler (e.g. react-query refetch). Shown as a button when provided. */
  onRetry?: () => void;
  /** Extra action node (e.g. a link back). */
  action?: ReactNode;
  className?: string;
}

/**
 * Designed error panel that explains WHAT happened (not authenticated / denied /
 * not found / rate-limited / server) from an ApiError, with the backend's
 * message and a sensible recovery action. Use wherever a data fetch can fail.
 */
export function ErrorState({ error, onRetry, action, className }: ErrorStateProps) {
  const { icon: Icon, title, description, status } = resolve(error);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex items-center gap-2">
        {status === 401 ? (
          <Button render={<Link href="/login" />} size="sm">
            Go to sign in
          </Button>
        ) : null}
        {status === 403 ? (
          <Button render={<Link href="/settings/billing" />} variant="outline" size="sm">
            View plans
          </Button>
        ) : null}
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw className="size-4" />
            Retry
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
