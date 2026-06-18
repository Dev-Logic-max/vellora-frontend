import { Check, Clock, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ApprovalStep } from "@/features/leave/types";

const TONE = {
  approved: { icon: Check, ring: "bg-success-soft text-success" },
  rejected: { icon: X, ring: "bg-danger-soft text-danger" },
  pending: { icon: Clock, ring: "bg-muted text-muted-foreground" },
} as const;

/** Vertical step list showing each approver's state (06-leave §7). */
export function ApprovalTimeline({ chain }: { chain: ApprovalStep[] }) {
  if (!chain?.length) return <p className="text-sm text-muted-foreground">No approval steps.</p>;
  return (
    <ol className="space-y-3">
      {chain.map((step, i) => {
        const tone = TONE[step.status];
        const Icon = tone.icon;
        return (
          <li key={step.step} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                tone.ring,
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground capitalize">
                {step.role?.replace(/_/g, " ") ?? `Step ${i + 1}`}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{step.status}</p>
              {step.note ? <p className="text-xs text-muted-foreground">“{step.note}”</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
