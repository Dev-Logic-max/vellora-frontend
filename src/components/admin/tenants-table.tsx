"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Eye, Settings2, Store } from "lucide-react";

import type { TenantSummary } from "@/features/admin/types";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Flag } from "@/components/ui/flag";
import { PlanTag } from "@/components/ui/plan-tag";
import { StatusPill } from "@/components/ui/status-pill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "@/i18n/navigation";
import { countryCode, countryName } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";

interface TenantsTableProps {
  data: TenantSummary[];
  isLoading?: boolean;
  /** Open the configuration sheet for a tenant. */
  onConfigure: (id: string) => void;
}

/**
 * Platform tenants — table view (matches the companies table) with two row
 * actions: View (→ the company detail page) and Configure (→ the platform config
 * sheet). Search/filter/view-toggle live in the page's ListToolbar.
 */
export function TenantsTable({ data, isLoading, onConfigure }: TenantsTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<TenantSummary, unknown>[]>(
    () => [
      {
        header: "Company",
        accessorKey: "name",
        // No flag here — the dedicated Country column already shows it.
        cell: ({ row }) => (
          <span className="flex items-center gap-3 font-medium text-foreground">
            <EntityAvatar name={row.original.name} className="size-9 rounded-lg" />
            <span className="truncate">{row.original.name}</span>
          </span>
        ),
      },
      {
        header: "Owner",
        cell: ({ row }) =>
          row.original.ownerName ? (
            <span className="flex items-center gap-2">
              <EntityAvatar
                name={row.original.ownerName}
                src={row.original.ownerAvatarUrl}
                className="size-7 rounded-full"
                textClassName="text-[10px]"
              />
              <span className="truncate text-foreground">{row.original.ownerName}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        header: "Plan",
        cell: ({ row }) => <PlanTag plan={row.original.subscription?.plan?.name} />,
      },
      {
        header: "Stores",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-foreground tabular-nums">
            <Store className="size-3.5 text-muted-foreground" />
            {row.original.stores ?? 0}
          </span>
        ),
      },
      {
        header: "Employees",
        cell: ({ row }) => (
          <AvatarStack items={row.original.employeeAvatars ?? []} total={row.original.employees ?? 0} />
        ),
      },
      {
        header: "Country",
        cell: ({ row }) => {
          const cc = countryCode(row.original.country);
          if (!cc) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Flag code={cc} className="h-3.5 w-5 rounded-[3px]" />
              <span className="text-sm">{countryName(cc) ?? cc}</span>
            </span>
          );
        },
      },
      {
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <ActionIcon
              label="View"
              icon={Eye}
              tone="view"
              onClick={() => router.push(`/companies/${row.original.id}`)}
            />
            <ActionIcon
              label="Configure"
              icon={Settings2}
              tone="edit"
              onClick={() => onConfigure(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [router, onConfigure],
  );

  return <DataTableShell columns={columns} data={data} isLoading={isLoading} />;
}

/** Card view — premium tenant cards (mirrors the companies cards). */
export function TenantsCards({
  data,
  onConfigure,
}: {
  data: TenantSummary[];
  onConfigure: (id: string) => void;
}) {
  const router = useRouter();
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {data.map((t) => {
        const cc = countryCode(t.country);
        return (
          <div
            key={t.id}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <EntityAvatar name={t.name} className="size-11 rounded-xl" textClassName="text-sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-display text-sm font-semibold text-foreground">
                    {t.name}
                  </h3>
                  {cc ? <Flag code={cc} className="h-3 w-4.5 shrink-0 rounded-xs" /> : null}
                </div>
                <PlanTag plan={t.subscription?.plan?.name} className="mt-1" />
              </div>
              <StatusPill status={t.status} />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-foreground-2">
              {t.ownerName ? (
                <>
                  <EntityAvatar
                    name={t.ownerName}
                    src={t.ownerAvatarUrl}
                    className="size-6 rounded-full"
                    textClassName="text-[9px]"
                  />
                  <span className="truncate">{t.ownerName}</span>
                </>
              ) : (
                <span className="text-muted-foreground">No owner</span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-surface-subtle/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Stores</p>
                <p className="font-display text-lg font-semibold tabular-nums">{t.stores ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-subtle/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Employees</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold tabular-nums">
                    {t.employees ?? 0}
                  </span>
                  <AvatarStack items={t.employeeAvatars ?? []} total={t.employees ?? 0} max={3} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/companies/${t.id}`)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onConfigure(t.id)}
                aria-label="Configure"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-strong"
              >
                <Settings2 className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ACTION_TONES = {
  view: "hover:bg-sky-50 hover:text-sky-600",
  edit: "hover:bg-emerald-50 hover:text-emerald-600",
} as const;

function ActionIcon({
  label,
  icon: Icon,
  onClick,
  tone,
}: {
  label: string;
  icon: typeof Eye;
  onClick?: () => void;
  tone: keyof typeof ACTION_TONES;
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
