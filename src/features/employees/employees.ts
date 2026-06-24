"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { getActiveCompanyId } from "@/lib/active-company";
import { createClient } from "@/lib/supabase/client";
import type {
  ActivationRequest,
  ActivationRequestStatus,
  BankAccount,
  BankAccountInput,
  Contract,
  Employee,
  EmployeeDetail,
  EmployeeFilters,
  EmployeeInput,
  EmployeeListResponse,
  EmployeePreferences,
  EmployeeStoreLink,
  Medical,
  Qualification,
  Supervisor,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

function toQuery(filters: EmployeeFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => api.get<EmployeeListResponse>(`/api/employees${toQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.get<EmployeeDetail>(`/api/employees/${id}`),
    enabled: Boolean(id),
  });
}

/** Users above Employee in the active company (supervisor picker source). */
export function useSupervisors() {
  return useQuery({
    queryKey: ["employees", "supervisors"],
    queryFn: () => api.get<Supervisor[]>("/api/employees/supervisors"),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeInput) => api.post<Employee>("/api/employees", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<EmployeeInput>) =>
      api.patch<Employee>(`/api/employees/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["employee", id] });
    },
  });
}

export function useArchiveEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Employee>(`/api/employees/${id}/archive`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

/** Permanently delete an employee (irreversible). */
export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: true }>(`/api/employees/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useInviteEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email?: string) =>
      api.post<{ invited: boolean; authLinked: boolean }>(`/api/employees/${id}/invite`, {
        email,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["employee", id] });
    },
  });
}

export interface ImportResult {
  created: number;
  skipped: number;
  total: number;
  errors: string[];
}

export function useImportEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) => api.post<ImportResult>("/api/employees/import", { csv }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

/** Downloads the employee CSV export (raw text response, not JSON). */
export async function downloadEmployeesCsv(): Promise<void> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  const headers = new Headers();
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
  const companyId = getActiveCompanyId();
  if (companyId) headers.set("x-company-id", companyId);

  const res = await fetch(`${API_URL}/api/employees/export`, { headers });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── bank accounts ───────────────────────────────────────────────────────────
export function useBankAccounts(id: string) {
  return useQuery({
    queryKey: ["employee", id, "bank-accounts"],
    queryFn: () => api.get<BankAccount[]>(`/api/employees/${id}/bank-accounts`),
    enabled: Boolean(id),
  });
}

export function useAddBankAccount(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BankAccountInput) =>
      api.post<BankAccount>(`/api/employees/${id}/bank-accounts`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "bank-accounts"] }),
  });
}

export function useDeleteBankAccount(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) =>
      api.delete<{ removed: boolean }>(`/api/employees/${id}/bank-accounts/${accountId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "bank-accounts"] }),
  });
}

// ── store links ───────────────────────────────────────────────────────────────
export function useEmployeeStoreLinks(id: string) {
  return useQuery({
    queryKey: ["employee", id, "stores"],
    queryFn: () => api.get<EmployeeStoreLink[]>(`/api/employees/${id}/stores`),
    enabled: Boolean(id),
  });
}

// ── contracts ─────────────────────────────────────────────────────────────────
export function useEmployeeContracts(id: string) {
  return useQuery({
    queryKey: ["employee", id, "contracts"],
    queryFn: () => api.get<Contract[]>(`/api/employees/${id}/contracts`),
    enabled: Boolean(id),
  });
}

export function useAddContract(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Contract>) =>
      api.post<Contract>(`/api/employees/${id}/contracts`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "contracts"] }),
  });
}

/** Extend an active contract — move (or clear) its end date. */
export function useExtendContract(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, endDate }: { contractId: string; endDate: string | null }) =>
      api.patch<Contract>(`/api/employees/${id}/contracts/${contractId}/extend`, { endDate }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "contracts"] }),
  });
}

/** Cancel a contract (kept until permanently deleted). */
export function useCancelContract(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, reason }: { contractId: string; reason?: string }) =>
      api.post<Contract>(`/api/employees/${id}/contracts/${contractId}/cancel`, { reason }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "contracts"] }),
  });
}

/** Permanently delete a cancelled contract. */
export function useDeleteContract(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) =>
      api.delete<{ deleted: true }>(`/api/employees/${id}/contracts/${contractId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "contracts"] }),
  });
}

// ── qualifications (paid) ──────────────────────────────────────────────────────
export function useEmployeeQualifications(id: string) {
  return useQuery({
    queryKey: ["employee", id, "qualifications"],
    queryFn: () => api.get<Qualification[]>(`/api/employees/${id}/qualifications`),
    enabled: Boolean(id),
  });
}

export function useAddQualification(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Qualification>) =>
      api.post<Qualification>(`/api/employees/${id}/qualifications`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "qualifications"] }),
  });
}

// ── medicals (paid) ────────────────────────────────────────────────────────────
export function useEmployeeMedicals(id: string) {
  return useQuery({
    queryKey: ["employee", id, "medicals"],
    queryFn: () => api.get<Medical[]>(`/api/employees/${id}/medicals`),
    enabled: Boolean(id),
  });
}

export function useAddMedical(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Medical>) =>
      api.post<Medical>(`/api/employees/${id}/medicals`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "medicals"] }),
  });
}

// ── preferences ────────────────────────────────────────────────────────────────
export function useEmployeePreferences(id: string) {
  return useQuery({
    queryKey: ["employee", id, "preferences"],
    queryFn: () => api.get<EmployeePreferences>(`/api/employees/${id}/preferences`),
    enabled: Boolean(id),
  });
}

export function useUpdatePreferences(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Omit<EmployeePreferences, "employeeId">>) =>
      api.put<EmployeePreferences>(`/api/employees/${id}/preferences`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employee", id, "preferences"] }),
  });
}

// ── activation requests (HR/admin approval queue) ─────────────────────────────
export function useActivationRequests(status?: ActivationRequestStatus, enabled = true) {
  return useQuery({
    queryKey: ["activation-requests", status ?? "all"],
    queryFn: () =>
      api.get<ActivationRequest[]>(
        `/api/employees/activation-requests${status ? `?status=${status}` : ""}`,
      ),
    enabled,
  });
}

export function useApproveActivation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.post<ActivationRequest>(`/api/employees/activation-requests/${requestId}/approve`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activation-requests"] });
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useRejectActivation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      api.post<ActivationRequest>(`/api/employees/activation-requests/${requestId}/reject`, {
        reason,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["activation-requests"] }),
  });
}
