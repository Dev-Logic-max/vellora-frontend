"use client";

import { useMemo } from "react";

import { RichSelect, type RichOption } from "@/components/ui/rich-select";
import { RoleTag } from "@/components/ui/role-tag";
import type { Company, Store } from "@/features/org/types";
import type { Employee } from "@/features/employees/types";
import type { MembershipRole } from "@/features/session/types";

/** Small muted "N label" count chip rendered on the right of an option. */
function CountChip({ n, label }: { n: number; label: string }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
      {n} {label}
    </span>
  );
}

interface BaseSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** Stores dropdown — avatar + name, company name below, # employees on the right. */
export function StoreSelect({
  stores,
  companies,
  employeeCounts,
  ...rest
}: BaseSelectProps & {
  stores: Store[] | undefined;
  /** Used to resolve the company-name subtitle per store. */
  companies?: Company[];
  /** Optional storeId → employee count (right slot). */
  employeeCounts?: Record<string, number>;
}) {
  const options = useMemo<RichOption[]>(() => {
    const companyName = new Map(companies?.map((c) => [c.id, c.name]));
    return (stores ?? []).map((s) => ({
      value: s.id,
      title: s.name,
      subtitle: companyName.get(s.companyId) ?? s.code ?? undefined,
      trailing:
        employeeCounts?.[s.id] != null ? (
          <CountChip n={employeeCounts[s.id]} label="staff" />
        ) : undefined,
      searchText: `${s.name} ${s.code ?? ""}`,
    }));
  }, [stores, companies, employeeCounts]);

  return <RichSelect options={options} placeholder="Select store" {...rest} />;
}

/** Companies dropdown — avatar + name, # stores on the right. */
export function CompanySelect({
  companies,
  storeCounts,
  ...rest
}: BaseSelectProps & {
  companies: Company[] | undefined;
  /** Optional companyId → store count (right slot). */
  storeCounts?: Record<string, number>;
}) {
  const options = useMemo<RichOption[]>(
    () =>
      (companies ?? []).map((c) => ({
        value: c.id,
        title: c.name,
        imageUrl: c.logoUrl,
        trailing:
          storeCounts?.[c.id] != null ? <CountChip n={storeCounts[c.id]} label="stores" /> : undefined,
      })),
    [companies, storeCounts],
  );

  return <RichSelect options={options} placeholder="Select company" {...rest} />;
}

/** Employees dropdown — avatar + name, role tag (colored) on the right. */
export function EmployeeSelect({
  employees,
  ...rest
}: BaseSelectProps & {
  employees: Employee[] | undefined;
}) {
  const options = useMemo<RichOption[]>(
    () =>
      (employees ?? []).map((e) => {
        const name = `${e.firstName} ${e.lastName}`.trim();
        return {
          value: e.id,
          title: name || e.uniqueCode,
          subtitle: e.email ?? undefined,
          imageUrl: e.avatarUrl,
          trailing: e.role ? <RoleTag role={e.role as MembershipRole} /> : undefined,
          searchText: `${name} ${e.email ?? ""} ${e.uniqueCode}`,
        };
      }),
    [employees],
  );

  return <RichSelect options={options} placeholder="Select employee" {...rest} />;
}
