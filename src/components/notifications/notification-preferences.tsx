"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useNotifPreferences,
  useUpdatePreference,
} from "@/features/notifications/notifications";
import { NOTIF_CATEGORIES } from "@/features/notifications/types";
import type { NotifPreference } from "@/features/notifications/types";

/** Per-category channel matrix (in-app / email) — defaults on when unset. */
export function NotificationPreferences() {
  const { data: prefs, isLoading } = useNotifPreferences();
  const update = useUpdatePreference();

  const byCategory = new Map((prefs ?? []).map((p) => [p.category, p]));

  const toggle = (
    category: string,
    field: "inApp" | "email",
    value: boolean,
    current?: NotifPreference,
  ) => {
    update.mutate({
      category,
      inApp: field === "inApp" ? value : (current?.inApp ?? true),
      email: field === "email" ? value : (current?.email ?? true),
      push: current?.push ?? false,
      digest: current?.digest ?? "off",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-8 border-b border-border px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <span>Category</span>
        <span>In-app</span>
        <span>Email</span>
      </div>
      {NOTIF_CATEGORIES.map((category) => {
        const pref = byCategory.get(category);
        return (
          <div
            key={category}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-8 border-b border-border px-4 py-3 last:border-0"
          >
            <span className="text-sm font-medium text-foreground capitalize">{category}</span>
            <Switch
              checked={pref?.inApp ?? true}
              onCheckedChange={(v) => toggle(category, "inApp", v, pref)}
            />
            <Switch
              checked={pref?.email ?? true}
              onCheckedChange={(v) => toggle(category, "email", v, pref)}
            />
          </div>
        );
      })}
    </div>
  );
}
