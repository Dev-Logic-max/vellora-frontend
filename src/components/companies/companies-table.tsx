"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Flag } from "@/components/ui/flag";
import { PlanTag } from "@/components/ui/plan-tag";
import { RoleTag } from "@/components/ui/role-tag";
import { StatusPill } from "@/components/ui/status-pill";
import { useRouter } from "@/i18n/navigation";
import { countryCode } from "@/lib/geo/countries";
import type { Company } from "@/features/org/types";
import type { MembershipRole } from "@/features/session/types";

/**
 * Companies table view. Search/filter/view-toggle live in the page's ListToolbar;
 * this receives already-filtered rows. The row action is a single "Open" button
 * that routes to the company detail page (edit/configure/deactivate live there).
 */
export function CompaniesTable({ companies }: { companies: Company[] }) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<Company, unknown>[]>(
    () => [
      {
        header: "Company",
        accessorKey: "name",
        cell: ({ row }) => {
          const cc = countryCode(row.original.country);
          return (
            <span className="flex items-center gap-3 font-medium text-foreground">
              <EntityAvatar
                name={row.original.name}
                src={row.original.logoUrl}
                className="size-9 rounded-lg"
              />
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate">{row.original.name}</span>
                {cc ? <Flag code={cc} className="h-3 w-4.5 shrink-0 rounded-xs" /> : null}
              </span>
            </span>
          );
        },
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
        header: "Role",
        cell: ({ row }) =>
          row.original.role ? (
            <RoleTag role={row.original.role as MembershipRole} />
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
          <AvatarStack
            items={row.original.employeeAvatars ?? []}
            total={row.original.employeeCount ?? 0}
          />
        ),
      },
      {
        header: "Plan",
        cell: ({ row }) => <PlanTag plan={row.original.planName} />,
      },
      {
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/companies/${row.original.id}`);
              }}
            >
              Open
              <ArrowRight />
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

  return (
    <DataTableShell
      columns={columns}
      data={companies}
      onRowClick={(row) => router.push(`/companies/${row.id}`)}
    />
  );
}
