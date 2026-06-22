"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { setActiveCompanyId } from "@/lib/active-company";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/features/org/companies";
import { useGroups } from "@/features/org/groups";
import type { Company } from "@/features/org/types";
import type { CurrentUser } from "@/features/session/types";

const roleLabel = (role?: string) => (role ? role.replace(/_/g, " ") : "Member");

/**
 * Header company block + switcher. Shows the active company (themed avatar +
 * name, group name below only when grouped). Clicking opens a centered modal
 * ONLY when the company is in a group that has other companies the user belongs
 * to; selecting a sibling switches the active company context (the workspace id).
 */
export function CompanySwitcher({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Companies the user belongs to (across tenants) — includes groupId + logo.
  const { data: companies } = useCompanies();
  // Group names for the subline. Tolerate failure (some roles can't list groups).
  const { data: groups } = useGroups();

  const active = useMemo(
    () => companies?.find((c) => c.id === user.companyId),
    [companies, user.companyId],
  );

  // Sibling companies = same group, member of, excluding the active one.
  const siblings = useMemo(() => {
    if (!companies || !active?.groupId) return [];
    return companies.filter((c) => c.groupId === active.groupId && c.id !== active.id);
  }, [companies, active]);

  const groupName = active?.groupId
    ? (groups?.find((g) => g.id === active.groupId)?.name ?? "Group")
    : null;

  if (!user.companyId) return null;

  const label = active?.name ?? "Company";
  const canSwitch = Boolean(active?.groupId) && siblings.length > 0;

  const block = (
    <span className="flex items-center gap-2.5 text-left">
      <EntityAvatar name={label} src={active?.logoUrl} className="size-8 rounded-lg" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="max-w-48 truncate text-sm font-semibold text-foreground">
          {label}
        </span>
        {groupName ? (
          <span className="max-w-48 truncate text-xs text-foreground-2">{groupName}</span>
        ) : null}
      </span>
      {canSwitch && <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />}
    </span>
  );

  // Not in a group (or no siblings the user belongs to) → static block, no modal.
  if (!canSwitch) {
    return (
      <div className="flex items-center rounded-lg bg-linear-to-r from-accent-soft/60 to-transparent px-2.5 py-1.5">
        {block}
      </div>
    );
  }

  const select = (companyId: string) => {
    setActiveCompanyId(companyId);
    setOpen(false);
    // Re-resolve /api/me (new active company) then refetch everything tenant-scoped.
    void queryClient.invalidateQueries();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center rounded-lg bg-linear-to-r from-accent-soft/60 to-transparent px-2.5 py-1.5 transition-[background-color,box-shadow] hover:shadow-accent-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {block}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch company</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {groupName ? `Companies in ${groupName}.` : "Companies you can switch to."}
            </p>
          </DialogHeader>

          <ul className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto">
            {active ? <CompanyRow company={active} role={user.role} isActive /> : null}
            {siblings.map((c) => (
              <CompanyRow key={c.id} company={c} role={c.role} onSwitch={() => select(c.id)} />
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CompanyRow({
  company,
  role,
  isActive,
  onSwitch,
}: {
  company: Company;
  role?: string;
  isActive?: boolean;
  onSwitch?: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        isActive
          ? "border-accent/30 bg-accent-soft/50"
          : "border-border bg-surface hover:bg-surface-subtle",
      )}
    >
      <EntityAvatar name={company.name} src={company.logoUrl} className="size-10 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
        <p className="truncate text-xs text-muted-foreground capitalize">{roleLabel(role)}</p>
      </div>
      {isActive ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
          <Check className="size-3.5" />
          Active
        </span>
      ) : (
        <Button size="sm" variant="outline" onClick={onSwitch}>
          Switch
        </Button>
      )}
    </li>
  );
}
