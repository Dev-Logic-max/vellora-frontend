"use client";

import { useState } from "react";
import { Fingerprint, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field-group";
import { FormSheet } from "@/components/ui/form-sheet";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { useUpdateCompany } from "@/features/org/companies";
import type { Company } from "@/features/org/types";

/**
 * Company configuration — a right-sheet (lg) of per-company operational toggles.
 * Distinct from the profile Edit modal (name/address/branding): this is settings.
 * Currently surfaces the attendance device-fingerprint enforcement; built to grow.
 */
export function CompanyConfigSheet({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateCompany(company.id);
  const [requireFingerprint, setRequireFingerprint] = useState(
    company.settings?.requireDeviceFingerprint ?? false,
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const save = async () => {
    setServerError(null);
    try {
      // settings is shallow-merged server-side, so this preserves other keys.
      await update.mutateAsync({
        settings: { requireDeviceFingerprint: requireFingerprint },
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
      title="Company configuration"
      subtitle={company.name}
      footer={
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save settings"}
        </Button>
      }
    >
      <div className="space-y-6">
        <FieldGroup title="Attendance security">
          <ToggleRow
            icon={Fingerprint}
            title="Require device fingerprint"
            description="In addition to a registered device, require a matching browser fingerprint to clock in. A stricter, secondary check."
            checked={requireFingerprint}
            onChange={setRequireFingerprint}
          />
        </FieldGroup>

        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-subtle/40 p-3.5 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-strong" />
          More configuration (notifications, scheduling rules, data retention) will appear here as
          those modules expand. Changes are scoped to this company.
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
}: {
  icon: typeof Fingerprint;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="col-span-full flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
          <Icon className="size-4.5" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
