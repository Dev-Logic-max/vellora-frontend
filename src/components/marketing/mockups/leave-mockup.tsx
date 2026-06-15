import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Request = {
  name: string;
  type: string;
  dates: string;
  status: "Pending" | "Approved";
};

const REQUESTS: Request[] = [
  { name: "Ava Martins", type: "Vacation", dates: "Jun 18 – 22", status: "Pending" },
  { name: "Liam Khan", type: "Sick leave", dates: "Jun 16", status: "Approved" },
  { name: "Noah Reyes", type: "Personal", dates: "Jun 24", status: "Pending" },
  { name: "Mia Santos", type: "Vacation", dates: "Jul 1 – 5", status: "Approved" },
];

export function LeaveMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-display text-sm font-semibold text-foreground">Leave requests</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
          2 pending
        </span>
      </div>

      <ul className="divide-y divide-border">
        {REQUESTS.map((req) => (
          <li key={req.name} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
              {req.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-foreground">{req.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {req.type} · {req.dates}
              </p>
            </div>
            {req.status === "Pending" ? (
              <div className="flex items-center gap-1">
                <span className="flex size-6 items-center justify-center rounded-md bg-success/15 text-success">
                  <Check className="size-3.5" />
                </span>
                <span className="flex size-6 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <X className="size-3.5" />
                </span>
              </div>
            ) : (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  "bg-success/15 text-success",
                )}
              >
                Approved
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
