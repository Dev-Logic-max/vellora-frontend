import { EntityAvatar } from "@/components/ui/entity-avatar";
import { cn } from "@/lib/utils";

export interface StackItem {
  name?: string | null;
  src?: string | null;
}

/**
 * Overlapping avatar stack — shows up to `max` rounded-full avatars side-by-side
 * (each slightly overlapping the previous via a negative margin + white ring), and
 * a trailing "+N" bubble when `total` exceeds what's shown. Used for employee
 * counts in the companies / tenants tables.
 */
export function AvatarStack({
  items,
  total,
  max = 3,
  className,
}: {
  items: StackItem[];
  /** Full count (drives the "+N" bubble). Falls back to items.length. */
  total?: number;
  max?: number;
  className?: string;
}) {
  const count = total ?? items.length;
  if (count <= 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const shown = items.slice(0, max);
  const overflow = count - shown.length;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center -space-x-2">
        {shown.map((it, i) => (
          <EntityAvatar
            key={i}
            name={it.name}
            src={it.src}
            className="size-7 rounded-full ring-2 ring-surface"
            textClassName="text-[10px]"
          />
        ))}
        {overflow > 0 ? (
          <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent-strong ring-2 ring-surface tabular-nums">
            {overflow}+
          </span>
        ) : null}
      </div>
    </div>
  );
}
