"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { useTenants } from "@/features/admin/admin";
import type { TenantSummary } from "@/features/admin/types";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { ErrorState } from "@/components/ui/error-state";
import { StatusPill } from "@/components/ui/status-pill";

export function TenantsTable({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, isLoading, error, refetch } = useTenants();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((t) => t.name.toLowerCase().includes(q));
  }, [data, search]);

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const columns: ColumnDef<TenantSummary, unknown>[] = [
    {
      header: "Company",
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="flex items-center gap-3 font-medium text-foreground">
          <EntityAvatar name={row.original.name} className="size-8 rounded-lg" />
          {row.original.name}
        </span>
      ),
    },
    {
      header: "Plan",
      cell: ({ row }) => row.original.subscription?.plan?.name ?? "Free",
    },
    {
      header: "Employees",
      cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.employees}</span>,
    },
    {
      header: "Status",
      cell: ({ row }) => <StatusPill status={row.original.status} />,
    },
    {
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <DataTableShell
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      onRowClick={(row) => onOpen(row.id)}
      toolbar={{
        searchValue: search,
        onSearchChange: setSearch,
        searchPlaceholder: "Search companies…",
      }}
    />
  );
}
