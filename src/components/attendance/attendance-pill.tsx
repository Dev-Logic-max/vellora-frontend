import { ATTENDANCE_STATUS_STYLES } from "@/features/attendance/status";
import { cn } from "@/lib/utils";

/** Soft status chip from the attendance status→color map (design-colors §3). */
export function AttendancePill({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        ATTENDANCE_STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {(label ?? status).replace(/_/g, " ")}
    </span>
  );
}
