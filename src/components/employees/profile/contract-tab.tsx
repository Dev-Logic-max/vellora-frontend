"use client";

import { useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  Clock,
  FileText,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-picker";
import { CurrencySelect } from "@/components/ui/geo-selects";
import { OptionSelect } from "@/components/ui/option-select";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitNumberField } from "@/components/ui/unit-number-field";
import { cn } from "@/lib/utils";
import { currencySymbol } from "@/lib/geo/currencies";
import { CONTRACT_TYPE_LABEL, CONTRACT_TYPE_OPTIONS } from "@/features/employees/constants";
import {
  useAddContract,
  useCancelContract,
  useDeleteContract,
  useEmployeeContracts,
  useExtendContract,
} from "@/features/employees/employees";
import type { Contract, ContractType } from "@/features/employees/types";

const HOURS_UNITS = [
  { value: "week", label: "week" },
  { value: "day", label: "day" },
  { value: "month", label: "month" },
  { value: "hours", label: "hours" },
];

/** Hours entered in week/day/month are normalized to a weekly figure for the API. */
function toWeekly(value: number, unit: string): number {
  if (unit === "day") return value * 5;
  if (unit === "month") return Math.round(value / 4.33);
  return value; // week / hours
}

const EMPTY_FORM = {
  title: "",
  type: "full_time" as ContractType,
  startDate: "",
  endDate: "",
  hours: "",
  hoursUnit: "week",
  salary: "",
  currency: "USD",
};

export function ContractTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useEmployeeContracts(employeeId);
  const addContract = useAddContract(employeeId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const reset = () => setForm(EMPTY_FORM);

  const submit = async () => {
    if (!form.startDate) return;
    await addContract.mutateAsync({
      title: form.title || undefined,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      hoursWeek: form.hours ? toWeekly(Number(form.hours), form.hoursUnit) : undefined,
      salary: form.salary || undefined,
      currency: form.currency,
    });
    setOpen(false);
    reset();
  };

  const contracts = data ?? [];
  const hasContracts = contracts.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-primary">
            <FileText className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Contracts</h2>
            <p className="text-xs text-muted-foreground">
              {hasContracts
                ? `${contracts.length} on file`
                : "No contract has been set up yet"}
            </p>
          </div>
        </div>
        {hasContracts ? (
          <Button size="sm" onClick={() => setOpen((v) => !v)}>
            <Plus />
            New contract
          </Button>
        ) : null}
      </div>

      {open ? (
        <ContractForm
          form={form}
          setForm={setForm}
          onCancel={() => {
            setOpen(false);
            reset();
          }}
          onSubmit={submit}
          pending={addContract.isPending}
        />
      ) : null}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : hasContracts ? (
        <div className="space-y-3">
          {contracts.map((c) => (
            <ContractCard key={c.id} contract={c} employeeId={employeeId} />
          ))}
        </div>
      ) : !open ? (
        <ContractEmpty onAdd={() => setOpen(true)} />
      ) : null}
    </div>
  );
}

/** Designed empty state — icon hero + copy + a primary "New contract" CTA. */
function ContractEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft/50 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          <FileText className="size-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">No contract yet</h3>
        <p className="text-sm text-muted-foreground">
          Set up this employee&apos;s employment contract — type, hours, salary and the term. You
          can extend or cancel it later.
        </p>
        <Button className="mt-1" onClick={onAdd}>
          <Plus />
          New contract
        </Button>
      </div>
    </div>
  );
}

