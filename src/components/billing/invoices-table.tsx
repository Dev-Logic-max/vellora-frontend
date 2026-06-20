"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, Receipt } from "lucide-react";

import { useInvoiceDownload, useInvoices } from "@/features/billing/billing";
import type { Invoice } from "@/features/billing/types";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";

function formatAmount(amount: number, currency: string): string {
  // Stripe amounts are in the smallest currency unit (cents).
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function InvoicesTable() {
  const { data, isLoading } = useInvoices();
  const download = useInvoiceDownload();

  const columns: ColumnDef<Invoice, unknown>[] = [
    {
      header: "Date",
      cell: ({ row }) =>
        row.original.issuedAt ? new Date(row.original.issuedAt).toLocaleDateString() : "—",
    },
    {
      header: "Invoice",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.number ?? row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: ({ row }) => <StatusPill status={row.original.status} />,
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Download invoice"
          disabled={download.isPending}
          onClick={() => download.mutate(row.original.id)}
        >
          <Download className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTableShell
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      empty={
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices appear here once your subscription bills."
        />
      }
    />
  );
}
