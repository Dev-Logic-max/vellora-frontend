"use client";

import { useState } from "react";
import { LayoutDashboard, ListChecks } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { OverviewPanel } from "@/components/onboarding/overview-panel";
import { TasksPanel } from "@/components/onboarding/tasks-panel";
import { useCurrentUser } from "@/features/session/use-current-user";

type OnboardingTab = "overview" | "tasks";

const ADMIN_ROLES = ["owner", "hr"];

const TABS: SegmentedTab<OnboardingTab>[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "tasks", label: "Tasks", icon: ListChecks },
];

export function OnboardingView() {
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState<OnboardingTab>("overview");
  const canManage = Boolean(me?.role && ADMIN_ROLES.includes(me.role));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Onboarding"
        description="Track new-hire checklists and completion across stages."
      />

      <SegmentedTabs tabs={TABS} value={tab} onValueChange={setTab} layoutGroup="onboarding-tabs" />

      {tab === "overview" ? (
        <div className="pt-2">
          <OverviewPanel canManage={canManage} />
        </div>
      ) : null}
      {tab === "tasks" ? (
        <div className="pt-2">
          <TasksPanel canManage={canManage} />
        </div>
      ) : null}
    </div>
  );
}
