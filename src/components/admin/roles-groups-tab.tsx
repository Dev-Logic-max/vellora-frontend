"use client";

import { useState } from "react";
import { Layers, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Input } from "@/components/ui/input";
import { RichSelect, type RichOption } from "@/components/ui/rich-select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/features/org/companies";
import {
  useAttachCompany,
  useCreateGroup,
  useDetachCompany,
  useGroupCompanies,
  useGroups,
} from "@/features/org/groups";
import { PLATFORM_ROLES_META, TENANT_ROLES } from "@/features/permissions/roles";
import type { Company, Group } from "@/features/org/types";

/**
 * Admin → Roles & Groups. Shows the platform → tenant role hierarchy (colored)
 * and lets platform operators manage company groups (create + attach companies).
 * Groups were moved here out of the Companies module.
 */
export function RolesGroupsTab() {
  return (
    <div className="space-y-8">
      <RoleHierarchy />
      <GroupsManager />
    </div>
  );
}

// ── Role hierarchy ───────────────────────────────────────────────────────────
function RoleHierarchy() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-accent-strong" />
        <h2 className="font-display text-base font-semibold text-foreground">Role hierarchy</h2>
        <span className="text-xs text-muted-foreground">
          · Fixed role colors — consistent everywhere in the platform.
        </span>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        {/* Platform plane — full names, no icons. */}
        <div>
          <p className="mb-2.5 text-xs font-semibold tracking-wide text-foreground-2 uppercase">
            Platform plane
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PLATFORM_ROLES_META.map((r) => (
              <div key={r.key} className={cn("rounded-xl border p-3.5", r.tone)}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: r.dot }} />
                  <p className="text-sm font-semibold">{r.label}</p>
                </div>
                <p className="mt-1.5 text-xs opacity-80">{r.blurb}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company plane — vertical authority rail, full names, no icons. */}
        <div>
          <p className="mb-2.5 text-xs font-semibold tracking-wide text-foreground-2 uppercase">
            Company plane
          </p>
          <ol className="space-y-2">
            {TENANT_ROLES.map((r, i) => (
              <li key={r.key} className="flex items-stretch gap-3">
                <div className="flex flex-col items-center pt-2.5">
                  <span
                    className="size-3 rounded-full ring-4 ring-surface"
                    style={{ backgroundColor: r.dot }}
                  />
                  {i < TENANT_ROLES.length - 1 ? (
                    <span className="w-px flex-1 bg-border" />
                  ) : null}
                </div>
                <div
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl border px-4 py-2.5",
                    r.tone,
                  )}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-surface/70 text-[11px] font-bold tabular-nums">
                    {r.level}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="truncate text-xs opacity-80">{r.blurb}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ── Groups manager (moved from Companies) ────────────────────────────────────
function GroupsManager() {
  const { data: groups, isLoading } = useGroups();
  const { data: companies } = useCompanies();
  const createGroup = useCreateGroup();
  const [name, setName] = useState("");

  const add = async () => {
    if (name.trim().length < 2) return;
    await createGroup.mutateAsync({ name: name.trim() });
    setName("");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-accent-strong" />
        <h2 className="font-display text-base font-semibold text-foreground">Company groups</h2>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Organize companies under a parent group for consolidated management and billing.
        </p>

        <div className="mt-4 flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New group name"
            className="h-9"
            onKeyDown={(e) => e.key === "Enter" && void add()}
          />
          <Button onClick={add} disabled={createGroup.isPending}>
            <Plus />
            Add group
          </Button>
        </div>

        <div className="mt-4 space-y-2.5">
          {isLoading && <Skeleton className="h-16 w-full rounded-lg" />}
          {groups?.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-surface-subtle/40 px-4 py-8 text-center text-sm text-muted-foreground">
              No groups yet. Create one to start grouping companies.
            </p>
          )}
          {groups?.map((group) => (
            <GroupRow key={group.id} group={group} companies={companies ?? []} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GroupRow({ group, companies }: { group: Group; companies: Company[] }) {
  const { data: members } = useGroupCompanies(group.id);
  const attach = useAttachCompany(group.id);
  const detach = useDetachCompany(group.id);
  const [selected, setSelected] = useState<string | undefined>();

  const memberIds = new Set((members ?? []).map((m) => m.id));
  const attachable = companies.filter((c) => !memberIds.has(c.id) && c.groupId !== group.id);
  const options: RichOption[] = attachable.map((c) => ({
    value: c.id,
    title: c.name,
    subtitle: `${c.country} · ${c.currency}`,
    imageUrl: c.logoUrl,
  }));

  return (
    <div className="rounded-xl border border-border bg-surface-subtle/40 p-3.5 transition-shadow hover:shadow-accent-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={group.name} src={group.logoUrl} className="size-9 rounded-lg" />
          <div>
            <p className="text-sm font-semibold text-foreground">{group.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {group.billingMode.replace(/_/g, " ")} ·{" "}
              <span className="tabular-nums">{members?.length ?? 0}</span>{" "}
              {members?.length === 1 ? "company" : "companies"}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-accent/20 bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-strong tabular-nums">
          {members?.length ?? 0}
        </span>
      </div>

      {members && members.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {members.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
            >
              <EntityAvatar name={m.name} src={m.logoUrl} className="size-4 rounded" textClassName="text-[8px]" />
              {m.name}
              <button
                type="button"
                aria-label={`Detach ${m.name}`}
                className="text-muted-foreground hover:text-destructive"
                onClick={() => void detach.mutateAsync(m.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {options.length > 0 ? (
        <div className="mt-3 flex gap-2">
          <RichSelect
            className="flex-1"
            options={options}
            value={selected}
            onChange={setSelected}
            placeholder="Attach a company…"
            allowClear={false}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={!selected || attach.isPending}
            onClick={async () => {
              if (!selected) return;
              await attach.mutateAsync(selected);
              setSelected(undefined);
            }}
          >
            Attach
          </Button>
        </div>
      ) : null}
    </div>
  );
}
