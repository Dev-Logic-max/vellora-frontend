"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { CountrySelect, CurrencySelect } from "@/components/ui/geo-selects";
import { SelectField } from "@/components/ui/select-field";
import { PlanSlider, type PlanInterval } from "@/components/billing/plan-slider";
import { COMPANY_CATEGORIES } from "@/features/org/categories";
import { currencyForCountry } from "@/lib/geo/currencies";
import { timezoneForCountry } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { useCreateCompany } from "@/features/org/companies";
import { useGroups } from "@/features/org/groups";
import { usePublicPlans } from "@/features/billing/billing";
import { useCurrentUser } from "@/features/session/use-current-user";

const schema = z.object({
  // Step 0 — company profile
  name: z.string().min(2, "Enter a company name"),
  category: z.string().optional(),
  groupId: z.string().optional(),
  currency: z.string().min(3, "Select a currency").max(3),
  country: z.string().min(2, "Select a country").max(2),
  timezone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  headOfficeAddress: z.string().optional(),
  // Step 1 — owner & contact
  registrationNumber: z.string().optional(),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  officeLocations: z.string().optional(),
  // Step 2 — plan (custom pricing)
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
  { label: "Owner", hint: "Contact details" },
  { label: "Plan", hint: "Membership" },
];

const STEP0_FIELDS = ["name", "currency", "country"] as const;
const num = (v: string | undefined) => (v ? Number(v) : undefined);

export function CompanyCreateSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [planKey, setPlanKey] = useState("free");
  const [interval, setInterval] = useState<PlanInterval>("month");
  const [serverError, setServerError] = useState<string | null>(null);
  const createCompany = useCreateCompany();
  const { data: groups } = useGroups();
  const { data: plans } = usePublicPlans();
  const { data: me } = useCurrentUser();

  const isCustom = planKey === "custom";
  // The plan slider shows live plans + a synthetic "Custom" card for negotiated
  // pricing (platform/owner only — sets per-unit prices below).
  const sliderPlans = [
    ...(plans ?? []),
    {
      id: "__custom",
      key: "custom",
      name: "Custom",
      tier: 99,
      priceMonth: "0",
      priceYear: "0",
      currency: "USD",
      entitlementsJson: {},
      limitsJson: {},
      tagline: "Negotiated pricing",
      highlights: ["Set per-unit prices", "Custom storage & discounts", "Tailored to the tenant"],
      popular: false,
    },
  ];

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
    },
  });

  const resetAll = () => {
    reset();
    setStep(0);
    setPlanKey("free");
    setInterval("month");
    setServerError(null);
  };

  const goNext = async () => {
    if (step === 0) {
      const ok = await validate(STEP0_FIELDS);
      if (ok) setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  // Hard guard: the form NEVER persists on its own. Enter advances on steps 0/1;
  // saving happens ONLY via the explicit Create button's onClick.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) void goNext();
  };

  const handleSave = () => void handleSubmit(onSubmit)();

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
        category: values.category || undefined,
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
        planKey,
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
        {/* Header — gradient + step rail (heading under each number). */}
        <div className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 pt-4 pb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">New company</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create a tenant — you&apos;ll be its owner.
          </p>
          <StepRail steps={STEPS} current={step} onStep={setStep} />
        </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
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
              </>
            ) : step === 1 ? (
              <>
                <FieldGroup title="Owner & contact">
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
                    <PlanSlider
                      plans={sliderPlans}
                      value={planKey}
                      onSelect={setPlanKey}
                      interval={interval}
                      onIntervalChange={setInterval}
                    />
                  </FullWidth>
                </FieldGroup>

                {isCustom ? (
                  <>
                    <FieldGroup title="Custom pricing">
                      <FormField id="pricePerEmployee" type="number" label="Price / employee" {...register("pricePerEmployee")} />
                      <FormField id="pricePerDevice" type="number" label="Price / device" {...register("pricePerDevice")} />
                      <FormField id="extraStoragePricePerGb" type="number" label="Extra storage / GB" {...register("extraStoragePricePerGb")} />
                      <FormField id="storageLimitGb" type="number" label="Storage limit (GB)" {...register("storageLimitGb")} />
                      <Controller
                        control={control}
                        name="storageFrom"
                        render={({ field }) => (
                          <DateField id="storageFrom" label="Storage from" value={field.value ?? ""} onChange={field.onChange} />
                        )}
                      />
                      <Controller
                        control={control}
                        name="storageTo"
                        render={({ field }) => (
                          <DateField id="storageTo" label="Storage to" value={field.value ?? ""} onChange={field.onChange} />
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup title="Discount">
                      <FormField id="discountPct" type="number" label="Discount %" {...register("discountPct")} />
                      <span />
                      <Controller
                        control={control}
                        name="discountFrom"
                        render={({ field }) => (
                          <DateField id="discountFrom" label="Discount from" value={field.value ?? ""} onChange={field.onChange} />
                        )}
                      />
                      <Controller
                        control={control}
                        name="discountTo"
                        render={({ field }) => (
                          <DateField id="discountTo" label="Discount to" value={field.value ?? ""} onChange={field.onChange} />
                        )}
                      />
                    </FieldGroup>
                  </>
                ) : null}
              </>
            )}

            {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          </div>

          {/* Footer — Close (far left, always) + Back/Next/Create (right). */}
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-subtle/60 px-6 py-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                resetAll();
              }}
            >
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
                <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create company"}
                </Button>
              )}
            </div>
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

/** Step rail: numbered circle with the heading + tiny subtext UNDER each, a
 * connector line between that fills as you progress (matches the employee modal). */
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
