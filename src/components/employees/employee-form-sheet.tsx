"use client";

import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-picker";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { CompanySelect, StoreSelect, SupervisorSelect } from "@/components/org/entity-selects";
import { useCompanies } from "@/features/org/companies";
import { useStores } from "@/features/org/stores";
import {
  useCreateEmployee,
  useSupervisors,
  useUpdateEmployee,
} from "@/features/employees/employees";
import { useCurrentUser } from "@/features/session/use-current-user";
import {
  BENEFIT_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  GENDER_OPTIONS,
  WORK_SCHEDULE_OPTIONS,
} from "@/features/employees/constants";
import type { EmployeeBenefits, EmployeeDetail } from "@/features/employees/types";

const schema = z.object({
  // Step 1 — personal
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().or(z.literal("")),
  iban: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  // Step 2 — platform + contract
  role: z.string().optional(),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  status: z.enum(["active", "invited", "on_leave", "suspended", "archived"]).optional(),
  workScheduleType: z
    .enum(["full_time", "part_time", "shift", "flexible", "remote"])
    .optional()
    .or(z.literal("")),
  weeklyHours: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 168), "0–168"),
  hireDate: z.string().optional(),
  contractEnd: z.string().optional(),
  contractType: z
    .enum(["full_time", "part_time", "temporary", "contractor", "intern"])
    .optional()
    .or(z.literal("")),
});
type Values = z.infer<typeof schema>;

const STEPS = [
  { label: "Personal", hint: "Identity & address" },
  { label: "Employment", hint: "Role, contract, benefits" },
];

/** Fields validated on step 1 — gate "Next" on these. */
const STEP1_FIELDS = ["firstName", "lastName", "email"] as const;

