"use client";

import { Building2, Flag, Inbox, Network, ScrollText, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { useCurrentUser } from "@/features/session/use-current-user";
import { AuditLogViewer } from "./audit-log-viewer";
import { FeatureFlagsPanel } from "./feature-flags-panel";
import { RequestsTab } from "./requests-tab";
import { RolesGroupsTab } from "./roles-groups-tab";
import { TenantsPanel } from "./tenants-panel";

/**
 * Platform console (P9-F). Visible only to platform operators; everyone else
 * sees a block. The backend PlatformGuard is the real gate.
 */
type AdminTab = "tenants" | "requests" | "roles" | "flags" | "audit";

const ADMIN_TABS: SegmentedTab<AdminTab>[] = [
  { value: "tenants", label: "Tenants", icon: Building2 },
  { value: "requests", label: "Requests", icon: Inbox },
  { value: "roles", label: "Roles & groups", icon: Network },
  { value: "flags", label: "Feature flags", icon: Flag },
  { value: "audit", label: "Audit log", icon: ScrollText },
];

export function AdminView() {
  const { data: user, isLoading } = useCurrentUser();
  const isPlatform = Boolean(user?.platformRole);
  const [tab, setTab] = useState<AdminTab>("tenants");

  if (!isLoading && !isPlatform) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin" description="Platform operations console." />
        <EmptyState
          icon={ShieldAlert}
          title="Platform access only"
          description="This console is restricted to Vellora platform operators."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform admin" description="Tenants, plans, feature flags, and audit." />

      <SegmentedTabs tabs={ADMIN_TABS} value={tab} onValueChange={setTab} layoutGroup="admin-tabs" />

      <div className="pt-1">
        {tab === "tenants" ? <TenantsPanel /> : null}
        {tab === "requests" ? <RequestsTab /> : null}
        {tab === "roles" ? <RolesGroupsTab /> : null}
        {tab === "flags" ? <FeatureFlagsPanel /> : null}
        {tab === "audit" ? <AuditLogViewer /> : null}
      </div>
    </div>
  );
}
