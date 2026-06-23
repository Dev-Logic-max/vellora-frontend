"use client";

import { useState } from "react";
import { AlertTriangle, Archive, Building2, Check, Store as StoreIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { cn } from "@/lib/utils";
import { useArchiveEmployee, useDeleteEmployee } from "@/features/employees/employees";
import { useCompanies } from "@/features/org/companies";
import { useStores } from "@/features/org/stores";
import type { Employee } from "@/features/employees/types";
import type { MembershipRole } from "@/features/session/types";

type Mode = "deactivate" | "delete";

/**
 * Rich employee removal modal (P4): choose Deactivate (default, reversible) or
 * Permanently delete (irreversible). Surfaces the employee's company + store so
 * the admin knows exactly who they're acting on.
 */
export function EmployeeDeleteModal({
  employee,
  open,
  onOpenChange,
  onDone,
}: {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("deactivate");
  const archive = useArchiveEmployee();
  const del = useDeleteEmployee();
  const { data: companies } = useCompanies();
  const { data: stores } = useStores();

  const company = companies?.find((c) => c.id === employee.companyId);
  const store = stores?.find((s) => s.id === employee.primaryStoreId);
  const busy = archive.isPending || del.isPending;
  const name = `${employee.firstName} ${employee.lastName}`.trim();

  const confirm = async () => {
    try {
      if (mode === "deactivate") {
        await archive.mutateAsync(employee.id);
        toast.success("Employee deactivated");
      } else {
        await del.mutateAsync(employee.id);
        toast.success("Employee permanently deleted");
      }
      onOpenChange(false);
      onDone?.();
    } catch {
      toast.error(mode === "deactivate" ? "Couldn't deactivate" : "Couldn't delete");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* Header — danger-tinted. */}
        <div className="flex items-start gap-3 border-b border-border bg-linear-to-br from-destructive/10 via-surface to-surface px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Remove employee</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose how to remove this person from the directory.
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Who — avatar + name + role + company/store. */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-subtle/50 p-3">
            <EntityAvatar name={name} src={employee.avatarUrl} className="size-11 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {employee.uniqueCode}
              </p>
            </div>
            {employee.membershipRole && employee.membershipRole !== "owner" ? (
              <RoleTag role={employee.membershipRole as MembershipRole} />
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DetailChip icon={Building2} label="Company" value={company?.name ?? "—"} />
            <DetailChip icon={StoreIcon} label="Store" value={store?.name ?? "—"} />
          </div>

          {/* Mode choice. */}
          <div className="space-y-2">
            <ModeOption
              active={mode === "deactivate"}
              onClick={() => setMode("deactivate")}
              icon={Archive}
              title="Deactivate"
              desc="Archive the record and revoke portal access. Reversible — reactivate anytime."
              tone="accent"
            />
            <ModeOption
              active={mode === "delete"}
              onClick={() => setMode("delete")}
              icon={Trash2}
              title="Permanently delete"
              desc="Erase the employee and all their data. This cannot be undone."
              tone="danger"
            />
          </div>
        </div>

        {/* Footer. */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={mode === "delete" ? "destructive" : "default"}
            onClick={confirm}
            disabled={busy}
          >
            {busy
              ? "Working…"
              : mode === "delete"
                ? "Delete permanently"
                : "Deactivate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ModeOption({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Archive;
  title: string;
  desc: string;
  tone: "accent" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors",
        active
          ? tone === "danger"
            ? "border-destructive bg-destructive/5"
            : "border-primary bg-accent-soft"
          : "border-border bg-surface hover:border-foreground/20",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          tone === "danger" ? "bg-destructive/15 text-destructive" : "bg-accent-soft text-primary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {title}
          {active ? <Check className="size-3.5 text-primary" /> : null}
        </p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
