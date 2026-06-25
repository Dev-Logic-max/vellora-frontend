"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { CountrySelect } from "@/components/ui/geo-selects";
import { CompanySelect } from "@/components/org/entity-selects";
import { COMPANY_CATEGORIES } from "@/features/org/categories";
import { generateStoreCode } from "@/lib/generate";
import { cn } from "@/lib/utils";
import type { Company } from "@/features/org/types";

const TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

export const storeSchema = z.object({
  // Step 1 — store profile
  name: z.string().min(2, "Enter a store name"),
  code: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  // Step 2 — platform
  companyId: z.string().optional(),
  timezone: z.string().optional(),
  capacity: z
    .string()
    .optional()
    .refine((v) => !v || Number(v) >= 0, "Must be ≥ 0"),
  headStore: z.boolean().optional(),
});
export type StoreFormValues = z.infer<typeof storeSchema>;

const STEPS = [
  { label: "Store", hint: "Profile & location" },
  { label: "Platform", hint: "Capacity & time zone" },
];
const STEP0_FIELDS = ["name"] as const;

interface StoreFormBodyProps {
  mode: "create" | "edit";
  form: UseFormReturn<StoreFormValues>;
  step: number;
  setStep: (s: number) => void;
  companies: Company[] | undefined;
  /** Active tenant — locked into the company select on create. */
  activeCompanyId?: string;
  companyLocked?: boolean;
  serverError: string | null;
  submitting: boolean;
  /** Pre-fill timezone when a country is chosen. */
  onCountryPrefill?: (cc: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

/**
 * Shared store create/edit body — mirrors the company modal exactly: gradient
 * header + numbered StepRail, two steps (profile w/ category cards + auto code +
 * flag country select; platform w/ company flags + capacity + timezone), and a
 * footer with Close (far left, always) + Back/Next/Save on the right.
 *
 * Saving happens ONLY via the explicit Save button's onClick — the form's submit
 * handler just advances steps, so moving to step 2 never persists (fixes req 2).
 */
export function StoreFormBody({
  mode,
  form,
  step,
  setStep,
  companies,
  activeCompanyId,
  companyLocked,
  serverError,
  submitting,
  onCountryPrefill,
  onSubmit,
  onClose,
}: StoreFormBodyProps) {
  const {
    register,
    control,
    trigger: validate,
    formState: { errors },
  } = form;

  const goNext = async () => {
    if (step === 0) {
      const ok = await validate(STEP0_FIELDS);
      if (ok) setStep(1);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) void goNext();
  };

  return (
    <>
      {/* Header — gradient + step rail (matches the company wizard). */}
      <div className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 pt-4 pb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {mode === "create" ? "New store" : "Edit store"}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {mode === "create"
            ? "A location under your active company."
            : form.getValues("name")}
        </p>
        <StepRail steps={STEPS} current={step} onStep={setStep} />
      </div>

      <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {step === 0 ? (
            <>
              <FieldGroup title="Store details">
                <FullWidth>
                  <FormField
                    id="name"
                    label="Store name"
                    placeholder="Downtown London"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                </FullWidth>

                {/* Auto-generated 6-digit code with a regenerate button. */}
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-foreground">Store code</label>
                      <div className="flex items-center gap-2">
                        <input
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="482915"
                          inputMode="numeric"
                          className="h-9 w-full rounded-lg border border-border bg-background px-2.5 font-mono text-sm tracking-wider outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                        />
                        <button
                          type="button"
                          onClick={() => field.onChange(generateStoreCode())}
                          title="Regenerate code"
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong"
                        >
                          <RefreshCw className="size-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Auto-generated · editable</p>
                    </div>
                  )}
                />
                <span />

                <FullWidth>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-foreground">
                          Store category
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {COMPANY_CATEGORIES.map((c) => {
                            const on = field.value === c.key;
                            const Icon = c.icon;
                            return (
                              <button
                                type="button"
                                key={c.key}
                                onClick={() => field.onChange(on ? "" : c.key)}
                                title={c.blurb}
                                className={cn(
                                  "relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border p-1.5 text-center transition-all",
                                  on
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-border hover:shadow-sm",
                                )}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    "absolute inset-0 bg-linear-to-br",
                                    c.gradient,
                                    on ? "opacity-100" : "opacity-75",
                                  )}
                                  style={{
                                    backgroundImage: `url(/categories/${c.key}.jpg)`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                />
                                <span className="absolute inset-0 bg-black/25" />
                                <Icon className="relative size-4 text-white drop-shadow" />
                                <span className="relative text-[9px] leading-tight font-semibold text-white drop-shadow">
                                  {c.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  />
                </FullWidth>
              </FieldGroup>

              <FieldGroup title="Location">
                <Field label="Country">
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v ?? "");
                          if (v) onCountryPrefill?.(v);
                        }}
                      />
                    )}
                  />
                </Field>
                <FormField id="state" label="State / region" {...register("state")} />
                <FormField id="city" label="City" {...register("city")} />
                <FormField id="postalCode" label="Postal code" {...register("postalCode")} />
                <FullWidth>
                  <FormField
                    id="address"
                    label="Address"
                    placeholder="221B Baker Street"
                    {...register("address")}
                  />
                </FullWidth>
              </FieldGroup>
            </>
          ) : (
            <FieldGroup title="Platform information">
              <FullWidth>
                <Controller
                  control={control}
                  name="companyId"
                  render={({ field }) => (
                    <Field label="Company">
                      <CompanySelect
                        companies={companies}
                        value={field.value || activeCompanyId}
                        onChange={(v) => field.onChange(v ?? "")}
                        disabled={companyLocked}
                      />
                    </Field>
                  )}
                />
              </FullWidth>
              <FormField
                id="capacity"
                type="number"
                label="Max capacity"
                error={errors.capacity?.message}
                {...register("capacity")}
              />
              <div className="space-y-1.5">
                <label htmlFor="timezone" className="text-[13px] font-medium text-foreground">
                  Time zone
                </label>
                <select
                  id="timezone"
                  className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("timezone")}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <FullWidth>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[rgb(var(--primary))]"
                    {...register("headStore")}
                  />
                  <span className="text-foreground">Head store (flagship for the company)</span>
                </label>
              </FullWidth>
            </FieldGroup>
          )}

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
        </div>

