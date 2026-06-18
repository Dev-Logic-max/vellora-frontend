"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTRACT_TYPE_LABEL, CONTRACT_TYPE_OPTIONS } from "@/features/employees/constants";
import { useAddContract, useEmployeeContracts } from "@/features/employees/employees";
import type { ContractType } from "@/features/employees/types";

export function ContractTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useEmployeeContracts(employeeId);
  const addContract = useAddContract(employeeId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "full_time" as ContractType,
    startDate: "",
    endDate: "",
    hoursWeek: "",
    salary: "",
    currency: "USD",
  });

  const submit = async () => {
    if (!form.startDate) return;
    await addContract.mutateAsync({
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      hoursWeek: form.hoursWeek ? Number(form.hoursWeek) : undefined,
      salary: form.salary || undefined,
      currency: form.currency,
    });
    setOpen(false);
    setForm({ type: "full_time", startDate: "", endDate: "", hoursWeek: "", salary: "", currency: "USD" });
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
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4">
          <SelectField
            id="c-type"
            label="Type"
            options={CONTRACT_TYPE_OPTIONS}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ContractType })}
          />
          <FormField
            id="c-hours"
            label="Hours / week"
            type="number"
            value={form.hoursWeek}
            onChange={(e) => setForm({ ...form, hoursWeek: e.target.value })}
          />
          <FormField
            id="c-start"
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <FormField
            id="c-end"
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <FormField
            id="c-salary"
            label="Salary"
            type="number"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
          />
          <FormField
            id="c-currency"
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <div className="col-span-2">
            <Button onClick={submit} disabled={!form.startDate || addContract.isPending}>
              Save contract
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
