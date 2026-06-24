"use client";

import { useMemo, useState } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { ChevronDown, Clock, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatHHmm } from "@/lib/schedule-time";

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
  /** Minutes granularity for the MM column (default 5). */
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const QUICK = ["08:00", "09:00", "13:00", "14:00", "17:00", "18:00", "22:00"];

const HOURS = Array.from({ length: 24 }, (_, h) => h.toString().padStart(2, "0"));

function splitValue(v?: string): { hh: string; mm: string } {
  if (v && /^\d{2}:\d{2}$/.test(v)) return { hh: v.slice(0, 2), mm: v.slice(3, 5) };
  return { hh: "", mm: "" };
}

/**
 * Themed time picker with a header (shows the current value), two scrollable
 * HH / MM columns with accent-highlighted selection, and a row of quick chips
 * for common times. Matches the platform date picker's header/footer styling.
 */
export function TimePicker({
  value,
  onChange,
  step = 5,
  placeholder = "--:--",
  className,
  disabled,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const { hh, mm } = splitValue(value);
  const minutes = useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / step) }, (_, i) =>
        (i * step).toString().padStart(2, "0"),
      ),
    [step],
  );

  const commit = (nextHh: string, nextMm: string) => {
    if (nextHh && nextMm) onChange(`${nextHh}:${nextMm}`);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <Clock className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("flex-1 text-left tabular-nums", value && "text-foreground")}>
          {value ? formatHHmm(value) : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={6} align="start" className="z-50">
          <PopoverPrimitive.Popup className="z-50 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-lg transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {/* Header — current value + dismiss, themed wash + darker border. */}
            <div className="flex items-center justify-between border-b-2 border-border bg-linear-to-br from-accent-soft via-surface to-surface px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="size-4 text-accent-strong" />
                <span className="tabular-nums">{value ? formatHHmm(value) : "--:--"}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent-soft hover:text-accent-strong"
                aria-label="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* HH / MM columns. */}
            <div className="grid grid-cols-2">
              <Column label="HH" items={HOURS} value={hh} onPick={(h) => commit(h, mm || "00")} />
              <Column
                label="MM"
                items={minutes}
                value={mm}
                onPick={(m) => commit(hh || "00", m)}
                bordered
              />
            </div>

            {/* Quick chips. */}
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-surface-subtle/60 p-2">
              {QUICK.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs font-medium tabular-nums transition-colors",
                    t === value
                      ? "border-accent-strong bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent-soft hover:text-accent-strong",
                  )}
                >
                  {formatHHmm(t)}
                </button>
              ))}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function Column({
  label,
  items,
  value,
  onPick,
  bordered,
}: {
  label: string;
  items: string[];
  value: string;
  onPick: (v: string) => void;
  bordered?: boolean;
}) {
  return (
    <div className={cn(bordered && "border-l border-border")}>
      <div className="border-b border-border px-2 py-1 text-center text-[11px] font-semibold tracking-wide text-faint uppercase">
        {label}
      </div>
      <ul className="scrollbar-none max-h-44 overflow-y-auto p-1">
        {items.map((it) => (
          <li key={it}>
            <button
              type="button"
              onClick={() => onPick(it)}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-center text-sm tabular-nums transition-colors",
                it === value
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-accent-soft hover:text-accent-strong",
              )}
            >
              {it}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
