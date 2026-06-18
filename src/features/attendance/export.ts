"use client";

import { getActiveCompanyId } from "@/lib/active-company";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

/** Streams the attendance timesheet CSV (paid) with the auth + tenant headers. */
export async function downloadAttendanceCsv(filters: { storeId?: string } = {}): Promise<void> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  const headers = new Headers();
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
  const companyId = getActiveCompanyId();
  if (companyId) headers.set("x-company-id", companyId);

  const params = new URLSearchParams();
  if (filters.storeId) params.set("storeId", filters.storeId);
  const qs = params.toString();

  const res = await fetch(`${API_URL}/api/attendance/export${qs ? `?${qs}` : ""}`, { headers });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
  URL.revokeObjectURL(url);
}
