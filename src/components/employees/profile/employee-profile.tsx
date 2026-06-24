"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building,
  CalendarDays,
  CalendarOff,
  Clock,
  FileText,
  ClipboardList,
  IdCard,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Settings,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";

import { Flag } from "@/components/ui/flag";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { countryCode, countryName } from "@/lib/geo/countries";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { EmployeeFormSheet } from "@/components/employees/employee-form-sheet";
import { EmployeeDeleteModal } from "@/components/employees/employee-delete-modal";
import { EmployeeMessageModal } from "@/components/employees/employee-message-modal";
import { BankingSection } from "@/components/employees/profile/banking-section";
import { ContractTab } from "@/components/employees/profile/contract-tab";
import { CredentialsTab } from "@/components/employees/profile/credentials-tab";
import { PreferencesTab } from "@/components/employees/profile/preferences-tab";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CONTRACT_TYPE_LABEL } from "@/features/employees/constants";
import { useEmployee } from "@/features/employees/employees";
import { useCurrentUser } from "@/features/session/use-current-user";
import type { EmployeeDetail } from "@/features/employees/types";
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

function StubTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-muted-foreground">
      {label} for this employee will appear here once that module is connected.
    </div>
  );
}

/** Designed empty state for the Onboarding tab (P8): icon hero + copy + an
 * "Assign task" CTA shown to every role EXCEPT employees. */
