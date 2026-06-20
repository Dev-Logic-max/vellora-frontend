"use client";

import { ArrowRight, Check, Plus, Repeat, Shuffle, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TransferSheet } from "@/components/transfers/transfer-sheet";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useDecideTransfer, useTransfers } from "@/features/transfers/transfers";
import { TRANSFER_STATUS_STYLES, type Transfer } from "@/features/transfers/types";

const APPROVER_ROLES = ["owner", "hr", "area_manager"];
const OPEN = ["requested", "approved", "active"];

function KindChip({ transfer }: { transfer: Transfer }) {
  const Icon = transfer.kind === "temporary" ? Repeat : Shuffle;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong capitalize">
      <Icon className="size-3" />
      {transfer.kind}
    </span>
  );
}

function TransferRow({ transfer, canApprove }: { transfer: Transfer; canApprove: boolean }) {
  const { approve, reject, cancel } = useDecideTransfer();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">
            {transfer.employee
              ? `${transfer.employee.firstName} ${transfer.employee.lastName}`
              : transfer.employeeId}
          </p>
          <KindChip transfer={transfer} />
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              TRANSFER_STATUS_STYLES[transfer.status],
            )}
          >
            {transfer.status}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {transfer.fromStore?.name ?? "—"}
          <ArrowRight className="size-3.5" />
          {transfer.toStore?.name ?? "—"}
          {transfer.startDate ? (
            <span className="tabular-nums">
              · {transfer.startDate} → {transfer.endDate}
            </span>
          ) : null}
        </p>
      </div>

      {OPEN.includes(transfer.status) ? (
        <div className="flex items-center gap-2">
          {canApprove && transfer.status === "requested" ? (
            <>
              <Button variant="outline" size="sm" onClick={() => reject.mutate(transfer.id)}>
                <X className="size-4" />
                Reject
              </Button>
              <Button size="sm" onClick={() => approve.mutate(transfer.id)}>
                <Check className="size-4" />
                Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => cancel.mutate(transfer.id)}>
              Cancel
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function TransfersView() {
  const { data: me } = useCurrentUser();
  const { data, isLoading } = useTransfers();
  const canApprove = Boolean(me?.role && APPROVER_ROLES.includes(me.role));

  const open = data?.filter((t) => OPEN.includes(t.status)) ?? [];
  const history = data?.filter((t) => !OPEN.includes(t.status)) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transfers"
        description="Move staff between stores temporarily or permanently."
        actions={
          <TransferSheet
            trigger={
              <Button>
                <Plus className="size-4" />
                New transfer
              </Button>
            }
          />
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={Shuffle}
          title="No transfers yet"
          description="Create a transfer to loan or move an employee to another store."
        />
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Open
            </h2>
            {open.length ? (
              open.map((t) => <TransferRow key={t.id} transfer={t} canApprove={canApprove} />)
            ) : (
              <p className="text-sm text-muted-foreground">No open transfers.</p>
            )}
          </section>

          {history.length ? (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                History
              </h2>
              <ol className="relative space-y-3 border-l border-border pl-5">
                {history.map((t) => (
                  <li key={t.id} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-border" />
                    <TransferRow transfer={t} canApprove={canApprove} />
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
