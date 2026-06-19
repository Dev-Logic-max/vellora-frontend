"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { uploadFile } from "@/features/documents/upload";
import { useBulkCreate, useCreateDocument } from "@/features/documents/documents";

interface Props {
  folderId?: string;
  /** Render bulk mode (multiple files) vs single. */
  multiple?: boolean;
  onDone?: () => void;
}

interface FileProgress {
  name: string;
  pct: number;
  done: boolean;
  error?: boolean;
}

/** Drag-drop upload with per-file progress; persists rows once bytes land. */
export function UploadDropzone({ folderId, multiple = true, onDone }: Props) {
  const [items, setItems] = useState<FileProgress[]>([]);
  const [busy, setBusy] = useState(false);
  const createDoc = useCreateDocument();
  const bulk = useBulkCreate();

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (accepted.length === 0) return;
      setBusy(true);
      setItems(accepted.map((f) => ({ name: f.name, pct: 0, done: false })));

      const uploaded: { name: string; storageKey: string; mime?: string; size?: number }[] = [];
      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        try {
          const { storageKey } = await uploadFile(file, (pct) =>
            setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, pct } : it))),
          );
          uploaded.push({ name: file.name, storageKey, mime: file.type, size: file.size });
          setItems((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, pct: 100, done: true } : it)),
          );
        } catch {
          setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, error: true } : it)));
        }
      }

      try {
        if (uploaded.length === 1 && !multiple) {
          await createDoc.mutateAsync({ ...uploaded[0], folderId });
        } else if (uploaded.length > 0) {
          await bulk.mutateAsync({ folderId, files: uploaded });
        }
        toast.success(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded`);
        onDone?.();
      } catch {
        toast.error("Couldn't save the upload");
      } finally {
        setBusy(false);
      }
    },
    [folderId, multiple, createDoc, bulk, onDone],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-accent-strong/50",
          isDragActive && "border-accent-strong bg-accent-soft/40",
        )}
      >
        <input {...getInputProps()} />
        <span className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
          {busy ? <Loader2 className="size-6 animate-spin" /> : <CloudUpload className="size-6" />}
        </span>
        <p className="text-sm font-medium text-foreground">
          {isDragActive ? "Drop to upload" : "Drag & drop, or click to choose"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {multiple ? "Upload one or many files" : "Upload a single file"}
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.name} className="rounded-lg border border-border bg-surface px-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate text-foreground">{it.name}</span>
                <span className={cn("ml-2", it.error ? "text-danger" : "text-muted-foreground")}>
                  {it.error ? "Failed" : it.done ? "Done" : `${it.pct}%`}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", it.error ? "bg-danger" : "bg-accent-strong")}
                  style={{ width: `${it.error ? 100 : it.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