function OnboardingEmpty({ canManage }: { canManage: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft/50 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          <ClipboardList className="size-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">No tasks assigned yet</h3>
        <p className="text-sm text-muted-foreground">
          Build this employee&apos;s onboarding journey — assign tasks across pre-start, first day,
          first week, and first month.
        </p>
        {canManage ? (
          <Button className="mt-1">
            <ClipboardList />
            Assign task
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Designed empty state for the Attendance tab (P8): gradient status legend +
 * copy. Uses semantic gradients beyond the accent for action/status meaning. */
function AttendanceEmpty() {
  const STATUSES = [
    { label: "On time", from: "from-emerald-500", to: "to-teal-500" },
    { label: "Late", from: "from-amber-500", to: "to-orange-500" },
    { label: "Absent", from: "from-rose-500", to: "to-red-500" },
    { label: "Leave", from: "from-sky-500", to: "to-blue-500" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          <Clock className="size-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">No attendance yet</h3>
        <p className="text-sm text-muted-foreground">
          Clock-ins, breaks and anomalies for this employee will show here once they start punching.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {STATUSES.map((s) => (
            <span
              key={s.label}
              className={`inline-flex items-center gap-1.5 rounded-full bg-linear-to-r ${s.from} ${s.to} px-3 py-1 text-xs font-medium text-white shadow-sm`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof UserRound;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/30">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{value || "—"}</dd>
      </div>
    </div>
  );
}

/** A small titled section block (accent rule header) wrapping a detail grid. */
function ProfileDetails({ employee }: { employee: EmployeeDetail }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Overview" icon={UserRound} />
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail
          icon={IdCard}
          label="Employee ID"
          value={<span className="font-mono">{employee.uniqueCode}</span>}
        />
        <Detail icon={Briefcase} label="Job role" value={employee.role} />
        <Detail icon={Building} label="Department" value={employee.department} />
        <Detail icon={Store} label="Primary store" value={employee.primaryStore?.name} />
        <Detail icon={CalendarDays} label="Hire date" value={employee.hireDate} />
        <Detail
          icon={FileText}
          label="Contract"
          value={employee.contractType ? CONTRACT_TYPE_LABEL[employee.contractType] : null}
        />
        <Detail icon={Mail} label="Email" value={employee.email} />
        <Detail icon={Phone} label="Phone" value={employee.phone} />
        <Detail icon={Clock} label="Timezone" value={employee.timezone} />
      </dl>
    </div>
  );
}

/** Accent-ruled section header used across the profile tab. */
function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof UserRound }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft text-primary">
        <Icon className="size-4" />
      </span>
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <span
        className="h-px flex-1 rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--accent) / 0.45), rgb(var(--accent) / 0.12) 60%, transparent)",
        }}
      />
    </div>
  );
}

/** Designed empty state for the Leave tab — mirrors the attendance legend style. */
function LeaveEmpty() {
  const TYPES = [
    { label: "Annual", from: "from-emerald-500", to: "to-teal-500" },
    { label: "Sick", from: "from-rose-500", to: "to-red-500" },
    { label: "Unpaid", from: "from-slate-400", to: "to-slate-500" },
    { label: "Parental", from: "from-violet-500", to: "to-fuchsia-500" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          <CalendarOff className="size-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">No leave yet</h3>
        <p className="text-sm text-muted-foreground">
          This employee&apos;s leave requests, balances and holidays will appear here once they
          book time off.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {TYPES.map((s) => (
            <span
              key={s.label}
              className={`inline-flex items-center gap-1.5 rounded-full bg-linear-to-r ${s.from} ${s.to} px-3 py-1 text-xs font-medium text-white shadow-sm`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmployeeProfile({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "profile";
  const { data: employee, isLoading, isError } = useEmployee(id);
  const { data: me } = useCurrentUser();
  // Every role except a plain employee may manage / message / assign tasks.
  const canManage = Boolean(me?.role && me.role !== "employee");
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const setTab = (value: string) => router.replace(`/employees/${id}?tab=${value}`);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !employee)
    return <p className="text-sm text-destructive">Employee not found.</p>;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  // Prefer the employee's own country/nationality; fall back to the locale region.
  // Resolve to an ISO alpha-2 so we can render the real flag SVG (not initials).
  const rawCountry =
    employee.country ??
    employee.nationality ??
    (employee.locale?.includes("-") ? (employee.locale.split("-")[1] ?? null) : null);
  const cc = countryCode(rawCountry);

  return (
    <div className="space-y-6">
      {/* Back + action buttons row (vertical gap below before the hero). */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Employees
        </Link>
        {canManage ? (
          <div className="flex items-center gap-2">
            <HeroAction
              icon={Pencil}
              label="Edit"
              tone="emerald"
              onClick={() => setEditOpen(true)}
            />
            <HeroAction
              icon={MessageSquare}
              label="Message"
              tone="blue"
              onClick={() => setMessageOpen(true)}
            />
            <HeroAction
              icon={Trash2}
              label="Delete"
              tone="rose"
              onClick={() => setDeleteOpen(true)}
            />
          </div>
        ) : null}
      </div>

      {/* Identity hero: avatar TOP-LEFT (rounded-full), name + status right,
          PLATFORM role tag under the name + real country flag. Theme-colored glow
          bottom-right (mirrors the dashboard's accent glow). */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {/* Layered accent glow, bottom-right — same treatment as the dashboard. */}
        <div className="pointer-events-none absolute -right-16 -bottom-20 size-64 rounded-full bg-accent/25 blur-[80px]" />
        <div className="pointer-events-none absolute right-6 -bottom-10 size-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <EntityAvatar
              name={fullName}
              src={employee.avatarUrl}
              className="avatar-ring size-20 rounded-full"
              textClassName="text-2xl"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-semibold text-foreground">{fullName}</h1>
                {cc ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 py-0.5 pr-2 pl-1 shadow-sm"
                    title={countryName(cc) ?? cc}
                  >
                    <Flag code={cc} className="h-3.5 w-5 rounded-[3px]" />
                    <span className="text-xs font-medium text-muted-foreground">{cc}</span>
                  </span>
                ) : null}
              </div>
              {/* The PLATFORM (membership) role — not the free-text job title. */}
              <div className="mt-2 flex items-center gap-2">
                {employee.membershipRole ? (
                  <RoleTag role={employee.membershipRole as MembershipRole} />
                ) : (
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    No portal login
                  </span>
                )}
                {employee.role ? (
                  <span className="text-xs text-muted-foreground">· {employee.role}</span>
                ) : null}
              </div>
            </div>
          </div>
          <StatusPill status={employee.status} />
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
          {tab === "profile" ? (
            <div className="space-y-5">
              <ProfileDetails employee={employee} />
              <BankingSection employeeId={employee.id} />
            </div>
          ) : null}
          {tab === "contract" ? <ContractTab employeeId={employee.id} /> : null}
          {tab === "shifts" ? <StubTab label="Shifts" /> : null}
          {tab === "leave" ? <LeaveEmpty /> : null}
          {tab === "attendance" ? <AttendanceEmpty /> : null}
          {tab === "onboarding" ? <OnboardingEmpty canManage={canManage} /> : null}
          {tab === "documents" ? <StubTab label="Documents" /> : null}
          {tab === "credentials" ? <CredentialsTab employeeId={employee.id} /> : null}
          {tab === "preferences" ? <PreferencesTab employeeId={employee.id} /> : null}
        </div>
      </div>

      {/* Hero action modals (edit / message / delete). */}
      {canManage ? (
        <>
          <EmployeeFormSheet
            employee={employee}
            open={editOpen}
            onOpenChange={setEditOpen}
            onDelete={() => {
              setEditOpen(false);
              setDeleteOpen(true);
            }}
          />
          <EmployeeMessageModal
            employee={employee}
            open={messageOpen}
            onOpenChange={setMessageOpen}
          />
          <EmployeeDeleteModal
            employee={employee}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDone={() => router.push("/employees")}
          />
        </>
      ) : null}
    </div>
  );
}

/** Colored hero action button (icon + text), theme-independent tones. */
function HeroAction({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  tone: "emerald" | "blue" | "rose";
  onClick: () => void;
}) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    blue: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        tones[tone],
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
