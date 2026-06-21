"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormSheet } from "@/components/ui/form-sheet";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { StoreSelect, EmployeeSelect } from "@/components/org/entity-selects";
import { ApiError } from "@/lib/api";
import { useCompanies } from "@/features/org/companies";
import { useStores } from "@/features/org/stores";
import { useEmployees } from "@/features/employees/employees";
import {
  useCreateShift,
  useDeleteShift,
  useShiftAction,
  useUpdateShift,
} from "@/features/scheduling/scheduling";
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
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

type DayMode = "working" | "off";
type BreakMode = "none" | "fixed" | "flexible";

export function ShiftSheet({
  open,
  onOpenChange,
  storeId: initialStoreId,
  shift,
  defaultDate,
  defaultHour,
}: ShiftSheetProps) {
  const isEdit = Boolean(shift);
  const { data: stores } = useStores();
  const { data: companies } = useCompanies();
  const create = useCreateShift();
  const update = useUpdateShift();
  const action = useShiftAction();
  const del = useDeleteShift();

  // Seeded from props on mount; parent passes a changing `key` to remount.
  const s = shift ? new Date(shift.startsAtUtc) : null;
  const e = shift ? new Date(shift.endsAtUtc) : null;

  const [storeId, setStoreId] = useState<string | undefined>(shift?.storeId ?? initialStoreId);
  const [dayMode, setDayMode] = useState<DayMode>(shift?.status === "off" ? "off" : "working");
  const [date, setDate] = useState<Date>(
    s ?? (defaultDate ? new Date(`${defaultDate}T00:00:00`) : new Date()),
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
  const [status, setStatus] = useState<ShiftStatus>(
    shift?.status && shift.status !== "off" ? shift.status : "draft",
  );
  const [breakMode, setBreakMode] = useState<BreakMode>(
    shift?.breakMinutes ? "fixed" : "none",
  );
  const [breakMinutes, setBreakMinutes] = useState(String(shift?.breakMinutes ?? 30));
  const [reason, setReason] = useState(shift?.status === "off" ? (shift?.notes ?? "") : "");
  const [error, setError] = useState<string | null>(null);

  const { data: employeeList } = useEmployees({ storeId, pageSize: 200 });

  const saving = create.isPending || update.isPending;

  const save = async () => {
    setError(null);
    const day = isoDate(date);

    const payload =
      dayMode === "off"
        ? {
            storeId: storeId!,
            employeeId: employeeId ?? null,
            // Off-day occupies the whole date; reason lives in notes.
            startsAtUtc: `${day}T00:00:00.000Z`,
            endsAtUtc: `${day}T23:59:00.000Z`,
            breakMinutes: 0,
            notes: reason || null,
            status: "off" as ShiftStatus,
          }
        : {
            storeId: storeId!,
            startsAtUtc: `${day}T${start}:00.000Z`,
            endsAtUtc: `${day}T${end}:00.000Z`,
            employeeId: employeeId ?? null,
            role: role || null,
            breakMinutes: breakMode === "none" ? 0 : Number(breakMinutes) || 0,
            notes: breakMode === "flexible" ? "flex-break" : null,
            status,
          };

    if (!payload.storeId) {
      setError("Select a store.");
      return;
    }

    try {
      if (shift) await update.mutateAsync({ id: shift.id, input: payload });
      else await create.mutateAsync(payload);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the shift.");
    }
  };

  const remove = async () => {
    if (!shift) return;
    await del.mutateAsync(shift.id);
    onOpenChange(false);
  };

  const runAction = async (a: "approve" | "cancel") => {
    if (!shift) return;
    setError(null);
    try {
      await action.mutateAsync({ id: shift.id, action: a });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit shift" : "New shift"}
      subtitle="Times are in the store timezone."
      footer={
        <>
          {isEdit ? (
            <Button variant="destructive" onClick={() => void remove()} className="mr-auto">
              <Trash2 />
              Delete
            </Button>
          ) : null}
          <Button onClick={() => void save()} disabled={saving}>
            {isEdit ? "Save shift" : "Create shift"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Store → Employee → Date (top-down per the right-sheet standard). */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Store</label>
          <StoreSelect stores={stores} companies={companies} value={storeId} onChange={setStoreId} />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Employee</label>
          <EmployeeSelect employees={employeeList?.data} value={employeeId} onChange={setEmployeeId} />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Date</label>
          <DatePicker value={date} onChange={(d) => d && setDate(d)} />
        </div>

        {/* Working day / Off day sliding toggle. */}
        <SegmentedTabs
          tabs={[
            { value: "working", label: "Working day" },
            { value: "off", label: "Off day" },
          ]}
          value={dayMode}
          onValueChange={(v) => setDayMode(v as DayMode)}
          layoutGroup="shift-daymode"
          className="w-full"
        />

        {dayMode === "working" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Start</label>
                <TimePicker value={start} onChange={setStart} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">End</label>
                <TimePicker value={end} onChange={setEnd} />
              </div>
            </div>

            <FormField id="s-role" label="Role" value={role} onChange={(ev) => setRole(ev.target.value)} />

            {/* Break — segmented control (No break / Fixed / Flexible). */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">Break</label>
              <SegmentedTabs
                tabs={[
                  { value: "none", label: "No break" },
                  { value: "fixed", label: "Fixed" },
                  { value: "flexible", label: "Flexible" },
                ]}
                value={breakMode}
                onValueChange={(v) => setBreakMode(v as BreakMode)}
                layoutGroup="shift-break"
                size="sm"
                className="w-full"
              />
              {breakMode === "none" ? (
                <p className="text-xs text-muted-foreground">No break will be assigned to this shift.</p>
              ) : (
                <FormField
                  id="s-break"
                  label={breakMode === "fixed" ? "Break length (min)" : "Flexible break (min)"}
                  type="number"
                  value={breakMinutes}
                  onChange={(ev) => setBreakMinutes(ev.target.value)}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Status</label>
              <SegmentedTabs
                tabs={[
                  { value: "draft", label: "Planning" },
                  { value: "assigned", label: "Assigned" },
                  { value: "published", label: "Published" },
                ]}
                value={status === "approved" || status === "cancelled" ? "assigned" : status}
                onValueChange={(v) => setStatus(v as ShiftStatus)}
                layoutGroup="shift-status"
                size="sm"
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(ev) => setReason(ev.target.value)}
              rows={3}
              placeholder="Why is this a day off? (optional)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-xs text-muted-foreground">
              No shift can be assigned to this employee on this date until it&apos;s switched back to a
              working day.
            </p>
          </div>
        )}

        {isEdit && dayMode === "working" ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => void runAction("approve")}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => void runAction("cancel")}>
              Cancel shift
            </Button>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </FormSheet>
  );
}
