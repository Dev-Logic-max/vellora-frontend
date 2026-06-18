import { cn } from "@/lib/utils";

/** Used/max capacity meter; color shifts green→amber→red by utilization (02-stores §7). */
export function CapacityBar({ used, max }: { used: number; max: number }) {
  const ratio = max > 0 ? Math.min(used / max, 1) : 0;
  const pct = Math.round(ratio * 100);
  const tone =
    ratio >= 0.9 ? "bg-danger" : ratio >= 0.7 ? "bg-warning" : "bg-success";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {used}/{max || 0}
      </span>
    </div>
  );
}
