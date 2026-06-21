"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StepDef {
  /** Short label shown under/next to the number. */
  label: string;
  /** Optional one-line hint. */
  hint?: string;
}

interface StepperProps {
  steps: StepDef[];
  /** 0-based index of the active step. */
  current: number;
  /** Click a completed step to jump back (forward jumps are blocked). */
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Horizontal numbered stepper for multi-step creation flows. The current step
 * is a rounded accent-outlined chip; completed steps are filled (accent) with a
 * check; upcoming steps are muted. Connectors fill as you progress.
 */
export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((step, i) => {
        const isDone = i < current;
        const isActive = i === current;
        const clickable = Boolean(onStepClick) && i < current;
        return (
          <li key={step.label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onStepClick?.(i) : undefined}
              className={cn(
                "group flex items-center gap-2.5 text-left",
                clickable && "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                  isActive &&
                    "border-primary bg-accent-soft text-primary shadow-[0_0_0_4px_rgb(var(--accent-soft))]",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  !isActive &&
                    !isDone &&
                    "border-border bg-surface text-muted-foreground group-hover:border-foreground/20",
                )}
              >
                {isDone ? <Check className="size-4.5" /> : i + 1}
              </span>
              <span className="hidden min-w-0 flex-col sm:flex">
                <span
                  className={cn(
                    "truncate text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {step.hint ? (
                  <span className="truncate text-xs text-muted-foreground">{step.hint}</span>
                ) : null}
              </span>
            </button>

            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "mx-3 h-0.5 flex-1 rounded-full transition-colors duration-300",
                  i < current ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
