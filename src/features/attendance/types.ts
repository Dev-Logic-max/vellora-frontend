export type AttendanceMethod = "qr" | "manual" | "terminal";
export type AttendanceSource = "online" | "offline_sync";
export type AttendanceLogStatus = "open" | "closed" | "flagged" | "corrected";

export type AnomalyType =
  | "late"
  | "early_leave"
  | "missing_punch"
  | "no_show"
  | "over_hours"
  | "location_mismatch";
export type AnomalySeverity = "low" | "medium" | "high";
export type AnomalyStatus = "open" | "in_review" | "resolved" | "dismissed";
export type CorrectionStatus = "requested" | "approved" | "rejected";

export type TerminalStatus = "pending" | "active" | "inactive" | "blocked";
export type DeviceStatus = "pending" | "registered" | "reset" | "blocked";

export interface EmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  uniqueCode?: string | null;
  /** Free-text job title. */
  role?: string | null;
  /** Company membership role (the staff "user role"); null without a login. */
  membershipRole?: string | null;
  primaryStoreId?: string | null;
}

export interface AttendanceBreak {
  id: string;
  logId: string;
  startUtc: string;
  endUtc: string | null;
  minutes: number;
  paid: boolean;
}

export interface AttendanceLog {
  id: string;
  companyId: string;
  storeId: string;
  employeeId: string;
  shiftId: string | null;
  clockInUtc: string;
  clockOutUtc: string | null;
  method: AttendanceMethod;
  deviceId: string | null;
  terminalId: string | null;
  lat: number | null;
  lng: number | null;
  source: AttendanceSource;
  status: AttendanceLogStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: EmployeeRef | null;
  breaks?: AttendanceBreak[];
}

export interface Anomaly {
  id: string;
  storeId: string;
  employeeId: string;
  logId: string | null;
  type: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  detectedAt: string;
  resolvedBy: string | null;
  note: string | null;
  employee?: EmployeeRef | null;
}

export interface Correction {
  id: string;
  logId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  requestedBy: string | null;
  approvedBy: string | null;
  status: CorrectionStatus;
  createdAt: string;
  resolvedAt: string | null;
  log?: (AttendanceLog & { employee?: EmployeeRef | null }) | null;
}

export interface Device {
  id: string;
  employeeId: string;
  label: string;
  platform: string | null;
  status: DeviceStatus;
  boundHint: string | null;
  lastSeen: string | null;
  createdAt: string;
  employee?: EmployeeRef | null;
}

export interface Terminal {
  id: string;
  storeId: string;
  label: string;
  status: TerminalStatus;
  qrSecret: string | null;
  qrRotatedAt: string | null;
  lastSeen: string | null;
  deactivatedBy: string | null;
  deactivatedAt: string | null;
  createdAt: string;
}

export interface TerminalQr {
  terminalId: string;
  storeId: string;
  payload: string;
  rotatedAt: string;
  expiresAt: string;
  ttlSeconds: number;
}

// ── Device registration (point 21) ──────────────────────────────────────────
export type DeviceRegistrationStatus = "active" | "disabled" | "revoked";
export type DeviceRegistrationAction =
  | "registered"
  | "revoked"
  | "disabled"
  | "enabled"
  | "re_registered";

export interface PublicRegistration {
  id: string;
  label: string | null;
  platform: string | null;
  status: DeviceRegistrationStatus;
  registeredAt: string;
  lastSeenAt: string | null;
}

/** The signed-in employee's own device status (drives the My-Profile UI). */
export interface MyDeviceStatus {
  isEmployee: boolean;
  employeeId?: string;
  registered: boolean;
  requireFingerprint: boolean;
  registration: PublicRegistration | null;
  /** Returned once, right after registering, so the device can persist it. */
  deviceToken?: string;
}

/** A registration row in the HR/admin management table. */
export interface DeviceRegistration {
  id: string;
  companyId: string;
  employeeId: string;
  label: string | null;
  platform: string | null;
  status: DeviceRegistrationStatus;
  registeredAt: string;
  lastSeenAt: string | null;
  revokedBy: string | null;
  revokedAt: string | null;
  employee?: EmployeeRef | null;
}

export interface DeviceRegistrationLog {
  id: string;
  employeeId: string;
  registrationId: string | null;
  action: DeviceRegistrationAction;
  actorUserId: string | null;
  deviceLabel: string | null;
  note: string | null;
  createdAt: string;
}

export interface LogFilters {
  storeId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
  status?: AttendanceLogStatus;
}

export interface ClockInput {
  employeeId: string;
  storeId: string;
  shiftId?: string;
  method?: AttendanceMethod;
  terminalId?: string;
  deviceId?: string;
  atUtc?: string;
}

export interface PunchInput {
  logId?: string;
  employeeId?: string;
  atUtc?: string;
  paid?: boolean;
}
