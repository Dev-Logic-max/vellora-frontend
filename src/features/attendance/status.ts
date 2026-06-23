import type {
  AnomalySeverity,
  AnomalyStatus,
  AttendanceLogStatus,
  DeviceStatus,
  TerminalStatus,
} from "./types";

/** Worked vs scheduled outcome shown on a log row (design-colors §3). */
export type PunchOutcome = "on_time" | "late" | "absent" | "open";

/** soft chip classes keyed by attendance status family (tokens only). */
export const ATTENDANCE_STATUS_STYLES: Record<string, string> = {
  // log lifecycle
  open: "bg-accent-soft text-accent-strong",
  closed: "bg-success-soft text-success",
  flagged: "bg-warning-soft text-warning",
  corrected: "bg-accent-soft text-accent-strong",
  // punch outcome
  on_time: "bg-success-soft text-success",
  late: "bg-warning-soft text-warning",
  absent: "bg-danger-soft text-danger",
  // anomaly lifecycle
  in_review: "bg-warning-soft text-warning",
  resolved: "bg-success-soft text-success",
  dismissed: "bg-muted text-muted-foreground",
  // correction lifecycle
  requested: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
  // device / terminal
  registered: "bg-success-soft text-success",
  active: "bg-success-soft text-success",
  pending: "bg-warning-soft text-warning",
  reset: "bg-muted text-muted-foreground",
  inactive: "bg-warning-soft text-warning",
  disabled: "bg-warning-soft text-warning",
  revoked: "bg-muted text-muted-foreground",
  blocked: "bg-danger-soft text-danger",
};

export const SEVERITY_STYLES: Record<AnomalySeverity, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning-soft text-warning",
  high: "bg-danger-soft text-danger",
};

export const ANOMALY_TYPE_LABELS: Record<string, string> = {
  late: "Late arrival",
  early_leave: "Early leave",
  missing_punch: "Missing punch",
  no_show: "No show",
  over_hours: "Over hours",
  location_mismatch: "Location mismatch",
};

export const LOG_STATUS_OPTIONS: { value: AttendanceLogStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "flagged", label: "Flagged" },
  { value: "corrected", label: "Corrected" },
];

export const DEVICE_STATUS_OPTIONS: { value: DeviceStatus; label: string }[] = [
  { value: "registered", label: "Registered" },
  { value: "pending", label: "Pending" },
  { value: "reset", label: "Not registered" },
  { value: "blocked", label: "Blocked" },
];

export const TERMINAL_STATUS_LABELS: Record<TerminalStatus, string> = {
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
  blocked: "Blocked",
};

export const ANOMALY_STATUS_LABELS: Record<AnomalyStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};
