"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { Stepper } from "@/components/ui/stepper";
import { ApiError } from "@/lib/api";
import { CompanySelect } from "@/components/org/entity-selects";
import { useCompanies } from "@/features/org/companies";
import { useCreateStore } from "@/features/org/stores";
import { useCurrentUser } from "@/features/session/use-current-user";

const TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

const schema = z.object({
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
  timezone: z.string().min(1, "Required"),
  capacity: z
    .string()
    .optional()
    .refine((v) => !v || Number(v) >= 0, "Must be ≥ 0"),
  headStore: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

const STEPS = [
  { label: "Store", hint: "Profile & location" },
  { label: "Platform", hint: "Capacity & time zone" },
];

const STEP1_FIELDS = ["name"] as const;

export function StoreCreateSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const createStore = useCreateStore();
  const { data: companies } = useCompanies();
  const { data: me } = useCurrentUser();

  const activeCompanyId = me?.companyId ?? companies?.[0]?.id;

  const {
    register,
    handleSubmit,
    reset,
    trigger: validate,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", timezone: "UTC", capacity: "" },
  });

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
    try {
      await createStore.mutateAsync({
        name: values.name,
        code: values.code || undefined,
        category: values.category || undefined,
        country: values.country ? values.country.toUpperCase() : undefined,
        state: values.state || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined,
        address: values.address || undefined,
        timezone: values.timezone,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        headStore: values.headStore || undefined,
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
            New store
          </Button>
        }
      />
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {/* Header — gradient + stepper. */}
        <div className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 pt-5 pb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">New store</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A location under your active company.
          </p>
          <Stepper steps={STEPS} current={step} onStepClick={setStep} className="mt-4" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
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
                  <FormField id="code" label="Store code" placeholder="LDN-01" {...register("code")} />
                  <FormField
                    id="category"
                    label="Category"
                    placeholder="Flagship"
                    {...register("category")}
                  />
                </FieldGroup>

                <FieldGroup title="Location">
                  <FormField id="country" label="Country" placeholder="GB" {...register("country")} />
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
                  <Field label="Company">
                    <CompanySelect
                      companies={companies}
                      value={activeCompanyId}
                      onChange={() => undefined}
                      disabled
                    />
                  </Field>
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
                {isSubmitting ? "Creating…" : "Create store"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
