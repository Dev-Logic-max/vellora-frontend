"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Link, useRouter } from "@/i18n/navigation";
import { signInWithPassword } from "@/lib/auth";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { GoogleButton } from "@/components/auth/google-button";
import { Reveal } from "@/components/marketing/reveal";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session-expired";
  // Return-to path captured by the 401 handler (locale-prefixed, raw path).
  const next = searchParams.get("next");
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (values: Values) => {
    setFormError(null);
    const { error } = await signInWithPassword(values.email, values.password);
    if (error) {
      setFormError(error.message);
      return;
    }
    // Show the overlay, then send the user back where they were (or the dashboard).
    setRedirecting(true);
    if (next) {
      // `next` is already locale-prefixed → use a raw navigation (no i18n re-prefix).
      window.location.assign(next);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const busy = isSubmitting || redirecting;

  return (
    <Reveal className="space-y-6">
      {redirecting ? <FullScreenLoader /> : null}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your Vellora account.</p>
      </div>

      {sessionExpired ? (
        <div className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
          Your session expired. Please sign in again to continue.
        </div>
      ) : null}

      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthField
          id="email"
          type="email"
          label="Email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
              {...register("remember")}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button type="submit" size="lg" className="h-10 w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </Reveal>
  );
}
