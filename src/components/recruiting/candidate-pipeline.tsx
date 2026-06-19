"use client";

import {
  DndContext,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Users } from "lucide-react";
import { useState } from "react";

import { useCandidates, useMoveCandidate } from "@/features/recruiting/recruiting";
import { STAGE_LABELS, STAGE_ORDER, type Candidate, type CandidateStage } from "@/features/recruiting/types";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateCard } from "./candidate-card";

function Column({
  stage,
  candidates,
  onOpen,
}: {
  stage: CandidateStage;
  candidates: Candidate[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl bg-surface-subtle p-2">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {STAGE_LABELS[stage]}
        </span>
        <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
          {candidates.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-lg p-1 transition-colors ${isOver ? "bg-accent-soft/50" : ""}`}
      >
        <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} onOpen={onOpen} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function CandidatePipeline({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, isLoading } = useCandidates();
  const move = useMoveCandidate();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  // Optimistic stage overrides keyed by candidate id.
  const [overrides, setOverrides] = useState<Record<string, CandidateStage>>({});

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (!data?.length) {
    return (
      <EmptyState
        icon={Users}
        title="No candidates yet"
        description="Applications submitted through your careers site land here."
      />
    );
  }

  const stageOf = (c: Candidate): CandidateStage => overrides[c.id] ?? c.stage;
  const byStage = (stage: CandidateStage) => data.filter((c) => stageOf(c) === stage);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const candidateId = String(active.id);
    // `over.id` is either a column id (stage) or another card id.
    const overStage = STAGE_ORDER.includes(over.id as CandidateStage)
      ? (over.id as CandidateStage)
      : data.find((c) => c.id === over.id)
        ? stageOf(data.find((c) => c.id === over.id)!)
        : null;
    if (!overStage) return;
    const current = stageOf(data.find((c) => c.id === candidateId)!);
    if (current === overStage) return;
    setOverrides((s) => ({ ...s, [candidateId]: overStage }));
    move.mutate({ id: candidateId, stage: overStage });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGE_ORDER.map((stage) => (
          <Column key={stage} stage={stage} candidates={byStage(stage)} onOpen={onOpen} />
        ))}
      </div>
    </DndContext>
  );
}
