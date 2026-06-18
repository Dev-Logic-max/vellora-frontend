"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttachCompany,
  useCreateGroup,
  useGroupCompanies,
  useGroups,
} from "@/features/org/groups";
import type { Company, Group } from "@/features/org/types";

export function GroupsPanel({ companies }: { companies: Company[] }) {
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const [name, setName] = useState("");

  const add = async () => {
    if (name.trim().length < 2) return;
    await createGroup.mutateAsync({ name: name.trim() });
    setName("");
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold text-foreground">Groups</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Organize companies you own under a parent group.
      </p>

      <div className="mt-4 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New group name"
          className="h-9"
        />
        <Button onClick={add} disabled={createGroup.isPending}>
          <Plus />
          Add
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <Skeleton className="h-12 w-full" />}
        {groups?.length === 0 && (
          <p className="text-sm text-muted-foreground">No groups yet.</p>
        )}
        {groups?.map((group) => (
          <GroupRow key={group.id} group={group} companies={companies} />
        ))}
      </div>
    </section>
  );
}

function GroupRow({ group, companies }: { group: Group; companies: Company[] }) {
  const { data: members } = useGroupCompanies(group.id);
  const attach = useAttachCompany(group.id);
  const [selected, setSelected] = useState("");

  const attachable = companies.filter(
    (c) => c.role === "owner" && c.groupId !== group.id,
  );

  return (
    <div className="rounded-lg border border-border px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{group.name}</span>
        <span className="text-xs text-muted-foreground capitalize">
          {group.billingMode.replace(/_/g, " ")}
        </span>
      </div>
      {members && members.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          {members.map((m) => m.name).join(", ")}
        </p>
      )}
      {attachable.length > 0 && (
        <div className="mt-2 flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
          >
            <option value="">Attach a company…</option>
            {attachable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={!selected || attach.isPending}
            onClick={async () => {
              await attach.mutateAsync(selected);
              setSelected("");
            }}
          >
            Attach
          </Button>
        </div>
      )}
    </div>
  );
}
