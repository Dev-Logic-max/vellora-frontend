"use client";

import { ShieldAlert } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/features/session/use-current-user";
import { AuditLogViewer } from "./audit-log-viewer";
import { FeatureFlagsPanel } from "./feature-flags-panel";
import { TenantDrawer } from "./tenant-drawer";
import { TenantsTable } from "./tenants-table";

/**
 * Platform console (P9-F). Visible only to platform operators; everyone else
 * sees a block. The backend PlatformGuard is the real gate.
 */
export function AdminView() {
  const { data: user, isLoading } = useCurrentUser();
  const isPlatform = Boolean(user?.platformRole);
  const [tab, setTab] = useState("tenants");
  const [openTenant, setOpenTenant] = useState<string | null>(null);

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

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList variant="line" className="w-max">
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="flags">Feature flags</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="pt-4">
          <TenantsTable onOpen={setOpenTenant} />
          <TenantDrawer id={openTenant} onClose={() => setOpenTenant(null)} />
        </TabsContent>
        <TabsContent value="flags" className="pt-4">
          <FeatureFlagsPanel />
        </TabsContent>
        <TabsContent value="audit" className="pt-4">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
