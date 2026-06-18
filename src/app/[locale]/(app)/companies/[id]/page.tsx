"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Store as StoreIcon, Users } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Link } from "@/i18n/navigation";
import { useCompany, useCompanyUsage, useUpdateCompany } from "@/features/org/companies";
import type { Company } from "@/features/org/types";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading } = useCompany(id);
  const { data: usage } = useCompanyUsage(id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!company) return <p className="text-sm text-destructive">Company not found.</p>;

  return (
    <div className="space-y-6">
      <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground">
        ← Companies
      </Link>
      <PageHeader
        title={company.name}
        description={`${company.country} · ${company.currency} · ${company.timezone}`}
        actions={<StatusPill status={company.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiTile label="Stores" value={String(usage?.stores ?? "—")} icon={StoreIcon} />
        <KpiTile label="Members" value={String(usage?.members ?? "—")} icon={Users} />
        <KpiTile label="Group" value={company.groupId ? "Linked" : "None"} icon={Building2} />
      </div>

      <CompanyEditForm key={company.id} company={company} />
    </div>
  );
}

function CompanyEditForm({ company }: { company: Company }) {
  const updateCompany = useUpdateCompany(company.id);
  const [name, setName] = useState(company.name);
  const [timezone, setTimezone] = useState(company.timezone);

  return (
    <section className="max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold text-foreground">Company details</h2>
      <div className="mt-4 space-y-4">
        <FormField id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <FormField
          id="timezone"
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
        <Button
          onClick={() => updateCompany.mutate({ name, timezone })}
          disabled={updateCompany.isPending}
        >
          {updateCompany.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </section>
  );
}
