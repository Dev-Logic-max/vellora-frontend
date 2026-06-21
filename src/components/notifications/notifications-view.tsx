"use client";

import { useState } from "react";
import { Bell, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { NotificationsCenter } from "./notifications-center";
import { NotificationPreferences } from "./notification-preferences";

type NotificationsTab = "all" | "preferences";

const TABS: SegmentedTab<NotificationsTab>[] = [
  { value: "all", label: "All", icon: Bell },
  { value: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

export function NotificationsView() {
  const [tab, setTab] = useState<NotificationsTab>("all");
  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" description="Everything that needs your attention." />
      <SegmentedTabs tabs={TABS} value={tab} onValueChange={setTab} layoutGroup="notifications-tabs" />
      {tab === "all" ? (
        <div className="pt-2">
          <NotificationsCenter />
        </div>
      ) : null}
      {tab === "preferences" ? (
        <div className="max-w-2xl pt-2">
          <NotificationPreferences />
        </div>
      ) : null}
    </div>
  );
}
