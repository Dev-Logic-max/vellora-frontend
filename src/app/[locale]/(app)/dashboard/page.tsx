"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Building2, CalendarDays, Clock, Users } from "lucide-react";

import { CreateCompanyDialog } from "@/components/dashboard/create-company-dialog";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentUser } from "@/features/session/use-current-user";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const reduce = useReducedMotion();

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";
  const hasCompany = Boolean(user?.companyId);

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Here's what's happening across your workforce."
        />
      </motion.div>

      {hasCompany ? (
        <>
          <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile label="Employees" value="—" icon={Users} />
            <KpiTile label="Stores" value="—" icon={Building2} />
            <KpiTile label="Open shifts" value="—" icon={CalendarDays} />
            <KpiTile label="Clocked in" value="—" icon={Clock} />
          </motion.div>
          <motion.div variants={item}>
            <EmptyState
              icon={CalendarDays}
              title="No activity yet"
              description="As you add stores, employees and shifts, your live metrics will appear here."
            />
          </motion.div>
        </>
      ) : (
        <motion.div variants={item}>
          <EmptyState
            icon={Building2}
            title="Create your first company"
            description="You're signed in but not part of a company yet. Create one to become its owner and start managing your workforce."
            action={<CreateCompanyDialog />}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
