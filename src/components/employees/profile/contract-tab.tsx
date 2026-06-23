"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-picker";
import { CurrencySelect } from "@/components/ui/geo-selects";
import { OptionSelect } from "@/components/ui/option-select";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitNumberField } from "@/components/ui/unit-number-field";
import { currencySymbol } from "@/lib/geo/currencies";
import { CONTRACT_TYPE_LABEL, CONTRACT_TYPE_OPTIONS } from "@/features/employees/constants";
import { useAddContract, useEmployeeContracts } from "@/features/employees/employees";
import type { ContractType } from "@/features/employees/types";

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

export function ContractTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useEmployeeContracts(employeeId);
  const addContract = useAddContract(employeeId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "full_time" as ContractType,
    startDate: "",
    endDate: "",
    hours: "",
    hoursUnit: "week",
    salary: "",
    currency: "USD",
  });

  const reset = () =>
    setForm({
      type: "full_time",
      startDate: "",
      endDate: "",
      hours: "",
      hoursUnit: "week",
      salary: "",
      currency: "USD",
    });

  const submit = async () => {
    if (!form.startDate) return;
    await addContract.mutateAsync({
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">Contracts</h2>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          <Plus />
          Add contract
        </Button>
      </div>

      {open ? (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
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

          {/* Actions — right-aligned (Cancel + Save). */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!form.startDate || addContract.isPending}>
              {addContract.isPending ? "Saving…" : "Save contract"}
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : data && data.length > 0 ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {data.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{CONTRACT_TYPE_LABEL[c.type]}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {c.startDate} {c.endDate ? `→ ${c.endDate}` : "→ ongoing"}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground tabular-nums">
                {c.hoursWeek ? <p>{c.hoursWeek} h/wk</p> : null}
                {c.salary ? (
                  <p>
                    {currencySymbol(c.currency)}
                    {Number(c.salary).toLocaleString()} {c.currency}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No contracts on file.</p>
      )}
    </div>
  );
}
