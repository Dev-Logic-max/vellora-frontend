"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Check, Copy, Star, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { CapacityBar } from "@/components/stores/capacity-bar";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Flag } from "@/components/ui/flag";
import { StatusPill } from "@/components/ui/status-pill";
import { useRouter } from "@/i18n/navigation";
import { countryCode } from "@/lib/geo/countries";
import { storeMoney } from "@/lib/store-metrics";
import type { Store } from "@/features/org/types";

/**
 * Stores table — enhanced columns: store (avatar + flag), copyable code, capacity
 * meter, employees stack, mock revenue + profit with up/down arrows, status, and
 * a "Details" action that routes to the store detail page. Search/filter/view live
 * in the page's ListToolbar; this receives already-filtered rows.
 */
export function StoresTable({ stores }: { stores: Store[] }) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<Store, unknown>[]>(
    () => [
      {
        header: "Store",
        accessorKey: "name",
        cell: ({ row }) => {
          const cc = countryCode(row.original.country);
          const loc = [row.original.city, row.original.state].filter(Boolean).join(", ");
          return (
            <span className="flex items-center gap-3 font-medium text-foreground">
              <EntityAvatar
                name={row.original.name}
                src={row.original.logoUrl}
                className="size-9 rounded-lg"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="truncate">{row.original.name}</span>
                  {row.original.headStore ? (
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  ) : null}
                  {cc ? <Flag code={cc} className="h-3 w-4.5 shrink-0 rounded-xs" /> : null}
                </span>
                {loc ? <span className="block truncate text-xs text-muted-foreground">{loc}</span> : null}
              </span>
            </span>
          );
        },
      },
      {
        header: "Code",
        accessorKey: "code",
        cell: ({ row }) =>
          row.original.code ? (
            <CopyCode code={row.original.code} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        header: "Capacity",
        cell: ({ row }) => <CapacityBar used={row.original.employeeCount ?? 0} max={row.original.capacity} />,
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
        header: "Revenue",
        cell: ({ row }) => {
          const m = storeMoney(row.original.id);
          return <Money value={m.revenue} change={m.revenueChange} />;
        },
      },
      {
        header: "Profit",
        cell: ({ row }) => {
          const m = storeMoney(row.original.id);
          return <Money value={m.profit} change={m.profitChange} tone="profit" />;
        },
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
                router.push(`/stores/${row.original.id}`);
              }}
            >
              Details
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
      data={stores}
      onRowClick={(row) => router.push(`/stores/${row.id}`)}
    />
  );
}

/** Mono code — click to copy (copy icon on hover, tick on copy). */
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        toast.success(`Copied ${code}`);
        setTimeout(() => setCopied(false), 1200);
      },
      () => toast.error("Couldn't copy"),
    );
  };
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      title="Click to copy code"
      className="group/code inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-accent-strong"
    >
      {code}
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3 opacity-0 transition-opacity group-hover/code:opacity-70" />
      )}
    </button>
  );
}

/** Money cell with an up/down change badge (mock figures). */
function Money({
  value,
  change,
  tone = "revenue",
}: {
  value: number;
  change: number;
  tone?: "revenue" | "profit";
}) {
  const up = change >= 0;
  return (
    <span className="inline-flex flex-col">
      <span
        className={
          tone === "profit"
            ? "font-semibold text-emerald-600 tabular-nums"
            : "font-semibold text-foreground tabular-nums"
        }
      >
        {storeMoney.format(value)}
      </span>
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${
          up ? "text-emerald-600" : "text-rose-500"
        }`}
      >
        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
        {Math.abs(change)}%
      </span>
    </span>
  );
}
