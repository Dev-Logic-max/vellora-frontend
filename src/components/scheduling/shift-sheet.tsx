"use client";

import { useState } from "react";
import { Briefcase, CalendarOff, Coffee, Timer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { FormSheet } from "@/components/ui/form-sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { StoreSelect, EmployeeSelect } from "@/components/org/entity-selects";
import { ApiError } from "@/lib/api";
import { localToUtcIso, zonedParts } from "@/lib/schedule-time";
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

  const [storeId, setStoreId] = useState<string | undefined>(shift?.storeId ?? initialStoreId);
  // The store's IANA timezone — all wall-clock ⇄ UTC conversions pivot on this
  // so a shift created in one timezone shows the same store-local time anywhere.
  const storeTz = stores?.find((st) => st.id === storeId)?.timezone || "UTC";

  // Seed the local (store-tz) wall-clock fields from the shift's UTC instants.
  const seedStart = shift ? zonedParts(shift.startsAtUtc, storeTz) : null;
  const seedEnd = shift ? zonedParts(shift.endsAtUtc, storeTz) : null;
  const hhmm = (minutesOfDay: number) =>
    `${pad(Math.floor(minutesOfDay / 60))}:${pad(minutesOfDay % 60)}`;

  const [dayMode, setDayMode] = useState<DayMode>(shift?.status === "off" ? "off" : "working");
  const [date, setDate] = useState<Date>(
    seedStart
      ? new Date(`${seedStart.dateStr}T00:00:00`)
      : defaultDate
        ? new Date(`${defaultDate}T00:00:00`)
        : new Date(),
  );
  const [start, setStart] = useState(
    seedStart
      ? hhmm(seedStart.minutesOfDay)
      : defaultHour != null
        ? `${pad(defaultHour)}:00`
        : "09:00",
  );
  const [end, setEnd] = useState(
    seedEnd
      ? hhmm(seedEnd.minutesOfDay)
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
  // Fixed-break window (validated to sit inside the shift). Defaults to a sensible mid-shift slot.
  const [breakStart, setBreakStart] = useState("12:00");
  const [breakEnd, setBreakEnd] = useState("12:30");
  const [reason, setReason] = useState(shift?.status === "off" ? (shift?.notes ?? "") : "");
  const [notes, setNotes] = useState(
    shift?.status !== "off" && shift?.notes && shift.notes !== "flex-break" ? shift.notes : "",
  );
  const [error, setError] = useState<string | null>(null);

  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const { data: employeeList } = useEmployees({ storeId, pageSize: 200 });

  const saving = create.isPending || update.isPending;

  const save = async () => {
    setError(null);
    const day = isoDate(date);

    // Validate a fixed break sits inside the shift's scheduled window.
    if (dayMode === "working" && breakMode === "fixed") {
      const bs = toMin(breakStart);
      const be = toMin(breakEnd);
      const ss = toMin(start);
      const se = toMin(end);
      if (be <= bs) {
        setError("Break end must be after break start.");
        return;
      }
      if (bs < ss || be > se) {
        setError("The break must be within the shift's start and end times.");
        return;
      }
    }

    const fixedBreakMinutes =
      breakMode === "fixed" ? toMin(breakEnd) - toMin(breakStart) : Number(breakMinutes) || 0;

    const payload =
      dayMode === "off"
        ? {
            storeId: storeId!,
            employeeId: employeeId ?? null,
            // Off-day occupies the whole date (store-local) → correct UTC instants.
            startsAtUtc: localToUtcIso(day, "00:00", storeTz),
            endsAtUtc: localToUtcIso(day, "23:59", storeTz),
            breakMinutes: 0,
            notes: reason || null,
            status: "off" as ShiftStatus,
          }
        : {
            storeId: storeId!,
            // Store-local wall-clock → UTC (DST-aware) so it re-displays
            // correctly from any timezone.
            startsAtUtc: localToUtcIso(day, start, storeTz),
            endsAtUtc: localToUtcIso(day, end, storeTz),
            employeeId: employeeId ?? null,
            role: role || null,
            breakMinutes: breakMode === "none" ? 0 : fixedBreakMinutes,
            // Flexible break flagged in notes; otherwise persist the user's note.
            notes: breakMode === "flexible" ? "flex-break" : notes || null,
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
      <div className="space-y-6">
        {/* Assignment group. */}
        <FieldGroup title="Assignment" cols={1}>
          <FullWidth>
            <Field label="Store">
              <StoreSelect
                stores={stores}
                companies={companies}
                value={storeId}
                onChange={setStoreId}
              />
            </Field>
          </FullWidth>
          <FullWidth>
            <Field label="Employee">
              <EmployeeSelect
                employees={employeeList?.data}
                value={employeeId}
                onChange={setEmployeeId}
              />
            </Field>
          </FullWidth>
          <FullWidth>
            <Field label="Date">
              <DatePicker value={date} onChange={(d) => d && setDate(d)} />
            </Field>
          </FullWidth>
          {/* Day type — separate colored buttons (working = emerald, off = rose). */}
          <FullWidth>
            <Field label="Day type">
              <ButtonGroup
                value={dayMode}
                onChange={(v) => setDayMode(v as DayMode)}
                options={[
                  {
                    value: "working",
                    label: "Working day",
                    icon: Briefcase,
                    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-700",
                  },
                  {
                    value: "off",
                    label: "Off day",
                    icon: CalendarOff,
                    activeClass: "border-rose-500 bg-rose-50 text-rose-700",
                  },
                ]}
              />
            </Field>
          </FullWidth>
        </FieldGroup>

        {dayMode === "working" ? (
          <>
            {/* Shift timing group. */}
            <FieldGroup title="Shift timing">
              <Field label="Start">
                <TimePicker value={start} onChange={setStart} />
              </Field>
              <Field label="End">
                <TimePicker value={end} onChange={setEnd} />
              </Field>
              <FullWidth>
                <FormField
                  id="s-role"
                  label="Role"
                  value={role}
                  onChange={(ev) => setRole(ev.target.value)}
                />
              </FullWidth>
            </FieldGroup>

            {/* Break group — separate colored buttons + fixed start/end window. */}
            <FieldGroup title="Break" cols={1}>
              <FullWidth>
                <ButtonGroup
                  value={breakMode}
                  onChange={(v) => setBreakMode(v as BreakMode)}
                  options={[
                    { value: "none", label: "No break" },
                    {
                      value: "fixed",
                      label: "Fixed",
                      icon: Timer,
                      activeClass: "border-sky-500 bg-sky-50 text-sky-700",
                    },
                    {
                      value: "flexible",
                      label: "Flexible",
                      icon: Coffee,
                      activeClass: "border-amber-500 bg-amber-50 text-amber-700",
                    },
                  ]}
                />
              </FullWidth>
              {breakMode === "none" ? (
                <FullWidth>
                  <p className="text-xs text-muted-foreground">
                    No break will be assigned to this shift.
                  </p>
                </FullWidth>
              ) : breakMode === "fixed" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Break start">
                    <TimePicker value={breakStart} onChange={setBreakStart} />
                  </Field>
                  <Field label="Break end">
                    <TimePicker value={breakEnd} onChange={setBreakEnd} />
                  </Field>
                  <FullWidth>
                    <p className="text-xs text-muted-foreground">
                      Must fall within the shift ({start}–{end}).
                    </p>
                  </FullWidth>
                </div>
              ) : (
                <FullWidth>
                  <FormField
                    id="s-break"
                    label="Flexible break (min)"
                    type="number"
                    value={breakMinutes}
                    onChange={(ev) => setBreakMinutes(ev.target.value)}
                  />
                </FullWidth>
              )}
            </FieldGroup>

            {/* Status group — separate buttons. */}
            <FieldGroup title="Status" cols={1}>
              <FullWidth>
                <ButtonGroup
                  value={status === "approved" || status === "cancelled" ? "assigned" : status}
                  onChange={(v) => setStatus(v as ShiftStatus)}
                  options={[
                    { value: "draft", label: "Planning" },
                    {
                      value: "assigned",
                      label: "Assigned",
                      activeClass: "border-indigo-500 bg-indigo-50 text-indigo-700",
                    },
                    {
                      value: "published",
                      label: "Published",
                      activeClass: "border-emerald-500 bg-emerald-50 text-emerald-700",
                    },
                  ]}
                />
              </FullWidth>
            </FieldGroup>

            {/* Notes group. */}
            <FieldGroup title="Notes" cols={1}>
              <FullWidth>
                <textarea
                  value={notes}
                  onChange={(ev) => setNotes(ev.target.value)}
                  rows={3}
                  placeholder="Optional notes for this shift…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </FullWidth>
            </FieldGroup>

            {isEdit ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => void runAction("approve")}>
                  Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => void runAction("cancel")}>
                  Cancel shift
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <FieldGroup title="Off day" cols={1}>
            <FullWidth>
              <Field label="Reason (optional)">
                <textarea
                  value={reason}
                  onChange={(ev) => setReason(ev.target.value)}
                  rows={3}
                  placeholder="Why is this a day off? (optional)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
            </FullWidth>
            <FullWidth>
              <p className="text-xs text-muted-foreground">
                No shift can be assigned to this employee on this date until it&apos;s switched back to
                a working day.
              </p>
            </FullWidth>
          </FieldGroup>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </FormSheet>
  );
}

/** Labeled wrapper for non-input controls inside the shift groups. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
