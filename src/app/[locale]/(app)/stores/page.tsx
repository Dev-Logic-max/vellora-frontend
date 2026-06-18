"use client";

import { Store as StoreIcon } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/layout/page-header";
import { CapacityBar } from "@/components/stores/capacity-bar";
import { StoreCreateSheet } from "@/components/stores/store-create-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Link } from "@/i18n/navigation";
import { useStores } from "@/features/org/stores";

export default function StoresPage() {
  const { data, isLoading, isError } = useStores();

  const active = data?.filter((s) => s.status === "active").length ?? 0;
  const totalCapacity = data?.reduce((sum, s) => sum + s.capacity, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stores"
        description="Locations under your active company."
        actions={<StoreCreateSheet />}
      />

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiTile label="Active stores" value={String(active)} icon={StoreIcon} />
          <KpiTile label="Total capacity" value={String(totalCapacity)} />
          <KpiTile label="Avg utilization" value="0%" />
        </div>
      )}

      {isLoading && <Skeleton className="h-48 w-full" />}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load stores.</p>}
      {data && data.length === 0 && (
        <EmptyState
          icon={StoreIcon}
          title="No stores yet"
          description="Add your first store to start scheduling and attendance."
          action={<StoreCreateSheet />}
        />
      )}
      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3 font-semibold">Store</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Capacity</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((store) => (
                <tr key={store.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/stores/${store.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {store.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {store.code ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <CapacityBar used={0} max={store.capacity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={store.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
