"use client";

import { Briefcase, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  useCreateJob,
  useDraftJd,
  useJobs,
  useTogglePublish,
} from "@/features/recruiting/recruiting";
import type { Job } from "@/features/recruiting/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

function JobEditor() {
  const create = useCreateJob();
  const draftJd = useDraftJd();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <Plus className="size-4" />
            New position
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New position</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <FormField id="job-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FormField
            id="job-location"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="job-desc" className="text-[13px] font-medium text-foreground">
                Description
              </label>
              <Button
                variant="ghost"
                size="xs"
                disabled={!title || draftJd.isPending}
                onClick={() =>
                  draftJd.mutate(
                    { title },
                    { onSuccess: ({ text }) => setDescription(text) },
                  )
                }
              >
                <Sparkles className="size-3" />
                Draft with AI
              </Button>
            </div>
            <textarea
              id="job-desc"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
          </div>
          <Button
            className="w-full"
            disabled={!title || create.isPending}
            onClick={() =>
              create.mutate(
                { title, location, description },
                {
                  onSuccess: () => {
                    setOpen(false);
                    setTitle("");
                    setLocation("");
                    setDescription("");
                  },
                },
              )
            }
          >
            Create position
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function JobRow({ job }: { job: Job }) {
  const publish = useTogglePublish();
  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          <Briefcase className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{job.title}</p>
          <p className="text-xs text-muted-foreground">
            {job.location ?? "Any location"} · {job.employmentType.replace(/_/g, " ")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusPill status={job.status} />
        <Button
          variant={job.published ? "outline" : "default"}
          size="sm"
          disabled={publish.isPending}
          onClick={() => publish.mutate({ id: job.id, publish: !job.published })}
        >
          {job.published ? "Unpublish" : "Publish"}
        </Button>
      </div>
    </div>
  );
}

export function JobsPanel() {
  const { data, isLoading, error, refetch } = useJobs();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <JobEditor />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : !data?.length ? (
        <EmptyState
          icon={Briefcase}
          title="No positions yet"
          description="Create a position and publish it to your public careers site."
        />
      ) : (
        <div className="space-y-2">
          {data.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
