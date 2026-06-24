"use client";

import { AlertTriangle, ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUsage, useEntitlements } from "@/features/billing/billing";

/** A usage meter from the billing API → derived "limit reached / near" state. */
export function usePlanMeter(metric: "employees" | "stores") {
  const { data: usage } = useUsage();
  const meter = usage?.find((m) => m.metric === metric);
  const used = meter?.used ?? 0;
  const limit = meter?.limit ?? -1;
  const unlimited = limit < 0;
  const atLimit = !unlimited && used >= limit;
  const nearLimit = !unlimited && !atLimit && limit > 0 && used / limit >= 0.8;
  return { used, limit, unlimited, atLimit, nearLimit };
}

/**
 * Inline banner shown above a creation surface when the plan cap for `metric` is
 * reached (or nearly). The backend is the real gate (PLAN_LIMIT 403) — this just
 * tells the user why "New …" is blocked and where to upgrade. Renders nothing
 * when there's plenty of headroom.
 */
export function PlanLimitBanner({
  metric,
  label,
}: {
  metric: "employees" | "stores";
  label: string;
}) {
  const { used, limit, atLimit, nearLimit } = usePlanMeter(metric);
  const { data: ent } = useEntitlements();
  if (!atLimit && !nearLimit) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        atLimit
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-border bg-surface-subtle/60 text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <AlertTriangle className={cn("size-4 shrink-0", atLimit ? "text-amber-600" : "text-muted-foreground")} />
        {atLimit ? (
          <span>
            You&apos;ve reached your plan limit of{" "}
            <span className="font-semibold">
              {limit} {label}
            </span>{" "}
            on <span className="font-semibold">{ent?.planName ?? "your plan"}</span>. Upgrade to add
            more, or contact the platform.
          </span>
        ) : (
          <span>
            You&apos;re using{" "}
            <span className="font-semibold">
              {used} of {limit} {label}
            </span>{" "}
            — approaching your plan limit.
          </span>
        )}
      </span>
      <Link
        href="/settings/billing"
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Upgrade plan
        <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}
