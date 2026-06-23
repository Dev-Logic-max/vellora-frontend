import type {
  ContractType,
  EmployeeStatus,
  Gender,
  MaritalStatus,
  StoreRelation,
  WorkScheduleType,
} from "./types";

export const EMPLOYEE_STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "on_leave", label: "On leave" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
];

export const CONTRACT_TYPE_OPTIONS: { value: ContractType; label: string }[] = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "temporary", label: "Temporary" },
  { value: "contractor", label: "Contractor" },
  { value: "intern", label: "Intern" },
];

export const STORE_RELATION_OPTIONS: { value: StoreRelation; label: string }[] = [
  { value: "secondary", label: "Secondary" },
  { value: "guest", label: "Guest" },
  { value: "peak", label: "Peak" },
];

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = Object.fromEntries(
  CONTRACT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ContractType, string>;

export const WORK_SCHEDULE_OPTIONS: { value: WorkScheduleType; label: string }[] = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "shift", label: "Shift" },
  { value: "flexible", label: "Flexible" },
  { value: "remote", label: "Remote" },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "other", label: "Other" },
];

/** Benefits a company can toggle on for an employee (the key is persisted). */
export const BENEFIT_OPTIONS: { key: string; label: string }[] = [
  { key: "first_aid", label: "First-aid certified" },
  { key: "medical", label: "Medical insurance" },
  { key: "dental", label: "Dental cover" },
  { key: "meal_allowance", label: "Meal allowance" },
  { key: "transport", label: "Transport allowance" },
  { key: "gym", label: "Gym / wellness" },
  { key: "remote_stipend", label: "Remote stipend" },
  { key: "paid_parking", label: "Paid parking" },
];
