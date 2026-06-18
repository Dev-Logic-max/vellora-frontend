"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { MembershipRole } from "@/features/session/types";
import {
  usePermissionMatrix,
  useUpdatePermissions,
  type PermissionEntry,
} from "@/features/org/permissions";

const ROLES: MembershipRole[] = ["owner", "hr", "area_manager", "store_manager", "employee"];
const label = (value: string) => value.replace(/_/g, " ");

export function PermissionMatrix() {
  const { data, isLoading, isError } = usePermissionMatrix();
  const update = useUpdatePermissions();
  const [changes, setChanges] = useState<Record<string, boolean>>({});

  const modules = useMemo(
    () => (data ? Array.from(new Set(data.map((c) => c.resource))) : []),
    [data],
  );
  const baseMap = useMemo(() => {
    const map = new Map<string, boolean>();
    data?.forEach((c) => map.set(`${c.role}:${c.resource}`, c.allowed));
    return map;
  }, [data]);

  const valueOf = (role: string, resource: string) => {
    const key = `${role}:${resource}`;
    return key in changes ? changes[key] : (baseMap.get(key) ?? false);
  };
  const toggle = (role: string, resource: string, value: boolean) =>
    setChanges((prev) => ({ ...prev, [`${role}:${resource}`]: value }));

  const dirtyCount = Object.keys(changes).length;

  const save = async () => {
    const entries: PermissionEntry[] = Object.entries(changes).map(([key, allowed]) => {
      const [role, resource] = key.split(":");
      return { role: role as MembershipRole, resource, allowed };
    });
    await update.mutateAsync(entries);
    setChanges({});
  };

  if (isLoading) return <Skeleton className="h-72 w-full" />;
  if (isError || !data) return <p className="text-sm text-destructive">Couldn&apos;t load permissions.</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Module
              </th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground capitalize"
                >
                  {label(role)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((moduleKey) => (
              <tr key={moduleKey} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                <td className="px-4 py-2.5 font-medium capitalize">{moduleKey}</td>
                {ROLES.map((role) => (
                  <td key={role} className="px-4 py-2.5">
                    <div className="flex justify-center">
                      <Switch
                        checked={valueOf(role, moduleKey)}
                        onCheckedChange={(value) => toggle(role, moduleKey, value)}
                        disabled={role === "owner"}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dirtyCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 shadow-sm">
          <span className="text-sm text-muted-foreground">
            {dirtyCount} unsaved change{dirtyCount > 1 ? "s" : ""}
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
