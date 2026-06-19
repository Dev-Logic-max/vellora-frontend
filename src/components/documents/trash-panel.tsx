"use client";

import { formatDistanceToNow } from "date-fns";
import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePurge, useRestore, useTrash } from "@/features/documents/documents";

/** Soft-deleted documents with restore + permanent-delete (08-documents §8). */
export function TrashPanel() {
  const { data: trash, isLoading } = useTrash();
  const restore = useRestore();
  const purge = usePurge();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!trash || trash.length === 0) {
    return <EmptyState icon={Trash2} title="Trash is empty" description="Deleted files appear here until purged." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {trash.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {entry.snapshot.name ?? "Untitled"}
            </p>
            <p className="text-xs text-muted-foreground">
              Purges {formatDistanceToNow(new Date(entry.purgeAfter), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => restore.mutate(entry.id)}>
              <RotateCcw className="size-3.5" />
              Restore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-danger"
              onClick={() => purge.mutate(entry.id)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
