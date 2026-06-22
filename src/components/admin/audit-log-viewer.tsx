"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ScrollText } from "lucide-react";
import { useState } from "react";

import { useAuditLog } from "@/features/admin/admin";
import type { PlatformAuditEntry } from "@/features/admin/types";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";

export function AuditLogViewer() {
  const { data, isLoading } = useAuditLog();
  const [filter, setFilter] = useState("");

  const rows = (data ?? []).filter(
    (e) => !filter || e.action.toLowerCase().includes(filter.toLowerCase()),
  );

  const columns: ColumnDef<PlatformAuditEntry, unknown>[] = [
    {
      header: "When",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      header: "Action",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.action}</span>,
    },
    {
      header: "Target company",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.targetCompanyId?.slice(0, 8) ?? "—"}</span>
      ),
    },
    {
      header: "Actor",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.actorUserId.slice(0, 8)}</span>,
    },
  ];

  return (
    <DataTableShell
      columns={columns}
      data={rows}
      isLoading={isLoading}
      toolbar={{
        searchValue: filter,
        onSearchChange: setFilter,
        searchPlaceholder: "Filter by action…",
      }}
      empty={<EmptyState icon={ScrollText} title="No audit entries" />}
    />
  );
}
