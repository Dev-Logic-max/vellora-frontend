"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationsCenter } from "./notifications-center";
import { NotificationPreferences } from "./notification-preferences";

export function NotificationsView() {
  const [tab, setTab] = useState("all");
  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" description="Everything that needs your attention." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList variant="line" className="w-max">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-2">
          <NotificationsCenter />
        </TabsContent>
        <TabsContent value="preferences" className="max-w-2xl pt-2">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
}
