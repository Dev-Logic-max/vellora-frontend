"use client";

import { createElement, useMemo, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  usePermissionMatrix,
  useUpdatePermissions,
  type PermissionEntry,
} from "@/features/permissions/permissions";
import { groupModules } from "@/features/permissions/modules";
import { MATRIX_ROLES, ROLE_META } from "@/features/permissions/roles";
import type { MembershipRole } from "@/features/session/types";

/**
 * Roles × modules permission grid. Modules are grouped + ordered like the
 * sidebar (group header shows name + module count); role columns share an equal
 * width and a changed cell shows a tick/cross until saved. `companyId` (set only
 * for platform users) edits another tenant's matrix via the admin endpoint.
 */
export function PermissionMatrix({ companyId }: { companyId?: string | null }) {
  const { data, isLoading, isError } = usePermissionMatrix(companyId);
  const update = useUpdatePermissions(companyId);
  const [changes, setChanges] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const keys = data ? Array.from(new Set(data.map((c) => c.resource))) : [];
    return groupModules(keys);
  }, [data]);

  const baseMap = useMemo(() => {
    const map = new Map<string, boolean>();
    data?.forEach((c) => map.set(`${c.role}:${c.resource}`, c.allowed));
    return map;
  }, [data]);

  const baseOf = (role: string, resource: string) =>
    baseMap.get(`${role}:${resource}`) ?? false;
  const valueOf = (role: string, resource: string) => {
    const key = `${role}:${resource}`;
    return key in changes ? changes[key] : baseOf(role, resource);
  };
  const isChanged = (role: string, resource: string) => {
    const key = `${role}:${resource}`;
    return key in changes && changes[key] !== baseOf(role, resource);
  };

  const toggle = (role: string, resource: string, value: boolean) =>
    setChanges((prev) => ({ ...prev, [`${role}:${resource}`]: value }));

  const dirtyCount = useMemo(
    () =>
      Object.keys(changes).filter((k) => {
        const [role, resource] = k.split(":");
        return changes[k] !== baseOf(role, resource);
      }).length,
    [changes, baseMap], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const save = async () => {
    const entries: PermissionEntry[] = Object.entries(changes)
      .filter(([key, allowed]) => {
        const [role, resource] = key.split(":");
        return allowed !== baseOf(role, resource);
      })
      .map(([key, allowed]) => {
        const [role, resource] = key.split(":");
        return { role: role as MembershipRole, resource, allowed };
      });
    if (entries.length === 0) return;
    await update.mutateAsync(entries);
    setChanges({});
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError || !data)
    return <p className="text-sm text-destructive">Couldn&apos;t load permissions.</p>;

  return (
    <div className="space-y-4">
      <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {/* table-fixed + an explicit equal width on every role col = identical
            column widths regardless of header/label length. */}
        <table className="w-full min-w-3xl table-fixed text-sm">
          <colgroup>
            <col className="w-72" />
            {MATRIX_ROLES.map((role) => (
              <col key={role} style={{ width: `${74 / MATRIX_ROLES.length}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="table-header-tint-strong border-b border-accent/20">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-foreground-2 uppercase">
                Module
              </th>
              {MATRIX_ROLES.map((role) => {
                const meta = ROLE_META[role];
                return (
                  <th key={role} className="px-2 py-3 text-center">
                    <span
                      className={cn(
                        "mx-auto inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        meta.tone,
                      )}
                    >
                      {createElement(meta.icon, { className: "size-3.5 shrink-0" })}
                      <span className="truncate">{meta.short}</span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <GroupBlock
                key={group.title}
                group={group}
                valueOf={valueOf}
                isChanged={isChanged}
                toggle={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>

      {dirtyCount > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-accent/30 bg-surface px-4 py-3 shadow-accent-md">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{dirtyCount}</span> unsaved
            change{dirtyCount > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setChanges({})}>
              Discard
            </Button>
            <Button onClick={save} disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupBlock({
  group,
  valueOf,
  isChanged,
  toggle,
}: {
  group: ReturnType<typeof groupModules>[number];
  valueOf: (role: string, resource: string) => boolean;
  isChanged: (role: string, resource: string) => boolean;
  toggle: (role: string, resource: string, value: boolean) => void;
}) {
  return (
    <>
      {/* Group header: name + small block (left), module count (right). */}
      <tr className="table-header-tint border-y border-accent/15">
        <td colSpan={1 + MATRIX_ROLES.length} className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-1 rounded-full bg-accent" />
              <span className="text-xs font-semibold tracking-wide text-foreground-2 uppercase">
                {group.title}
              </span>
            </span>
            <span className="rounded-full border border-accent/20 bg-background px-2 py-0.5 text-xs font-medium text-accent-strong tabular-nums">
              {group.modules.length} {group.modules.length === 1 ? "module" : "modules"}
            </span>
          </div>
        </td>
      </tr>

      {group.modules.map((mod) => (
        <tr
          key={mod.key}
          className="border-b border-border last:border-0 transition-colors hover:bg-surface-subtle"
        >
          <td className="px-4 py-2.5">
            <span className="flex items-center gap-2.5">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                {createElement(mod.icon, { className: "size-4" })}
              </span>
              <span className="font-medium text-foreground">{mod.label}</span>
            </span>
          </td>
          {MATRIX_ROLES.map((role) => {
            const checked = valueOf(role, mod.key);
            const changed = isChanged(role, mod.key);
            const isOwner = role === "owner";
            return (
              <td key={role} className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  <Switch
                    checked={checked}
                    onCheckedChange={(v) => toggle(role, mod.key, v)}
                    disabled={isOwner}
                    aria-label={`${role} ${mod.label}`}
                  />
                  {/* Tick/cross indicator shown only for a pending change. */}
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center transition-opacity",
                      changed ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden={!changed}
                  >
                    {checked ? (
                      <Check className="size-4 text-(--success,var(--chart-2))" />
                    ) : (
                      <X className="size-4 text-destructive" />
                    )}
                  </span>
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
