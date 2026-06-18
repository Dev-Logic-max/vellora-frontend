"use client";

import { useState, type ReactNode } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { useImportEmployees, type ImportResult } from "@/features/employees/employees";

export function ImportEmployeesDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const importer = useImportEmployees();

  const onFile = async (file?: File) => {
    if (file) setCsv(await file.text());
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import employees</DialogTitle>
          <DialogDescription>
            Upload or paste CSV with a header row:{" "}
            <code className="font-mono text-xs">firstName,lastName,email,phone,role,department</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <Upload className="size-4" />
            Choose a .csv file
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={6}
            placeholder="firstName,lastName,email…"
            className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />

          {result ? (
            <div className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
              Imported {result.created} of {result.total}.{" "}
              {result.skipped > 0 ? `${result.skipped} skipped.` : ""}
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            onClick={onImport}
            disabled={!csv.trim() || importer.isPending}
            className="h-10 w-full"
          >
            {importer.isPending ? "Importing…" : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
