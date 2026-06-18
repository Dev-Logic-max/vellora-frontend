"use client";

import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";

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
} from "@/components/ui/sheet";
import { ApiError } from "@/lib/api";
import { useEmployees } from "@/features/employees/employees";
import {
  useCreateShift,
  useDeleteShift,
  useShiftAction,
  useUpdateShift,
} from "@/features/scheduling/scheduling";
import { SHIFT_STATUS_OPTIONS } from "@/features/scheduling/status";
import type { Shift, ShiftStatus } from "@/features/scheduling/types";

interface ShiftSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  shift: Shift | null;
  defaultDate?: string;
  defaultHour?: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function ShiftSheet({
  open,
  onOpenChange,
  storeId,
  shift,
  defaultDate,
  defaultHour,
}: ShiftSheetProps) {
  const isEdit = Boolean(shift);
  const { data: employeeList } = useEmployees({ storeId, pageSize: 200 });
  const create = useCreateShift();
  const update = useUpdateShift();
  const action = useShiftAction();
  const del = useDeleteShift();

  // Initialized from props on mount; the parent passes a changing `key` so a
  // fresh editing session remounts the form (no setState-in-effect needed).
  const s = shift ? new Date(shift.startsAtUtc) : null;
  const e = shift ? new Date(shift.endsAtUtc) : null;
  const [date, setDate] = useState(
    s ? s.toISOString().slice(0, 10) : (defaultDate ?? new Date().toISOString().slice(0, 10)),
  );
  const [start, setStart] = useState(
    s ? s.toISOString().slice(11, 16) : defaultHour != null ? `${pad(defaultHour)}:00` : "09:00",
  );
  const [end, setEnd] = useState(
    e
      ? e.toISOString().slice(11, 16)
      : defaultHour != null
        ? `${pad(Math.min(defaultHour + 8, 23))}:00`
        : "17:00",
  );
  const [employeeId, setEmployeeId] = useState<string | undefined>(shift?.employeeId ?? undefined);
  const [role, setRole] = useState(shift?.role ?? "");
  const [breakMinutes, setBreakMinutes] = useState(String(shift?.breakMinutes ?? 0));
  const [status, setStatus] = useState<ShiftStatus>(shift?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);

  const employeeOptions =
    employeeList?.data.map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName}`,
      hint: e.uniqueCode,
    })) ?? [];

  const save = async () => {
    setError(null);
    const payload = {
      storeId,
      startsAtUtc: `${date}T${start}:00.000Z`,
      endsAtUtc: `${date}T${end}:00.000Z`,
      employeeId: employeeId ?? null,
      role: role || null,
      breakMinutes: Number(breakMinutes) || 0,
      status,
    };
    try {
      if (shift) {
        await update.mutateAsync({ id: shift.id, input: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save the shift.");
    }
  };

  const runAction = async (a: "approve" | "cancel") => {
    if (!shift) return;
    setError(null);
    try {
      await action.mutateAsync({ id: shift.id, action: a });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed.");
    }
  };

  const remove = async () => {
    if (!shift) return;
    await del.mutateAsync(shift.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit shift" : "New shift"}</SheetTitle>
          <SheetDescription>Times are in the store timezone.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <FormField id="s-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="s-start" label="Start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            <FormField id="s-end" label="End" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Assignee</label>
            <Combobox
              options={employeeOptions}
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="Unassigned"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="s-role" label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <FormField
              id="s-break"
              label="Break (min)"
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
            />
          </div>
          <SelectField
            id="s-status"
            label="Status"
            options={SHIFT_STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as ShiftStatus)}
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button onClick={save} disabled={create.isPending || update.isPending} className="h-10 w-full">
            {isEdit ? "Save shift" : "Create shift"}
          </Button>

          {isEdit ? (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => void runAction("approve")}>
                <Check />
                Approve
              </Button>
              <Button variant="outline" size="sm" onClick={() => void runAction("cancel")}>
                <X />
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => void remove()}>
                <Trash2 />
                Delete
              </Button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
