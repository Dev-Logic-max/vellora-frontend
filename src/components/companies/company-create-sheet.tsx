"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { CountrySelect, CurrencySelect } from "@/components/ui/geo-selects";
import { SelectField } from "@/components/ui/select-field";
import { Stepper } from "@/components/ui/stepper";
import { currencyForCountry } from "@/lib/geo/currencies";
import { timezoneForCountry } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { useCreateCompany } from "@/features/org/companies";
import { useGroups } from "@/features/org/groups";
import { usePlans } from "@/features/billing/billing";
import { useCurrentUser } from "@/features/session/use-current-user";

const schema = z.object({
  // Step 1 — company profile
  name: z.string().min(2, "Enter a company name"),
  groupId: z.string().optional(),
  registrationNumber: z.string().optional(),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  currency: z.string().min(3, "Select a currency").max(3),
  country: z.string().min(2, "Select a country").max(2),
  timezone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  headOfficeAddress: z.string().optional(),
  officeLocations: z.string().optional(),
  // Step 2 — plan
  planKey: z.string().min(1, "Pick a plan"),
  pricePerEmployee: z.string().optional(),
  pricePerDevice: z.string().optional(),
  extraStoragePricePerGb: z.string().optional(),
  storageLimitGb: z.string().optional(),
  storageFrom: z.string().optional(),
  storageTo: z.string().optional(),
  discountPct: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 100), "0–100"),
  discountFrom: z.string().optional(),
  discountTo: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const STEPS = [
  { label: "Company", hint: "Profile & location" },
  { label: "Membership", hint: "Plan & pricing" },
];

const STEP1_FIELDS = ["name", "currency", "country"] as const;

/** Built-in plan presets shown in the selector (enriched with live prices when available). */
const PLAN_PRESETS = [
  { key: "free", name: "Free", blurb: "Get started, core features" },
  { key: "starter", name: "Starter", blurb: "Small teams" },
  { key: "growth", name: "Growth", blurb: "Scaling multi-store" },
  { key: "business", name: "Business", blurb: "Advanced + priority" },
  { key: "custom", name: "Custom", blurb: "Negotiated pricing" },
];

const num = (v: string | undefined) => (v ? Number(v) : undefined);

