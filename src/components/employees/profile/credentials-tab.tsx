"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpiryChip } from "@/components/employees/expiry-chip";
import {
  useAddMedical,
  useAddQualification,
  useEmployeeMedicals,
  useEmployeeQualifications,
} from "@/features/employees/employees";

function QualificationsCard({ employeeId }: { employeeId: string }) {
  const { data, isLoading, isError } = useEmployeeQualifications(employeeId);
  const add = useAddQualification(employeeId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", issuer: "", issued: "", expires: "" });

  const submit = async () => {
    if (!form.name.trim()) return;
    await add.mutateAsync({
      name: form.name,
      issuer: form.issuer || undefined,
      issued: form.issued || undefined,
      expires: form.expires || undefined,
    });
    setOpen(false);
    setForm({ name: "", issuer: "", issued: "", expires: "" });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">Qualifications</h2>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          <Plus />
          Add
        </Button>
      </div>

      {open ? (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4">
          <FormField
            id="q-name"
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormField
            id="q-issuer"
            label="Issuer"
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          />
          <FormField
            id="q-issued"
            label="Issued"
            type="date"
            value={form.issued}
            onChange={(e) => setForm({ ...form, issued: e.target.value })}
          />
          <FormField
            id="q-expires"
            label="Expires"
            type="date"
            value={form.expires}
            onChange={(e) => setForm({ ...form, expires: e.target.value })}
          />
          <div className="col-span-2">
            <Button onClick={submit} disabled={!form.name.trim() || add.isPending}>
              Save
            </Button>
          </div>
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-muted-foreground">
          Qualifications require a paid plan on this company.
        </p>
      ) : isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : data && data.length > 0 ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {data.map((q) => (
            <div key={q.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.issuer ?? "—"}</p>
              </div>
              <ExpiryChip expires={q.expires} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No qualifications recorded.</p>
      )}
    </section>
  );
}

function MedicalsCard({ employeeId }: { employeeId: string }) {
  const { data, isLoading, isError } = useEmployeeMedicals(employeeId);
  const add = useAddMedical(employeeId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "", date: "", expires: "" });

  const submit = async () => {
    if (!form.type.trim()) return;
    await add.mutateAsync({
      type: form.type,
      date: form.date || undefined,
      expires: form.expires || undefined,
    });
    setOpen(false);
    setForm({ type: "", date: "", expires: "" });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">Medicals</h2>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          <Plus />
          Add
        </Button>
      </div>

      {open ? (
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface p-4">
          <FormField
            id="m-type"
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <FormField
            id="m-date"
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <FormField
            id="m-expires"
            label="Expires"
            type="date"
            value={form.expires}
            onChange={(e) => setForm({ ...form, expires: e.target.value })}
          />
          <div className="col-span-3">
            <Button onClick={submit} disabled={!form.type.trim() || add.isPending}>
              Save
            </Button>
          </div>
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-muted-foreground">Medicals require a paid plan on this company.</p>
      ) : isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : data && data.length > 0 ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {data.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{m.type}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{m.date ?? "—"}</p>
              </div>
              <ExpiryChip expires={m.expires} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No medicals recorded.</p>
      )}
    </section>
  );
}

export function CredentialsTab({ employeeId }: { employeeId: string }) {
  return (
    <div className="space-y-8">
      <QualificationsCard employeeId={employeeId} />
      <MedicalsCard employeeId={employeeId} />
    </div>
  );
}
