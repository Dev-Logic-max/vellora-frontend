"use client";

import { useState, type ReactNode } from "react";
import { Check, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { downloadEmployeesCsv } from "@/features/employees/employees";

type Format = "csv" | "pdf";

/** Export modal with format options (P15). CSV downloads now; PDF is flagged as
 * coming soon. */
export function ExportEmployeesDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("csv");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (format === "pdf") {
      toast.message("PDF export is coming soon — exporting CSV instead.");
    }
    setBusy(true);
    try {
      await downloadEmployeesCsv();
      toast.success("Export ready");
      setOpen(false);
    } catch {
      toast.error("Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="flex items-start gap-3 border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
            <Download className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Export employees</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Choose a format to download.</p>
          </div>
        </div>

        <div className="space-y-2 px-5 py-5">
          <FormatOption
            active={format === "csv"}
            onClick={() => setFormat("csv")}
            icon={FileSpreadsheet}
            title="CSV spreadsheet"
            desc="Comma-separated values — opens in Excel / Sheets."
            tone="emerald"
          />
          <FormatOption
            active={format === "pdf"}
            onClick={() => setFormat("pdf")}
            icon={FileText}
            title="PDF document"
            desc="Formatted printable directory."
            tone="rose"
            badge="Coming soon"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={run} disabled={busy}>
            {busy ? "Exporting…" : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormatOption({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  tone,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  title: string;
  desc: string;
  tone: "emerald" | "rose";
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors",
        active ? "border-primary bg-accent-soft" : "border-border bg-surface hover:border-foreground/20",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {title}
          {badge ? (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-strong">
              {badge}
            </span>
          ) : null}
          {active ? <Check className="ml-auto size-4 text-primary" /> : null}
        </p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
