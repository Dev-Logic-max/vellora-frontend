import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Horizontal stepper showing progress through the company registration wizard. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li key={label} className={cn("flex items-center", !last && "flex-1")}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary/10 text-primary ring-1 ring-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {!last && (
              <span className={cn("mx-2 h-px flex-1", done ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
