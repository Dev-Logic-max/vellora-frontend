"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CapacityBar } from "@/components/stores/capacity-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Link } from "@/i18n/navigation";
import { useCreateActivity, useStore, useStoreActivities } from "@/features/org/stores";

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: store, isLoading } = useStore(id);
  const { data: activities } = useStoreActivities(id);
  const createActivity = useCreateActivity(id);
  const [activityName, setActivityName] = useState("");

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!store) return <p className="text-sm text-destructive">Store not found.</p>;

  const addActivity = async () => {
    if (activityName.trim().length < 1) return;
    await createActivity.mutateAsync({ name: activityName.trim() });
    setActivityName("");
  };

  return (
    <div className="space-y-6">
      <Link href="/stores" className="text-sm text-muted-foreground hover:text-foreground">
        ← Stores
      </Link>
      <PageHeader
        title={store.name}
        description={[store.code, store.category, store.address].filter(Boolean).join(" · ") || store.timezone}
        actions={<StatusPill status={store.status} />}
      />

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Capacity
        </h2>
        <div className="mt-3">
          <CapacityBar used={0} max={store.capacity} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-base font-semibold text-foreground">Activities</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Color-coded tasks that seed shift templates.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="e.g. Window display"
            className="h-9"
          />
          <Button onClick={addActivity} disabled={createActivity.isPending}>
            <Plus />
            Add
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {activities?.length === 0 && (
            <p className="text-sm text-muted-foreground">No activities yet.</p>
          )}
          {activities?.map((activity) => (
            <span
              key={activity.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: activity.color }} />
              {activity.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
