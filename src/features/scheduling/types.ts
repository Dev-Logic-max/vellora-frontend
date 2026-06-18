export type ShiftStatus =
  | "draft"
  | "assigned"
  | "published"
  | "approved"
  | "cancelled"
  | "off";
export type ShiftSource = "manual" | "template" | "suggested";

export interface ShiftEmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ShiftActivityRef {
  id: string;
  name: string;
  color: string;
}

export interface Shift {
  id: string;
  companyId: string;
  storeId: string;
  employeeId: string | null;
  activityId: string | null;
  role: string | null;
  startsAtUtc: string;
  endsAtUtc: string;
  breakMinutes: number;
  status: ShiftStatus;
  notes: string | null;
  source: ShiftSource;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: ShiftEmployeeRef | null;
  activity?: ShiftActivityRef | null;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  storeId: string | null;
  pattern: Record<string, { start: string; end: string; role?: string; breakMinutes?: number }[]>;
  active: boolean;
  createdAt: string;
}

export interface CoverageCell {
  date: string;
  hour: number;
  required: number;
  scheduled: number;
}

export interface CoverageResponse {
  storeId: string;
  cells: CoverageCell[];
}

export interface Suggestion {
  storeId: string;
  date: string;
  fromHour: number;
  toHour: number;
  addStaff: number;
  reason: string;
}

export interface ShiftInput {
  storeId: string;
  employeeId?: string | null;
  activityId?: string | null;
  role?: string | null;
  startsAtUtc?: string;
  endsAtUtc?: string;
  breakMinutes?: number;
  notes?: string | null;
  status?: ShiftStatus;
}
