"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Days (Mon-first) to render for a month grid, including leading/trailing days. */
function monthMatrix(view: Date): Date[] {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  // Mon=0 … Sun=6
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const navBtn =
  "inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent-soft hover:text-accent-strong";

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  /** Footer Clear action. The button always renders; it's disabled until a date
   * is selected. */
  onClear?: () => void;
  className?: string;
}

/**
 * Themed calendar with a header (month + clickable year), a year-picker grid
 * (4×3 with prev/next), and a footer (Clear left / Today right). Selected day
 * uses a lighter accent fill with a darker accent border + soft shadow; today is
 * the strong accent; hover is the soft accent tint. White base, theme accent.
 */
export function Calendar({ selected, onSelect, onClear, className }: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<Date>(() => selected ?? today);
  const [yearMode, setYearMode] = useState(false);
  // Year grid is a 12-year window starting at the decade-ish boundary.
  const [yearBase, setYearBase] = useState(() => (selected ?? today).getFullYear() - 4);

  const days = useMemo(() => monthMatrix(view), [view]);
  const viewMonth = view.getMonth();

  const shiftMonth = (delta: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  return (
    <div className={cn("w-72 select-none", className)}>
      {/* Header — themed wash + darker bottom border. */}
      <div className="flex items-center justify-between gap-2 rounded-t-xl border-b-2 border-border bg-linear-to-br from-accent-soft via-surface to-surface px-3 py-2.5">
        <button
          type="button"
          className={navBtn}
          onClick={() => (yearMode ? setYearBase((y) => y - 12) : shiftMonth(-1))}
          aria-label="Previous"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setYearBase(view.getFullYear() - 4);
            setYearMode((v) => !v);
          }}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong"
        >
          {yearMode
            ? `${yearBase} – ${yearBase + 11}`
            : `${MONTHS[viewMonth]} ${view.getFullYear()}`}
        </button>

        <button
          type="button"
          className={navBtn}
          onClick={() => (yearMode ? setYearBase((y) => y + 12) : shiftMonth(1))}
          aria-label="Next"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="bg-popover p-3">
        {yearMode ? (
          // Year picker — 4 columns × 3 rows (12 years).
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => yearBase + i).map((yr) => {
              const isCurrent = yr === today.getFullYear();
              const isSelected = selected?.getFullYear() === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setView((v) => new Date(yr, v.getMonth(), 1));
                    setYearMode(false);
                  }}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-accent-strong bg-accent-soft text-accent-strong shadow-accent-sm"
                      : isCurrent
                        ? "border-accent/30 bg-accent/15 text-accent-strong"
                        : "border-transparent bg-surface-subtle/60 text-foreground hover:bg-accent-soft hover:text-accent-strong",
                  )}
                >
                  {yr}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[11px] font-medium text-faint">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((d) => {
                const outside = d.getMonth() !== viewMonth;
                const isToday = sameDay(d, today);
                const isSelected = selected ? sameDay(d, selected) : false;
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => onSelect(d)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg text-sm transition-colors",
                      isSelected
                        ? // Selected: light accent fill + darker accent border + soft shadow.
                          "border border-accent-strong bg-accent-soft font-semibold text-accent-strong shadow-accent-sm hover:bg-accent/15"
                        : isToday
                          ? // Today: slightly deeper accent tint than a normal hover (no harsh dark).
                            "border border-accent/30 bg-accent/15 font-semibold text-accent-strong"
                          : outside
                            ? "text-faint/60 hover:bg-accent-soft/60"
                            : "text-foreground hover:bg-accent-soft hover:text-accent-strong",
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer — Clear (red, always shown; disabled until a date is picked)
          left, Today (accent, small) right. */}
      <div className="flex items-center justify-between rounded-b-xl border-t border-border bg-surface-subtle/60 px-3 py-2">
        <button
          type="button"
          disabled={!selected}
          onClick={() => onClear?.()}
          className="text-xs font-medium text-destructive transition-colors hover:text-destructive/80 disabled:cursor-not-allowed disabled:text-muted-foreground/50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            setView(new Date(today.getFullYear(), today.getMonth(), 1));
            setYearMode(false);
            onSelect(today);
          }}
          className="text-xs font-semibold text-primary transition-colors hover:text-accent-strong"
        >
          Today
        </button>
      </div>
    </div>
  );
}
