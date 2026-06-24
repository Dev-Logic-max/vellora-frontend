import type { MembershipRole } from "@/features/session/types";

export type EmployeeStatus = "invited" | "active" | "on_leave" | "suspended" | "archived";
export type ContractType = "full_time" | "part_time" | "temporary" | "contractor" | "intern";
export type WorkScheduleType = "full_time" | "part_time" | "shift" | "flexible" | "remote";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "other";
export type StoreRelation = "secondary" | "guest" | "peak";
export type CredentialStatus = "valid" | "expiring" | "expired";

export interface BankAccount {
  id: string;
  employeeId: string;
  label: string | null;
  country: string | null;
  bankName: string;
  bankSwift: string | null;
  bankBrandColor: string | null;
  accountHolder: string | null;
  iban: string | null;
  accountNumber: string | null;
  currency: string | null;
  cardNetwork: string | null;
  cardLast4: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface BankAccountInput {
  label?: string;
  country?: string;
  bankName: string;
  bankSwift?: string;
  bankBrandColor?: string;
  accountHolder?: string;
  iban?: string;
  accountNumber?: string;
  currency?: string;
  cardNetwork?: string;
  cardLast4?: string;
  isPrimary?: boolean;
}

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
  maritalStatus: MaritalStatus | null;
  idCardNumber: string | null;
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

export type ContractStatus = "active" | "cancelled";

export interface Contract {
  id: string;
  employeeId: string;
  title: string | null;
  type: ContractType;
  startDate: string;
  endDate: string | null;
  hoursWeek: number | null;
  salary: string | null;
  currency: string;
  docId: string | null;
  status: ContractStatus;
  cancelReason: string | null;
  cancelledAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ActivationRequestStatus = "pending" | "approved" | "rejected";

export interface ActivationRequest {
  id: string;
  companyId: string;
  employeeId: string | null;
  email: string;
  requestedRole: MembershipRole;
  status: ActivationRequestStatus;
  source: string;
  rejectReason: string | null;
  cooldownUntil: string | null;
  decidedAt: string | null;
  createdAt: string;
  /** Joined display fields. */
  employeeName: string | null;
  uniqueCode: string | null;
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
  maritalStatus?: MaritalStatus;
  idCardNumber?: string;
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
  /** When set, provision a portal login of this role (raises an activation request). */
  membershipRole?: MembershipRole;
  /** Login email for the provisioned account (defaults to `email`). */
  accountEmail?: string;
}

/** A user eligible to supervise (role above Employee). */
export interface Supervisor {
  userId: string;
  role: MembershipRole;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}
