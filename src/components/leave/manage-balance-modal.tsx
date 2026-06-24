"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { EmployeeSelect } from "@/components/org/entity-selects";
import { useEmployees } from "@/features/employees/employees";
import { useLeaveBalances, useLeaveTypes, useSetLeaveBalance } from "@/features/leave/leave";

/**
 * Manage leave/holiday balances (P9, higher roles). Pick an employee + year,
 * then set the entitled days for each leave type (e.g. sick, vacation). Saves
 * one balance row per type via POST /leave/balances.
 */
export function ManageBalanceModal({
  open,
  onOpenChange,
  year,
  employeeId: fixedEmployeeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  /** When provided, the employee is fixed (e.g. opened from a balance card). */
  employeeId?: string;
}) {
  const { data: employees } = useEmployees({ pageSize: 200 });
  const { data: types } = useLeaveTypes();
  const setBalance = useSetLeaveBalance();
  const [employeeId, setEmployeeId] = useState<string | undefined>(fixedEmployeeId);
  const { data: existing } = useLeaveBalances({ employeeId, year });

  // Entitled-days draft keyed by typeId (seeded from existing on first edit).
  const [draft, setDraft] = useState<Record<string, string>>({});
  const valueFor = (typeId: string) => {
    if (draft[typeId] !== undefined) return draft[typeId];
    const found = existing?.find((b) => b.typeId === typeId);
    return found ? String(Number(found.entitled)) : "";
  };

  const close = () => {
    onOpenChange(false);
    setDraft({});
    if (!fixedEmployeeId) setEmployeeId(undefined);
  };

  const save = async () => {
    if (!employeeId || !types) return;
    try {
      // Persist every type that has a numeric entitlement entered.
      await Promise.all(
        types
          .map((t) => ({ typeId: t.id, val: valueFor(t.id) }))
          .filter((r) => r.val !== "" && !Number.isNaN(Number(r.val)))
          .map((r) =>
            setBalance.mutateAsync({
              employeeId,
              typeId: r.typeId,
              year,
              entitled: Number(r.val),
            }),
          ),
      );
      toast.success("Balances updated");
      close();
    } catch {
      toast.error("Couldn't update balances");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="flex items-start gap-3 border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
            <Wallet className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Manage balance</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Set entitled days per leave type for {year}.
            </p>
          </div>
        </div>

        <div className="scrollbar-none max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
          {!fixedEmployeeId ? (
            <FieldGroup title="Employee" cols={1}>
              <FullWidth>
                <EmployeeSelect
                  employees={employees?.data}
                  value={employeeId}
                  onChange={setEmployeeId}
                />
              </FullWidth>
            </FieldGroup>
          ) : null}

          <FieldGroup title="Entitlements (days)">
            {types && types.length > 0 ? (
              types.map((t) => (
                <FormField
                  key={t.id}
                  id={`bal-${t.id}`}
                  type="number"
                  label={t.name}
                  placeholder="0"
                  value={valueFor(t.id)}
                  onChange={(e) => setDraft((d) => ({ ...d, [t.id]: e.target.value }))}
                />
              ))
            ) : (
              <FullWidth>
                <p className="text-sm text-muted-foreground">
                  No leave types defined yet. Add them under Leave → Policies.
                </p>
              </FullWidth>
            )}
          </FieldGroup>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
          <Button variant="outline" onClick={close} disabled={setBalance.isPending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!employeeId || setBalance.isPending}>
            {setBalance.isPending ? "Saving…" : "Save balance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
