export type TransferKind = "temporary" | "permanent";
export type TransferStatus =
  | "requested"
  | "approved"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled";

export interface StoreRef {
  id: string;
  name: string;
}

export interface EmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  uniqueCode?: string | null;
  primaryStoreId?: string | null;
}

export interface Transfer {
  id: string;
  employeeId: string;
  fromStoreId: string | null;
  toStoreId: string;
  kind: TransferKind;
  startDate: string | null;
  endDate: string | null;
  reason: string | null;
  status: TransferStatus;
  linkId: string | null;
  createdAt: string;
  employee?: EmployeeRef | null;
  fromStore?: StoreRef | null;
  toStore?: StoreRef | null;
}

export interface CreateTransferInput {
  employeeId: string;
  toStoreId: string;
  fromStoreId?: string;
  kind: TransferKind;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export const TRANSFER_STATUS_STYLES: Record<TransferStatus, string> = {
  requested: "bg-warning-soft text-warning",
  approved: "bg-accent-soft text-accent-strong",
  active: "bg-success-soft text-success",
  completed: "bg-muted text-muted-foreground",
  rejected: "bg-danger-soft text-danger",
  cancelled: "bg-muted text-muted-foreground",
};
