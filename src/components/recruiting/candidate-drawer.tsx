"use client";

import { Calendar, FileText, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  useCandidate,
  useResumeUrl,
  useScheduleInterview,
  useScoreCandidate,
} from "@/features/recruiting/recruiting";
import { STAGE_LABELS } from "@/features/recruiting/types";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

export function CandidateDrawer({
  candidateId,
  onClose,
}: {
  candidateId: string | null;
  onClose: () => void;
}) {
  const { data: candidate, isLoading } = useCandidate(candidateId);
  const resume = useResumeUrl();
  const score = useScoreCandidate();
  const schedule = useScheduleInterview();
  const [slot, setSlot] = useState("");

  return (
    <Sheet open={Boolean(candidateId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{candidate?.name ?? "Candidate"}</SheetTitle>
          <SheetDescription>{candidate?.email}</SheetDescription>
        </SheetHeader>

        {isLoading || !candidate ? (
          <div className="space-y-3 px-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-5 px-4 pb-6">
            <div className="flex items-center gap-2">
              <StatusPill status={candidate.stage} />
              <span className="text-xs text-muted-foreground">{STAGE_LABELS[candidate.stage]}</span>
              {typeof candidate.score === "number" ? (
                <span className="ml-auto text-sm tabular-nums text-foreground">
                  Score: {candidate.score}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!candidate.resumeKey || resume.isPending}
                onClick={() => resume.mutate(candidate.id)}
              >
                <FileText className="size-4" />
                Resume
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={score.isPending}
                onClick={() => score.mutate(candidate.id)}
              >
                <Sparkles className="size-4" />
                AI score
              </Button>
            </div>

            {candidate.parsed ? (
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Parsed resume
                </h3>
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs">
                  {JSON.stringify(candidate.parsed, null, 2)}
                </pre>
              </section>
            ) : null}

            {candidate.notes ? (
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Notes
                </h3>
                <p className="mt-1 text-sm text-foreground">{candidate.notes}</p>
              </section>
            ) : null}

            <section className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Schedule interview
              </h3>
              <FormField
                id="interview-slot"
                label=""
                type="datetime-local"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!slot || schedule.isPending}
                onClick={() =>
                  schedule.mutate(
                    {
                      candidateId: candidate.id,
                      scheduledAt: new Date(slot).toISOString(),
                    },
                    { onSuccess: () => setSlot("") },
                  )
                }
              >
                <Calendar className="size-4" />
                Send invite (ICS)
              </Button>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
