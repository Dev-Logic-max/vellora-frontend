"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, CalendarDays, Clock, Users } from "lucide-react";

import { CreateCompanyDialog } from "@/components/dashboard/create-company-dialog";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { OnboardingShowcase } from "@/components/dashboard/onboarding-showcase";
import { SectionDecor } from "@/components/dashboard/section-decor";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cardItem, staggerContainer } from "@/lib/motion";
import { useSectionPattern } from "@/features/design/section-pattern";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useEmployees } from "@/features/employees/employees";
import { useStores } from "@/features/org/stores";
import { useShifts } from "@/features/scheduling/scheduling";
import { useLogs } from "@/features/attendance/attendance";
import { weekDates, ymd } from "@/lib/schedule-time";

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const hasCompany = Boolean(user?.companyId);
  const pattern = useSectionPattern();

  // The user keeps the setup guide until they dismiss it (it does NOT auto-hide
  // when data loads). Once dismissed, the activity placeholder takes its place.
  const [guideDismissed, setGuideDismissed] = useState(false);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";

  // ── Live metrics ──────────────────────────────────────────────────────────
  const { data: employees, isLoading: empLoading } = useEmployees({ page: 1, pageSize: 1 });
  const { data: stores, isLoading: storesLoading } = useStores();

  const { from, to, today } = useMemo(() => {
    const days = weekDates(new Date());
    const d = ymd(new Date());
    return {
      from: `${days[0]}T00:00:00.000Z`,
      to: `${days[days.length - 1]}T23:59:59.999Z`,
      today: d,
    };
  }, []);

  const { data: shifts, isLoading: shiftsLoading } = useShifts({ from, to }, hasCompany);
  const { data: logs, isLoading: logsLoading } = useLogs(
    { from: `${today}T00:00:00.000Z`, to: `${today}T23:59:59.999Z` },
    hasCompany,
  );

  const employeeCount = employees?.total ?? 0;
  const storeCount = stores?.length ?? 0;
  const openShifts = (shifts ?? []).filter((s) => !s.employeeId && s.status !== "off").length;
  const clockedIn = (logs ?? []).filter((l) => !l.clockOutUtc).length;

  // Gate the dashboard UI on the core data so cards never flash empty first.
  const coreLoading =
    userLoading || (hasCompany && (empLoading || storesLoading || shiftsLoading || logsLoading));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={cardItem}>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Here's what's happening across your workforce."
        />
      </motion.div>

      {coreLoading ? (
        <DashboardSkeleton />
      ) : !hasCompany ? (
        <motion.div variants={cardItem}>
          <EmptyState
            icon={Building2}
            title="Create your first company"
            description="You're signed in but not part of a company yet. Create one to become its owner and start managing your workforce."
            action={<CreateCompanyDialog />}
          />
        </motion.div>
      ) : (
        <>
          {/* KPI row — 4 tiles in one row; each tile carries the selected themed
              section pattern (chosen in Design → Layout). */}
          <motion.div variants={cardItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile label="Employees" value={String(employeeCount)} count={{ to: employeeCount }} icon={Users} decor={pattern} />
            <KpiTile label="Stores" value={String(storeCount)} count={{ to: storeCount }} icon={Building2} decor={pattern} />
            <KpiTile label="Open shifts" value={String(openShifts)} count={{ to: openShifts }} icon={CalendarDays} decor={pattern} />
            <KpiTile label="Clocked in" value={String(clockedIn)} count={{ to: clockedIn }} icon={Clock} decor={pattern} />
          </motion.div>

          {/* Setup guide — stays until the user dismisses it (decoupled from data).
              Once dismissed, the activity placeholder takes its place. */}
          {!guideDismissed ? (
            <motion.div variants={cardItem}>
              <OnboardingShowcase onDismiss={() => setGuideDismissed(true)} />
            </motion.div>
          ) : (
            <SectionDecor
              kind={pattern}
              className="rounded-2xl border border-border bg-surface shadow-accent-sm"
            >
              <motion.div variants={cardItem}>
                <EmptyState
                  icon={CalendarDays}
                  title="Activity feed coming soon"
                  description="Live shift, attendance and request activity will stream here. Your metrics above are live."
                />
              </motion.div>
            </SectionDecor>
          )}

          {/* Quick highlights — selected section pattern bottom-right. */}
          <SectionDecor
            kind={pattern}
            className="rounded-2xl border border-border bg-surface p-5 shadow-accent-sm"
          >
            <motion.div variants={cardItem}>
              <h3 className="font-display text-base font-semibold text-foreground">
                This week at a glance
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {openShifts > 0
                  ? `${openShifts} open shift${openShifts === 1 ? "" : "s"} still need coverage this week.`
                  : "All shifts are covered this week — nicely done."}{" "}
                {clockedIn > 0
                  ? `${clockedIn} team member${clockedIn === 1 ? " is" : "s are"} clocked in right now.`
                  : "No one is clocked in at the moment."}
              </p>
            </motion.div>
          </SectionDecor>
        </>
      )}
    </motion.div>
  );
}

/** Skeleton shown while the core dashboard data loads (no empty cards flash). */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
