"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { CountrySelect, CurrencySelect } from "@/components/ui/geo-selects";
import { COMPANY_CATEGORIES } from "@/features/org/categories";
import { currencyForCountry } from "@/lib/geo/currencies";
import { timezoneForCountry } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { useUpdateCompany } from "@/features/org/companies";
import type { Company } from "@/features/org/types";

const schema = z.object({
  name: z.string().min(2, "Enter a company name"),
  category: z.string().optional(),
  country: z.string().min(2, "Select a country").max(2),
  currency: z.string().min(3, "Select a currency").max(3),
  timezone: z.string().optional(),
  registrationNumber: z.string().optional(),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  headOfficeAddress: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const STEPS = [
  { label: "Company", hint: "Profile & contact" },
  { label: "Location", hint: "Address & region" },
];
const STEP0_FIELDS = ["name", "companyEmail"] as const;

function toDefaults(company: Company): Values {
  return {
    name: company.name,
    category: company.category ?? "",
    country: company.country,
    currency: company.currency,
    timezone: company.timezone,
    registrationNumber: company.registrationNumber ?? "",
    companyEmail: company.companyEmail ?? "",
    phone: company.phone ?? "",
    state: company.state ?? "",
    city: company.city ?? "",
    postalCode: company.postalCode ?? "",
    headOfficeAddress: company.headOfficeAddress ?? "",
  };
}

/**
 * Company edit — centered two-step Dialog (mirrors the create wizard's layout),
 * with every field PRE-FILLED from the company. Saves via PATCH /api/companies/:id.
 * Controlled by the parent (the table's Edit icon).
 */
export function CompanyEditDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {/* Re-key per company + open so the inner form initializes fresh (step 0,
            prefilled defaults) WITHOUT a synchronous setState-in-effect. */}
        {open ? (
          <EditForm key={company.id} company={company} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  company,
  onOpenChange,
}: {
  company: Company;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateCompany(company.id);
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger: validate,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(company),
  });

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

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      await update.mutateAsync({
        name: values.name,
        category: values.category || undefined,
        country: values.country.toUpperCase(),
        currency: values.currency.toUpperCase(),
        timezone: values.timezone || undefined,
        registrationNumber: values.registrationNumber || undefined,
        companyEmail: values.companyEmail || undefined,
        phone: values.phone || undefined,
        state: values.state || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined,
        headOfficeAddress: values.headOfficeAddress || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <>
      {/* Header — gradient + step rail (matches the create wizard). */}
      <div className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 pt-4 pb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Edit company</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{company.name}</p>
        <StepRail steps={STEPS} current={step} onStep={setStep} />
      </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {step === 0 ? (
              <>
                <FieldGroup title="Company details">
                  <FullWidth>
                    <FormField id="name" label="Company name" error={errors.name?.message} {...register("name")} />
                  </FullWidth>
                  <FullWidth>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-foreground">Industry</label>
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
                                    className={cn("absolute inset-0 bg-linear-to-br", c.gradient, on ? "opacity-100" : "opacity-75")}
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
                  <FormField
                    id="registrationNumber"
                    label="Registration number"
                    {...register("registrationNumber")}
                  />
                  <FormField
                    id="companyEmail"
                    label="Company email"
                    type="email"
                    error={errors.companyEmail?.message}
                    {...register("companyEmail")}
                  />
                  <FormField id="phone" label="Company phone" {...register("phone")} />
                </FieldGroup>
              </>
            ) : (
              <FieldGroup title="Location">
                <Field label="Country" error={errors.country?.message}>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v ?? "");
                          if (v) {
                            setValue("currency", currencyForCountry(v) ?? "USD");
                            setValue("timezone", timezoneForCountry(v));
                          }
                        }}
                      />
                    )}
                  />
                </Field>
                <Field label="Currency" error={errors.currency?.message}>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <CurrencySelect value={field.value} onChange={(v) => field.onChange(v ?? "")} />
                    )}
                  />
                </Field>
                <FormField id="state" label="State / region" {...register("state")} />
                <FormField id="city" label="City" {...register("city")} />
                <FormField id="postalCode" label="Postal code" {...register("postalCode")} />
                <FullWidth>
                  <FormField
                    id="headOfficeAddress"
                    label="Head-office address"
                    {...register("headOfficeAddress")}
                  />
                </FullWidth>
              </FieldGroup>
            )}

            {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          </div>

          {/* Footer — Close (far left, always) + Back/Next/Save (right). */}
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-subtle/60 px-6 py-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              <X />
              Close
            </Button>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
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
                <Button
                  type="button"
                  onClick={() => void handleSubmit(onSubmit)()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Save changes"}
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
 * progress (matches the company create wizard). */
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
