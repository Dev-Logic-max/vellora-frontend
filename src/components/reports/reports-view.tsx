"use client";

import { useState } from "react";

import { LockedFeature } from "@/components/billing/locked-feature";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReportFilters } from "@/features/reports/types";
import { InsightCard } from "./insight-card";
import { ReportsDashboard } from "./reports-dashboard";
import { ReportsFilters } from "./reports-filters";
import { SavedReportsPanel } from "./saved-reports-panel";

export function ReportsView() {
  const [tab, setTab] = useState("dashboard");
  const [filters, setFilters] = useState<ReportFilters>({});

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Workforce analytics across headcount, attendance, turnover, and labor." />

      <LockedFeature
        feature="reports"
        title="Reports is a Growth feature"
        description="Upgrade to unlock workforce dashboards, scheduled reports, and AI insights."
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabsList variant="line" className="w-max">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="saved">Saved reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-5 pt-4">
            <ReportsFilters filters={filters} onChange={setFilters} />
            <InsightCard storeId={filters.storeId} />
            <ReportsDashboard filters={filters} />
          </TabsContent>

          <TabsContent value="saved" className="pt-4">
            <SavedReportsPanel />
          </TabsContent>
        </Tabs>
      </LockedFeature>
    </div>
  );
}
