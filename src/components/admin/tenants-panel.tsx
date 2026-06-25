"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListToolbar, type ListView } from "@/components/ui/list-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilterValues } from "@/components/ui/filter-modal";
import { useTenants } from "@/features/admin/admin";
import { TenantDrawer } from "./tenant-drawer";
import { TenantsCards, TenantsTable } from "./tenants-table";

const VIEW_KEY = "vellora:admin-tenants-view";
const FILTER_THRESHOLD = 8;

function initialView(): ListView {
  if (typeof window === "undefined") return "table";
  return window.localStorage.getItem(VIEW_KEY) === "cards" ? "cards" : "table";
}

/** Admin → Tenants. Section toolbar (search + view toggle), cards/table views,
 * and the platform configuration sheet. View defaults to TABLE (platform power
 * users live in the table); cards are available too. */
export function TenantsPanel() {
  const { data, isLoading, error, refetch } = useTenants();
  const [view, setView] = useState<ListView>(initialView);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [configId, setConfigId] = useState<string | null>(null);

  const changeView = (v: ListView) => {
    setView(v);
    window.localStorage.setItem(VIEW_KEY, v);
  };

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.ownerName ?? "").toLowerCase().includes(q) ||
        (t.country ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, filters]);

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search company, owner, or country…"
        view={view}
        onViewChange={changeView}
        showFilter={(data?.length ?? 0) > FILTER_THRESHOLD}
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
              { value: "inactive", label: "Inactive" },
              { value: "deleted", label: "Deleted" },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={setFilters}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No tenants" description="No companies match your search." />
      ) : view === "cards" ? (
        <TenantsCards data={filtered} onConfigure={setConfigId} />
      ) : (
        <TenantsTable data={filtered} onConfigure={setConfigId} />
      )}

      <TenantDrawer id={configId} onClose={() => setConfigId(null)} />
    </div>
  );
}
