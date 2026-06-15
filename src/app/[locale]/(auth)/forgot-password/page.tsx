"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthField } from "@/components/auth/auth-field";
import { Reveal } from "@/components/marketing/reveal";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: Values) => {
    // UI-only — wiring comes later.
    console.log("forgot-password", values);
    setSent(true);
  };

  if (sent) {
    return (
      <Reveal className="space-y-6 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account exists, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </Reveal>
    );
  }

  return (
    <Reveal className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
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
        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </Reveal>
  );
}
