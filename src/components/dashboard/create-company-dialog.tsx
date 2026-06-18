"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { setActiveCompanyId } from "@/lib/active-company";
import { CURRENT_USER_KEY } from "@/features/session/use-current-user";

const schema = z.object({
  name: z.string().min(2, "Enter a company name"),
  country: z.string().length(2, "2-letter code, e.g. US"),
  currency: z.string().length(3, "3-letter code, e.g. USD"),
  timezone: z.string().min(1, "Enter a timezone"),
});

type Values = z.infer<typeof schema>;

interface CreatedCompany {
  id: string;
}

function Field({
  id,
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <Input id={id} aria-invalid={Boolean(error)} className="h-9" {...props} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function CreateCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
      const company = await api.post<CreatedCompany>("/api/companies", {
        name: values.name,
        country: values.country.toUpperCase(),
        currency: values.currency.toUpperCase(),
        timezone: values.timezone,
      });
      setActiveCompanyId(company.id);
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
      setOpen(false);
      reset();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Building2 />
            Create company
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your company</DialogTitle>
          <DialogDescription>
            This becomes your tenant — you&apos;ll be its owner. You can refine the details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            id="name"
            label="Company name"
            placeholder="Acme Retail Group"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field id="country" label="Country" error={errors.country?.message} {...register("country")} />
            <Field
              id="currency"
              label="Currency"
              error={errors.currency?.message}
              {...register("currency")}
            />
            <Field
              id="timezone"
              label="Timezone"
              error={errors.timezone?.message}
              {...register("timezone")}
            />
          </div>

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create company"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
