"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api";
import { useCreateRequest } from "@/features/requests/requests";
import type { Store } from "@/features/org/types";

/**
 * Danger zone — store-deletion REQUEST flow (mirrors the company one). A store
 * can't be deleted directly: type the exact store name to unlock, which raises a
 * request to the platform (lands in the admin Requests tab as a Stores support
 * request with the store id in meta). A platform operator processes it.
 */
export function StoreDeleteRequest({ store }: { store: Store }) {
  const request = useCreateRequest();
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  const matches = confirm.trim() === store.name.trim();

  const submit = async () => {
    if (!matches) return;
    try {
      await request.mutateAsync({
        type: "support",
        module: "Stores",
        priority: "high",
        subject: `Delete store "${store.name}"`,
        message: reason.trim() || `Requesting deletion of store "${store.name}" (${store.code ?? store.id}).`,
      });
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
                <span className="font-semibold">{store.name}</span>. You&apos;ll be notified of the
                outcome.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground-2">
              Deleting a store removes its shifts, attendance, and assignments. For safety, deletion
              is handled by the platform: type the store name to confirm and we&apos;ll send a
              deletion request for approval.
            </p>

            <FormField
              id="confirm-store-name"
              label={`Type "${store.name}" to confirm`}
              placeholder={store.name}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <FormField
              id="store-delete-reason"
              label="Reason (optional)"
              placeholder="Why is this store being deleted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Button variant="destructive" disabled={!matches || request.isPending} onClick={submit}>
              <AlertTriangle />
              {request.isPending ? "Sending request…" : "Request store deletion"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
