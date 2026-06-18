"use client";

import { Building2 } from "lucide-react";

import { CompanyCreateSheet } from "@/components/companies/company-create-sheet";
import { GroupsPanel } from "@/components/companies/groups-panel";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Link } from "@/i18n/navigation";
import { useCompanies } from "@/features/org/companies";

export default function CompaniesPage() {
  const { data, isLoading, isError } = useCompanies();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="The tenants you belong to."
        actions={<CompanyCreateSheet />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Locale</th>
                    <th className="px-4 py-3 font-semibold">Your role</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-border last:border-0 hover:bg-surface-subtle"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/companies/${company.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {company.country} · {company.currency}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">
                        {company.role?.replace(/_/g, " ") ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={company.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <GroupsPanel companies={data ?? []} />
      </div>
    </div>
  );
}
