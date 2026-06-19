"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import { useMarkRead, useNotifications } from "@/features/notifications/notifications";
import { NOTIF_CATEGORIES } from "@/features/notifications/types";
import type { Notification, NotifPriority } from "@/features/notifications/types";
import { NotificationRow } from "./notification-row";

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  ...NOTIF_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) })),
];
const PRIORITY_OPTIONS = [
  { value: "", label: "Any priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];
const READ_OPTIONS = [
  { value: "", label: "All" },
  { value: "unread", label: "Unread" },
];

/** Full notification center with category / priority / read filters. */
export function NotificationsCenter() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [read, setRead] = useState("");
  const markRead = useMarkRead();

  const { data: items, isLoading } = useNotifications({
    category: category || undefined,
    priority: (priority || undefined) as NotifPriority | undefined,
    unread: read === "unread",
  });

  const onItem = (n: Notification) => {
    if (!n.readAt) markRead.mutate(n.id);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SelectField
          id="notif-category"
          className="sm:w-48"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <SelectField
          id="notif-priority"
          className="sm:w-40"
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
        <SelectField
          id="notif-read"
          className="sm:w-32"
          options={READ_OPTIONS}
          value={read}
          onChange={(e) => setRead(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map((n) => (
              <NotificationRow key={n.id} notification={n} onClick={onItem} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="Nothing matches these filters yet."
            className="border-0"
          />
        )}
      </div>
    </div>
  );
}