        {/* Footer — Close (far left, always) + Back/Next/Save (right). */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-subtle/60 px-6 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            <X />
            Close
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft />
                Back
              </Button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Next
                <ArrowRight />
              </Button>
            ) : (
              <Button type="button" onClick={onSubmit} disabled={submitting}>
                {submitting
                  ? mode === "create"
                    ? "Creating…"
                    : "Saving…"
                  : mode === "create"
                    ? "Create store"
                    : "Save changes"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Step rail — numbered circle + heading/subtext under, connector fills as you
 * progress (matches the company create/edit wizard). */
function StepRail({
  steps,
  current,
  onStep,
}: {
  steps: { label: string; hint: string }[];
  current: number;
  onStep: (i: number) => void;
}) {
  return (
    <ol className="mt-4 flex items-start">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === steps.length - 1;
        return (
          <li key={s.label} className={cn("flex items-start", isLast ? "flex-none" : "flex-1")}>
            <div className="flex w-max flex-col items-center">
              <button
                type="button"
                disabled={i > current}
                onClick={() => i < current && onStep(i)}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                  active &&
                    "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_rgb(var(--accent-soft))]",
                  done && "border-primary bg-accent-soft text-primary",
                  !active && !done && "border-border bg-surface text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </button>
              <div className="mt-1.5 text-center">
                <p
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap",
                    active || done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </p>
                <p className="text-[10px] leading-tight whitespace-nowrap text-muted-foreground">
                  {s.hint}
                </p>
              </div>
            </div>
            {!isLast ? (
              <span
                className={cn(
                  "mt-[18px] h-0.5 flex-1 rounded-full transition-colors",
                  i < current ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
