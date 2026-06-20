import { cn } from "@/lib/utils";
import { LEAVE_STATUS_STYLES } from "@/features/leave/status";
import type { LeaveRequestStatus } from "@/features/leave/types";

/** Soft pill for a leave-request status (design-colors §3). */
export function LeavePill({ status }: { status: LeaveRequestStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        LEAVE_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
