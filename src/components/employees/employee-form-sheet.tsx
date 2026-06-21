"use client";

import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DateField } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ApiError } from "@/lib/api";
import { useStores } from "@/features/org/stores";
import { useCreateEmployee, useUpdateEmployee } from "@/features/employees/employees";
import {
  CONTRACT_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  STORE_RELATION_OPTIONS,
} from "@/features/employees/constants";
import type { EmployeeDetail, StoreRelation } from "@/features/employees/types";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["active", "invited", "on_leave", "suspended", "archived"]).optional(),
  contractType: z
    .enum(["full_time", "part_time", "temporary", "contractor", "intern"])
    .optional()
    .or(z.literal("")),
  hireDate: z.string().optional(),
});
type Values = z.infer<typeof schema>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function EmployeeFormSheet({
  employee,
  trigger,
}: {
  employee?: EmployeeDetail;
  trigger: ReactNode;
}) {
  const isEdit = Boolean(employee);
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [primaryStoreId, setPrimaryStoreId] = useState<string | undefined>(
    employee?.primaryStoreId ?? undefined,
  );
  const [secondary, setSecondary] = useState<{ storeId: string; relation: StoreRelation }[]>([]);
  const [draftStore, setDraftStore] = useState<string | undefined>();
  const [draftRelation, setDraftRelation] = useState<StoreRelation>("secondary");

  const { data: stores } = useStores();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(employee?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      role: employee?.role ?? "",
      department: employee?.department ?? "",
      status: employee?.status ?? "active",
      contractType: employee?.contractType ?? "",
      hireDate: employee?.hireDate ?? "",
    },
  });

  const storeOptions =
    stores?.map((s) => ({ value: s.id, label: s.name, hint: s.code ?? undefined })) ?? [];

  const storeName = (id: string) => stores?.find((s) => s.id === id)?.name ?? id;

  const addSecondary = () => {
    if (!draftStore || draftStore === primaryStoreId) return;
    if (secondary.some((s) => s.storeId === draftStore)) return;
    setSecondary((prev) => [...prev, { storeId: draftStore, relation: draftRelation }]);
    setDraftStore(undefined);
  };

  const onSubmit = async (values: Values) => {
    setServerError(null);
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || undefined,
      phone: values.phone || undefined,
      role: values.role || undefined,
      department: values.department || undefined,
      status: values.status,
      contractType: values.contractType || undefined,
      hireDate: values.hireDate || undefined,
      primaryStoreId: primaryStoreId || undefined,
    };
    try {
      if (isEdit) {
        await updateEmployee.mutateAsync(payload);
      } else {
        await createEmployee.mutateAsync({
          ...payload,
          secondaryStores: secondary.length ? secondary : undefined,
        });
      }
      setOpen(false);
      reset();
      setSecondary([]);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit employee" : "New employee"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update profile details." : "Add a person to your directory."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4" noValidate>
          <Section title="Identity">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="firstName"
                label="First name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <FormField
                id="lastName"
                label="Last name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="email"
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormField id="phone" label="Phone" {...register("phone")} />
            </div>
          </Section>

          <Section title="Employment">
            <div className="grid grid-cols-2 gap-3">
              <FormField id="role" label="Job role" placeholder="Barista" {...register("role")} />
              <FormField id="department" label="Department" {...register("department")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                id="status"
                label="Status"
                options={EMPLOYEE_STATUS_OPTIONS}
                {...register("status")}
              />
              <SelectField
                id="contractType"
                label="Contract"
                placeholder="—"
                options={CONTRACT_TYPE_OPTIONS}
                {...register("contractType")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="hireDate"
                render={({ field }) => (
                  <DateField
                    id="hireDate"
                    label="Hire date"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Primary store</label>
                <Combobox
                  options={storeOptions}
                  value={primaryStoreId}
                  onChange={setPrimaryStoreId}
                  placeholder="Select store"
                />
              </div>
            </div>
          </Section>

          {!isEdit ? (
            <Section title="Secondary stores">
              <div className="flex items-end gap-2">
                <Combobox
                  className="flex-1"
                  options={storeOptions.filter((o) => o.value !== primaryStoreId)}
                  value={draftStore}
                  onChange={setDraftStore}
                  placeholder="Add store"
                />
                <SelectField
                  id="relation"
                  options={STORE_RELATION_OPTIONS}
                  value={draftRelation}
                  onChange={(e) => setDraftRelation(e.target.value as StoreRelation)}
                  className="w-32"
                />
                <Button type="button" variant="outline" size="icon" onClick={addSecondary}>
                  <Plus />
                </Button>
              </div>
              {secondary.length ? (
                <div className="flex flex-wrap gap-2">
                  {secondary.map((s) => (
                    <span
                      key={s.storeId}
                      className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong"
                    >
                      {storeName(s.storeId)} · {s.relation}
                      <button
                        type="button"
                        onClick={() =>
                          setSecondary((prev) => prev.filter((x) => x.storeId !== s.storeId))
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </Section>
          ) : null}

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create employee"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
