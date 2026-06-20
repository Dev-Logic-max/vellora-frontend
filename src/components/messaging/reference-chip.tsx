"use client";

import { LinkIcon } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { refHref, REF_TYPE_LABELS, type MessageRef } from "@/features/messaging/types";

/** A compact card for an inline record reference; clicks through to the record. */
export function ReferenceChip({ refData }: { refData: MessageRef }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(refHref(refData))}
      className="mt-1.5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
    >
      <LinkIcon className="size-3.5 text-accent-strong" />
      <span className="font-medium">{REF_TYPE_LABELS[refData.type]}</span>
      <span className="text-muted-foreground">{refData.label ?? refData.id.slice(0, 8)}</span>
    </button>
  );
}
