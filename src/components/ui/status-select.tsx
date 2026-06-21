"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusIcon, statusTone, TONE_CLASSES } from "@/components/ui/status-config";

export interface StatusOption {
  value: string;
  label: string;
}

interface StatusSelectProps {
  options: StatusOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  /** Shown when nothing is selected (also the "all" option label). */
  placeholder?: string;
  /** Include a leading "all / clear" option. */
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
}

/** A small soft+outlined status chip (icon + tone) used inside the select. */
function StatusChip({ value, label }: { value: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[statusTone(value)],
      )}
    >
      <StatusIcon status={value} className="size-3" />
      {label}
    </span>
  );
}

/**
 * Enhanced status picker — instead of a native select, each option renders its
 * status icon + tone chip. Used for status filters and inline status changes.
 */
export function StatusSelect({
  options,
  value,
  onChange,
  placeholder = "All statuses",
  allowClear = true,
  className,
  disabled,
}: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        {selected ? (
          <StatusChip value={selected.value} label={selected.label} />
        ) : (
          <span className="truncate text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <ul className="max-h-60 overflow-y-auto p-1">
            {allowClear ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
                >
                  {placeholder}
                  {!value ? <Check className="size-4 text-primary" /> : null}
                </button>
              </li>
            ) : null}
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                >
                  <StatusChip value={o.value} label={o.label} />
                  {o.value === value ? <Check className="size-4 text-primary" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
