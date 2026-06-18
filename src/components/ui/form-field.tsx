import type * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormField({
  id,
  label,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <Input id={id} aria-invalid={Boolean(error)} className={cn("h-9", className)} {...props} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
