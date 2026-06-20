"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { useTenants } from "@/features/admin/admin";
import type { TenantSummary } from "@/features/admin/types";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { ErrorState } from "@/components/ui/error-state";
import { StatusPill } from "@/components/ui/status-pill";

export function TenantsTable({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, isLoading, error, refetch } = useTenants();

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const columns: ColumnDef<TenantSummary, unknown>[] = [
    { header: "Company", accessorKey: "name" },
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
      data={data ?? []}
      isLoading={isLoading}
      onRowClick={(row) => onOpen(row.id)}
    />
  );
}
