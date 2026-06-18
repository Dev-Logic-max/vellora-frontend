"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Device, DeviceStatus, Terminal, TerminalQr } from "./types";

const DEVICES_KEY = "devices";
const TERMINALS_KEY = "terminals";

export interface DeviceQuery {
  storeId?: string;
  status?: DeviceStatus;
  q?: string;
}

function toQuery(q: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function useDevices(query: DeviceQuery = {}) {
  return useQuery({
    queryKey: [DEVICES_KEY, query],
    queryFn: () =>
      api.get<Device[]>(`/api/devices${toQuery(query as Record<string, string | undefined>)}`),
    placeholderData: (prev) => prev,
  });
}

export function useRegisterDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { employeeId: string; label: string; platform?: string }) =>
      api.post<Device>("/api/devices/register", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DEVICES_KEY] }),
  });
}

export function useDeviceAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "reset" | "block" }) =>
      api.post<Device>(`/api/devices/${id}/${action}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DEVICES_KEY] }),
  });
}

// ── terminals ─────────────────────────────────────────────────────────────────
export function useTerminals() {
  return useQuery({
    queryKey: [TERMINALS_KEY],
    queryFn: () => api.get<Terminal[]>("/api/terminals"),
  });
}

export function useCreateTerminal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeId: string; label: string }) =>
      api.post<Terminal>("/api/terminals", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TERMINALS_KEY] }),
  });
}

export function useTerminalAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "authorize" | "block" }) =>
      api.post<Terminal>(`/api/terminals/${id}/${action}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TERMINALS_KEY] }),
  });
}

/** Polls the rotating QR payload while a terminal panel is open. */
export function useTerminalQr(terminalId: string | undefined, active: boolean) {
  return useQuery({
    queryKey: [TERMINALS_KEY, terminalId, "qr"],
    queryFn: () => api.get<TerminalQr>(`/api/terminals/${terminalId}/qr`),
    enabled: Boolean(terminalId) && active,
    refetchInterval: active ? 30_000 : false,
  });
}
