import { cn } from "@/lib/utils";
import { PhoneFrame } from "@/components/marketing/mockups/frames";

// Deterministic faux-QR pattern (no randomness → no hydration mismatch).
const QR_SIZE = 13;
function isFilled(r: number, c: number): boolean {
  const inFinder = (br: number, bc: number) => r >= br && r < br + 3 && c >= bc && c < bc + 3;
  const finders = inFinder(0, 0) || inFinder(0, QR_SIZE - 3) || inFinder(QR_SIZE - 3, 0);
  return finders || (r * 5 + c * 3 + r * c) % 4 === 0;
}

const CHECKINS = [
  { name: "Ava Martins", time: "08:58", status: "On time" as const },
  { name: "Liam Khan", time: "09:07", status: "Late" as const },
  { name: "Noah Reyes", time: "08:45", status: "On time" as const },
];

export function AttendanceMockup() {
  return (
    <PhoneFrame>
      <div className="bg-background px-4 pt-7 pb-4">
        <p className="text-center text-[11px] font-medium text-muted-foreground">
          Downtown · Tuesday
        </p>
        <p className="text-center font-display text-base font-semibold text-foreground">Clock in</p>

        {/* QR */}
        <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3 ring-1 ring-border">
          <div
            className="grid gap-px"
            style={{ gridTemplateColumns: `repeat(${QR_SIZE}, 0.55rem)` }}
            aria-hidden
          >
            {Array.from({ length: QR_SIZE * QR_SIZE }, (_, i) => {
              const r = Math.floor(i / QR_SIZE);
              const c = i % QR_SIZE;
              return (
                <span
                  key={i}
                  className={cn(
                    "size-[0.55rem]",
                    isFilled(r, c) ? "bg-foreground" : "bg-transparent",
                  )}
                />
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Scan the store code to clock in
        </p>

        {/* Recent check-ins */}
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">Recent check-ins</p>
          <ul className="space-y-2">
            {CHECKINS.map(({ name, time, status }) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span className="text-[11px] font-medium text-foreground">{name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{time}</span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status === "On time" ? "bg-success" : "bg-warning",
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PhoneFrame>
  );
}
