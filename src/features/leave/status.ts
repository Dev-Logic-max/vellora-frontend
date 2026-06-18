import type { LeaveRequestStatus } from "./types";

/** Request status → soft pill tone (design-colors §3). */
export const LEAVE_STATUS_STYLES: Record<LeaveRequestStatus, string> = {
  requested: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
  cancelled: "bg-muted text-muted-foreground",
};

export const LEAVE_STATUS_OPTIONS: { value: LeaveRequestStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];
