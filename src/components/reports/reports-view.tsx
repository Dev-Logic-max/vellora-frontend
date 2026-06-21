"use client";

import { useState } from "react";
import { BarChart3, Bookmark } from "lucide-react";

import { LockedFeature } from "@/components/billing/locked-feature";
import { PageHeader } from "@/components/layout/page-header";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import type { ReportFilters } from "@/features/reports/types";
import { InsightCard } from "./insight-card";
import { ReportsDashboard } from "./reports-dashboard";
import { ReportsFilters } from "./reports-filters";
import { SavedReportsPanel } from "./saved-reports-panel";

type ReportsTab = "dashboard" | "saved";

const REPORTS_TABS: SegmentedTab<ReportsTab>[] = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "saved", label: "Saved reports", icon: Bookmark },
];

export function ReportsView() {
  const [tab, setTab] = useState<ReportsTab>("dashboard");
  const [filters, setFilters] = useState<ReportFilters>({});

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Workforce analytics across headcount, attendance, turnover, and labor." />

      <LockedFeature
        feature="reports"
        title="Reports is a Growth feature"
        description="Upgrade to unlock workforce dashboards, scheduled reports, and AI insights."
      >
        <SegmentedTabs
          tabs={REPORTS_TABS}
          value={tab}
          onValueChange={setTab}
          layoutGroup="reports-tabs"
        />

        {tab === "dashboard" ? (
          <div className="space-y-5 pt-4">
            <ReportsFilters filters={filters} onChange={setFilters} />
            <InsightCard storeId={filters.storeId} />
            <ReportsDashboard filters={filters} />
          </div>
        ) : null}

        {tab === "saved" ? (
          <div className="pt-4">
            <SavedReportsPanel />
          </div>
        ) : null}
      </LockedFeature>
    </div>
  );
}
