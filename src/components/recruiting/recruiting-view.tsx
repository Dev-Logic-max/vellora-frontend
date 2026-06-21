"use client";

import { useState } from "react";
import { Briefcase, Sparkles, Users } from "lucide-react";

import { LockedFeature } from "@/components/billing/locked-feature";
import { PageHeader } from "@/components/layout/page-header";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { CandidateDrawer } from "./candidate-drawer";
import { CandidatePipeline } from "./candidate-pipeline";
import { InsightsPanel } from "./insights-panel";
import { JobsPanel } from "./jobs-panel";

type RecruitingTab = "candidates" | "positions" | "insights";

const RECRUITING_TABS: SegmentedTab<RecruitingTab>[] = [
  { value: "candidates", label: "Candidates", icon: Users },
  { value: "positions", label: "Positions", icon: Briefcase },
  { value: "insights", label: "Insights", icon: Sparkles },
];

export function RecruitingView() {
  const [tab, setTab] = useState<RecruitingTab>("candidates");
  const [openCandidate, setOpenCandidate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Recruiting" description="Post jobs, run your pipeline, and schedule interviews." />

      <LockedFeature
        feature="recruiting"
        title="Recruiting is a Growth feature"
        description="Upgrade to post jobs, collect applications, and run a hiring pipeline."
      >
        <SegmentedTabs
          tabs={RECRUITING_TABS}
          value={tab}
          onValueChange={setTab}
          layoutGroup="recruiting-tabs"
        />

        <div className="pt-3">
          {tab === "candidates" ? <CandidatePipeline onOpen={setOpenCandidate} /> : null}
          {tab === "positions" ? <JobsPanel /> : null}
          {tab === "insights" ? <InsightsPanel /> : null}
        </div>

        <CandidateDrawer candidateId={openCandidate} onClose={() => setOpenCandidate(null)} />
      </LockedFeature>
    </div>
  );
}
