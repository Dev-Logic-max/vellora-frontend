"use client";

import { useState } from "react";
import { Landmark, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FieldGroup, FullWidth } from "@/components/ui/field-group";
import { FormField } from "@/components/ui/form-field";
import { BankSelect, CountrySelect, CurrencySelect } from "@/components/ui/geo-selects";
import { OptionSelect } from "@/components/ui/option-select";
import { ApiError } from "@/lib/api";
import { banksForCountry, CARD_NETWORKS } from "@/lib/geo/banks";
import { currencyForCountry } from "@/lib/geo/currencies";
import { useAddBankAccount } from "@/features/employees/employees";

/**
 * Centered modal to add a bank account to an employee (P3). Pick a country →
 * the bank list filters to that country (with brand badges); selecting a bank
 * auto-fills SWIFT + brand color. The catalog is in-repo; a live bank-lookup API
 * is flagged "coming soon".
 */
export function BankAccountModal({
  employeeId,
  open,
  onOpenChange,
}: {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const add = useAddBankAccount(employeeId);
  const [country, setCountry] = useState<string | undefined>();
  const [bankName, setBankName] = useState<string | undefined>();
  const [currency, setCurrency] = useState<string | undefined>();
  const [label, setLabel] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [iban, setIban] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardNetwork, setCardNetwork] = useState<string | undefined>();
  const [cardLast4, setCardLast4] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCountry(undefined);
    setBankName(undefined);
    setCurrency(undefined);
    setLabel("");
    setAccountHolder("");
    setIban("");
    setAccountNumber("");
    setCardNetwork(undefined);
    setCardLast4("");
    setIsPrimary(false);
    setError(null);
  };

  const onCountry = (c: string | undefined) => {
    setCountry(c);
    setBankName(undefined);
    // Default the currency to the country's currency for convenience.
    if (c) setCurrency((cur) => cur ?? currencyForCountry(c));
  };

  const submit = async () => {
    setError(null);
    if (!bankName) {
      setError("Select a bank.");
      return;
    }
    const bank = banksForCountry(country).find((b) => b.name === bankName);
    try {
      await add.mutateAsync({
        label: label || undefined,
        country,
        bankName,
        bankSwift: bank?.swift,
        bankBrandColor: bank?.brandColor,
        accountHolder: accountHolder || undefined,
        iban: iban || undefined,
        accountNumber: accountNumber || undefined,
        currency,
        cardNetwork: cardNetwork || undefined,
        cardLast4: cardLast4 || undefined,
        isPrimary,
      });
      toast.success("Bank account added");
      onOpenChange(false);
      reset();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't add the account.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        {/* Header. */}
        <div className="flex items-start gap-3 border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
            <Landmark className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Add bank account</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pick the country, then the bank — details auto-fill.
            </p>
          </div>
        </div>

        <div className="scrollbar-none max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
          <FieldGroup title="Bank">
            <Field label="Country">
              <CountrySelect value={country} onChange={onCountry} />
            </Field>
            <Field label="Bank">
              <BankSelect country={country} value={bankName} onChange={setBankName} />
            </Field>
            <FullWidth>
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-surface-subtle/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Can&apos;t find your bank? Live bank lookup
                </span>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent-strong">
                  Coming soon
                </span>
              </div>
            </FullWidth>
          </FieldGroup>

          <FieldGroup title="Account">
            <FullWidth>
              <FormField
                id="bankLabel"
                label="Label (optional)"
                placeholder="Salary, Expenses…"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </FullWidth>
            <FullWidth>
              <FormField
                id="accountHolder"
                label="Account holder"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </FullWidth>
            <FormField
              id="iban"
              label="IBAN"
              placeholder="GB29 NWBK…"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
            <FormField
              id="accountNumber"
              label="Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <Field label="Currency">
              <CurrencySelect value={currency} onChange={setCurrency} />
            </Field>
            <div className="flex items-end">
              <label className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="size-4 accent-[rgb(var(--primary))]"
                />
                <span className="text-foreground">Primary account</span>
              </label>
            </div>
          </FieldGroup>

          <FieldGroup title="Linked card (optional)">
            <Field label="Card network">
              <OptionSelect
                value={cardNetwork}
                onChange={setCardNetwork}
                placeholder="None"
                options={CARD_NETWORKS.map((c) => ({
                  value: c.value,
                  label: c.label,
                  leading: (
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  ),
                }))}
              />
            </Field>
            <FormField
              id="cardLast4"
              label="Card last 4"
              placeholder="1234"
              maxLength={4}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </FieldGroup>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        {/* Footer. */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={add.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={add.isPending}>
            {add.isPending ? "Adding…" : "Add account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
