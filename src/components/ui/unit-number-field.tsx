"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface UnitOption {
  value: string;
  /** Short button label, e.g. "week". */
  label: string;
}

/**
 * A number input with an in-field unit selector on the right (e.g. hours per
 * week / day / month). The chosen unit is reported via `onUnitChange`; the
 * consumer can change a field label accordingly (P7).
 */
export function UnitNumberField({
  id,
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  units,
  placeholder,
  className,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
  units: UnitOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = units.find((u) => u.value === unit) ?? units[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div
        ref={ref}
        className="flex h-9 items-stretch overflow-visible rounded-lg border border-border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
      >
        <input
          id={id}
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-l-lg bg-transparent px-3 text-sm text-foreground outline-none"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-full items-center gap-1 rounded-r-lg border-l border-border bg-accent-soft px-2.5 text-xs font-medium text-accent-strong transition-colors hover:bg-accent/15"
          >
            {current.label}
            <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
          </button>
          {open ? (
            <ul className="absolute right-0 z-50 mt-1 w-28 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
              {units.map((u) => (
                <li key={u.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onUnitChange(u.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-sm capitalize transition-colors",
                      u.value === unit
                        ? "bg-accent-soft font-medium text-accent-strong"
                        : "text-foreground hover:bg-accent-soft/60",
                    )}
                  >
                    {u.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
