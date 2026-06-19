"use client";

import { useState } from "react";

import { LockedFeature } from "@/components/billing/locked-feature";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateDrawer } from "./candidate-drawer";
import { CandidatePipeline } from "./candidate-pipeline";
import { InsightsPanel } from "./insights-panel";
import { JobsPanel } from "./jobs-panel";

export function RecruitingView() {
  const [tab, setTab] = useState("candidates");
  const [openCandidate, setOpenCandidate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Recruiting" description="Post jobs, run your pipeline, and schedule interviews." />

      <LockedFeature
        feature="recruiting"
        title="Recruiting is a Growth feature"
        description="Upgrade to post jobs, collect applications, and run a hiring pipeline."
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabsList variant="line" className="w-max">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="pt-3">
            <CandidatePipeline onOpen={setOpenCandidate} />
          </TabsContent>
          <TabsContent value="positions" className="pt-3">
            <JobsPanel />
          </TabsContent>
          <TabsContent value="insights" className="pt-3">
            <InsightsPanel />
          </TabsContent>
        </Tabs>

        <CandidateDrawer candidateId={openCandidate} onClose={() => setOpenCandidate(null)} />
      </LockedFeature>
    </div>
  );
}
