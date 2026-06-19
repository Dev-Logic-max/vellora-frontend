"use client";

import { ShieldAlert } from "lucide-react";

import { DesignSettingsView } from "@/components/design/design-settings-view";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentUser } from "@/features/session/use-current-user";

/**
 * Platform design settings (design module). Platform-admin surface — gated to
 * owner for now (super_admin plane lands later; the backend is the real gate).
 * Edit the system palette, preview components live, and browse theme packs.
 */
export default function DesignSettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const isAdmin = user?.role === "owner";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Design"
        description="Customize the platform's colors, preview components, and manage theme packs."
      />

      {!isLoading && !isAdmin ? (
        <EmptyState
          icon={ShieldAlert}
          title="Platform admin only"
          description="Only platform administrators can change the platform design."
        />
      ) : (
        <DesignSettingsView />
      )}
    </div>
  );
}
