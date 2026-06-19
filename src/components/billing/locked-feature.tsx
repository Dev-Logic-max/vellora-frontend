"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useEntitlement } from "@/features/billing/use-entitlement";
import { cn } from "@/lib/utils";

interface LockedFeatureProps {
  /** Entitlement key the surface requires (e.g. "analytics", "recruiting"). */
  feature: string;
  title?: string;
  description?: string;
  /** Rendered when the feature IS unlocked. */
  children: ReactNode;
  /** Inline (small chip) vs the default promo card. */
  variant?: "card" | "inline";
  className?: string;
}

/**
 * Gates `children` behind a plan entitlement. When the active company's plan
 * lacks `feature`, an indigo→violet upgrade prompt is shown instead (15-billing
 * §7). The backend PlanGuard is the real gate; this is the UX layer.
 */
export function LockedFeature({
  feature,
  title = "Upgrade to unlock",
  description = "This feature isn't included in your current plan.",
  children,
  variant = "card",
  className,
}: LockedFeatureProps) {
  const { allowed } = useEntitlement(feature);
  if (allowed) return <>{children}</>;

  if (variant === "inline") {
    return (
      <Link
        href="/settings/billing"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong transition-colors hover:bg-accent-soft/80",
          className,
        )}
      >
        <Lock className="size-3" />
        Upgrade
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 p-6 text-center text-white",
        className,
      )}
    >
      <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-white/15">
        <Sparkles className="size-5" />
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-white/80">{description}</p>
      <Button
        render={<Link href="/settings/billing" />}
        variant="secondary"
        size="sm"
        className="mt-4"
      >
        View plans
      </Button>
    </div>
  );
}
