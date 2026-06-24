"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { useUpdatePlan } from "@/features/billing/billing";
import type { Plan, PlanUpsertInput } from "@/features/billing/types";

/** Editable plan form (Pricing module). `-1` cap = unlimited. Highlights are
 * one-per-line. Persists via PUT /api/admin/plans/:id (super-admin). */
export function PlanEditDialog({
  plan,
  open,
  onClose,
}: {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
}) {
  const update = useUpdatePlan();
  const [form, setForm] = useState<State | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hydrate the local form when a NEW plan is opened — done during render (keyed
  // by plan id) to satisfy React-Compiler's no-setState-in-effect rule.
  if (plan && plan.id !== loadedId) {
    setLoadedId(plan.id);
    setForm(formFromPlan(plan));
    setError(null);
  }

  if (!plan || !form) return null;

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async () => {
    setError(null);
    const input: PlanUpsertInput = {
      name: form.name,
      tagline: form.tagline || null,
      description: form.description || null,
      priceMonth: form.priceMonth || "0",
      priceYear: form.priceYear || "0",
      popular: form.popular,
      isActive: form.isActive,
      highlights: form.highlights
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      limits: {
        ...(plan.limitsJson ?? {}),
        employees: capNum(form.employees),
        stores: capNum(form.stores),
        devices: capNum(form.devices),
        storage_gb: capNum(form.storage_gb),
        ai_calls: capNum(form.ai_calls),
      },
    };
    try {
      await update.mutateAsync({ id: plan.id, input });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save the plan.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 py-4">
          <DialogTitle>Edit {plan.name}</DialogTitle>
          <DialogDescription>
            These values power the registration & company-create cards immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="plan-name"
              label="Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <FormField
              id="plan-tagline"
              label="Tagline"
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
            <FormField
              id="plan-price-month"
              label="Price / month"
              type="number"
              value={form.priceMonth}
              onChange={(e) => set("priceMonth", e.target.value)}
            />
            <FormField
              id="plan-price-year"
              label="Price / year"
              type="number"
              value={form.priceYear}
              onChange={(e) => set("priceYear", e.target.value)}
            />
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-foreground">
              Usage caps <span className="text-xs text-muted-foreground">(−1 = unlimited)</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                id="cap-employees"
                label="Employees"
                type="number"
                value={form.employees}
                onChange={(e) => set("employees", e.target.value)}
              />
              <FormField
                id="cap-stores"
                label="Stores"
                type="number"
                value={form.stores}
                onChange={(e) => set("stores", e.target.value)}
              />
              <FormField
                id="cap-devices"
                label="Devices"
                type="number"
                value={form.devices}
                onChange={(e) => set("devices", e.target.value)}
              />
              <FormField
                id="cap-storage"
                label="Storage GB"
                type="number"
                value={form.storage_gb}
                onChange={(e) => set("storage_gb", e.target.value)}
              />
              <FormField
                id="cap-ai"
                label="AI calls"
                type="number"
                value={form.ai_calls}
                onChange={(e) => set("ai_calls", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Features <span className="text-xs text-muted-foreground">(one per line)</span>
            </label>
            <textarea
              value={form.highlights}
              onChange={(e) => set("highlights", e.target.value)}
              rows={6}
              className="scrollbar-thin w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder={"2 companies · 4 stores\nUp to 80 employees\nStore terminals"}
            />
          </div>

          <div className="flex items-center gap-6">
            <ToggleRow label="Popular" checked={form.popular} onChange={(v) => set("popular", v)} />
            <ToggleRow
              label="Active (shown on cards)"
              checked={form.isActive}
              onChange={(v) => set("isActive", v)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="border-t border-border bg-surface-subtle/60 px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface State {
  name: string;
  tagline: string;
  description: string;
  priceMonth: string;
  priceYear: string;
  popular: boolean;
  isActive: boolean;
  employees: string;
  stores: string;
  devices: string;
  storage_gb: string;
  ai_calls: string;
  highlights: string;
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

const capStr = (n?: number) => (n === undefined ? "" : String(n));
const capNum = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

function formFromPlan(plan: Plan): State {
  return {
    name: plan.name,
    tagline: plan.tagline ?? "",
    description: plan.description ?? "",
    priceMonth: plan.priceMonth ?? "0",
    priceYear: plan.priceYear ?? "0",
    popular: Boolean(plan.popular),
    isActive: plan.isActive ?? true,
    employees: capStr(plan.limitsJson?.employees),
    stores: capStr(plan.limitsJson?.stores),
    devices: capStr(plan.limitsJson?.devices),
    storage_gb: capStr(plan.limitsJson?.storage_gb),
    ai_calls: capStr(plan.limitsJson?.ai_calls),
    highlights: (plan.highlights ?? []).join("\n"),
  };
}
