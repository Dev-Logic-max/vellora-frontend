import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Shift = { label: string; tone: "morning" | "evening" | "mid" } | null;

const TONE: Record<NonNullable<Shift>["tone"], string> = {
  morning: "bg-primary/10 text-primary ring-primary/20",
  evening: "bg-warning/15 text-warning ring-warning/25",
  mid: "bg-success/15 text-success ring-success/25",
};

const ROSTER: { name: string; shifts: Shift[] }[] = [
  {
    name: "Ava M.",
    shifts: [
      { label: "9–5", tone: "morning" },
      { label: "9–5", tone: "morning" },
      null,
      { label: "12–8", tone: "mid" },
      { label: "12–8", tone: "mid" },
      null,
      null,
    ],
  },
  {
    name: "Liam K.",
    shifts: [
      null,
      { label: "12–8", tone: "mid" },
      { label: "12–8", tone: "mid" },
      { label: "2–10", tone: "evening" },
      null,
      { label: "2–10", tone: "evening" },
      { label: "2–10", tone: "evening" },
    ],
  },
  {
    name: "Noah R.",
    shifts: [
      { label: "2–10", tone: "evening" },
      null,
      { label: "9–5", tone: "morning" },
      { label: "9–5", tone: "morning" },
      { label: "9–5", tone: "morning" },
      { label: "9–5", tone: "morning" },
      null,
    ],
  },
  {
    name: "Mia S.",
    shifts: [
      { label: "12–8", tone: "mid" },
      { label: "12–8", tone: "mid" },
      null,
      null,
      { label: "2–10", tone: "evening" },
      { label: "9–5", tone: "morning" },
      { label: "9–5", tone: "morning" },
    ],
  },
];

export function ScheduleMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-display text-sm font-semibold text-foreground">Weekly schedule</p>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          Week 24 · Downtown
        </span>
      </div>

      <div className="p-3">
        {/* Day header */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] gap-1 pb-1">
          <span />
          {DAYS.map((d) => (
            <span key={d} className="text-center text-[10px] font-medium text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {ROSTER.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[3.5rem_repeat(7,1fr)] items-center gap-1"
            >
              <span className="truncate text-[11px] font-medium text-foreground">{row.name}</span>
              {row.shifts.map((shift, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-7 items-center justify-center rounded-md text-[10px] font-medium",
                    shift
                      ? cn("ring-1 ring-inset", TONE[shift.tone])
                      : "bg-muted/40 text-transparent",
                  )}
                >
                  {shift ? shift.label : "·"}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
