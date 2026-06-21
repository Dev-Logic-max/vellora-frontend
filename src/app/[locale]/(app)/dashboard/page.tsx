"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, CalendarDays, Clock, Users } from "lucide-react";

import { CreateCompanyDialog } from "@/components/dashboard/create-company-dialog";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { OnboardingShowcase } from "@/components/dashboard/onboarding-showcase";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cardItem, staggerContainer } from "@/lib/motion";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useEmployees } from "@/features/employees/employees";
import { useStores } from "@/features/org/stores";
import { useShifts } from "@/features/scheduling/scheduling";
import { useLogs } from "@/features/attendance/attendance";
import { weekDates, ymd } from "@/lib/schedule-time";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const hasCompany = Boolean(user?.companyId);

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

  // "Activity" = any real data configured/happening.
  const hasActivity = employeeCount > 0 || storeCount > 0 || (shifts?.length ?? 0) > 0;
  const dash = (n: number, loading: boolean) => (loading ? "…" : String(n));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={cardItem}>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Here's what's happening across your workforce."
        />
      </motion.div>

      {!hasCompany ? (
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
          <motion.div variants={cardItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label="Employees"
              value={dash(employeeCount, empLoading)}
              icon={Users}
              decor="bubbles"
            />
            <KpiTile
              label="Stores"
              value={dash(storeCount, storesLoading)}
              icon={Building2}
              decor="hexagon"
            />
            <KpiTile
              label="Open shifts"
              value={dash(openShifts, shiftsLoading)}
              icon={CalendarDays}
              decor="dots"
            />
            <KpiTile
              label="Clocked in"
              value={dash(clockedIn, logsLoading)}
              icon={Clock}
              decor="bubbles"
            />
          </motion.div>

          <motion.div variants={cardItem}>
            {hasActivity ? (
              <EmptyState
                icon={CalendarDays}
                title="Activity feed coming soon"
                description="Live shift, attendance and request activity will stream here. Your metrics above are live."
              />
            ) : (
              <OnboardingShowcase />
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
