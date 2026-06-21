import type { MembershipRole } from "@/features/session/types";

export type EmployeeStatus = "invited" | "active" | "on_leave" | "suspended" | "archived";
export type ContractType = "full_time" | "part_time" | "temporary" | "contractor" | "intern";
export type WorkScheduleType = "full_time" | "part_time" | "shift" | "flexible" | "remote";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type StoreRelation = "secondary" | "guest" | "peak";
export type CredentialStatus = "valid" | "expiring" | "expired";

/** Adjustable benefits a company can offer an employee. */
export type EmployeeBenefits = Record<string, boolean>;

export interface Employee {
  id: string;
  companyId: string;
  primaryStoreId: string | null;
  userId: string | null;
  uniqueCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyEmail: string | null;
  /** Free-text job title (e.g. "Barista"). */
  role: string | null;
  /** The user's company membership role (owner/hr/area_manager/...) — null when no portal login yet. */
  membershipRole: MembershipRole | null;
  department: string | null;
  supervisorId: string | null;
  status: EmployeeStatus;
  hireDate: string | null;
  contractType: ContractType | null;
  workScheduleType: WorkScheduleType | null;
  weeklyHours: number | null;
  contractEnd: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  iban: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  postalCode: string | null;
  address: string | null;
  benefits: EmployeeBenefits;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRef {
  id: string;
  name: string;
  code: string | null;
  timezone?: string;
}

export interface EmployeeStoreLink {
  id: string;
  companyId: string;
  employeeId: string;
  storeId: string;
  relation: StoreRelation;
  active: boolean;
  createdAt: string;
  store?: StoreRef;
}

export interface EmployeeDetail extends Employee {
  primaryStore: StoreRef | null;
  storeLinks: EmployeeStoreLink[];
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeFilters {
  page?: number;
  pageSize?: number;
  storeId?: string;
  role?: string;
  status?: EmployeeStatus;
  q?: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  type: ContractType;
  startDate: string;
  endDate: string | null;
  hoursWeek: number | null;
  salary: string | null;
  currency: string;
  docId: string | null;
  createdAt: string;
}

export interface Qualification {
  id: string;
  employeeId: string;
  name: string;
  issuer: string | null;
  issued: string | null;
  expires: string | null;
  docId: string | null;
  status: CredentialStatus;
  createdAt: string;
}

export interface Medical {
  id: string;
  employeeId: string;
  type: string;
  date: string | null;
  expires: string | null;
  status: CredentialStatus;
  createdAt: string;
}

export interface EmployeePreferences {
  employeeId: string;
  availability: Record<string, unknown>;
  notifPrefs: Record<string, unknown>;
  uiPrefs: Record<string, unknown>;
}

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyEmail?: string;
  role?: string;
  department?: string;
  supervisorId?: string;
  status?: EmployeeStatus;
  hireDate?: string;
  contractType?: ContractType;
  workScheduleType?: WorkScheduleType;
  weeklyHours?: number;
  contractEnd?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: Gender;
  iban?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  benefits?: EmployeeBenefits;
  primaryStoreId?: string;
  uniqueCode?: string;
  secondaryStores?: { storeId: string; relation: StoreRelation }[];
}

/** A user eligible to supervise (role above Employee). */
export interface Supervisor {
  userId: string;
  role: MembershipRole;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}
