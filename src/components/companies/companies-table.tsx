"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Store, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CountryFlag } from "@/components/ui/country-flag";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { StatusPill } from "@/components/ui/status-pill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { CompanyEditSheet } from "@/components/companies/company-edit-sheet";
import { useDeactivateCompany } from "@/features/org/companies";
import { useCurrentUser } from "@/features/session/use-current-user";
import type { Company } from "@/features/org/types";
import type { MembershipRole } from "@/features/session/types";

/** Plan chip — themed pill; muted "Free" when no subscription. */
function PlanCell({ plan }: { plan?: string | null }) {
  if (!plan) return <span className="text-muted-foreground">Free</span>;
  return (
    <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-strong">
      {plan}
    </span>
  );
}

export function CompaniesTable({ companies }: { companies: Company[] }) {
  const { data: me } = useCurrentUser();
  const [search, setSearch] = useState("");

  // Only owners / platform users may deactivate a tenant.
  const canManage = me?.role === "owner" || Boolean(me?.platformRole);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ownerName ?? "").toLowerCase().includes(q) ||
        (c.country ?? "").toLowerCase().includes(q),
    );
  }, [companies, search]);

  const columns = useMemo<ColumnDef<Company, unknown>[]>(
    () => [
      {
        header: "Company",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="flex items-center gap-3 font-medium text-foreground">
            <EntityAvatar name={row.original.name} src={row.original.logoUrl} className="size-9 rounded-lg" />
            <span className="truncate">{row.original.name}</span>
          </span>
        ),
      },
      {
        header: "Country",
        cell: ({ row }) => <CountryFlag code={row.original.country} />,
      },
      {
        header: "Owner",
        cell: ({ row }) =>
          row.original.ownerName ? (
            <span className="text-foreground">{row.original.ownerName}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        header: "Stores",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-foreground tabular-nums">
            <Store className="size-3.5 text-muted-foreground" />
            {row.original.storeCount ?? 0}
          </span>
        ),
      },
      {
        header: "Employees",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-foreground tabular-nums">
            <Users className="size-3.5 text-muted-foreground" />
            {row.original.employeeCount ?? 0}
          </span>
        ),
      },
      {
        header: "Billing",
        cell: ({ row }) => <PlanCell plan={row.original.planName} />,
      },
      {
        header: "Your role",
        cell: ({ row }) =>
          row.original.role ? (
            <RoleTag role={row.original.role as MembershipRole} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => <RowActions company={row.original} canManage={canManage} />,
      },
    ],
    [canManage],
  );

  return (
    <DataTableShell
      columns={columns}
      data={filtered}
      toolbar={{
        searchValue: search,
        onSearchChange: setSearch,
        searchPlaceholder: "Search company, owner, or country…",
      }}
    />
  );
}

/** Row action icons: view (→ detail), edit (sheet), deactivate (confirm dialog). */
function RowActions({ company, canManage }: { company: Company; canManage: boolean }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const deactivate = useDeactivateCompany();

  const confirmDelete = async () => {
    setServerError(null);
    try {
      await deactivate.mutateAsync(company.id);
      setRemoveOpen(false);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <ActionIcon
        label="View"
        icon={Eye}
        tone="view"
        onClick={() => router.push(`/companies/${company.id}`)}
      />
      <ActionIcon label="Edit" icon={Pencil} tone="edit" onClick={() => setEditOpen(true)} />
      {/* Controlled by the Edit icon above — no trigger element. */}
      <CompanyEditSheet company={company} open={editOpen} onOpenChange={setEditOpen} />
      {canManage ? (
        <>
          <ActionIcon
            label="Deactivate"
            icon={Trash2}
            tone="delete"
            onClick={() => setRemoveOpen(true)}
          />
          <Dialog open={removeOpen} onOpenChange={(o) => !o && setRemoveOpen(false)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Deactivate {company.name}?</DialogTitle>
                <DialogDescription>
                  This suspends the company and revokes access for its members. You can
                  reactivate it later — tenant data is preserved.
                </DialogDescription>
              </DialogHeader>
              {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoveOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deactivate.isPending}
                >
                  <Trash2 />
                  {deactivate.isPending ? "Deactivating…" : "Deactivate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}

/** Per-action hover tones: view = light blue, edit = green, delete = red. */
const ACTION_TONES = {
  view: "hover:bg-sky-50 hover:text-sky-600",
  edit: "hover:bg-emerald-50 hover:text-emerald-600",
  delete: "hover:bg-red-50 hover:text-red-600",
  accent: "hover:bg-accent-soft hover:text-accent-strong",
} as const;

function ActionIcon({
  label,
  icon: Icon,
  onClick,
  tone = "accent",
}: {
  label: string;
  icon: typeof Eye;
  onClick?: () => void;
  tone?: keyof typeof ACTION_TONES;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            aria-label={label}
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors",
              ACTION_TONES[tone],
            )}
          >
            <Icon className="size-4" />
          </button>
        }
      />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
