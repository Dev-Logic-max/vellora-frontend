"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewPanel } from "@/components/onboarding/overview-panel";
import { TasksPanel } from "@/components/onboarding/tasks-panel";
import { useCurrentUser } from "@/features/session/use-current-user";

const ADMIN_ROLES = ["owner", "hr"];

export function OnboardingView() {
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState("overview");
  const canManage = Boolean(me?.role && ADMIN_ROLES.includes(me.role));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Onboarding"
        description="Track new-hire checklists and completion across stages."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList variant="line" className="w-max">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-2">
          <OverviewPanel canManage={canManage} />
        </TabsContent>

        <TabsContent value="tasks" className="pt-2">
          <TasksPanel canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
