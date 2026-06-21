"use client";

import { useSearchParams } from "next/navigation";
import {
  Award,
  CalendarDays,
  CalendarOff,
  Clock,
  FileText,
  ClipboardList,
  Mail,
  Phone,
  Settings,
  UserRound,
} from "lucide-react";

import { CountryFlag } from "@/components/ui/country-flag";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { ContractTab } from "@/components/employees/profile/contract-tab";
import { CredentialsTab } from "@/components/employees/profile/credentials-tab";
import { PreferencesTab } from "@/components/employees/profile/preferences-tab";
import { Link, useRouter } from "@/i18n/navigation";
import { CONTRACT_TYPE_LABEL } from "@/features/employees/constants";
import { useEmployee } from "@/features/employees/employees";
import type { EmployeeDetail, StoreRelation } from "@/features/employees/types";
import type { MembershipRole } from "@/features/session/types";

const TABS: SegmentedTab[] = [
  { value: "profile", label: "Profile", icon: UserRound },
  { value: "contract", label: "Contract", icon: FileText },
  { value: "shifts", label: "Shifts", icon: CalendarDays },
  { value: "leave", label: "Leave", icon: CalendarOff },
  { value: "attendance", label: "Attendance", icon: Clock },
  { value: "onboarding", label: "Onboarding", icon: ClipboardList },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "credentials", label: "Qualifications", icon: Award },
  { value: "preferences", label: "Preferences", icon: Settings },
];

const RELATION_TINT: Record<StoreRelation, string> = {
  secondary: "bg-accent-soft text-accent-strong",
  guest: "bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
  peak: "bg-[var(--chart-4)]/15 text-[var(--chart-4)]",
};

function StubTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-muted-foreground">
      {label} for this employee will appear here once that module is connected.
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

function ProfileDetails({ employee }: { employee: EmployeeDetail }) {
  return (
    <dl className="grid grid-cols-2 gap-5 rounded-xl border border-border bg-surface p-5 sm:grid-cols-3">
      <Detail label="Employee ID" value={<span className="font-mono">{employee.uniqueCode}</span>} />
      <Detail label="Role" value={employee.role} />
      <Detail label="Department" value={employee.department} />
      <Detail label="Primary store" value={employee.primaryStore?.name} />
      <Detail label="Hire date" value={employee.hireDate} />
      <Detail
        label="Contract"
        value={employee.contractType ? CONTRACT_TYPE_LABEL[employee.contractType] : null}
      />
      <Detail label="Locale" value={employee.locale} />
      <Detail label="Timezone" value={employee.timezone} />
      <Detail label="Email" value={employee.email} />
    </dl>
  );
}

export function EmployeeProfile({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "profile";
  const { data: employee, isLoading, isError } = useEmployee(id);

  const setTab = (value: string) => router.replace(`/employees/${id}?tab=${value}`);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !employee)
    return <p className="text-sm text-destructive">Employee not found.</p>;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  // Prefer the employee's own country/nationality; fall back to the locale region.
  const country =
    employee.country ??
    employee.nationality ??
    (employee.locale?.includes("-") ? (employee.locale.split("-")[1] ?? null) : null);

  return (
    <div className="space-y-6">
      <Link href="/employees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Employees
      </Link>

      {/* Full-width identity banner: avatar + name, country flag, role tag. */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-r from-accent/10 via-accent/5 to-transparent" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <EntityAvatar
            name={fullName}
            src={employee.avatarUrl}
            className="size-20 rounded-2xl"
            textClassName="text-2xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-foreground">{fullName}</h1>
              {country ? <CountryFlag code={country} /> : null}
              <StatusPill status={employee.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{employee.uniqueCode}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {employee.membershipRole ? (
                <RoleTag role={employee.membershipRole as MembershipRole} />
              ) : null}
              {employee.role ? (
                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {employee.role}
                </span>
              ) : null}
              {employee.department ? (
                <span className="text-xs text-muted-foreground">· {employee.department}</span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {employee.email ? (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  <span className="truncate">{employee.email}</span>
                </span>
              ) : null}
              {employee.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {employee.phone}
                </span>
              ) : null}
              {employee.primaryStore ? (
                <span className="inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong">
                  {employee.primaryStore.name} · primary
                </span>
              ) : null}
              {employee.storeLinks.map((link) => (
                <span
                  key={link.id}
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RELATION_TINT[link.relation]}`}
                >
                  {link.store?.name ?? "Store"} · {link.relation}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-width tabbed content */}
      <div className="min-w-0">
        <div className="scrollbar-thin overflow-x-auto pb-1">
          <SegmentedTabs
            tabs={TABS}
            value={tab}
            onValueChange={setTab}
            layoutGroup="employee-profile-tabs"
          />
        </div>

        <div className="mt-5">
          {tab === "profile" ? <ProfileDetails employee={employee} /> : null}
          {tab === "contract" ? <ContractTab employeeId={employee.id} /> : null}
          {tab === "shifts" ? <StubTab label="Shifts" /> : null}
          {tab === "leave" ? <StubTab label="Leave & holidays" /> : null}
          {tab === "attendance" ? <StubTab label="Attendance" /> : null}
          {tab === "onboarding" ? <StubTab label="Onboarding" /> : null}
          {tab === "documents" ? <StubTab label="Documents" /> : null}
          {tab === "credentials" ? <CredentialsTab employeeId={employee.id} /> : null}
          {tab === "preferences" ? <PreferencesTab employeeId={employee.id} /> : null}
        </div>
      </div>
    </div>
  );
}
