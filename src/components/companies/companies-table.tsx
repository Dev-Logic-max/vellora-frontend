"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Store, Users } from "lucide-react";

import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { CountryFlag } from "@/components/ui/country-flag";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { StatusPill } from "@/components/ui/status-pill";
import { useRouter } from "@/i18n/navigation";
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
  const router = useRouter();
  const [search, setSearch] = useState("");

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
        id: "open",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: () => (
          <span className="inline-flex items-center gap-1 rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong transition-colors group-hover:bg-accent group-hover:text-[var(--accent-foreground,white)]">
            Details
            <ChevronRight className="size-3.5" />
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTableShell
      columns={columns}
      data={filtered}
      onRowClick={(c) => router.push(`/companies/${c.id}`)}
      toolbar={{
        searchValue: search,
        onSearchChange: setSearch,
        searchPlaceholder: "Search company, owner, or country…",
      }}
    />
  );
}
