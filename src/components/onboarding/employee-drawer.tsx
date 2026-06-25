"use client";

import { Bell, Check, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STAGE_LABELS } from "@/features/onboarding/types";
import { useAssign, useAssignments, useSetAssignment } from "@/features/onboarding/onboarding";

export function EmployeeDrawer({
  employeeId,
  name,
  open,
  onOpenChange,
}: {
  employeeId: string | null;
  name: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: assignments, isLoading } = useAssignments(employeeId ?? "");
  const setStatus = useSetAssignment();
  const assign = useAssign();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{name}</SheetTitle>
          <SheetDescription>Onboarding checklist</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!employeeId || assign.isPending}
              onClick={() =>
                employeeId &&
                assign.mutate({ employeeIds: [employeeId], onlyMissing: true })
              }
            >
              Assign missing
            </Button>
            <Button variant="outline" size="sm" disabled title="Notifications land in Phase 6">
              <Bell className="size-4" />
              Send reminder
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : !assignments?.length ? (
            <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => {
                const done = a.status === "done";
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
                  >
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          done ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {a.task?.title ?? "Task"}
                      </p>
                      {a.task?.group ? (
                        <p className="text-xs text-muted-foreground">
                          {STAGE_LABELS[a.task.group.stage]}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant={done ? "ghost" : "outline"}
                      size="icon-sm"
                      disabled={setStatus.isPending}
                      onClick={() =>
                        setStatus.mutate({ id: a.id, status: done ? "pending" : "done" })
                      }
                      title={done ? "Reset" : "Mark done"}
                    >
                      {done ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
