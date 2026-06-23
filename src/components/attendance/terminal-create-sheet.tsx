"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Eye, EyeOff, Info, MonitorSmartphone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { FormSheet } from "@/components/ui/form-sheet";
import { RichSelect, type RichOption } from "@/components/ui/rich-select";
import { QrCode } from "@/components/attendance/qr-code";
import { useCompanies } from "@/features/org/companies";
import { useStores } from "@/features/org/stores";
import { useCreateTerminal, useTerminals } from "@/features/attendance/devices";
import { ApiError } from "@/lib/api";

/** A short, URL-safe stem from the store name for the auto-generated email. */
function slugStem(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) || "terminal"
  );
}

function randomPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Right-sheet for creating a store terminal (points 19/20). One terminal per
 * store — stores that already have one are tagged + disabled in the picker. The
 * label auto-fills from the store name (editable); the pairing email is derived
 * as `{store}@{companyEmail-domain}` when the company has an email, else hidden.
 * Password has a show/hide toggle + regenerate. Sections use the accent group
 * header + rule for a consistent premium look.
 */
export function TerminalCreateSheet({ trigger }: { trigger: ReactNode }) {
  const { data: stores } = useStores();
  const { data: companies } = useCompanies();
  const { data: terminals } = useTerminals();
  const create = useCreateTerminal();

  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | undefined>();
  const [label, setLabel] = useState("");
  const [labelEdited, setLabelEdited] = useState(false);
  const [password, setPassword] = useState(() => randomPassword());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takenStoreIds = useMemo(
    () => new Set((terminals ?? []).map((t) => t.storeId)),
    [terminals],
  );

  const storeOptions = useMemo<RichOption[]>(() => {
    const companyName = new Map(companies?.map((c) => [c.id, c.name]));
    return (stores ?? []).map((s) => {
      const taken = takenStoreIds.has(s.id);
      return {
        value: s.id,
        title: s.name,
        subtitle: companyName.get(s.companyId) ?? s.code ?? undefined,
        disabled: taken,
        trailing: taken ? (
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">
            Terminal exists
          </span>
        ) : (
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
            Available
          </span>
        ),
        searchText: `${s.name} ${s.code ?? ""}`,
      };
    });
  }, [stores, companies, takenStoreIds]);

  const selectedStore = stores?.find((s) => s.id === storeId);
  const company = companies?.find((c) => c.id === selectedStore?.companyId);

  // The label shown: the user's edit if they typed one, else auto-filled from the
  // store name. Derived during render (no effect) so there are no cascading renders.
  const effectiveLabel = labelEdited
    ? label
    : selectedStore
      ? `${selectedStore.name} Terminal`
      : "";

  // Auto-generated pairing email: {store}@{company-email-domain}. Hidden when the
  // company has no email yet (we'll wire it later — leave it out for now).
  const emailDomain = company?.companyEmail?.split("@")[1];
  const generatedEmail =
    selectedStore && emailDomain ? `${slugStem(selectedStore.name)}@${emailDomain}` : null;

  const reset = () => {
    setStoreId(undefined);
    setLabel("");
    setLabelEdited(false);
    setPassword(randomPassword());
    setShowPassword(false);
    setError(null);
  };

  const submit = async () => {
    if (!storeId || !effectiveLabel.trim()) return;
    setError(null);
    try {
      await create.mutateAsync({ storeId, label: effectiveLabel.trim() });
      toast.success("Terminal created");
      reset();
      setOpen(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Couldn't create the terminal";
      setError(msg);
      toast.error(msg);
    }
  };

  const previewPayload = `vellora:terminal:${storeId ?? "store"}:${effectiveLabel || "new"}`;

  return (
    <FormSheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
      trigger={trigger}
      title="New terminal"
      subtitle="Pair a kiosk to show the rotating clock-in QR at a store."
      footer={
        <Button onClick={submit} disabled={create.isPending || !storeId || !effectiveLabel.trim()}>
          {create.isPending ? "Creating…" : "Create terminal"}
        </Button>
      }
    >
      <div className="space-y-6">
        <FieldGroup title="Store & pairing" cols={1}>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Store</label>
            <RichSelect
              options={storeOptions}
              value={storeId}
              onChange={(v) => {
                setStoreId(v);
                setLabelEdited(false);
              }}
              placeholder="Select a store"
              searchPlaceholder="Search stores…"
            />
            <p className="text-xs text-muted-foreground">
              Each store can have one terminal. Stores with a terminal are marked.
            </p>
          </div>

          <FormField
            id="terminal-label"
            label="Terminal label"
            placeholder="Front counter iPad"
            value={effectiveLabel}
            onChange={(e) => {
              setLabel(e.target.value);
              setLabelEdited(true);
            }}
          />

          {generatedEmail ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">
                Terminal email (auto-generated)
              </label>
              <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-2.5 font-mono text-xs text-muted-foreground">
                {generatedEmail}
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="terminal-password" className="text-[13px] font-medium text-foreground">
              Pairing password
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="terminal-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2.5 pr-9 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Regenerate password"
                onClick={() => {
                  setPassword(randomPassword());
                  setShowPassword(true);
                }}
              >
                <RefreshCw />
              </Button>
            </div>
          </div>

          <p className="flex items-start gap-1.5 rounded-lg bg-info-soft px-3 py-2 text-xs text-info">
            <Info className="mt-px size-3.5 shrink-0" />
            The kiosk enters this password once to pair, then displays the rotating QR below.
          </p>
        </FieldGroup>

        <FieldGroup title="Terminal screen preview" cols={1}>
          <div className="rounded-2xl border border-border bg-linear-to-b from-surface-subtle to-surface p-5 shadow-accent-sm">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <MonitorSmartphone className="size-4 text-accent-strong" />
              {selectedStore?.name ?? "Select a store"}
              {effectiveLabel ? (
                <span className="text-muted-foreground">· {effectiveLabel}</span>
              ) : null}
            </div>
            <div className="flex justify-center">
              <QrCode payload={previewPayload} size={170} />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Scan to clock in · rotates automatically
            </p>
          </div>
        </FieldGroup>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </FormSheet>
  );
}
