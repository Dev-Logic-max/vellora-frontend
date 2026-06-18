import { differenceInCalendarDays, parseISO } from "date-fns";

import { cn } from "@/lib/utils";

/** Amber/red expiry chip for qualifications & medicals (≤30d amber, past red). */
export function ExpiryChip({ expires }: { expires: string | null }) {
  if (!expires) {
    return <span className="text-xs text-muted-foreground">No expiry</span>;
  }
  const days = differenceInCalendarDays(parseISO(expires), new Date());
  const expired = days < 0;
  const soon = days >= 0 && days <= 30;

  const label = expired ? "Expired" : soon ? `${days}d left` : "Valid";
  const tone = expired
    ? "bg-danger-soft text-danger"
    : soon
      ? "bg-warning-soft text-warning"
      : "bg-success-soft text-success";

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tone)}
    >
      {label}
    </span>
  );
}
