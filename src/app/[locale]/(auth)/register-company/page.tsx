"use client";

import { useState } from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, MailCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { CountrySelect, CurrencySelect } from "@/components/ui/geo-selects";
import { PlanSlider, type PlanInterval } from "@/components/billing/plan-slider";
import { COMPANY_CATEGORIES } from "@/features/org/categories";
import { currencyForCountry } from "@/lib/geo/currencies";
import { timezoneForCountry } from "@/lib/geo/countries";
import { usePublicPlans } from "@/features/billing/billing";
import { useRegisterCompany } from "@/features/auth/register";

const schema = z.object({
  // Step 0 — company
  companyName: z.string().min(2, "Enter your company name"),
  category: z.string().optional(),
  country: z.string().min(1, "Select a country"),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1, "Select a timezone"),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  // Step 1 — owner
  ownerName: z.string().min(2, "Enter your name"),
  ownerEmail: z.string().email("Enter a valid email address"),
  ownerPassword: z.string().min(8, "Use at least 8 characters"),
  ownerPhone: z.string().optional(),
  ownerSecondaryEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  ownerPersonalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

const STEPS = [
  { label: "Company", hint: "Who you are" },
  { label: "Owner", hint: "Your account" },
  { label: "Plan", hint: "Pick a tier" },
  { label: "Review", hint: "Confirm" },
];
const STEP_FIELDS: Path<Values>[][] = [
  ["companyName", "country", "currency", "timezone"],
  ["ownerName", "ownerEmail", "ownerPassword"],
  [],
];

export default function RegisterCompanyPage() {
  const [step, setStep] = useState(0);
  const [planKey, setPlanKey] = useState<string | undefined>();
  const [interval, setInterval] = useState<PlanInterval>("month");
  const [formError, setFormError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const { data: plans } = usePublicPlans();
  const register = useRegisterCompany();
  const [done, setDone] = useState<{ email: string; company: string } | null>(null);

  const {
    register: field,
    handleSubmit,
    trigger,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      companyName: "",
      category: "",
      country: "",
      currency: "USD",
      timezone: "",
      companyEmail: "",
      ownerName: "",
      ownerEmail: "",
      ownerPassword: "",
      ownerPhone: "",
      ownerSecondaryEmail: "",
      ownerPersonalEmail: "",
    },
  });

  // Effective selection: the user's pick, else the Popular plan, else the first.
  // (Derived at render — no effect — to satisfy React-Compiler's no-setState rule.)
  const effectivePlanKey =
    planKey ?? plans?.find((p) => p.popular)?.key ?? plans?.[0]?.key;

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Hard guard: the form never persists on its own. Enter advances on steps
  // 0–2; the real submit fires ONLY from the explicit button on the last step.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) void next();
  };

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      const result = await register.mutateAsync({
        companyName: values.companyName,
        country: values.country,
        currency: values.currency,
        timezone: values.timezone,
        category: values.category || undefined,
        companyEmail: values.companyEmail || undefined,
        ownerName: values.ownerName,
        ownerEmail: values.ownerEmail,
        ownerPassword: values.ownerPassword,
        ownerPhone: values.ownerPhone || undefined,
        ownerSecondaryEmail: values.ownerSecondaryEmail || undefined,
        ownerPersonalEmail: values.ownerPersonalEmail || undefined,
        planKey: effectivePlanKey ?? "free",
        interval,
      });
      setDone({ email: result.ownerEmail, company: result.companyName });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong.");
      if (error instanceof ApiError && error.status === 409) setStep(1);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-center"
      >
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
          <MailCheck className="size-7" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">{done.email}</span>. Confirm it to
            activate <span className="font-medium text-foreground">{done.company}</span>, then sign
            in.
          </p>
          <p className="mt-3 rounded-lg border border-dashed border-border bg-surface-subtle/60 px-3 py-2 text-xs text-muted-foreground">
            Your workspace is created and pending — it activates the moment you verify your email.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Continue to sign in
          <ArrowRight className="size-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Set up your workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few details and your company is ready to go.
        </p>
      </div>

      <StepRail steps={STEPS} current={step} onStep={setStep} />

      <form onSubmit={handleFormSubmit} noValidate>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <AuthField
                id="companyName"
                label="Company name"
                placeholder="Acme Retail Group"
                error={errors.companyName?.message}
                {...field("companyName")}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  What&apos;s your business?
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: f }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {COMPANY_CATEGORIES.map((c) => {
                        const on = f.value === c.key;
                        const Icon = c.icon;
                        return (
                          <button
                            type="button"
                            key={c.key}
                            onClick={() => f.onChange(on ? "" : c.key)}
                            title={c.blurb}
                            className={cn(
                              "group relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border p-2 text-center transition-all duration-200",
                              on
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-border hover:-translate-y-0.5 hover:shadow-sm",
                            )}
                          >
                            {/* Gradient wash (always) + optional Gemini bg image. */}
                            <span
                              aria-hidden
                              className={cn(
                                "absolute inset-0 bg-linear-to-br opacity-100 transition-opacity",
                                c.gradient,
                                on ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                              )}
                              style={{
                                backgroundImage: `url(/categories/${c.key}.jpg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <span className="absolute inset-0 bg-linear-to-t from-black/45 to-transparent" />
                            <Icon className="relative size-5 text-white drop-shadow" />
                            <span className="relative text-[10px] leading-tight font-semibold text-white drop-shadow">
                              {c.label}
                            </span>
                            {on ? (
                              <span className="absolute top-1 right-1 inline-flex size-4 items-center justify-center rounded-full bg-white text-primary shadow">
                                <Check className="size-3" />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Country" error={errors.country?.message}>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field: f }) => (
                      <CountrySelect
                        value={f.value || undefined}
                        onChange={(v) => {
                          f.onChange(v ?? "");
                          if (v) {
                            setValue("currency", currencyForCountry(v) ?? "USD", {
                              shouldValidate: true,
                            });
                            setValue("timezone", timezoneForCountry(v), { shouldValidate: true });
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
                    render={({ field: f }) => (
                      <CurrencySelect value={f.value} onChange={(v) => f.onChange(v ?? "")} />
                    )}
                  />
                </Field>
              </div>

              <AuthField
                id="companyEmail"
                type="email"
                label="Company email"
                placeholder="hello@company.com (optional)"
                error={errors.companyEmail?.message}
                {...field("companyEmail")}
              />
            </>
          )}

          {step === 1 && (
            <>
              <AuthField
                id="ownerName"
                label="Your name"
                placeholder="Alex Rivera"
                autoComplete="name"
                error={errors.ownerName?.message}
                {...field("ownerName")}
              />
              <AuthField
                id="ownerEmail"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                autoComplete="email"
                error={errors.ownerEmail?.message}
                {...field("ownerEmail")}
              />
              <PasswordField
                id="ownerPassword"
                label="Password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={errors.ownerPassword?.message}
                {...field("ownerPassword")}
              />
              <div className="rounded-lg border border-dashed border-border bg-surface-subtle/50 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Backup contact — so we can reach you if email verification fails
                </p>
                <div className="space-y-3">
                  <AuthField
                    id="ownerPhone"
                    label="Phone"
                    placeholder="+1 555 000 1234 (optional)"
                    {...field("ownerPhone")}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AuthField
                      id="ownerSecondaryEmail"
                      type="email"
                      label="Secondary email"
                      placeholder="optional"
                      error={errors.ownerSecondaryEmail?.message}
                      {...field("ownerSecondaryEmail")}
                    />
                    <AuthField
                      id="ownerPersonalEmail"
                      type="email"
                      label="Personal email"
                      placeholder="optional"
                      error={errors.ownerPersonalEmail?.message}
                      {...field("ownerPersonalEmail")}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <PlanSlider
              plans={plans ?? []}
              value={effectivePlanKey}
              onSelect={setPlanKey}
              interval={interval}
              onIntervalChange={setInterval}
            />
          )}

          {step === 3 && (
            <ReviewStep
              values={getValues()}
              planName={plans?.find((p) => p.key === effectivePlanKey)?.name ?? "Free"}
              interval={interval}
            />
          )}
        </motion.div>

        {formError ? <p className="mt-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button type="button" variant="ghost" size="lg" className="h-10" onClick={back}>
              <ArrowLeft />
              Back
            </Button>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Cancel
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" size="lg" className="h-10" onClick={next}>
              Continue
              <ArrowRight />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-10"
              disabled={register.isPending}
              onClick={() => void handleSubmit(onSubmit)()}
            >
              {register.isPending ? <Loader2 className="animate-spin" /> : null}
              {register.isPending ? "Creating…" : "Create workspace"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Step rail: numbered circle with the heading + tiny subtext UNDER each (the
 * standard platform-modal step UI), connector fills as you progress. */
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
    <ol className="flex items-start">
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
                    "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_18%,transparent)]",
                  done && "border-primary bg-primary/10 text-primary",
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
                  "mt-4.5 h-0.5 flex-1 rounded-full transition-colors",
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
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

function ReviewStep({
  values,
  planName,
  interval,
}: {
  values: Values;
  planName: string;
  interval: PlanInterval;
}) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border px-4">
      <ReviewRow label="Company" value={values.companyName} />
      <ReviewRow label="Country" value={values.country} />
      <ReviewRow label="Currency" value={values.currency} />
      <ReviewRow label="Owner" value={values.ownerName} />
      <ReviewRow label="Email" value={values.ownerEmail} />
      <ReviewRow label="Plan" value={`${planName} · ${interval === "year" ? "Yearly" : "Monthly"}`} />
    </div>
  );
}
