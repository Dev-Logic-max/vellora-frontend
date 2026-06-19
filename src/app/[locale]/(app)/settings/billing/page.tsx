"use client";

import { ShieldAlert } from "lucide-react";

import { CurrentPlanCard } from "@/components/billing/current-plan-card";
import { InvoicesTable } from "@/components/billing/invoices-table";
import { PlanCards } from "@/components/billing/plan-cards";
import { TrialBanner } from "@/components/billing/trial-banner";
import { UsageMeters } from "@/components/billing/usage-meters";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentUser } from "@/features/session/use-current-user";

/**
 * Billing & subscriptions (15-billing). Owner-only — non-owners see a notice.
 * The backend is the real gate (returns 403); this is the UX surface.
 */
export default function BillingPage() {
  const { data: user, isLoading } = useCurrentUser();
  const isOwner = user?.role === "owner";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your plan, usage, and invoices."
      />

      {!isLoading && !isOwner ? (
        <EmptyState
          icon={ShieldAlert}
          title="Owner access only"
          description="Only the account owner can manage billing and subscriptions."
        />
      ) : (
        <>
          <TrialBanner />
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrentPlanCard />
            <UsageMeters />
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Plans</h2>
            <PlanCards />
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Invoices</h2>
            <InvoicesTable />
          </section>
        </>
      )}
    </div>
  );
}
