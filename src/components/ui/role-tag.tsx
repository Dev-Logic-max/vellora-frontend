import { cn } from "@/lib/utils";
import type { MembershipRole } from "@/features/session/types";

/**
 * FIXED role colors — deliberately NOT tied to the theme accent / chart vars, so
 * a role reads the SAME hue everywhere (tables, dropdowns, any user's login)
 * regardless of the platform theme. Soft fill + matching text + hairline border.
 */
const ROLE_CLASSES: Record<MembershipRole, string> = {
  owner: "bg-amber-50 text-amber-700 border-amber-300/60",
  hr: "bg-violet-50 text-violet-700 border-violet-300/60",
  area_manager: "bg-sky-50 text-sky-700 border-sky-300/60",
  store_manager: "bg-teal-50 text-teal-700 border-teal-300/60",
  employee: "bg-slate-100 text-slate-600 border-slate-300/60",
};

export const ROLE_LABELS: Record<MembershipRole, string> = {
  owner: "Owner",
  hr: "HR - Manager",
  area_manager: "Area Manager",
  store_manager: "Store Manager",
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
