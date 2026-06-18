import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success-soft text-success",
  pending: "bg-warning-soft text-warning",
  invited: "bg-accent-soft text-accent-strong",
  on_leave: "bg-warning-soft text-warning",
  suspended: "bg-warning-soft text-warning",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  deleted: "bg-danger-soft text-danger",
};

/** Soft status chip from the status→color map (design-colors §3). */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
