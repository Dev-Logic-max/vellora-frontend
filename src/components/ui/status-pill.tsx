import { cn } from "@/lib/utils";
import { StatusIcon, statusTone, TONE_CLASSES } from "@/components/ui/status-config";

interface StatusPillProps {
  status: string;
  /** Override the displayed text (defaults to the humanized status). */
  label?: string;
  /** Hide the leading status icon. */
  hideIcon?: boolean;
  className?: string;
}

/**
 * Soft, OUTLINED status chip with a status-matched icon (premium lift). Tone +
 * icon come from the central status config so every module stays consistent.
 */
export function StatusPill({ status, label, hideIcon, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        TONE_CLASSES[statusTone(status)],
        className,
      )}
    >
      {!hideIcon ? <StatusIcon status={status} className="size-3" /> : null}
      {(label ?? status).replace(/_/g, " ")}
    </span>
  );
}
