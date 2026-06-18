export type LeaveRequestStatus = "requested" | "approved" | "rejected" | "cancelled";

export interface EmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  uniqueCode?: string | null;
  primaryStoreId?: string | null;
  timezone?: string | null;
}

export interface LeaveType {
  id: string;
  name: string;
  paid: boolean;
  color: string;
  requiresChain: boolean;
  accrualRule: Record<string, unknown>;
  carryoverRule: Record<string, unknown>;
  maxPerYear: number | null;
  active: boolean;
}

export interface ApprovalStep {
  step: number;
  role?: string;
  userId?: string;
  status: "pending" | "approved" | "rejected";
  by?: string;
  at?: string;
  note?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  typeId: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  days: string;
  reason: string | null;
  status: LeaveRequestStatus;
  approverChain: ApprovalStep[];
  currentStep: number;
  createdAt: string;
  employee?: EmployeeRef | null;
  type?: LeaveType | null;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  typeId: string;
  year: number;
  entitled: string;
  taken: string;
  pending: string;
  employee?: EmployeeRef | null;
  type?: LeaveType | null;
}

export interface Holiday {
  id: string;
  storeId: string | null;
  country: string | null;
  date: string;
  name: string;
  recurring: boolean;
}

export interface BlackoutDate {
  id: string;
  storeId: string | null;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface ConflictResult {
  alreadyOff: number;
  requests: {
    id: string;
    employeeId: string;
    employee?: EmployeeRef | null;
    startDate: string;
    endDate: string;
    status: LeaveRequestStatus;
  }[];
}

export interface CreateRequestInput {
  employeeId: string;
  typeId: string;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  reason?: string;
}
