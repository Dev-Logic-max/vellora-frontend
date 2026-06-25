"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StoreFormBody, storeSchema, type StoreFormValues } from "@/components/stores/store-form-body";
import { ApiError } from "@/lib/api";
import { generateStoreCode } from "@/lib/generate";
import { timezoneForCountry } from "@/lib/geo/countries";
import { useCompanies } from "@/features/org/companies";
import { useCreateStore } from "@/features/org/stores";
import { useCurrentUser } from "@/features/session/use-current-user";

/**
 * Create store — centered two-step Dialog (mirrors the company create wizard):
 * Step 1 profile (name, category cards, auto code, location w/ flag country),
 * Step 2 platform (company w/ flags, capacity, timezone, head-store). The form
 * NEVER persists on its own — saving happens only via the explicit Create button.
 */
export function StoreCreateSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const createStore = useCreateStore();
  const { data: companies } = useCompanies();
  const { data: me } = useCurrentUser();

  const activeCompanyId = me?.companyId ?? companies?.[0]?.id;

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      code: generateStoreCode(),
      category: "",
      country: "",
      timezone: "UTC",
      capacity: "",
      headStore: false,
    },
  });

  const resetAll = () => {
    form.reset({
      name: "",
      code: generateStoreCode(),
      category: "",
      country: "",
      timezone: "UTC",
      capacity: "",
      headStore: false,
    });
    setStep(0);
    setServerError(null);
  };

  const onSubmit = async (values: StoreFormValues) => {
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
        timezone: values.timezone || undefined,
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
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <StoreFormBody
          mode="create"
          form={form}
          step={step}
          setStep={setStep}
          companies={companies}
          activeCompanyId={activeCompanyId}
          companyLocked
          serverError={serverError}
          submitting={createStore.isPending}
          onCountryPrefill={(cc) => form.setValue("timezone", timezoneForCountry(cc))}
          onSubmit={() => void form.handleSubmit(onSubmit)()}
          onClose={() => {
            setOpen(false);
            resetAll();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
