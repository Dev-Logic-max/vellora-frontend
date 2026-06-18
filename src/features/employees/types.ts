export type EmployeeStatus = "invited" | "active" | "on_leave" | "suspended" | "archived";
export type ContractType = "full_time" | "part_time" | "temporary" | "contractor" | "intern";
export type StoreRelation = "secondary" | "guest" | "peak";
export type CredentialStatus = "valid" | "expiring" | "expired";

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
  role: string | null;
  department: string | null;
  status: EmployeeStatus;
  hireDate: string | null;
  contractType: ContractType | null;
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
  role?: string;
  department?: string;
  status?: EmployeeStatus;
  hireDate?: string;
  contractType?: ContractType;
  primaryStoreId?: string;
  uniqueCode?: string;
  secondaryStores?: { storeId: string; relation: StoreRelation }[];
}
