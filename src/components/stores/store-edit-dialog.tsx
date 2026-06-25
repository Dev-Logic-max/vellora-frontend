"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StoreFormBody, storeSchema, type StoreFormValues } from "@/components/stores/store-form-body";
import { ApiError } from "@/lib/api";
import { timezoneForCountry } from "@/lib/geo/countries";
import { useCompanies } from "@/features/org/companies";
import { useUpdateStore } from "@/features/org/stores";
import type { Store } from "@/features/org/types";

function toDefaults(store: Store): StoreFormValues {
  return {
    name: store.name,
    code: store.code ?? "",
    category: store.category ?? "",
    country: store.country ?? "",
    state: store.state ?? "",
    city: store.city ?? "",
    postalCode: store.postalCode ?? "",
    address: store.address ?? "",
    companyId: store.companyId,
    timezone: store.timezone,
    capacity: String(store.capacity ?? ""),
    headStore: store.headStore,
  };
}

/**
 * Store edit — centered two-step Dialog (mirrors the company edit dialog) with
 * every field PRE-FILLED. Re-keyed per store + open so the inner form initializes
 * fresh without a synchronous setState-in-effect.
 */
export function StoreEditDialog({
  store,
  open,
  onOpenChange,
}: {
  store: Store;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {open ? <EditForm key={store.id} store={store} onOpenChange={onOpenChange} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  store,
  onOpenChange,
}: {
  store: Store;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateStore(store.id);
  const { data: companies } = useCompanies();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: toDefaults(store),
  });

  const onSubmit = async (values: StoreFormValues) => {
    setServerError(null);
    try {
      await update.mutateAsync({
        name: values.name,
        code: values.code || undefined,
        category: values.category || undefined,
        country: values.country ? values.country.toUpperCase() : undefined,
        state: values.state || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined,
        address: values.address || undefined,
        timezone: values.timezone || undefined,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        headStore: values.headStore || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <StoreFormBody
      mode="edit"
      form={form}
      step={step}
      setStep={setStep}
      companies={companies}
      activeCompanyId={store.companyId}
      companyLocked
      serverError={serverError}
      submitting={update.isPending}
      onCountryPrefill={(cc) => form.setValue("timezone", timezoneForCountry(cc))}
      onSubmit={() => void form.handleSubmit(onSubmit)()}
      onClose={() => onOpenChange(false)}
    />
  );
}
