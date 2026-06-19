import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  File as FileIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type DocKind = "image" | "pdf" | "sheet" | "archive" | "text" | "other";

function kindFor(mime: string | null, name: string): DocKind {
  const m = mime ?? "";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (m.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (m.includes("pdf") || ext === "pdf") return "pdf";
  if (m.includes("sheet") || ["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (m.includes("zip") || ["zip", "rar", "7z"].includes(ext)) return "archive";
  if (m.startsWith("text/") || ["doc", "docx", "txt", "md"].includes(ext)) return "text";
  return "other";
}

const ICON_CLASS = "size-4.5";

/** File type glyph in a soft tile (08-documents §7). */
export function DocTypeIcon({
  mime,
  name,
  className,
}: {
  mime: string | null;
  name: string;
  className?: string;
}) {
  const kind = kindFor(mime, name);
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong",
        className,
      )}
    >
      {kind === "image" ? (
        <FileImage className={ICON_CLASS} />
      ) : kind === "pdf" ? (
        <FileType className={ICON_CLASS} />
      ) : kind === "sheet" ? (
        <FileSpreadsheet className={ICON_CLASS} />
      ) : kind === "archive" ? (
        <FileArchive className={ICON_CLASS} />
      ) : kind === "text" ? (
        <FileText className={ICON_CLASS} />
      ) : (
        <FileIcon className={ICON_CLASS} />
      )}
    </span>
  );
}
