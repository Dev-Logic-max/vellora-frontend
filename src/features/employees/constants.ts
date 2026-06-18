import type { ContractType, EmployeeStatus, StoreRelation } from "./types";

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
