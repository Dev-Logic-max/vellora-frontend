"use client";

import { Download, FileSignature, MoreVertical, PenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/session/use-current-user";
import {
  openDocument,
  useRequestSignatures,
  useSoftDeleteDocument,
} from "@/features/documents/documents";
import type { DocumentItem } from "@/features/documents/types";
import { DocTypeIcon } from "./doc-type-icon";
import { ESignModal } from "./e-sign-modal";
import { ExpiryChip } from "./expiry-chip";

interface Props {
  data: DocumentItem[];
  isLoading: boolean;
  canManage: boolean;
}

const MANAGER_ROLES = ["owner", "hr", "area_manager", "store_manager"];

/** File grid (08-documents §7): type tile, name, expiry chip, per-doc actions. */
export function DocumentsGrid({ data, isLoading, canManage }: Props) {
  const { data: me } = useCurrentUser();
  const requestSign = useRequestSignatures();
  const softDelete = useSoftDeleteDocument();

  const download = async (id: string) => {
    try {
      await openDocument(id);
    } catch {
      toast.error("Couldn't open the document");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileSignature}
        title="No documents here"
        description="Upload a file to get started."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((doc) => {
        const myPending = doc.signatures?.find(
          (s) => s.signerId === me?.userId && s.status === "requested",
        );
        const signedCount = doc.signatures?.filter((s) => s.status === "signed").length ?? 0;
        return (
          <div
            key={doc.id}
            className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-surface-subtle"
          >
            <div className="flex items-start gap-3">
              <DocTypeIcon mime={doc.mime} name={doc.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                {doc.category ? (
                  <p className="truncate text-xs text-muted-foreground">{doc.category}</p>
                ) : null}
              </div>
              <MoreVertical className="size-4 shrink-0 text-muted-foreground/50" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ExpiryChip expiresAt={doc.expiresAt} />
              {signedCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
                  <PenLine className="size-3" />
                  {signedCount} signed
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
              <Button variant="ghost" size="sm" onClick={() => download(doc.id)}>
                <Download className="size-3.5" />
                Open
              </Button>

              {myPending ? (
                <ESignModal
                  signatureId={myPending.id}
                  documentName={doc.name}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <PenLine className="size-3.5" />
                      Sign
                    </Button>
                  }
                />
              ) : canManage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={requestSign.isPending || !me?.userId}
                  onClick={() =>
                    me?.userId &&
                    requestSign.mutate(
                      { documentId: doc.id, signerIds: [me.userId] },
                      { onSuccess: () => toast.success("Signature requested") },
                    )
                  }
                >
                  <FileSignature className="size-3.5" />
                  Request sign
                </Button>
              ) : null}

              {canManage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-danger"
                  onClick={() => softDelete.mutate(doc.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { MANAGER_ROLES };
