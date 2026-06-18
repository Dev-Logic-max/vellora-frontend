"use client";

import { useSearchParams } from "next/navigation";
import { Mail, Pencil, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { EmployeeFormSheet } from "@/components/employees/employee-form-sheet";
import { ContractTab } from "@/components/employees/profile/contract-tab";
import { CredentialsTab } from "@/components/employees/profile/credentials-tab";
import { InviteButton } from "@/components/employees/profile/invite-button";
import { PreferencesTab } from "@/components/employees/profile/preferences-tab";
import { Link, useRouter } from "@/i18n/navigation";
import { CONTRACT_TYPE_LABEL } from "@/features/employees/constants";
import { useEmployee } from "@/features/employees/employees";
import type { EmployeeDetail, StoreRelation } from "@/features/employees/types";

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "contract", label: "Contract" },
  { value: "shifts", label: "Shifts" },
  { value: "leave", label: "Leave" },
  { value: "attendance", label: "Attendance" },
  { value: "onboarding", label: "Onboarding" },
  { value: "documents", label: "Documents" },
  { value: "credentials", label: "Qualifications" },
  { value: "preferences", label: "Preferences" },
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

  return (
    <div className="space-y-6">
      <Link href="/employees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Employees
      </Link>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Identity rail */}
        <aside className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <EmployeeAvatar
              firstName={employee.firstName}
              lastName={employee.lastName}
              avatarUrl={employee.avatarUrl}
              className="size-20 text-xl"
            />
            <h1 className="mt-3 font-display text-lg font-semibold text-foreground">{fullName}</h1>
            <p className="font-mono text-xs text-muted-foreground">{employee.uniqueCode}</p>
            <div className="mt-2">
              <StatusPill status={employee.status} />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {employee.email ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" />
                <span className="truncate">{employee.email}</span>
              </p>
            ) : null}
            {employee.phone ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5" />
                {employee.phone}
              </p>
            ) : null}
          </div>

          {employee.primaryStore || employee.storeLinks.length ? (
            <div className="space-y-2">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Stores</p>
              <div className="flex flex-wrap gap-1.5">
                {employee.primaryStore ? (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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
          ) : null}

          <div className="space-y-2 border-t border-border pt-4">
            <EmployeeFormSheet
              employee={employee}
              trigger={
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil />
                  Edit profile
                </Button>
              }
            />
            <InviteButton employeeId={employee.id} email={employee.email} />
          </div>
        </aside>

        {/* Tabbed content */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)} className="min-w-0">
          <div className="overflow-x-auto">
            <TabsList variant="line" className="w-max">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-5">
            <TabsContent value="profile">
              <ProfileDetails employee={employee} />
            </TabsContent>
            <TabsContent value="contract">
              <ContractTab employeeId={employee.id} />
            </TabsContent>
            <TabsContent value="shifts">
              <StubTab label="Shifts" />
            </TabsContent>
            <TabsContent value="leave">
              <StubTab label="Leave & holidays" />
            </TabsContent>
            <TabsContent value="attendance">
              <StubTab label="Attendance" />
            </TabsContent>
            <TabsContent value="onboarding">
              <StubTab label="Onboarding" />
            </TabsContent>
            <TabsContent value="documents">
              <StubTab label="Documents" />
            </TabsContent>
            <TabsContent value="credentials">
              <CredentialsTab employeeId={employee.id} />
            </TabsContent>
            <TabsContent value="preferences">
              <PreferencesTab employeeId={employee.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
