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
import { useCreateStore } from "@/features/org/stores";

const schema = z.object({
  name: z.string().min(2, "Enter a store name"),
  code: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  capacity: z.coerce.number().int().min(0).optional(),
});
type Values = z.infer<typeof schema>;

export function StoreCreateSheet() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createStore = useCreateStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "", category: "", country: "", address: "", capacity: 0 },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      await createStore.mutateAsync({
        name: values.name,
        code: values.code || undefined,
        category: values.category || undefined,
        country: values.country ? values.country.toUpperCase() : undefined,
        address: values.address || undefined,
        capacity: values.capacity,
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
            New store
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create a store</SheetTitle>
          <SheetDescription>A location under your active company.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4" noValidate>
          <FormField id="name" label="Store name" placeholder="Downtown London" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="code" label="Code" placeholder="LDN-01" {...register("code")} />
            <FormField id="category" label="Category" placeholder="Flagship" {...register("category")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="country" label="Country" placeholder="GB" {...register("country")} />
            <FormField id="capacity" type="number" label="Capacity" error={errors.capacity?.message} {...register("capacity")} />
          </div>
          <FormField id="address" label="Address" placeholder="221B Baker Street" {...register("address")} />
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create store"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
