"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { useCheckout, usePlans, useSubscription } from "@/features/billing/billing";
import type { BillingInterval, Plan } from "@/features/billing/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const FEATURE_LABELS: Record<string, string> = {
  messaging: "Team messaging",
  "leave.advanced": "Advanced leave policies",
  "employee.advanced": "Import/export & credentials",
  "attendance.advanced": "Anomalies & geofencing",
  "scheduling.suggestions": "Smart staffing",
  analytics: "Reports & analytics",
  recruiting: "Recruiting & careers",
  "store.finances": "Store finances",
  "permissions.overrides": "Permission overrides",
  "group.policies": "Group policies",
};

function planFeatures(plan: Plan): string[] {
  return Object.entries(plan.entitlementsJson)
    .filter(([, on]) => on)
    .map(([key]) => FEATURE_LABELS[key] ?? key);
}

function priceFor(plan: Plan, interval: BillingInterval): string {
  const raw = interval === "year" ? plan.priceYear : plan.priceMonth;
  const n = Number(raw);
  return n === 0 ? "Free" : `$${n}`;
}

export function PlanCards() {
  const { data: plans, isLoading } = usePlans();
  const { data: subscription } = useSubscription();
  const checkout = useCheckout();
  const [interval, setInterval] = useState<BillingInterval>("month");

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    );
  }

  const sorted = [...(plans ?? [])].sort((a, b) => a.tier - b.tier);
  // Highlight the tier above the current one as "recommended".
  const currentTier = subscription?.plan?.tier ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
          {(["month", "year"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              className={cn(
                "rounded-md px-3 py-1 font-medium transition-colors",
                interval === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "month" ? "Monthly" : "Annual"}
              {value === "year" ? <span className="ml-1 text-success">−17%</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sorted.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const recommended = plan.tier === currentTier + 1;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl bg-card p-5 ring-1 ring-foreground/10",
                recommended && "ring-2 ring-primary shadow-[0_0_0_4px] shadow-primary/10",
              )}
            >
              {recommended ? (
                <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Recommended
                </span>
              ) : null}
              <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {priceFor(plan, interval)}
                </span>
                {Number(interval === "year" ? plan.priceYear : plan.priceMonth) > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    /{interval === "year" ? "yr" : "mo"}
                  </span>
                ) : null}
              </div>

              <ul className="mt-4 flex-1 space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="size-4 text-success" />
                  Up to{" "}
                  {plan.limitsJson.employees === -1 ? "unlimited" : plan.limitsJson.employees}{" "}
                  employees
                </li>
                {planFeatures(plan)
                  .slice(0, 5)
                  .map((label) => (
                    <li key={label} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="size-4 text-success" />
                      {label}
                    </li>
                  ))}
              </ul>

              <Button
                className="mt-5"
                variant={recommended ? "default" : "outline"}
                disabled={isCurrent || checkout.isPending || Number(plan.priceMonth) === 0}
                onClick={() => checkout.mutate({ planKey: plan.key, interval })}
              >
                {isCurrent ? "Current plan" : Number(plan.priceMonth) === 0 ? "Free" : "Upgrade"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
