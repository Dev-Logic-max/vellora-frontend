"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ApiError } from "@/lib/api";
import { useCreateCompany } from "@/features/org/companies";

const schema = z.object({
  name: z.string().min(2, "Enter a company name"),
  country: z.string().length(2, "2-letter code"),
  currency: z.string().length(3, "3-letter code"),
  timezone: z.string().min(1, "Required"),
});
type Values = z.infer<typeof schema>;

export function CompanyCreateSheet() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createCompany = useCreateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", country: "US", currency: "USD", timezone: "UTC" },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      await createCompany.mutateAsync({
        name: values.name,
        country: values.country.toUpperCase(),
        currency: values.currency.toUpperCase(),
        timezone: values.timezone,
      });
      setOpen(false);
      reset();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <Plus />
            New company
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create a company</SheetTitle>
          <SheetDescription>You&apos;ll be its owner. Refine details anytime.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4" noValidate>
          <FormField id="name" label="Company name" placeholder="Acme Retail Group" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-3 gap-3">
            <FormField id="country" label="Country" error={errors.country?.message} {...register("country")} />
            <FormField id="currency" label="Currency" error={errors.currency?.message} {...register("currency")} />
            <FormField id="timezone" label="Timezone" error={errors.timezone?.message} {...register("timezone")} />
          </div>
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create company"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
