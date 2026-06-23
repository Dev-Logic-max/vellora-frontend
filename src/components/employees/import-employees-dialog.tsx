"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { useImportEmployees, type ImportResult } from "@/features/employees/employees";

/** The CSV columns the importer understands (shown as a structure table). */
const CSV_COLUMNS: { name: string; required: boolean; example: string }[] = [
  { name: "firstName", required: true, example: "Giuseppe" },
  { name: "lastName", required: true, example: "Ferrari" },
  { name: "email", required: false, example: "g.ferrari@acme.com" },
  { name: "phone", required: false, example: "+39 333 000 1111" },
  { name: "role", required: false, example: "Barista" },
  { name: "department", required: false, example: "Floor" },
];

export function ImportEmployeesDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const importer = useImportEmployees();

  const takeFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setCsv(await file.text());
    setResult(null);
    setError(null);
  };

  const reset = () => {
    setCsv("");
    setFileName(null);
    setResult(null);
    setError(null);
  };

  const onImport = async () => {
    setError(null);
    setResult(null);
    try {
      setResult(await importer.mutateAsync(csv));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Import failed.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="flex items-start gap-3 border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
            <Upload className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Import employees</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Drag a CSV in or browse. Rows missing required columns are skipped.
            </p>
          </div>
        </div>

        <div className="scrollbar-none max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
          {/* Drag & drop zone. */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void takeFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
              dragging
                ? "border-primary bg-accent-soft"
                : "border-border bg-surface-subtle/40 hover:border-primary/40 hover:bg-accent-soft/40",
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-primary">
              <FileSpreadsheet className="size-6" />
            </span>
            {fileName ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CheckCircle2 className="size-4 text-emerald-500" />
                {fileName}
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  Drop your .csv here, or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">Header row required</p>
              </>
            )}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => void takeFile(e.target.files?.[0])}
            />
          </label>

          {/* Data structure table. */}
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-primary" />
              <h4 className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                Expected columns
              </h4>
              <span className="h-px flex-1 bg-linear-to-r from-accent/30 to-transparent" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle/60 text-left text-xs text-muted-foreground uppercase">
                    <th className="px-3 py-2 font-semibold">Column</th>
                    <th className="px-3 py-2 font-semibold">Required</th>
                    <th className="px-3 py-2 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {CSV_COLUMNS.map((c) => (
                    <tr key={c.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-mono text-xs text-foreground">{c.name}</td>
                      <td className="px-3 py-2">
                        {c.required ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
                            Required
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optional paste fallback. */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Or paste CSV text
            </summary>
            <textarea
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value);
                setFileName(null);
              }}
              rows={5}
              placeholder="firstName,lastName,email…"
              className="mt-2 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </details>

          {result ? (
            <div className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
              Imported {result.created} of {result.total}.{" "}
              {result.skipped > 0 ? `${result.skipped} skipped.` : ""}
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onImport} disabled={!csv.trim() || importer.isPending}>
            {importer.isPending ? "Importing…" : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
