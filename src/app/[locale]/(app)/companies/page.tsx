"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";

import { CompaniesTable } from "@/components/companies/companies-table";
import { CompanyCard } from "@/components/companies/company-card";
import { CompanyCreateSheet } from "@/components/companies/company-create-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ListToolbar, type ListView } from "@/components/ui/list-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilterValues } from "@/components/ui/filter-modal";
import { useCompanies } from "@/features/org/companies";

const VIEW_KEY = "vellora:companies-view";
/** Show the filter control only once there's enough data to warrant it. */
const FILTER_THRESHOLD = 8;

function initialView(): ListView {
  if (typeof window === "undefined") return "cards";
  return window.localStorage.getItem(VIEW_KEY) === "table" ? "table" : "cards";
}

export default function CompaniesPage() {
  const { data, isLoading, isError } = useCompanies();
  const [view, setView] = useState<ListView>(initialView);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});

  const changeView = (v: ListView) => {
    setView(v);
    window.localStorage.setItem(VIEW_KEY, v);
  };

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((c) => {
      if (filters.status && c.status !== filters.status) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.ownerName ?? "").toLowerCase().includes(q) ||
        (c.country ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, filters]);

  const total = data?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="The tenants you belong to."
        actions={<CompanyCreateSheet />}
      />

      {isLoading && <Skeleton className="h-48 w-full" />}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load companies.</p>}

      {data && data.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Create your first company to get started."
          action={<CompanyCreateSheet />}
        />
      )}

      {data && data.length > 0 && (
        <>
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search company, owner, or country…"
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
                ],
              },
            ]}
            filterValues={filters}
            onFilterChange={setFilters}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No matches"
              description="No companies match your search or filters."
            />
          ) : view === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
              {filtered.map((c) => (
                <CompanyCard key={c.id} company={c} />
              ))}
            </div>
          ) : (
            <CompaniesTable companies={filtered} />
          )}
        </>
      )}
    </div>
  );
}
