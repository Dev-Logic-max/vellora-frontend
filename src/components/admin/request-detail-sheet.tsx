"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field-group";
import { FormSheet } from "@/components/ui/form-sheet";
import { StatusSelect } from "@/components/ui/status-select";
import {
  ActionStatusTag,
  PriorityTag,
  RequestStatusTag,
  RequestTypeTag,
} from "@/components/requests/request-tags";
import { ApiError } from "@/lib/api";
import { useApproveDeletion, useRespondRequest } from "@/features/requests/requests";
import type { AdminPlatformRequest, PlatformRequestStatus } from "@/features/requests/types";

const STATUS_OPTIONS: { value: PlatformRequestStatus; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "in_review", label: "In review" },
  { value: "replied", label: "Replied" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

/**
 * Platform request review sheet (lg). Shows the request, its colored tags, and the
 * tenant's message; lets the operator set the record status + write a response.
 * For company-deletion requests it surfaces the approve-and-delete action.
 */
export function RequestDetailSheet({
  request,
  open,
  onOpenChange,
}: {
  request: AdminPlatformRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Review request"
      subtitle={request?.companyName ?? undefined}
    >
      {request ? <Body request={request} onDone={() => onOpenChange(false)} /> : null}
    </FormSheet>
  );
}

function Body({ request, onDone }: { request: AdminPlatformRequest; onDone: () => void }) {
  const respond = useRespondRequest();
  const approve = useApproveDeletion();
  const [status, setStatus] = useState<PlatformRequestStatus>(request.status);
  const [response, setResponse] = useState(request.response ?? "");

  const save = async () => {
    try {
      await respond.mutateAsync({ id: request.id, status, response: response.trim() || undefined });
      toast.success("Request updated.");
      onDone();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update.");
    }
  };

  const approveDeletion = async () => {
    try {
      await approve.mutateAsync(request.id);
      toast.success("Company deletion approved and processed.");
      onDone();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't approve.");
    }
  };

  const isDeletion = request.type === "company_deletion";

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="space-y-3 rounded-xl border border-border bg-surface-subtle/40 p-4">
        <h3 className="font-display text-base font-semibold text-foreground">{request.subject}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <RequestTypeTag type={request.type} module={request.module} />
          <PriorityTag priority={request.priority} />
          <RequestStatusTag status={request.status} />
          <ActionStatusTag status={request.actionStatus} />
        </div>
        <dl className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <Meta label="Company" value={request.companyName} />
          <Meta label="Requested by" value={request.requesterName} />
          <Meta label="Submitted" value={new Date(request.createdAt).toLocaleString()} />
          {request.resolvedAt ? (
            <Meta label="Resolved" value={new Date(request.resolvedAt).toLocaleString()} />
          ) : null}
        </dl>
      </div>

      {request.message ? (
        <FieldGroup title="Message">
          <p className="col-span-full rounded-xl border border-border bg-surface px-4 py-3 text-sm whitespace-pre-wrap text-foreground-2">
            {request.message}
          </p>
        </FieldGroup>
      ) : null}

      {/* Deletion approval */}
      {isDeletion ? (
        <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-600" />
            <p className="text-sm font-semibold text-rose-800">Company deletion request</p>
          </div>
          <p className="text-xs text-rose-700">
            Approving permanently deactivates this company (status → deleted) and revokes access for
            its members. This is processed immediately.
          </p>
          <Button variant="destructive" onClick={approveDeletion} disabled={approve.isPending}>
            <Trash2 />
            {approve.isPending ? "Processing…" : "Approve & delete company"}
          </Button>
        </div>
      ) : null}

      {/* Respond */}
      <FieldGroup title="Respond">
        <div className="col-span-full space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Record status</label>
          <StatusSelect
            value={status}
            onChange={(v) => v && setStatus(v as PlatformRequestStatus)}
            options={STATUS_OPTIONS}
            allowClear={false}
          />
        </div>
        <div className="col-span-full space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Response</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            placeholder="Reply to the requester…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>
        <div className="col-span-full">
          <Button onClick={save} disabled={respond.isPending}>
            {respond.isPending ? "Saving…" : "Save response"}
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
