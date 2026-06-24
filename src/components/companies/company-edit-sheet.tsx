"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { FormSheet } from "@/components/ui/form-sheet";
import { CountrySelect, CurrencySelect } from "@/components/ui/geo-selects";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { currencyForCountry } from "@/lib/geo/currencies";
import { timezoneForCountry } from "@/lib/geo/countries";
import { COMPANY_CATEGORIES } from "@/features/org/categories";
import { useUpdateCompany } from "@/features/org/companies";
import type { Company } from "@/features/org/types";

const schema = z.object({
  name: z.string().min(2, "Enter a company name"),
  category: z.string().optional(),
  country: z.string().min(2).max(2),
  currency: z.string().min(3).max(3),
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

/**
 * Company edit — single-form right-sheet (controlled). Edits the active company's
 * profile via PATCH /api/companies/:id (owner/permission-gated server-side). The
 * create wizard stays separate; this is a focused edit, not a re-run of signup.
 */
export function CompanyEditSheet({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateCompany(company.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    },
  });

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
    <FormSheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          reset();
          setServerError(null);
        }
      }}
      title="Edit company"
      subtitle={company.name}
      footer={
        <Button onClick={() => void handleSubmit(onSubmit)()} disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6" noValidate>
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

        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      </form>
    </FormSheet>
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
