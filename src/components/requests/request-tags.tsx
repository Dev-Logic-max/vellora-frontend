import {
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  CircleDot,
  Eye,
  Flag,
  Hourglass,
  Minus,
  MessageCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  PlatformRequestActionStatus,
  PlatformRequestPriority,
  PlatformRequestStatus,
  PlatformRequestType,
} from "@/features/requests/types";

type TagStyle = { cls: string; icon: LucideIcon; label: string };

// ── priority ─────────────────────────────────────────────────────────────────
const PRIORITY: Record<PlatformRequestPriority, TagStyle> = {
  low: { cls: "bg-slate-100 text-slate-600 border-slate-300/60", icon: Minus, label: "Low" },
  medium: { cls: "bg-sky-50 text-sky-700 border-sky-300/60", icon: CircleDot, label: "Medium" },
  high: { cls: "bg-amber-50 text-amber-700 border-amber-300/60", icon: ArrowUp, label: "High" },
  urgent: { cls: "bg-rose-50 text-rose-700 border-rose-300/60", icon: AlertTriangle, label: "Urgent" },
};

// ── record status (platform side) ──────────────────────────────────────────────
const STATUS: Record<PlatformRequestStatus, TagStyle> = {
  received: { cls: "bg-slate-100 text-slate-600 border-slate-300/60", icon: Hourglass, label: "Received" },
  in_review: { cls: "bg-sky-50 text-sky-700 border-sky-300/60", icon: Eye, label: "In review" },
  replied: { cls: "bg-violet-50 text-violet-700 border-violet-300/60", icon: MessageCircle, label: "Replied" },
  resolved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-300/60", icon: CheckCircle2, label: "Resolved" },
  rejected: { cls: "bg-rose-50 text-rose-700 border-rose-300/60", icon: XCircle, label: "Rejected" },
};

// ── action status (user side) ──────────────────────────────────────────────────
const ACTION: Record<PlatformRequestActionStatus, TagStyle> = {
  waiting: { cls: "bg-amber-50 text-amber-700 border-amber-300/60", icon: Hourglass, label: "Waiting" },
  read: { cls: "bg-sky-50 text-sky-700 border-sky-300/60", icon: Eye, label: "Read" },
  responded: { cls: "bg-violet-50 text-violet-700 border-violet-300/60", icon: MessageCircle, label: "Responded" },
  closed: { cls: "bg-slate-100 text-slate-600 border-slate-300/60", icon: CheckCircle2, label: "Closed" },
};

// ── type / category ────────────────────────────────────────────────────────────
const TYPE: Record<PlatformRequestType, { cls: string; label: string }> = {
  company_deletion: { cls: "bg-rose-50 text-rose-700 border-rose-300/60", label: "Company deletion" },
  report: { cls: "bg-orange-50 text-orange-700 border-orange-300/60", label: "Report" },
  query: { cls: "bg-sky-50 text-sky-700 border-sky-300/60", label: "Query" },
  support: { cls: "bg-teal-50 text-teal-700 border-teal-300/60", label: "Support" },
  feature: { cls: "bg-violet-50 text-violet-700 border-violet-300/60", label: "Feature" },
  billing: { cls: "bg-amber-50 text-amber-700 border-amber-300/60", label: "Billing" },
};

function Pill({ style }: { style: TagStyle }) {
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        style.cls,
      )}
    >
      <Icon className="size-3" />
      {style.label}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: PlatformRequestPriority }) {
  return <Pill style={PRIORITY[priority] ?? PRIORITY.medium} />;
}

export function RequestStatusTag({ status }: { status: PlatformRequestStatus }) {
  return <Pill style={STATUS[status] ?? STATUS.received} />;
}

export function ActionStatusTag({ status }: { status: PlatformRequestActionStatus }) {
  return <Pill style={ACTION[status] ?? ACTION.waiting} />;
}

export function RequestTypeTag({
  type,
  module,
}: {
  type: PlatformRequestType;
  module?: string | null;
}) {
  const t = TYPE[type] ?? { cls: "bg-muted text-muted-foreground border-border", label: type };
  return (
    <span className="inline-flex items-center gap-1.5">
      <Flag className="size-3 text-muted-foreground" />
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
          t.cls,
        )}
      >
        {module || t.label}
      </span>
    </span>
  );
}