export function EmployeeFormSheet({
  employee,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  employee?: EmployeeDetail;
  /** Optional trigger element. Omit when driving the sheet via `open` (controlled). */
  trigger?: ReactNode;
  /** Optional controlled open state (e.g. driven by a table action icon). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isEdit = Boolean(employee);
  const [openState, setOpenState] = useState(false);
  // Controlled when `open` is provided; otherwise self-managed.
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [primaryStoreId, setPrimaryStoreId] = useState<string | undefined>(
    employee?.primaryStoreId ?? undefined,
  );
  const [supervisorId, setSupervisorId] = useState<string | undefined>(
    employee?.supervisorId ?? undefined,
  );
  const [benefits, setBenefits] = useState<EmployeeBenefits>(employee?.benefits ?? {});

  const { data: stores } = useStores();
  const { data: companies } = useCompanies();
  const { data: supervisors } = useSupervisors();
  const { data: me } = useCurrentUser();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(employee?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger: validate,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      nationality: employee?.nationality ?? "",
      dateOfBirth: employee?.dateOfBirth ?? "",
      gender: employee?.gender ?? "",
      iban: employee?.iban ?? "",
      country: employee?.country ?? "",
      state: employee?.state ?? "",
      city: employee?.city ?? "",
      postalCode: employee?.postalCode ?? "",
      address: employee?.address ?? "",
      role: employee?.role ?? "",
      companyEmail: employee?.companyEmail ?? "",
      status: employee?.status ?? "active",
      workScheduleType: employee?.workScheduleType ?? "",
      weeklyHours: employee?.weeklyHours != null ? String(employee.weeklyHours) : "",
      hireDate: employee?.hireDate ?? "",
      contractEnd: employee?.contractEnd ?? "",
      contractType: employee?.contractType ?? "",
    },
  });

  const activeCompanyId = me?.companyId ?? companies?.[0]?.id;

  const resetAll = () => {
    reset();
    setStep(0);
    setPrimaryStoreId(employee?.primaryStoreId ?? undefined);
    setSupervisorId(employee?.supervisorId ?? undefined);
    setBenefits(employee?.benefits ?? {});
    setServerError(null);
  };

  const goNext = async () => {
    const ok = await validate(STEP1_FIELDS);
    if (ok) setStep(1);
  };

  const toggleBenefit = (key: string) =>
    setBenefits((b) => ({ ...b, [key]: !b[key] }));

  const onSubmit = async (values: Values) => {
    setServerError(null);
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || undefined,
      phone: values.phone || undefined,
      companyEmail: values.companyEmail || undefined,
      nationality: values.nationality || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      gender: values.gender || undefined,
      iban: values.iban || undefined,
      country: values.country || undefined,
      state: values.state || undefined,
      city: values.city || undefined,
      postalCode: values.postalCode || undefined,
      address: values.address || undefined,
      role: values.role || undefined,
      status: values.status,
      workScheduleType: values.workScheduleType || undefined,
      weeklyHours: values.weeklyHours ? Number(values.weeklyHours) : undefined,
      hireDate: values.hireDate || undefined,
      contractEnd: values.contractEnd || undefined,
      contractType: values.contractType || undefined,
      primaryStoreId: primaryStoreId || undefined,
      supervisorId: supervisorId || undefined,
      benefits: Object.keys(benefits).length ? benefits : undefined,
    };
    try {
      if (isEdit) await updateEmployee.mutateAsync(payload);
      else await createEmployee.mutateAsync(payload);
      setOpen(false);
      resetAll();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
      setStep(1);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetAll();
      }}
    >
      {trigger ? <SheetTrigger render={trigger as React.ReactElement} /> : null}
      <SheetContent
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {/* Header — gradient wash + stepper. */}
        <div className="border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-5 pt-4 pb-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isEdit ? "Edit employee" : "New employee"}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEdit ? "Update profile details." : "Add a person to your directory in two steps."}
          </p>
          <Stepper
            steps={STEPS}
            current={step}
            onStepClick={setStep}
            className="mt-4"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {step === 0 ? (
              <>
                <FieldGroup title="Main data">
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
                  <FormField
                    id="email"
                    label="Email"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <FormField id="phone" label="Phone" {...register("phone")} />
                </FieldGroup>

                <FieldGroup title="Personal information">
                  <FormField id="nationality" label="Nationality" {...register("nationality")} />
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <DateField
                        id="dateOfBirth"
                        label="Date of birth"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <SelectField
                    id="gender"
                    label="Gender"
                    placeholder="—"
                    options={GENDER_OPTIONS}
                    {...register("gender")}
                  />
                  <FullWidth>
                    <FormField
                      id="iban"
                      label="IBAN"
                      placeholder="GB29 NWBK 6016 1331 9268 19"
                      {...register("iban")}
                    />
                  </FullWidth>
                </FieldGroup>

                <FieldGroup title="Address">
                  <FormField id="country" label="Country" {...register("country")} />
                  <FormField id="state" label="State / region" {...register("state")} />
                  <FormField id="city" label="City" {...register("city")} />
                  <FormField id="postalCode" label="Postal code" {...register("postalCode")} />
                  <FullWidth>
                    <FormField id="address" label="Address" {...register("address")} />
                  </FullWidth>
                </FieldGroup>
              </>
            ) : (
              <>
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
                  <FullWidth>
                    <Field label="Primary store">
                      <StoreSelect
                        stores={stores}
                        companies={companies}
                        value={primaryStoreId}
                        onChange={setPrimaryStoreId}
                      />
                    </Field>
                  </FullWidth>
                  <FullWidth>
                    <FormField id="role" label="Job role" placeholder="Barista" {...register("role")} />
                  </FullWidth>
                  <FullWidth>
                    <Field label="Supervisor">
                      <SupervisorSelect
                        supervisors={supervisors}
                        value={supervisorId}
                        onChange={setSupervisorId}
                      />
                    </Field>
                  </FullWidth>
                  <FullWidth>
                    <FormField
                      id="companyEmail"
                      label="Company email"
                      type="email"
                      error={errors.companyEmail?.message}
                      {...register("companyEmail")}
                    />
                  </FullWidth>
                  <FullWidth>
                    <SelectField
                      id="status"
                      label="Status"
                      options={EMPLOYEE_STATUS_OPTIONS}
                      {...register("status")}
                    />
                  </FullWidth>
                </FieldGroup>

                <FieldGroup title="Contract information">
                  <SelectField
                    id="workScheduleType"
                    label="Work schedule"
                    placeholder="—"
                    options={WORK_SCHEDULE_OPTIONS}
                    {...register("workScheduleType")}
                  />
                  <FormField
                    id="weeklyHours"
                    type="number"
                    label="Weekly hours"
                    error={errors.weeklyHours?.message}
                    {...register("weeklyHours")}
                  />
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
                  <Controller
                    control={control}
                    name="contractEnd"
                    render={({ field }) => (
                      <DateField
                        id="contractEnd"
                        label="Contract end"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <FullWidth>
                    <SelectField
                      id="contractType"
                      label="Contract type"
                      placeholder="—"
                      options={CONTRACT_TYPE_OPTIONS}
                      {...register("contractType")}
                    />
                  </FullWidth>
                </FieldGroup>

                <FieldGroup title="Benefits">
                  <FullWidth>
                    <div className="grid grid-cols-2 gap-2">
                      {BENEFIT_OPTIONS.map((b) => {
                        const on = Boolean(benefits[b.key]);
                        return (
                          <button
                            key={b.key}
                            type="button"
                            onClick={() => toggleBenefit(b.key)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                              on
                                ? "border-primary bg-accent-soft text-foreground"
                                : "border-border bg-surface text-muted-foreground hover:border-foreground/20",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-colors",
                                on
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border",
                              )}
                            >
                              {on ? <Check className="size-3" /> : null}
                            </span>
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </FullWidth>
                </FieldGroup>
              </>
            )}

            {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          </div>

          {/* Footer — navigation. */}
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
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
                {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create employee"}
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/** Small labeled wrapper for non-input controls (rich selects). */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
