import { cn } from "@/lib/utils";
import type { MembershipRole } from "@/features/session/types";

/** Soft, outlined tag colors per membership role (chart-palette led). */
const ROLE_CLASSES: Record<MembershipRole, string> = {
  owner: "bg-[var(--chart-3)]/12 text-[var(--chart-3)] border-[var(--chart-3)]/25",
  hr: "bg-accent-soft text-accent-strong border-accent/25",
  area_manager: "bg-[var(--chart-2)]/12 text-[var(--chart-2)] border-[var(--chart-2)]/25",
  store_manager: "bg-[var(--chart-4)]/12 text-[var(--chart-4)] border-[var(--chart-4)]/25",
  employee: "bg-muted text-muted-foreground border-border",
};

export const ROLE_LABELS: Record<MembershipRole, string> = {
  owner: "Owner",
  hr: "HR",
  area_manager: "Area manager",
  store_manager: "Store manager",
  employee: "Employee",
};

/** A small role chip, colored by role (used in the employee dropdown + lists). */
export function RoleTag({
  role,
  className,
}: {
  role?: MembershipRole | string | null;
  className?: string;
}) {
  const key = role as MembershipRole;
  const known = key in ROLE_CLASSES;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        known ? ROLE_CLASSES[key] : "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {known ? ROLE_LABELS[key] : (role ?? "—")}
    </span>
  );
}
