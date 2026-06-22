"use client";

import { createElement, useMemo, useState } from "react";
import { Check, Lock, Settings2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  usePermissionMatrix,
  useUpdatePermissions,
  type PermissionEntry,
} from "@/features/permissions/permissions";
import { groupModules, type ModuleMeta } from "@/features/permissions/modules";
import { MATRIX_ROLES, ROLE_META } from "@/features/permissions/roles";
import type { MembershipRole } from "@/features/session/types";

/** localStorage key for the platform "locked toggles" config, per company. */
function lockKey(companyId?: string | null) {
  return `vellora:perm-locks:${companyId ?? "self"}`;
}
function readLocks(companyId?: string | null): Set<string> {
  try {
    const raw = localStorage.getItem(lockKey(companyId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * Roles × modules permission grid. Modules are grouped + ordered like the
 * sidebar (group header shows name + module count); role columns share an equal
 * width and a changed cell shows a tick/cross until saved. `companyId` (set only
 * for platform users) edits another tenant's matrix via the admin endpoint.
 * `platform` adds a per-module Action column whose config modal lets a super
 * admin LOCK a role's toggle (renders disabled-off and can't be changed).
 */
export function PermissionMatrix({
  companyId,
  platform = false,
}: {
  companyId?: string | null;
  platform?: boolean;
}) {
  const { data, isLoading, isError } = usePermissionMatrix(companyId);
  const update = useUpdatePermissions(companyId);
  const [changes, setChanges] = useState<Record<string, boolean>>({});
  // Platform-only "locked" toggles: `${role}:${resource}` keys. Persisted locally.
  const [locks, setLocks] = useState<Set<string>>(() =>
    platform ? readLocks(companyId) : new Set(),
  );
  const [configModule, setConfigModule] = useState<ModuleMeta | null>(null);

  const isLocked = (role: string, resource: string) => locks.has(`${role}:${resource}`);
  const persistLocks = (next: Set<string>) => {
    setLocks(new Set(next));
    try {
      localStorage.setItem(lockKey(companyId), JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

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

  const toggle = (role: string, resource: string, value: boolean) => {
    if (isLocked(role, resource)) return; // locked → not togglable
    setChanges((prev) => ({ ...prev, [`${role}:${resource}`]: value }));
  };

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
              <col key={role} style={{ width: `${(platform ? 66 : 74) / MATRIX_ROLES.length}%` }} />
            ))}
            {platform ? <col className="w-20" /> : null}
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
                    {/* Full role name, fixed role color, no icon (per spec). */}
                    <span
                      className={cn(
                        "mx-auto inline-flex max-w-full items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        meta.tone,
                      )}
                    >
                      <span className="truncate">{meta.short}</span>
                    </span>
                  </th>
                );
              })}
              {platform ? (
                <th className="px-2 py-3 text-center text-xs font-semibold tracking-wide text-foreground-2 uppercase">
                  Action
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <GroupBlock
                key={group.title}
                group={group}
                valueOf={valueOf}
                isChanged={isChanged}
                isLocked={isLocked}
                toggle={toggle}
                platform={platform}
                onConfig={setConfigModule}
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

      {/* Platform-only config modal: lock a role's toggle for this module. */}
      <ConfigModal
        module={configModule}
        onClose={() => setConfigModule(null)}
        locks={locks}
        onChange={persistLocks}
      />
    </div>
  );
}

function GroupBlock({
  group,
  valueOf,
  isChanged,
  isLocked,
  toggle,
  platform,
  onConfig,
}: {
  group: ReturnType<typeof groupModules>[number];
  valueOf: (role: string, resource: string) => boolean;
  isChanged: (role: string, resource: string) => boolean;
  isLocked: (role: string, resource: string) => boolean;
  toggle: (role: string, resource: string, value: boolean) => void;
  platform: boolean;
  onConfig: (mod: ModuleMeta) => void;
}) {
  const span = 1 + MATRIX_ROLES.length + (platform ? 1 : 0);
  return (
    <>
      {/* Group header: compact, light fill, dark hairline top + bottom. */}
      <tr className="border-y border-foreground/15 bg-surface-subtle/70">
        <td colSpan={span} className="px-4 py-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-3 w-1 rounded-full bg-accent" />
              <span className="text-[11px] font-semibold tracking-wide text-foreground-2 uppercase">
                {group.title}
              </span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
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
            const locked = isLocked(role, mod.key);
            // A locked toggle reads OFF + disabled (config decision wins).
            const checked = locked ? false : valueOf(role, mod.key);
            const changed = !locked && isChanged(role, mod.key);
            const isOwner = role === "owner";
            return (
              <td key={role} className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  <Switch
                    checked={checked}
                    onCheckedChange={(v) => toggle(role, mod.key, v)}
                    disabled={isOwner || locked}
                    aria-label={`${role} ${mod.label}`}
                  />
                  {locked ? (
                    <Lock className="size-3.5 text-muted-foreground" />
                  ) : (
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
                  )}
                </div>
              </td>
            );
          })}
          {platform ? (
            <td className="px-2 py-2.5 text-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => onConfig(mod)}
                      aria-label={`Configure ${mod.label}`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong"
                    >
                      <Settings2 className="size-4" />
                    </button>
                  }
                />
                <TooltipContent side="top">Configure access</TooltipContent>
              </Tooltip>
            </td>
          ) : null}
        </tr>
      ))}
    </>
  );
}

/** Super-admin config: lock individual role toggles for a module so they render
 * disabled-off and can't be changed in the matrix. (More config to come.) */
function ConfigModal({
  module,
  onClose,
  locks,
  onChange,
}: {
  module: ModuleMeta | null;
  onClose: () => void;
  locks: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  if (!module) return null;
  const toggleLock = (role: MembershipRole, on: boolean) => {
    const next = new Set(locks);
    const key = `${role}:${module.key}`;
    if (on) next.add(key);
    else next.delete(key);
    onChange(next);
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {createElement(module.icon, { className: "size-4 text-accent-strong" })}
            Configure “{module.label}”
          </DialogTitle>
          <DialogDescription>
            Lock a role’s access toggle. A locked role shows as disabled (off) in the matrix and
            can’t be changed. Platform-only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {MATRIX_ROLES.filter((r) => r !== "owner").map((role) => {
            const meta = ROLE_META[role];
            const locked = locks.has(`${role}:${module.key}`);
            return (
              <div
                key={role}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    meta.tone,
                  )}
                >
                  {meta.short}
                </span>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{locked ? "Locked" : "Editable"}</span>
                  <Switch
                    checked={locked}
                    onCheckedChange={(v) => toggleLock(role, v)}
                    aria-label={`Lock ${role}`}
                  />
                </label>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
