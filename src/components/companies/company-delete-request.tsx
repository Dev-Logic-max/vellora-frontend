"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api";
import { useRequestCompanyDeletion } from "@/features/requests/requests";
import type { Company } from "@/features/org/types";

/**
 * Danger zone — the company-deletion REQUEST flow. A company can't delete itself
 * directly: the owner must type the exact company name to unlock the button, which
 * raises a deletion request to the platform. A super-admin approves + executes it
 * from the admin Requests tab.
 */
export function CompanyDeleteRequest({ company }: { company: Company }) {
  const request = useRequestCompanyDeletion();
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  const matches = confirm.trim() === company.name.trim();

  const submit = async () => {
    if (!matches) return;
    try {
      await request.mutateAsync({ confirmName: confirm.trim(), reason: reason.trim() || undefined });
      setDone(true);
      toast.success("Deletion request sent to the platform.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't send the request.");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/40">
      <div className="flex items-center gap-2.5 border-b border-rose-200/70 bg-rose-50 px-5 py-3.5">
        <ShieldAlert className="size-5 text-rose-600" />
        <h3 className="font-display text-sm font-semibold text-rose-800">Danger zone</h3>
      </div>

      <div className="space-y-4 p-5">
        {done ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Deletion request submitted</p>
              <p className="mt-0.5 text-xs text-amber-700">
                The platform team will review and process the deletion of{" "}
                <span className="font-semibold">{company.name}</span>. You&apos;ll be notified of the
                outcome.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground-2">
              Deleting a company is permanent and removes its stores, employees, and data. For
              safety, deletion is handled by the platform: type the company name to confirm and we
              will send a deletion request for approval.
            </p>

            <FormField
              id="confirm-name"
              label={`Type "${company.name}" to confirm`}
              placeholder={company.name}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <FormField
              id="delete-reason"
              label="Reason (optional)"
              placeholder="Why is this company being deleted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Button
              variant="destructive"
              disabled={!matches || request.isPending}
              onClick={submit}
            >
              <AlertTriangle />
              {request.isPending ? "Sending request…" : "Request company deletion"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
