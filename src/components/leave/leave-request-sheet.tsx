"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ApiError } from "@/lib/api";
import { useEmployees } from "@/features/employees/employees";
import { useCreateLeaveRequest, useLeaveBalances, useLeaveTypes } from "@/features/leave/leave";

/** Inclusive working-day count (excl. weekends) for the in-sheet preview. */
function previewDays(start: string, end: string): number {
  if (!start || !end || end < start) return 0;
  let count = 0;
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export function LeaveRequestSheet({
  trigger,
  defaultEmployeeId,
}: {
  trigger: ReactNode;
  defaultEmployeeId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | undefined>(defaultEmployeeId);
  const [typeId, setTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: employeesPage } = useEmployees({ pageSize: 200 });
  const { data: types } = useLeaveTypes();
  const year = startDate ? Number(startDate.slice(0, 4)) : new Date().getFullYear();
  const { data: balances } = useLeaveBalances({ employeeId, year });
  const create = useCreateLeaveRequest();

  const employeeOptions =
    employeesPage?.data.map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName}`,
    })) ?? [];

  const days = halfDay ? 0.5 : previewDays(startDate, endDate);
  const balance = useMemo(
    () => balances?.find((b) => b.typeId === typeId),
    [balances, typeId],
  );
  const remaining = balance
    ? Number(balance.entitled) - Number(balance.taken) - Number(balance.pending)
    : null;

  const reset = () => {
    setTypeId("");
    setStartDate("");
    setEndDate("");
    setHalfDay(false);
    setReason("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!employeeId || !typeId || !startDate || !endDate) {
      setError("Employee, type and dates are required.");
      return;
    }
    try {
      await create.mutateAsync({ employeeId, typeId, startDate, endDate, halfDay, reason });
      reset();
      setOpen(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not submit request.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Request leave</SheetTitle>
          <SheetDescription>Pick a date range and leave type.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          {!defaultEmployeeId ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Employee</label>
              <Combobox
                options={employeeOptions}
                value={employeeId}
                onChange={setEmployeeId}
                placeholder="Select employee…"
              />
            </div>
          ) : null}

          <SelectField
            id="leave-type"
            label="Leave type"
            placeholder="Select type…"
            options={types?.map((t) => ({ value: t.id, label: t.name })) ?? []}
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="leave-start"
              label="From"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormField
              id="leave-end"
              label="To"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={halfDay}
              onChange={(e) => setHalfDay(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Half day
          </label>

          <FormField
            id="leave-reason"
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="rounded-lg border border-border bg-surface-subtle px-3 py-2.5 text-sm tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Days requested</span>
              <span className="font-semibold text-foreground">{days}</span>
            </div>
            {remaining !== null ? (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Remaining after</span>
                <span className="font-semibold text-foreground">{remaining - days}</span>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button className="w-full" onClick={() => void submit()} disabled={create.isPending}>
            {create.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