export function CompanyCreateSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const createCompany = useCreateCompany();
  const { data: groups } = useGroups();
  const { data: plans } = usePlans();
  const { data: me } = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    trigger: validate,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      currency: "USD",
      country: "US",
      timezone: "America/New_York",
      planKey: "free",
    },
  });

  const planKey = useWatch({ control, name: "planKey" });
  const isCustom = planKey === "custom";

  const priceFor = (key: string) => plans?.find((p) => p.key === key);

  const resetAll = () => {
    reset();
    setStep(0);
    setServerError(null);
  };

  const goNext = async () => {
    const ok = await validate(STEP1_FIELDS);
    if (ok) setStep(1);
  };

  const onSubmit = async (values: Values) => {
    setServerError(null);
    const offices = (values.officeLocations ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label }));
    try {
      await createCompany.mutateAsync({
        name: values.name,
        country: values.country.toUpperCase(),
        currency: values.currency.toUpperCase(),
        timezone: values.timezone || undefined,
        groupId: values.groupId || undefined,
        registrationNumber: values.registrationNumber || undefined,
        companyEmail: values.companyEmail || undefined,
        phone: values.phone || undefined,
        state: values.state || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined,
        headOfficeAddress: values.headOfficeAddress || undefined,
        offices: offices.length ? offices : undefined,
        planKey: values.planKey,
        customPricing: isCustom
          ? {
              pricePerEmployee: num(values.pricePerEmployee),
              pricePerDevice: num(values.pricePerDevice),
              extraStoragePricePerGb: num(values.extraStoragePricePerGb),
              storageLimitGb: num(values.storageLimitGb),
              storageFrom: values.storageFrom || undefined,
              storageTo: values.storageTo || undefined,
              discountPct: num(values.discountPct),
              discountFrom: values.discountFrom || undefined,
              discountTo: values.discountTo || undefined,
            }
          : undefined,
      });
      setOpen(false);
      resetAll();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetAll();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            New company
          </Button>
        }
      />
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {/* Header — gradient + stepper. */}
        <div className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 pt-5 pb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">New company</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Create a tenant — you&apos;ll be its owner.
          </p>
          <Stepper steps={STEPS} current={step} onStepClick={setStep} className="mt-4" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {step === 0 ? (
              <>
                <FieldGroup title="Company details">
                  <FullWidth>
                    <FormField
                      id="name"
                      label="Company name"
                      placeholder="Acme Retail Group"
                      error={errors.name?.message}
                      {...register("name")}
                    />
                  </FullWidth>
                  <SelectField
                    id="groupId"
                    label="Business group"
                    placeholder="No group"
                    options={(groups ?? []).map((g) => ({ value: g.id, label: g.name }))}
                    {...register("groupId")}
                  />
                  <Field label="Company owner">
                    <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground">
                      {me?.name || me?.email || "You"}
                    </div>
                  </Field>
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
                  <Field label="Currency" error={errors.currency?.message}>
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <CurrencySelect
                          value={field.value}
                          onChange={(v) => field.onChange(v ?? "")}
                        />
                      )}
                    />
                  </Field>
                </FieldGroup>

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
                            // Country-first: pre-fill currency + timezone from the country.
                            if (v) {
                              setValue("currency", currencyForCountry(v) ?? "USD");
                              setValue("timezone", timezoneForCountry(v));
                            }
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
                      id="headOfficeAddress"
                      label="Head-office address"
                      {...register("headOfficeAddress")}
                    />
                  </FullWidth>
                  <FullWidth>
                    <FormField
                      id="officeLocations"
                      label="Office locations"
                      placeholder="London, Berlin, Dubai (comma-separated)"
                      {...register("officeLocations")}
                    />
                  </FullWidth>
                </FieldGroup>
              </>
            ) : (
              <>
                <FieldGroup title="Membership plan">
                  <FullWidth>
                    <Controller
                      control={control}
                      name="planKey"
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {PLAN_PRESETS.map((p) => {
                            const live = priceFor(p.key);
                            const on = field.value === p.key;
                            return (
                              <button
                                key={p.key}
                                type="button"
                                onClick={() => field.onChange(p.key)}
                                className={cn(
                                  "relative flex flex-col gap-1 rounded-xl border-2 p-3 text-left transition-all",
                                  on
                                    ? "border-primary bg-accent-soft shadow-[0_0_0_3px_rgb(var(--accent-soft))]"
                                    : "border-border bg-surface hover:border-foreground/20",
                                )}
                              >
                                <span className="flex items-center justify-between">
                                  <span className="font-display text-sm font-semibold text-foreground">
                                    {live?.name ?? p.name}
                                  </span>
                                  {p.key === "custom" ? (
                                    <Sparkles className="size-3.5 text-primary" />
                                  ) : on ? (
                                    <Check className="size-4 text-primary" />
                                  ) : null}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {p.key === "custom"
                                    ? p.blurb
                                    : live
                                      ? `${live.currency} ${live.priceMonth}/mo`
                                      : p.blurb}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </FullWidth>
                </FieldGroup>

                {isCustom ? (
                  <>
                    <FieldGroup title="Custom pricing">
                      <FormField
                        id="pricePerEmployee"
                        type="number"
                        label="Price / employee"
                        {...register("pricePerEmployee")}
                      />
                      <FormField
                        id="pricePerDevice"
                        type="number"
                        label="Price / device"
                        {...register("pricePerDevice")}
                      />
                      <FormField
                        id="extraStoragePricePerGb"
                        type="number"
                        label="Extra storage / GB"
                        {...register("extraStoragePricePerGb")}
                      />
                      <FormField
                        id="storageLimitGb"
                        type="number"
                        label="Storage limit (GB)"
                        {...register("storageLimitGb")}
                      />
                      <Controller
                        control={control}
                        name="storageFrom"
                        render={({ field }) => (
                          <DateField
                            id="storageFrom"
                            label="Storage from"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="storageTo"
                        render={({ field }) => (
                          <DateField
                            id="storageTo"
                            label="Storage to"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </FieldGroup>

                    <FieldGroup title="Discount">
                      <FormField
                        id="discountPct"
                        type="number"
                        label="Discount %"
                        {...register("discountPct")}
                      />
                      <span />
                      <Controller
                        control={control}
                        name="discountFrom"
                        render={({ field }) => (
                          <DateField
                            id="discountFrom"
                            label="Discount from"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="discountTo"
                        render={({ field }) => (
                          <DateField
                            id="discountTo"
                            label="Discount to"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </FieldGroup>
                  </>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-surface-subtle/60 px-4 py-3 text-sm text-muted-foreground">
                    The selected plan&apos;s standard pricing and limits apply. Switch to{" "}
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() => setValue("planKey", "custom")}
                    >
                      Custom
                    </button>{" "}
                    to set negotiated pricing.
                  </p>
                )}
              </>
            )}

            {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          </div>

          {/* Footer — navigation. */}
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-subtle/60 px-6 py-3">
            {step === 0 ? (
              <span />
            ) : (
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft />
                Back
              </Button>
            )}
            {step === 0 ? (
              <Button type="button" onClick={goNext}>
                Next
                <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create company"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
