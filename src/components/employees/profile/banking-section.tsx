"use client";

import { useState } from "react";
import { Landmark, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { currencySymbol } from "@/lib/geo/currencies";
import { BankAccountModal } from "@/components/employees/bank-account-modal";
import { useBankAccounts, useDeleteBankAccount } from "@/features/employees/employees";

/** Banking & accounts panel on the employee profile (P2/P3). Lists the
 * employee's bank accounts (brand-color badge + masked details) with an
 * "Add bank account" action that opens the centered modal. */
export function BankingSection({ employeeId }: { employeeId: string }) {
  const { data: accounts, isLoading } = useBankAccounts(employeeId);
  const del = useDeleteBankAccount(employeeId);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <Landmark className="size-4 text-primary" />
          Banking & accounts
        </h3>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus />
          Add bank account
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : accounts && accounts.length > 0 ? (
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface-subtle/40 p-3"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: `${a.bankBrandColor ?? "#64748b"}1a`,
                  color: a.bankBrandColor ?? "#64748b",
                }}
              >
                {a.bankName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
                  {a.bankName}
                  {a.isPrimary ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-strong">
                      <Star className="size-2.5 fill-current" />
                      Primary
                    </span>
                  ) : null}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {a.iban || a.accountNumber || "—"}
                  {a.currency ? ` · ${currencySymbol(a.currency)} ${a.currency}` : ""}
                  {a.label ? ` · ${a.label}` : ""}
                </p>
              </div>
              {a.country ? <Flag code={a.country} className="h-4 w-6" /> : null}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await del.mutateAsync(a.id);
                    toast.success("Account removed");
                  } catch {
                    toast.error("Couldn't remove");
                  }
                }}
                className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Remove account"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No bank accounts yet. Add one to enable payroll details.
        </div>
      )}

      <BankAccountModal employeeId={employeeId} open={addOpen} onOpenChange={setAddOpen} />
    </section>
  );
}
