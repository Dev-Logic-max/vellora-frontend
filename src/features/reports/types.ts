/** Reports & analytics types — mirror the backend (16-reports). */
export type ReportType = "headcount" | "attendance" | "turnover" | "labor";

export interface ReportFilters {
  from?: string;
  to?: string;
  storeId?: string;
}

export interface HeadcountData {
  total: number;
  active: number;
  byStatus: Record<string, number>;
  byDepartment: Record<string, number>;
}

export interface AttendanceData {
  totalHours: number;
  shifts: number;
  series: { day: string; hours: number; shifts: number }[];
}

export interface TurnoverData {
  hires: number;
  leavers: number;
  active: number;
  turnoverRate: number;
}

export interface LaborData {
  totalCost: number;
  hourlyRate: number;
  series: { day: string; cost: number }[];
}

export interface ReportDef {
  id: string;
  name: string;
  type: ReportType;
  schedule: string | null;
  recipients: string[];
  createdAt: string;
}

export interface ReportRun {
  id: string;
  status: "queued" | "running" | "ready" | "failed";
  format: string;
  ranAt: string | null;
  createdAt: string;
}

export interface CreateReportDefInput {
  name: string;
  type: ReportType;
  config?: ReportFilters;
  schedule?: "daily" | "weekly" | "monthly";
  recipients?: string[];
}
