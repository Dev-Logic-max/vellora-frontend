"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RichSelect, type RichOption } from "@/components/ui/rich-select";
import { PermissionMatrix } from "@/components/permissions/permission-matrix";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useTenants } from "@/features/admin/admin";

/**
 * Permissions module. Owners/HR manage their own company's matrix. Platform
 * users get a company picker (cross-tenant) to view/edit any company's matrix —
 * permissions are stored per company, so the platform admin observes them all.
 */
export function PermissionsView() {
  const { data: me } = useCurrentUser();
  const isPlatform = Boolean(me?.platformRole);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Control which roles can access each module. Owners always have full access."
      />
      {isPlatform ? <PlatformMatrix /> : <PermissionMatrix />}
    </div>
  );
}

/** Platform view: pick any company, then edit its matrix via the admin endpoint. */
function PlatformMatrix() {
  const { data: tenants, isLoading } = useTenants();
  const [companyId, setCompanyId] = useState<string | undefined>();

  const options: RichOption[] =
    tenants?.map((t) => ({
      value: t.id,
      title: t.name,
      subtitle: t.subscription?.plan?.name ?? "Free plan",
      trailing: (
        <span className="text-xs text-muted-foreground tabular-nums">{t.employees} staff</span>
      ),
    })) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
            <Building2 className="size-4.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Company</p>
            <p className="text-xs text-muted-foreground">
              Choose a company to view or edit its permissions.
            </p>
          </div>
        </div>
        <RichSelect
          className="sm:w-72"
          options={options}
          value={companyId}
          onChange={setCompanyId}
          placeholder={isLoading ? "Loading companies…" : "Select a company"}
          searchPlaceholder="Search companies…"
          allowClear={false}
        />
      </div>

      {companyId ? (
        <PermissionMatrix key={companyId} companyId={companyId} />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle/50 px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Select a company above to manage its role permissions.
          </p>
        </div>
      )}
    </div>
  );
}
