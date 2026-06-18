"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRequestCorrection } from "@/features/attendance/attendance";
import { ApiError } from "@/lib/api";
import type { AttendanceLog } from "@/features/attendance/types";

const FIELD_OPTIONS = [
  { value: "clock_in_utc", label: "Clock-in time" },
  { value: "clock_out_utc", label: "Clock-out time" },
  { value: "status", label: "Status" },
];

/** Converts a UTC ISO string to the value a datetime-local input expects. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CorrectionSheet({
  log,
  open,
  onOpenChange,
}: {
  log: AttendanceLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const request = useRequestCorrection();
  const [field, setField] = useState("clock_in_utc");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!log) return null;
  const isTimeField = field !== "status";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const newValue = isTimeField && value ? new Date(value).toISOString() : value;
    if (!newValue) {
      setError("Enter the corrected value.");
      return;
    }
    request
      .mutateAsync({ logId: log.id, field, newValue, reason: reason || undefined })
      .then(() => onOpenChange(false))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Request failed."));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Request correction</SheetTitle>
          <SheetDescription>
            Propose an edit to this punch — a manager approves it (audited).
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-4 px-4">
          <SelectField
            id="correction-field"
            label="Field"
            options={FIELD_OPTIONS}
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setValue(
                e.target.value === "clock_in_utc"
                  ? toLocalInput(log.clockInUtc)
                  : e.target.value === "clock_out_utc"
                    ? toLocalInput(log.clockOutUtc)
                    : log.status,
              );
            }}
          />
          {isTimeField ? (
            <FormField
              id="correction-value"
              label="Corrected time"
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <SelectField
              id="correction-status"
              label="Corrected status"
              options={[
                { value: "closed", label: "Closed" },
                { value: "corrected", label: "Corrected" },
              ]}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <FormField
            id="correction-reason"
            label="Reason"
            placeholder="Why this change is needed"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <SheetFooter className="px-0">
            <Button type="submit" disabled={request.isPending}>
              {request.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
