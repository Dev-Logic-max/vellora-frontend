"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type FieldProps = React.ComponentProps<"input"> & { label: string; error?: string };

/** Labeled text input wired for react-hook-form (ref flows via React 19 ref-as-prop). */
export function AuthField({ label, error, id, className, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input id={id} aria-invalid={!!error} className={cn("h-10", className)} {...props} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({ label, error, id, className, ...props }: FieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          className={cn("h-10 pr-9", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Native select styled to match the field inputs. */
export function SelectField({
  label,
  error,
  id,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
