"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Tell us a little more (10+ characters)"),
});

type Values = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  const onSubmit = (values: Values) => {
    // UI-only — wiring comes later.
    console.log("contact", values);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center ring-1 ring-foreground/5">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Message sent</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks for reaching out — we&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          id="name"
          label="Name"
          placeholder="Alex Rivera"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthField
          id="email"
          type="email"
          label="Email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <AuthField
        id="company"
        label="Company (optional)"
        placeholder="Acme Retail Group"
        error={errors.company?.message}
        {...register("company")}
      />
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="How can we help?"
          aria-invalid={!!errors.message}
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive",
          )}
          {...register("message")}
        />
        {errors.message ? (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        ) : null}
      </div>
      <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
        Send message
      </Button>
    </form>
  );
}
