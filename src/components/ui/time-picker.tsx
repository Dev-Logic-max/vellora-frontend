"use client";

import { useMemo, useState } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

/** Labeled wrapper around TimePicker (string `HH:mm`) — drop-in for
 * `<FormField type="time">`. */
export function TimeField({
  id,
  label,
  value,
  onChange,
  step,
  className,
  disabled,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  step?: number;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <TimePicker value={value} onChange={onChange} step={step} disabled={disabled} />
    </div>
  );
}

interface TimePickerProps {
  /** "HH:mm" (24h). */
  value?: string;
  onChange: (value: string) => void;
  /** Minutes between options (default 15). */
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function buildSlots(step: number): string[] {
  const out: string[] = [];
  for (let m = 0; m < 24 * 60; m += step) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`);
  }
  return out;
}

/** Themed time picker — a scrollable list of slots, accent-highlighted selection.
 * Also lets the user type a free time which is matched against the list. */
export function TimePicker({
  value,
  onChange,
  step = 15,
  placeholder = "--:--",
  className,
  disabled,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const slots = useMemo(() => buildSlots(step), [step]);
  const filtered = query ? slots.filter((s) => s.startsWith(query)) : slots;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setQuery("");
      }}
    >
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <Clock className="size-4 text-muted-foreground" />
        <span className="flex-1 text-left tabular-nums">{value || placeholder}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={6} align="start" className="z-50">
          <PopoverPrimitive.Popup className="z-50 w-32 overflow-hidden rounded-xl border border-border bg-popover shadow-lg transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="border-b border-border p-1.5">
              <input
                autoFocus
                inputMode="numeric"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type…"
                className="h-7 w-full rounded-md bg-transparent px-2 text-sm tabular-nums outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul className="scrollbar-thin max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <li className="px-2 py-2 text-center text-xs text-muted-foreground">No match</li>
              ) : (
                filtered.map((slot) => (
                  <li key={slot}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(slot);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm tabular-nums transition-colors",
                        slot === value
                          ? "bg-accent-soft font-medium text-accent-strong"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {slot}
                      {slot === value ? <Check className="size-3.5 text-primary" /> : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
