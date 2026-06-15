import { Check, Minus } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

const PLAN_NAMES = ["Starter", "Growth", "Business", "Enterprise"];

type Cell = string | boolean;
type Row = { feature: string; values: [Cell, Cell, Cell, Cell] };

// PLACEHOLDER comparison matrix — aligns with roadmap §5.
const ROWS: Row[] = [
  { feature: "Employees", values: ["25", "100", "500", "Unlimited"] },
  { feature: "Stores", values: ["3", "10", "Unlimited", "Unlimited"] },
  { feature: "Scheduling & rosters", values: [true, true, true, true] },
  { feature: "QR attendance", values: [true, true, true, true] },
  { feature: "Leave & approvals", values: [true, true, true, true] },
  { feature: "Documents & onboarding", values: [true, true, true, true] },
  { feature: "Recruiting (ATS)", values: [false, true, true, true] },
  { feature: "Reports & analytics", values: [false, true, true, true] },
  { feature: "AI resume parsing", values: [false, true, true, true] },
  { feature: "Automations", values: [false, false, true, true] },
  { feature: "Custom themes", values: [false, false, true, true] },
  { feature: "SSO & SCIM", values: [false, false, false, true] },
  { feature: "Audit log & API", values: [false, false, false, true] },
  { feature: "Support", values: ["Email", "Email", "Priority", "Dedicated + SLA"] },
];

function CellValue({ value }: { value: Cell }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto size-4 text-primary" />
    ) : (
      <Minus className="mx-auto size-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-sm text-foreground">{value}</span>;
}

export function ComparisonTable() {
  return (
    <Reveal className="mx-auto w-full max-w-5xl">
      <div className="overflow-x-auto rounded-2xl border border-border ring-1 ring-foreground/5">
        <table className="w-full min-w-[40rem] border-collapse text-center">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Compare plans
              </th>
              {PLAN_NAMES.map((name) => (
                <th key={name} className="px-4 py-3 text-sm font-semibold text-foreground">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-left text-sm text-muted-foreground">{row.feature}</td>
                {row.values.map((value, i) => (
                  <td key={i} className="px-4 py-3">
                    <CellValue value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
