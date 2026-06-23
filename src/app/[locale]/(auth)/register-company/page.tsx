"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { signUp } from "@/lib/auth";
import { AuthField, PasswordField, SelectField } from "@/components/auth/auth-field";
import { Stepper } from "@/components/auth/stepper";
import { Reveal } from "@/components/marketing/reveal";
import { COUNTRIES, countryName, timezoneForCountry } from "@/lib/geo/countries";

/** A compact set of common timezones for the dropdown — the country selection
 * pre-selects the right one, but the user can still change it. */
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type PlanId = "Starter" | "Growth" | "Business" | "Enterprise";

const PLANS: { id: PlanId; price: string; desc: string; popular?: boolean }[] = [
  { id: "Starter", price: "$29/mo", desc: "Up to 25 employees · 3 stores" },
  { id: "Growth", price: "$79/mo", desc: "Up to 100 employees · 10 stores", popular: true },
  { id: "Business", price: "$199/mo", desc: "Up to 500 employees · unlimited stores" },
  { id: "Enterprise", price: "Custom", desc: "Unlimited everything + SSO" },
];

const schema = z.object({
  companyName: z.string().min(2, "Enter your company name"),
  slug: z
    .string()
    .min(2, "Enter a workspace slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  country: z.string().min(1, "Select a country"),
  timezone: z.string().min(1, "Select a timezone"),
  adminName: z.string().min(2, "Enter your name"),
  adminEmail: z.string().email("Enter a valid email address"),
  adminPassword: z.string().min(8, "Use at least 8 characters"),
  plan: z.enum(["Starter", "Growth", "Business", "Enterprise"]),
});

type Values = z.infer<typeof schema>;

const STEPS = ["Company", "Admin", "Plan", "Review"];
const STEP_FIELDS: Path<Values>[][] = [
  ["companyName", "slug", "country", "timezone"],
  ["adminName", "adminEmail", "adminPassword"],
  ["plan"],
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function RegisterCompanyPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const {
    register,
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
      slug: "",
      country: "",
      timezone: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      plan: "Growth",
    },
  });

  const plan = useWatch({ control, name: "plan" });
  const slug = useWatch({ control, name: "slug" });
  const companyName = useWatch({ control, name: "companyName" });

  // Auto-derive the workspace slug from the company name until the user edits it.
  useEffect(() => {
    if (!slugEdited) setValue("slug", slugify(companyName ?? ""));
  }, [companyName, slugEdited, setValue]);

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: Values) => {
    setFormError(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await signUp({
      email: values.adminEmail,
      password: values.adminPassword,
      data: {
        full_name: values.adminName,
        company_name: values.companyName,
        country: values.country,
        timezone: values.timezone,
        plan: values.plan,
      },
      emailRedirectTo: `${siteUrl}/login`,
    });
    if (error) {
      setFormError(error.message);
      setStep(1); // back to the Admin step where the email/password live
      return;
    }
    setDone(true);
  };

  if (done) {
    const values = getValues();
    return (
      <Reveal className="space-y-6 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Confirm your email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ve sent a verification link for {values.adminEmail}. Confirm it, then sign in —
            you&apos;ll finish setting up {values.companyName} from your dashboard.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Continue to sign in
        </Link>
      </Reveal>
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

      <Stepper steps={STEPS} current={step} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <AuthField
                id="companyName"
                label="Company name"
                placeholder="Acme Retail Group"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
              <AuthField
                id="slug"
                label="Workspace URL"
                placeholder="acme-retail"
                error={errors.slug?.message}
                {...register("slug", { onChange: () => setSlugEdited(true) })}
              />
              <p className="-mt-2 text-xs text-muted-foreground">
                vellora.com/{slug || "your-workspace"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  id="country"
                  label="Country"
                  error={errors.country?.message}
                  {...register("country", {
                    onChange: (e) => {
                      // Country-first: pre-fill the timezone from the chosen country.
                      const tz = timezoneForCountry(e.target.value);
                      setValue("timezone", tz, { shouldValidate: true });
                    },
                  })}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  id="timezone"
                  label="Timezone"
                  error={errors.timezone?.message}
                  {...register("timezone")}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </SelectField>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <AuthField
                id="adminName"
                label="Your name"
                placeholder="Alex Rivera"
                autoComplete="name"
                error={errors.adminName?.message}
                {...register("adminName")}
              />
              <AuthField
                id="adminEmail"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                autoComplete="email"
                error={errors.adminEmail?.message}
                {...register("adminEmail")}
              />
              <PasswordField
                id="adminPassword"
                label="Password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={errors.adminPassword?.message}
                {...register("adminPassword")}
              />
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {PLANS.map((p) => {
                const selected = plan === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setValue("plan", p.id, { shouldValidate: true })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold text-foreground">
                          {p.id}
                        </span>
                        {p.popular && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{p.price}</span>
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && <ReviewStep values={getValues()} />}
        </motion.div>

        {formError ? <p className="mt-4 text-sm text-destructive">{formError}</p> : null}

        {/* Wizard controls */}
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
            <Button type="submit" size="lg" className="h-10">
              Create workspace
            </Button>
          )}
        </div>
      </form>
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

function ReviewStep({ values }: { values: Values }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border px-4">
      <ReviewRow label="Company" value={values.companyName} />
      <ReviewRow label="Workspace" value={`vellora.com/${values.slug}`} />
      <ReviewRow label="Country" value={countryName(values.country) ?? values.country} />
      <ReviewRow label="Timezone" value={values.timezone} />
      <ReviewRow label="Admin" value={values.adminName} />
      <ReviewRow label="Email" value={values.adminEmail} />
      <ReviewRow label="Plan" value={values.plan} />
    </div>
  );
}
