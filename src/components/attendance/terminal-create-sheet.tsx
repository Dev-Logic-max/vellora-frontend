"use client";

import { useState, type ReactNode } from "react";
import { Info, MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormSheet } from "@/components/ui/form-sheet";
import { StoreSelect } from "@/components/org/entity-selects";
import { QrCode } from "@/components/attendance/qr-code";
import { useCompanies } from "@/features/org/companies";
import { useStores } from "@/features/org/stores";
import { useCreateTerminal } from "@/features/attendance/devices";

/**
 * Right-sheet for creating a store terminal — the UI-2 right-sheet pattern:
 * store (rich dropdown) + label + password, with a terminal-screen QR preview
 * at the bottom (as it'd appear on the store kiosk). The password is a preview
 * field for the kiosk pairing UX; only store + label are persisted today.
 */
export function TerminalCreateSheet({ trigger }: { trigger: ReactNode }) {
  const { data: stores } = useStores();
  const { data: companies } = useCompanies();
  const create = useCreateTerminal();

  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | undefined>();
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");

  const reset = () => {
    setStoreId(undefined);
    setLabel("");
    setPassword("");
  };

  const submit = async () => {
    if (!storeId || !label.trim()) return;
    try {
      await create.mutateAsync({ storeId, label: label.trim() });
      toast.success("Terminal created");
      reset();
      setOpen(false);
    } catch {
      toast.error("Couldn't create the terminal");
    }
  };

  // Decorative preview payload (the real rotating QR appears after creation).
  const previewPayload = `vellora:terminal:${storeId ?? "store"}:${label || "new"}`;
  const storeName = stores?.find((s) => s.id === storeId)?.name;

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
        <Button onClick={submit} disabled={create.isPending || !storeId || !label.trim()}>
          {create.isPending ? "Creating…" : "Create terminal"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Store</label>
          <StoreSelect
            stores={stores}
            companies={companies}
            value={storeId}
            onChange={setStoreId}
          />
        </div>

        <FormField
          id="terminal-label"
          label="Terminal label"
          placeholder="Front counter iPad"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <FormField
          id="terminal-password"
          label="Pairing password"
          type="password"
          placeholder="Shown on the kiosk during pairing"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="flex items-start gap-1.5 rounded-lg bg-info-soft px-3 py-2 text-xs text-info">
          <Info className="mt-px size-3.5 shrink-0" />
          The kiosk enters this password once to pair, then displays the rotating QR below.
        </p>

        {/* Terminal-screen preview. */}
        <div>
          <p className="mb-2 text-[13px] font-medium text-foreground">Terminal screen preview</p>
          <div className="rounded-2xl border border-border bg-linear-to-b from-surface-subtle to-surface p-5 shadow-accent-sm">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <MonitorSmartphone className="size-4 text-accent-strong" />
              {storeName ?? "Select a store"}
              {label ? <span className="text-muted-foreground">· {label}</span> : null}
            </div>
            <div className="flex justify-center">
              <QrCode payload={previewPayload} size={180} />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Scan to clock in · rotates automatically
            </p>
          </div>
        </div>
      </div>
    </FormSheet>
  );
}
