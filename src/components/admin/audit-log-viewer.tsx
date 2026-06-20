"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ScrollText } from "lucide-react";
import { useState } from "react";

import { useAuditLog } from "@/features/admin/admin";
import type { PlatformAuditEntry } from "@/features/admin/types";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";

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
    <div className="space-y-3">
      <FormField
        id="audit-filter"
        label=""
        className="max-w-xs"
        placeholder="Filter by action…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <DataTableShell
        columns={columns}
        data={rows}
        isLoading={isLoading}
        empty={<EmptyState icon={ScrollText} title="No audit entries" />}
      />
    </div>
  );
}
