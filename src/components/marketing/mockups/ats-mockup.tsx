type Candidate = { name: string; role: string };

const COLUMNS: { title: string; accent: string; candidates: Candidate[] }[] = [
  {
    title: "Received",
    accent: "bg-muted-foreground/40",
    candidates: [
      { name: "Sara P.", role: "Store Associate" },
      { name: "Tom W.", role: "Barista" },
      { name: "Ines D.", role: "Cashier" },
    ],
  },
  {
    title: "Review",
    accent: "bg-primary/60",
    candidates: [
      { name: "Marcus L.", role: "Shift Lead" },
      { name: "Yuki T.", role: "Store Associate" },
    ],
  },
  {
    title: "Interview",
    accent: "bg-warning/70",
    candidates: [
      { name: "Priya N.", role: "Assistant Mgr" },
      { name: "Diego R.", role: "Barista" },
    ],
  },
  {
    title: "Hired",
    accent: "bg-success/70",
    candidates: [{ name: "Amara K.", role: "Store Manager" }],
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function AtsMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-display text-sm font-semibold text-foreground">
          Candidates · Store Manager
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          8 active
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3">
        {COLUMNS.map((column) => (
          <div key={column.title} className="rounded-xl bg-muted/40 p-2">
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <span className={`size-1.5 rounded-full ${column.accent}`} />
              <span className="text-[10px] font-semibold text-foreground">{column.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {column.candidates.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {column.candidates.map((candidate) => (
                <div key={candidate.name} className="rounded-lg bg-card p-2 ring-1 ring-border">
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                      {initials(candidate.name)}
                    </span>
                    <span className="truncate text-[10px] font-medium text-foreground">
                      {candidate.name}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[9px] text-muted-foreground">{candidate.role}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
