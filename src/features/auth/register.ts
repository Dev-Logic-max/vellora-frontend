"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface RegisterInput {
  // Company
  companyName: string;
  slug?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  category?: string;
  companyEmail?: string;
  // Owner
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone?: string;
  ownerSecondaryEmail?: string;
  ownerPersonalEmail?: string;
  // Plan
  planKey?: string;
  interval?: "month" | "year";
}

export interface RegisterResult {
  companyId: string;
  companyName: string;
  status: string;
  ownerEmail: string;
  emailSent: boolean;
}

/** Public self-service registration → creates a pending company + owner identity
 * and sends the verification email. Unauthenticated. */
export function useRegisterCompany() {
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<RegisterResult>("/api/auth/register", input),
  });
}
