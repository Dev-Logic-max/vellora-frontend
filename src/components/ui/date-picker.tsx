"use client";

import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Shared themed DayPicker classNames — selected day uses the accent, today is
 * ringed, hover/range use the soft accent tint. White base, theme accent. */
const dayPickerClassNames = {
  months: "relative",
  month: "space-y-3",
  month_caption: "flex items-center justify-center h-8 px-9 relative",
  caption_label: "text-sm font-semibold text-foreground",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong",
  button_next:
    "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-[11px] font-medium text-faint",
  week: "flex w-full mt-1",
  day: "p-0",
  day_button:
    "inline-flex size-9 items-center justify-center rounded-lg text-sm text-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong aria-selected:font-semibold",
  today: "[&>button]:ring-1 [&>button]:ring-accent/40 [&>button]:text-accent-strong",
  selected:
    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-accent-sm [&>button:hover]:bg-accent-strong [&>button:hover]:text-primary-foreground",
  outside: "[&>button]:text-faint/60",
  disabled: "[&>button]:opacity-40 [&>button]:pointer-events-none",
  range_start: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:rounded-r-none",
  range_end: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:rounded-l-none",
  range_middle:
    "rounded-none bg-accent-soft [&>button]:bg-transparent [&>button]:text-accent-strong [&>button]:rounded-none",
} as const;

function CalendarChevron(props: { orientation?: "left" | "right" | "up" | "down"; className?: string }) {
  return props.orientation === "left" ? (
    <ChevronLeft className="size-4" />
  ) : (
    <ChevronRight className="size-4" />
  );
}

function triggerClass(empty: boolean) {
  return cn(
    "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    empty && "text-muted-foreground",
  );
}

const popupClass =
  "z-50 rounded-xl border border-border bg-popover p-3 shadow-lg transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** Single-date picker — themed calendar in a popover. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(triggerClass(!value), className)}
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className="flex-1 text-left">
          {value ? format(value, "EEE, MMM d, yyyy") : placeholder}
        </span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={6} align="start" className="z-50">
          <PopoverPrimitive.Popup className={popupClass}>
            <DayPicker
              mode="single"
              required={false}
              selected={value}
              onSelect={(d) => {
                onChange(d);
                setOpen(false);
              }}
              showOutsideDays
              weekStartsOn={1}
              components={{ Chevron: CalendarChevron }}
              classNames={dayPickerClassNames}
            />
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/**
 * Labeled, STRING-based date field (value/onChange in `YYYY-MM-DD`) — a drop-in
 * for `<FormField type="date">` that uses the themed DatePicker. Empty string =
 * no date.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  className,
  disabled,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  // Parse YYYY-MM-DD as a local date (avoid the UTC shift of `new Date("...")`).
  const parsed = value ? new Date(`${value}T00:00:00`) : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <DatePicker
        value={parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined}
        onChange={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
        disabled={disabled}
      />
    </div>
  );
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** Date-range picker — themed range calendar in a popover. */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a range",
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const label =
    value?.from && value?.to
      ? `${format(value.from, "MMM d")} – ${format(value.to, "MMM d, yyyy")}`
      : value?.from
        ? `${format(value.from, "MMM d, yyyy")} – …`
        : placeholder;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(triggerClass(!value?.from), className)}
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className="flex-1 text-left">{label}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={6} align="start" className="z-50">
          <PopoverPrimitive.Popup className={popupClass}>
            <DayPicker
              mode="range"
              selected={value}
              onSelect={onChange}
              showOutsideDays
              weekStartsOn={1}
              numberOfMonths={2}
              components={{ Chevron: CalendarChevron }}
              classNames={{ ...dayPickerClassNames, months: "flex gap-4" }}
            />
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
