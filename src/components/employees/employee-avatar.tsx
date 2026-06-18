import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Deterministic chart-palette tint for an initials avatar when there's no photo. */
const PALETTE = [
  "bg-[var(--chart-1)]/15 text-[var(--chart-1)]",
  "bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
  "bg-[var(--chart-3)]/15 text-[var(--chart-3)]",
  "bg-[var(--chart-4)]/15 text-[var(--chart-4)]",
  "bg-[var(--chart-5)]/15 text-[var(--chart-5)]",
];

export function initials(first?: string | null, last?: string | null): string {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function paletteFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function EmployeeAvatar({
  firstName,
  lastName,
  avatarUrl,
  className,
}: {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  className?: string;
}) {
  const seed = `${firstName ?? ""}${lastName ?? ""}`;
  return (
    <Avatar className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={seed} /> : null}
      <AvatarFallback className={cn("font-semibold", paletteFor(seed))}>
        {initials(firstName, lastName)}
      </AvatarFallback>
    </Avatar>
  );
}
