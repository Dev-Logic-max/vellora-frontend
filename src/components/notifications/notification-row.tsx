"use client";

import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import type { Notification } from "@/features/notifications/types";
import { PriorityDot } from "./priority-dot";

interface Props {
  notification: Notification;
  onClick?: (n: Notification) => void;
  compact?: boolean;
}

/** A single notification line — unread rows get a soft accent wash + dot. */
export function NotificationRow({ notification: n, onClick, compact }: Props) {
  const unread = !n.readAt;
  return (
    <button
      type="button"
      onClick={() => onClick?.(n)}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-subtle",
        unread && "bg-accent-soft/40",
      )}
    >
      <PriorityDot priority={n.priority} className={cn("mt-1.5 shrink-0", !unread && "opacity-40")} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              unread ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {n.title}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </span>
        </span>
        {n.body && !compact ? (
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>
        ) : null}
        <span className="mt-1 inline-block text-[11px] tracking-wide text-muted-foreground/70 uppercase">
          {n.category}
        </span>
      </span>
    </button>
  );
}
