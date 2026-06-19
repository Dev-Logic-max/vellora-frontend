"use client";

import { Clock } from "lucide-react";
import { useState } from "react";

import { useSubscription } from "@/features/billing/billing";

/** Promo banner shown while the company is on a trial, with days remaining. */
export function TrialBanner() {
  const { data } = useSubscription();
  // `Date.now()` is impure → read "now" once on mount via a lazy initializer.
  const [now] = useState(() => Date.now());

  if (!data || data.status !== "trialing" || !data.trialEndsAt) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(data.trialEndsAt).getTime() - now) / 86_400_000),
  );

  return (
    <div className="flex items-center gap-3 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 px-4 py-3 text-white">
      <Clock className="size-5 shrink-0" />
      <p className="text-sm">
        <span className="font-semibold">{daysLeft} day{daysLeft === 1 ? "" : "s"} left</span> in your{" "}
        {data.plan?.name ?? "trial"} trial. Add a plan to keep premium features after it ends.
      </p>
    </div>
  );
}
