"use client";

import { useMemo, useState } from "react";
import { Store as StoreIcon } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/layout/page-header";
import { PlanLimitBanner } from "@/components/billing/plan-limit-banner";
import { StoreCard } from "@/components/stores/store-card";
import { StoreCreateSheet } from "@/components/stores/store-create-sheet";
import { StoresTable } from "@/components/stores/stores-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ListToolbar, type ListView } from "@/components/ui/list-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilterValues } from "@/components/ui/filter-modal";
import { useStores } from "@/features/org/stores";

const VIEW_KEY = "vellora:stores-view";
/** Show the filter control only once there are enough stores to warrant it. */
const FILTER_THRESHOLD = 8;

function initialView(): ListView {
  if (typeof window === "undefined") return "cards";
  return window.localStorage.getItem(VIEW_KEY) === "table" ? "table" : "cards";
}

export default function StoresPage() {
  const { data, isLoading, isError } = useStores();
  const [view, setView] = useState<ListView>(initialView);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});

  const changeView = (v: ListView) => {
    setView(v);
    window.localStorage.setItem(VIEW_KEY, v);
  };

  const active = data?.filter((s) => s.status === "active").length ?? 0;
  const totalCapacity = data?.reduce((sum, s) => sum + s.capacity, 0) ?? 0;
  const totalStaff = data?.reduce((sum, s) => sum + (s.employeeCount ?? 0), 0) ?? 0;
  const util = totalCapacity > 0 ? Math.round((totalStaff / totalCapacity) * 100) : 0;

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((s) => {
      if (filters.status && s.status !== filters.status) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.code ?? "").toLowerCase().includes(q) ||
        (s.city ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, filters]);

  const total = data?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stores"
        description="Locations under your active company."
        actions={<StoreCreateSheet />}
      />

      <PlanLimitBanner metric="stores" label="stores" />

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Active stores" value={String(active)} icon={StoreIcon} />
          <KpiTile label="Team members" value={String(totalStaff)} />
          <KpiTile label="Total capacity" value={String(totalCapacity)} />
          <KpiTile label="Avg utilization" value={`${util}%`} />
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
        <>
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search stores by name, code, or city…"
            view={view}
            onViewChange={changeView}
            showFilter={total > FILTER_THRESHOLD}
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "active", label: "Active" },
                  { value: "pending", label: "Pending" },
                  { value: "inactive", label: "Inactive" },
                  { value: "suspended", label: "Suspended" },
                  { value: "archived", label: "Archived" },
                ],
              },
            ]}
            filterValues={filters}
            onFilterChange={setFilters}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={StoreIcon}
              title="No matches"
              description="No stores match your search or filters."
            />
          ) : view === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          ) : (
            <StoresTable stores={filtered} />
          )}
        </>
      )}
    </div>
  );
}
