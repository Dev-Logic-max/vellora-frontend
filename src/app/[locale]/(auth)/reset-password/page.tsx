"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PasswordField } from "@/components/auth/auth-field";
import { Reveal } from "@/components/marketing/reveal";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = (values: Values) => {
    // UI-only — wiring comes later.
    console.log("reset-password", values);
    setDone(true);
  };

  if (done) {
    return (
      <Reveal className="space-y-6 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Password updated
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your password has been changed. You can now sign in.
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
    <Reveal className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password you don&apos;t use elsewhere.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordField
          id="password"
          label="New password"
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
        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
          Update password
        </Button>
      </form>
    </Reveal>
  );
}
