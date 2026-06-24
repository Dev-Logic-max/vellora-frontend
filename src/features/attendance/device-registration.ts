"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import {
  describePlatform,
  getFingerprint,
  readDeviceToken,
  saveDeviceToken,
} from "@/lib/device-identity";
import type {
  DeviceRegistration,
  DeviceRegistrationLog,
  DeviceRegistrationStatus,
  MyDeviceStatus,
} from "./types";

const MY_KEY = "device-registration-me";
const LIST_KEY = "device-registrations";

/** The signed-in employee's own device status. */
export function useMyDeviceStatus() {
  return useQuery({
    queryKey: [MY_KEY],
    queryFn: () => api.get<MyDeviceStatus>("/api/device-registrations/me"),
  });
}

/**
 * Registers the CURRENT device for the signed-in employee. Captures a fingerprint
 * only when the company requires it, persists the returned device token locally,
 * and refreshes status. The flow is intentionally simple: one click → bound.
 */
export function useRegisterMyDevice(requireFingerprint: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const fingerprint = requireFingerprint ? await getFingerprint() : undefined;
      const result = await api.post<MyDeviceStatus>("/api/device-registrations/me", {
        platform: describePlatform(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        deviceToken: readDeviceToken() ?? undefined,
        fingerprint,
      });
      if (result.deviceToken) saveDeviceToken(result.deviceToken);
      return result;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [MY_KEY] }),
  });
}

// ── HR/admin management ─────────────────────────────────────────────────────
export interface RegistrationQuery {
  employeeId?: string;
  status?: DeviceRegistrationStatus;
}

export function useDeviceRegistrations(query: RegistrationQuery = {}) {
  const params = new URLSearchParams();
  if (query.employeeId) params.set("employeeId", query.employeeId);
  if (query.status) params.set("status", query.status);
  const qs = params.toString();
  return useQuery({
    queryKey: [LIST_KEY, query],
    queryFn: () => api.get<DeviceRegistration[]>(`/api/device-registrations${qs ? `?${qs}` : ""}`),
    placeholderData: (prev) => prev,
  });
}

export function useRegistrationHistory(employeeId: string | undefined) {
  return useQuery({
    queryKey: [LIST_KEY, employeeId, "history"],
    queryFn: () =>
      api.get<DeviceRegistrationLog[]>(`/api/device-registrations/${employeeId}/history`),
    enabled: Boolean(employeeId),
  });
}

/** Manager actions on a registration: revoke / disable / enable. */
export function useRegistrationAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "revoke" | "disable" | "enable" }) =>
      api.post<DeviceRegistration>(`/api/device-registrations/${id}/${action}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [LIST_KEY] });
      void qc.invalidateQueries({ queryKey: [MY_KEY] });
    },
  });
}

/** Manager registers a device on an employee's behalf. */
export function useAdminRegisterDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { employeeId: string; label?: string; platform?: string }) =>
      api.post<DeviceRegistration>("/api/device-registrations/admin", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [LIST_KEY] }),
  });
}
