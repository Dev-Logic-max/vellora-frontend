"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { signUp } from "@/lib/auth";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { GoogleButton } from "@/components/auth/google-button";
import { Reveal } from "@/components/marketing/reveal";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = async (values: Values) => {
    setFormError(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await signUp({
      email: values.email,
      password: values.password,
      data: { full_name: values.name },
      emailRedirectTo: `${siteUrl}/login`,
    });
    if (error) {
      setFormError(error.message);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Reveal className="space-y-6 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Confirm your email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ve sent a verification link to your inbox. Confirm it, then sign in to continue.
          </p>
        </div>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </Reveal>
    );
  }

  return (
    <Reveal className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start your free 14-day trial. No credit card required.
        </p>
      </div>

      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthField
          id="name"
          label="Full name"
          placeholder="Alex Rivera"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthField
          id="email"
          type="email"
          label="Work email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          id="confirm"
          label="Confirm password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Registering a company?{" "}
        <Link href="/register-company" className="font-medium text-primary hover:underline">
          Set up your workspace
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Reveal>
  );
}
