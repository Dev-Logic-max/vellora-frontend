import type * as React from "react";

import { cn } from "@/lib/utils";

interface SelectFieldProps extends React.ComponentProps<"select"> {
  id: string;
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

/** Labeled native select styled to match FormField inputs. */
export function SelectField({
  id,
  label,
  error,
  options,
  placeholder,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
