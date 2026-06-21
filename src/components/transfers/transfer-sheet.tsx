"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DateField } from "@/components/ui/date-picker";
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
import { useStores } from "@/features/org/stores";
import { useCreateTransfer } from "@/features/transfers/transfers";
import type { TransferKind } from "@/features/transfers/types";

const KIND_OPTIONS = [
  { value: "temporary", label: "Temporary (auto-reverts)" },
  { value: "permanent", label: "Permanent" },
];

export function TransferSheet({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [toStoreId, setToStoreId] = useState<string | undefined>();
  const [kind, setKind] = useState<TransferKind>("temporary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: employeesPage } = useEmployees({ pageSize: 200 });
  const { data: stores } = useStores();
  const create = useCreateTransfer();

  const employee = employeesPage?.data.find((e) => e.id === employeeId);
  const fromStore = stores?.find((s) => s.id === employee?.primaryStoreId);
  const conflict = toStoreId && toStoreId === employee?.primaryStoreId;

  const submit = async () => {
    setError(null);
    if (!employeeId || !toStoreId) {
      setError("Employee and destination store are required.");
      return;
    }
    if (kind === "temporary" && (!startDate || !endDate)) {
      setError("Temporary transfers need a start and end date.");
      return;
    }
    try {
      await create.mutateAsync({
        employeeId,
        toStoreId,
        kind,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        reason: reason || undefined,
      });
      setOpen(false);
      setEmployeeId(undefined);
      setToStoreId(undefined);
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create transfer.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New transfer</SheetTitle>
          <SheetDescription>Move an employee between stores.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Employee</label>
            <Combobox
              options={
                employeesPage?.data.map((e) => ({
                  value: e.id,
                  label: `${e.firstName} ${e.lastName}`,
                })) ?? []
              }
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="Select employee…"
            />
            {fromStore ? (
              <p className="text-xs text-muted-foreground">Currently at {fromStore.name}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">To store</label>
            <Combobox
              options={stores?.map((s) => ({ value: s.id, label: s.name })) ?? []}
              value={toStoreId}
              onChange={setToStoreId}
              placeholder="Select destination…"
            />
            {conflict ? (
              <p className="text-xs text-warning">Destination matches the current store.</p>
            ) : null}
          </div>

          <SelectField
            id="transfer-kind"
            label="Kind"
            options={KIND_OPTIONS}
            value={kind}
            onChange={(e) => setKind(e.target.value as TransferKind)}
          />

          {kind === "temporary" ? (
            <div className="grid grid-cols-2 gap-3">
              <DateField id="transfer-start" label="From" value={startDate} onChange={setStartDate} />
              <DateField id="transfer-end" label="To" value={endDate} onChange={setEndDate} />
            </div>
          ) : null}

          <FormField
            id="transfer-reason"
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            className="w-full"
            onClick={() => void submit()}
            disabled={create.isPending || Boolean(conflict)}
          >
            {create.isPending ? "Creating…" : "Create transfer"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
