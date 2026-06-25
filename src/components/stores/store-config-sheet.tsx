"use client";

import { useState } from "react";
import { Bell, Globe, ScanLine, Settings2, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { FormSheet } from "@/components/ui/form-sheet";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { useUpdateStore } from "@/features/org/stores";
import type { Store } from "@/features/org/types";

/**
 * Store configuration — a right-sheet (lg) of per-store operational toggles:
 * POS link (placeholder for the future POS module), public storefront profile,
 * peak-hour alerts, and the monthly revenue target that drives analytics. Saves
 * to stores.settings (shallow-merged server-side).
 */
export function StoreConfigSheet({
  store,
  open,
  onOpenChange,
}: {
  store: Store;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateStore(store.id);
  const [posEnabled, setPosEnabled] = useState(store.settings?.posEnabled ?? false);
  const [publicProfile, setPublicProfile] = useState(store.settings?.publicProfile ?? false);
  const [peakAlerts, setPeakAlerts] = useState(store.settings?.peakAlerts ?? false);
  const [monthlyTarget, setMonthlyTarget] = useState(
    store.settings?.monthlyTarget != null ? String(store.settings.monthlyTarget) : "",
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const save = async () => {
    setServerError(null);
    try {
      await update.mutateAsync({
        settings: {
          posEnabled,
          publicProfile,
          peakAlerts,
          monthlyTarget: monthlyTarget ? Number(monthlyTarget) : undefined,
        },
      });
      onOpenChange(false);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Store configuration"
      subtitle={store.name}
      footer={
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save settings"}
        </Button>
      }
    >
      <div className="space-y-6">
        <FieldGroup title="Point of sale">
          <ToggleRow
            icon={ScanLine}
            title="Enable POS link"
            description="Connect this store to the (upcoming) POS system so sales sync into revenue analytics."
            checked={posEnabled}
            onChange={setPosEnabled}
            badge="Coming soon"
          />
        </FieldGroup>

        <FieldGroup title="Visibility & alerts">
          <ToggleRow
            icon={Globe}
            title="Public storefront profile"
            description="Expose a public profile page for this store (hours, location, contact)."
            checked={publicProfile}
            onChange={setPublicProfile}
          />
          <ToggleRow
            icon={Bell}
            title="Peak-hour alerts"
            description="Notify store managers when foot traffic approaches peak thresholds."
            checked={peakAlerts}
            onChange={setPeakAlerts}
          />
        </FieldGroup>

        <FieldGroup title="Targets">
          <div className="col-span-full">
            <FormField
              id="monthlyTarget"
              type="number"
              label="Monthly revenue target"
              placeholder="e.g. 60000"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
            />
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="size-3.5" /> Used to compute target progress on the analytics tab.
            </p>
          </div>
        </FieldGroup>

        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-subtle/40 p-3.5 text-xs text-muted-foreground">
          <Settings2 className="mt-0.5 size-4 shrink-0 text-accent-strong" />
          More store configuration (scheduling rules, attendance geofencing, receipt printers) will
          appear here as those modules expand.
        </div>

        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      </div>
    </FormSheet>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  badge,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="col-span-full flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
          <Icon className="size-4.5" />
        </span>
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            {title}
            {badge ? (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                {badge}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
