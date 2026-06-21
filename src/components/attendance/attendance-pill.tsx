import { ATTENDANCE_STATUS_STYLES } from "@/features/attendance/status";
import { StatusIcon } from "@/components/ui/status-config";
import { cn } from "@/lib/utils";

/** Soft, OUTLINED attendance status chip with a status-matched icon. Uses the
 * attendance-specific color map (tuned tones) + the shared icon registry. */
export function AttendancePill({
  status,
  label,
  hideIcon,
  className,
}: {
  status: string;
  label?: string;
  hideIcon?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-current/15 px-2 py-0.5 text-xs font-medium capitalize",
        ATTENDANCE_STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {!hideIcon ? <StatusIcon status={status} className="size-3" /> : null}
      {(label ?? status).replace(/_/g, " ")}
    </span>
  );
}
