import { StatusPill } from "@/components/ui/status-pill";
import type { LeaveRequestStatus } from "@/features/leave/types";

/** Soft, outlined pill for a leave-request status (delegates to StatusPill). */
export function LeavePill({ status }: { status: LeaveRequestStatus }) {
  return <StatusPill status={status} />;
}
