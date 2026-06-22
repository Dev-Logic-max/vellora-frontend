"use client";

import { Building2 } from "lucide-react";

import { CompaniesTable } from "@/components/companies/companies-table";
import { CompanyCreateSheet } from "@/components/companies/company-create-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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
      {data && data.length > 0 && <CompaniesTable companies={data} />}
    </div>
  );
}
