"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionMatrix } from "@/components/permissions/permission-matrix";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Control which roles can access each module in this company. Owners always have full access."
      />
      <PermissionMatrix />
    </div>
  );
}
