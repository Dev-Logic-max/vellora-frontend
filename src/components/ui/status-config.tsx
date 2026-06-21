import { createElement } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarOff,
  CheckCircle2,
  CircleDashed,
  CircleSlash,
  Clock,
  HelpCircle,
  Hourglass,
  Mail,
  Pause,
  Send,
  ShieldCheck,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/** Coarse tone families that map a status to a soft-fill + outline + icon. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "accent" | "neutral";

/** Soft fill + text + a slightly darker border outline (premium lift). */
export const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  info: "bg-info-soft text-info border-info/25",
  accent: "bg-accent-soft text-accent-strong border-accent/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

/** Map a status keyword → tone. Centralizes the success/warn/danger meanings so
 * every module's pills/selects stay consistent without per-module color maps. */
export function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (
    [
      "active",
      "closed",
      "resolved",
      "approved",
      "registered",
      "on_time",
      "confirmed",
      "completed",
      "done",
      "paid",
      "published",
      "filled",
      "hired",
      "accepted",
      "passed",
      "succeeded",
      "open", // job/leave "open" reads positive enough
    ].includes(s)
  )
    return "success";
  if (
    [
      "pending",
      "in_review",
      "requested",
      "flagged",
      "on_leave",
      "suspended",
      "late",
      "warning",
      "draft",
      "scheduled",
      "trialing",
      "processing",
      "past_due",
      "interview",
      "screening",
      "planning",
      "planned",
      "awaiting",
    ].includes(s)
  )
    return "warning";
  if (
    [
      "absent",
      "blocked",
      "rejected",
      "deleted",
      "failed",
      "expired",
      "declined",
      "overdue",
      "no_show",
      "error",
      "unpaid",
    ].includes(s)
  )
    return "danger";
  if (["invited", "corrected", "in_progress", "sent", "info", "new"].includes(s)) return "accent";
  if (
    [
      "inactive",
      "archived",
      "reset",
      "dismissed",
      "off",
      "closed_out",
      "void",
      "cancelled",
      "canceled",
    ].includes(s)
  )
    return "neutral";
  return "neutral";
}

/** Map a status keyword → a representative icon. */
export function statusIcon(status: string): LucideIcon {
  const s = status.toLowerCase();
  const map: Record<string, LucideIcon> = {
    active: CheckCircle2,
    registered: ShieldCheck,
    closed: CheckCircle2,
    resolved: CheckCircle2,
    approved: CheckCircle2,
    confirmed: CheckCircle2,
    completed: CheckCircle2,
    paid: CheckCircle2,
    on_time: CheckCircle2,
    hired: CheckCircle2,
    pending: Hourglass,
    requested: Hourglass,
    in_review: Hourglass,
    processing: Hourglass,
    trialing: Hourglass,
    scheduled: Clock,
    planning: CircleDashed,
    planned: CircleDashed,
    draft: CircleDashed,
    late: Clock,
    flagged: AlertTriangle,
    warning: AlertTriangle,
    past_due: AlertTriangle,
    suspended: Pause,
    on_leave: CalendarOff,
    absent: XCircle,
    rejected: XCircle,
    declined: XCircle,
    failed: XCircle,
    cancelled: CircleSlash,
    canceled: CircleSlash,
    no_show: CircleSlash,
    blocked: Ban,
    expired: CircleSlash,
    deleted: Trash2,
    invited: Mail,
    sent: Send,
    inactive: Pause,
    archived: CircleSlash,
    reset: CircleDashed,
    dismissed: CircleSlash,
    open: CircleDashed,
    corrected: CheckCircle2,
  };
  return map[s] ?? HelpCircle;
}

/** Renders the icon for a status. Uses `createElement` (not a local capitalized
 * JSX binding) so the React Compiler doesn't flag a component "created during
 * render". */
export function StatusIcon({ status, className }: { status: string; className?: string }) {
  return createElement(statusIcon(status), { className });
}
