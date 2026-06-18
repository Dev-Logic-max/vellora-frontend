"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ListChecks, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateGroup,
  useCreateTask,
  useReorderTasks,
  useTaskGroups,
} from "@/features/onboarding/onboarding";
import { STAGE_LABELS, type OnboardingTask } from "@/features/onboarding/types";

const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }));

function SortableTask({ task }: { task: OnboardingTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-sm"
      data-dragging={isDragging}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="text-foreground">{task.title}</span>
    </li>
  );
}

export function TasksPanel({ canManage }: { canManage: boolean }) {
  const { data: groups, isLoading } = useTaskGroups();
  const createGroup = useCreateGroup();
  const createTask = useCreateTask();
  const reorder = useReorderTasks();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const [groupName, setGroupName] = useState("");
  const [stage, setStage] = useState("pre_start");
  const [taskTitles, setTaskTitles] = useState<Record<string, string>>({});
  // Optimistic order per group; falls back to server order until a drag happens.
  const [overrides, setOverrides] = useState<Record<string, OnboardingTask[]>>({});

  const tasksFor = (groupId: string, serverTasks: OnboardingTask[]) =>
    overrides[groupId] ?? serverTasks;

  const onDragEnd = (groupId: string, serverTasks: OnboardingTask[]) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = tasksFor(groupId, serverTasks);
    const oldIndex = items.findIndex((t) => t.id === active.id);
    const newIndex = items.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setOverrides((s) => ({ ...s, [groupId]: next }));
    reorder.mutate(next.map((t, i) => ({ id: t.id, groupId, sortOrder: i })));
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="space-y-5">
      {canManage ? (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
          <FormField
            id="group-name"
            label="New stage group"
            className="w-52"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Paperwork"
          />
          <SelectField
            id="group-stage"
            label="Stage"
            className="w-40"
            options={STAGE_OPTIONS}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />
          <Button
            disabled={!groupName || createGroup.isPending}
            onClick={() =>
              void createGroup.mutateAsync({ name: groupName, stage }).then(() => setGroupName(""))
            }
          >
            <Plus className="size-4" />
            Add group
          </Button>
        </div>
      ) : null}

      {!groups?.length ? (
        <EmptyState
          icon={ListChecks}
          title="No checklist yet"
          description="Create stage groups and tasks to build your onboarding template."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl border border-border bg-surface-subtle p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">{STAGE_LABELS[group.stage]}</p>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd(group.id, group.tasks)}
              >
                <SortableContext
                  items={tasksFor(group.id, group.tasks).map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {tasksFor(group.id, group.tasks).map((task) => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>

              {canManage ? (
                <div className="mt-3 flex gap-2">
                  <FormField
                    id={`task-${group.id}`}
                    label=""
                    className="flex-1"
                    placeholder="Add a task…"
                    value={taskTitles[group.id] ?? ""}
                    onChange={(e) =>
                      setTaskTitles((s) => ({ ...s, [group.id]: e.target.value }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="mt-0 self-end"
                    disabled={!taskTitles[group.id] || createTask.isPending}
                    onClick={() =>
                      void createTask
                        .mutateAsync({ groupId: group.id, title: taskTitles[group.id] })
                        .then(() => setTaskTitles((s) => ({ ...s, [group.id]: "" })))
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
