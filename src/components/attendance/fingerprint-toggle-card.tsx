"use client";

import { Fingerprint } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentCompany, useUpdateCompanySettings } from "@/features/org/companies";
import { useCurrentUser } from "@/features/session/use-current-user";

/**
 * Owner/super-admin toggle for the OPTIONAL device-fingerprint check (point 21).
 * Off by default — registration is the primary gate. When on, a registered
 * device must also match its captured fingerprint to clock in. Only owners see
 * the control; others see the current state read-only.
 */
export function FingerprintToggleCard() {
  const { data: company, isLoading } = useCurrentCompany();
  const { data: me } = useCurrentUser();
  const update = useUpdateCompanySettings();

  const isOwner = me?.role === "owner" || me?.platformRole === "super_admin";
  const enabled = company?.settings?.requireDeviceFingerprint ?? false;

  if (isLoading) return <Skeleton className="h-20 w-full rounded-xl" />;

  const toggle = async (next: boolean) => {
    try {
      await update.mutateAsync({ requireDeviceFingerprint: next });
      toast.success(next ? "Fingerprint check enabled" : "Fingerprint check disabled");
    } catch {
      toast.error("Couldn't update the setting");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          <Fingerprint className="size-4.5" />
        </span>
        <div>
          <p className="font-medium text-foreground">Device fingerprint verification</p>
          <p className="text-sm text-muted-foreground">
            Extra security: a registered device must also match its fingerprint to clock in.
            Registration alone is required either way.
          </p>
        </div>
      </div>
      {isOwner ? (
        <Switch
          checked={enabled}
          onCheckedChange={toggle}
          disabled={update.isPending}
          aria-label="Toggle device fingerprint verification"
        />
      ) : (
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {enabled ? "On" : "Off"}
        </span>
      )}
    </div>
  );
}
