"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Candidate } from "@/features/recruiting/types";
import { cn } from "@/lib/utils";

function scoreColor(score: number): string {
  if (score >= 70) return "bg-success-soft text-success";
  if (score >= 40) return "bg-warning-soft text-warning";
  return "bg-danger-soft text-danger";
}

export function CandidateCard({
  candidate,
  onOpen,
}: {
  candidate: Candidate;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onOpen(candidate.id)}
      {...attributes}
      {...listeners}
      className={cn(
        "w-full cursor-grab rounded-lg bg-card p-3 text-left ring-1 ring-foreground/10 transition-shadow hover:shadow-sm active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{candidate.name}</span>
        {typeof candidate.score === "number" ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
              scoreColor(candidate.score),
            )}
          >
            {candidate.score}
          </span>
        ) : null}
      </div>
      {candidate.job?.title ? (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{candidate.job.title}</p>
      ) : null}
    </button>
  );
}
