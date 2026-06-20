"use client";

import { Flag, Plus } from "lucide-react";
import { useState } from "react";

import { useFlags, useSetFlag } from "@/features/admin/admin";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export function FeatureFlagsPanel() {
  const { data, isLoading } = useFlags();
  const setFlag = useSetFlag();
  const [newKey, setNewKey] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-surface p-4">
        <FormField
          id="new-flag"
          label="New flag key"
          className="w-64"
          placeholder="e.g. beta_dashboard"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <Button
          className="self-end"
          disabled={!newKey || setFlag.isPending}
          onClick={() => setFlag.mutate({ key: newKey, enabled: false }, { onSuccess: () => setNewKey("") })}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : !data?.length ? (
        <EmptyState icon={Flag} title="No feature flags" description="Add a flag to toggle platform features." />
      ) : (
        <div className="space-y-2">
          {data.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div>
                <p className="font-mono text-sm text-foreground">{flag.key}</p>
                {flag.description ? (
                  <p className="text-xs text-muted-foreground">{flag.description}</p>
                ) : null}
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(enabled) => setFlag.mutate({ key: flag.key, enabled })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
