import { cn } from "@/lib/utils";
import type { NotifPriority } from "@/features/notifications/types";

const DOT: Record<NotifPriority, string> = {
  urgent: "bg-danger",
  high: "bg-warning",
  normal: "bg-accent-strong",
  low: "bg-muted-foreground",
};

/** Priority indicator dot (11-notifications §7): urgent red / high amber / normal indigo. */
export function PriorityDot({
  priority,
  className,
}: {
  priority: NotifPriority;
  className?: string;
}) {
  return <span className={cn("inline-block size-2 rounded-full", DOT[priority], className)} />;
}
