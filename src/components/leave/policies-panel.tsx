"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveTypes, useUpsertLeaveType } from "@/features/leave/leave";

export function PoliciesPanel({ canManage }: { canManage: boolean }) {
  const { data, isLoading } = useLeaveTypes();
  const upsert = useUpsertLeaveType();
  const [name, setName] = useState("");
  const [paid, setPaid] = useState(true);
  const [chain, setChain] = useState(false);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
          <FormField
            id="type-name"
            label="New leave type"
            className="w-52"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vacation"
          />
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
            Paid
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={chain} onChange={(e) => setChain(e.target.checked)} />
            Multi-step approval
          </label>
          <Button
            disabled={!name || upsert.isPending}
            onClick={() =>
              void upsert
                .mutateAsync({ name, paid, requiresChain: chain })
                .then(() => setName(""))
            }
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      ) : null}

      {!data?.length ? (
        <EmptyState icon={Tags} title="No leave types" description="Define types employees can request." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: t.color }}
                aria-hidden
              />
              <div>
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.paid ? "Paid" : "Unpaid"}
                  {t.requiresChain ? " · multi-step" : ""}
                  {t.maxPerYear ? ` · max ${t.maxPerYear}/yr` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
