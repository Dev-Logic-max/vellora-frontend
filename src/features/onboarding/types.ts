export type OnboardingStage = "pre_start" | "first_day" | "first_week" | "first_month";
export type AssignmentStatus = "pending" | "done" | "skipped";

export interface EmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  uniqueCode?: string | null;
  primaryStoreId?: string | null;
}

export interface OnboardingTask {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface TaskGroup {
  id: string;
  name: string;
  stage: OnboardingStage;
  sortOrder: number;
  tasks: OnboardingTask[];
}

export interface Assignment {
  id: string;
  employeeId: string;
  taskId: string;
  status: AssignmentStatus;
  completedAt: string | null;
  employee?: EmployeeRef | null;
  task?: (OnboardingTask & { group?: TaskGroup | null }) | null;
}

export interface OverviewRow {
  employeeId: string;
  employee?: EmployeeRef | null;
  total: number;
  done: number;
  progress: number;
}

export interface OnboardingOverview {
  employees: OverviewRow[];
  kpis: { inProgress: number; completed: number; notStarted: number };
}

export const STAGE_LABELS: Record<OnboardingStage, string> = {
  pre_start: "Pre-start",
  first_day: "First day",
  first_week: "First week",
  first_month: "First month",
};