/** A single contract — status-railed card with extend/cancel/delete actions. */
function ContractCard({ contract: c, employeeId }: { contract: Contract; employeeId: string }) {
  const cancelContract = useCancelContract(employeeId);
  const deleteContract = useDeleteContract(employeeId);
  const extendContract = useExtendContract(employeeId);
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDate, setExtendDate] = useState(c.endDate ?? "");
  const cancelled = c.status === "cancelled";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface",
        cancelled ? "border-border opacity-90" : "border-border",
      )}
    >
      {/* Status rail */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          cancelled ? "bg-rose-400" : "bg-primary",
        )}
      />
      <div className="space-y-3 py-4 pr-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">
                {c.title || CONTRACT_TYPE_LABEL[c.type]}
              </p>
              <StatusChip cancelled={cancelled} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{CONTRACT_TYPE_LABEL[c.type]}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Meta icon={CalendarClock}>
            {c.startDate} {c.endDate ? `→ ${c.endDate}` : "→ ongoing"}
          </Meta>
          {c.hoursWeek ? <Meta icon={Clock}>{c.hoursWeek} h / week</Meta> : null}
          {c.salary ? (
            <Meta icon={Wallet}>
              {currencySymbol(c.currency)}
              {Number(c.salary).toLocaleString()} {c.currency}
            </Meta>
          ) : null}
        </div>

        {cancelled && c.cancelReason ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            Cancelled — {c.cancelReason}
          </p>
        ) : null}

        {/* Inline extend editor */}
        {extendOpen ? (
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-surface-subtle/50 p-3">
            <div className="w-44">
              <DateField
                id={`extend-${c.id}`}
                label="New end date"
                value={extendDate}
                onChange={setExtendDate}
              />
            </div>
            <Button
              size="sm"
              onClick={async () => {
                await extendContract.mutateAsync({
                  contractId: c.id,
                  endDate: extendDate || null,
                });
                setExtendOpen(false);
              }}
              disabled={extendContract.isPending}
            >
              <Check />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setExtendOpen(false)}>
              Cancel
            </Button>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {!cancelled ? (
            <>
              <ActionBtn
                tone="emerald"
                icon={CalendarPlus}
                label="Extend"
                onClick={() => {
                  setExtendDate(c.endDate ?? "");
                  setExtendOpen((v) => !v);
                }}
              />
              <ActionBtn
                tone="amber"
                icon={X}
                label="Cancel contract"
                onClick={() => {
                  const reason = window.prompt("Reason for cancelling this contract?") ?? undefined;
                  void cancelContract.mutateAsync({ contractId: c.id, reason });
                }}
                disabled={cancelContract.isPending}
              />
            </>
          ) : (
            <ActionBtn
              tone="rose"
              icon={Trash2}
              label="Delete permanently"
              onClick={() => {
                if (window.confirm("Permanently delete this cancelled contract?")) {
                  void deleteContract.mutateAsync(c.id);
                }
              }}
              disabled={deleteContract.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ cancelled }: { cancelled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cancelled
          ? "border-rose-300/60 bg-rose-50 text-rose-700"
          : "border-emerald-300/60 bg-emerald-50 text-emerald-700",
      )}
    >
      {cancelled ? <X className="size-3" /> : <Check className="size-3" />}
      {cancelled ? "Cancelled" : "Active"}
    </span>
  );
}

function Meta({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <Icon className="size-3.5 text-muted-foreground/70" />
      {children}
    </span>
  );
}

function ActionBtn({
  tone,
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  tone: "emerald" | "amber" | "rose";
  icon: typeof Clock;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
        tones[tone],
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

/** The add-contract form (shared between empty-state and the header button). */
function ContractForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  pending,
}: {
  form: typeof EMPTY_FORM;
  setForm: (f: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Title (optional)</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 2026 Barista contract"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Type</label>
          <OptionSelect
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v as ContractType })}
            options={CONTRACT_TYPE_OPTIONS}
          />
        </div>
        <UnitNumberField
          id="c-hours"
          label={`Hours / ${form.hoursUnit === "hours" ? "total" : form.hoursUnit}`}
          value={form.hours}
          onChange={(v) => setForm({ ...form, hours: v })}
          unit={form.hoursUnit}
          onUnitChange={(u) => setForm({ ...form, hoursUnit: u })}
          units={HOURS_UNITS}
        />
        <DateField
          id="c-start"
          label="Start date"
          value={form.startDate}
          onChange={(v) => setForm({ ...form, startDate: v })}
        />
        <DateField
          id="c-end"
          label="End date"
          value={form.endDate}
          onChange={(v) => setForm({ ...form, endDate: v })}
        />
        {/* Currency FIRST, then salary (with the chosen currency symbol). */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Currency</label>
          <CurrencySelect
            value={form.currency}
            onChange={(v) => setForm({ ...form, currency: v ?? "USD" })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="c-salary" className="text-[13px] font-medium text-foreground">
            Salary
          </label>
          <div className="flex h-9 items-center rounded-lg border border-border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <span className="pl-3 text-sm font-medium text-muted-foreground">
              {currencySymbol(form.currency)}
            </span>
            <input
              id="c-salary"
              type="number"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!form.startDate || pending}>
          {pending ? "Saving…" : "Save contract"}
        </Button>
      </div>
    </div>
  );
}
