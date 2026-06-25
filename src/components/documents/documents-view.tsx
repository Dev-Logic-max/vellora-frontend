"use client";

import { useState } from "react";
import { FolderOpen, Search, Trash2, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useDocuments } from "@/features/documents/documents";
import { DocumentsGrid, MANAGER_ROLES } from "./documents-grid";
import { FolderTree } from "./folder-tree";
import { TrashPanel } from "./trash-panel";
import { UploadDropzone } from "./upload-dropzone";

type DocumentsTab = "library" | "trash";

export function DocumentsView() {
  const { data: me } = useCurrentUser();
  const canManage = Boolean(me?.role && MANAGER_ROLES.includes(me.role));

  const [tab, setTab] = useState<DocumentsTab>("library");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: docs, isLoading } = useDocuments({
    folderId: folderId ?? undefined,
    q: q || undefined,
  });

  const tabs: SegmentedTab<DocumentsTab>[] = [
    { value: "library", label: "Library", icon: FolderOpen },
    ...(canManage ? [{ value: "trash" as const, label: "Trash", icon: Trash2 }] : []),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Documents"
        description="Company library, employee files, e-signatures, and trash."
        actions={
          canManage ? (
            <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
              <SheetTrigger
                render={
                  <Button>
                    <Upload className="size-4" />
                    Upload
                  </Button>
                }
              />
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Upload documents</SheetTitle>
                  <SheetDescription>
                    Files are stored privately and shared via signed links only.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <UploadDropzone
                    folderId={folderId ?? undefined}
                    onDone={() => setUploadOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : null
        }
      />

      <SegmentedTabs tabs={tabs} value={tab} onValueChange={setTab} layoutGroup="documents-tabs" />

      {tab === "library" ? (
        <div className="flex flex-col gap-5 pt-2 sm:flex-row">
          <FolderTree selectedId={folderId} onSelect={setFolderId} canManage={canManage} />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="relative max-w-xs">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search documents…"
                className="h-9 pl-9"
              />
            </div>
            <DocumentsGrid data={docs ?? []} isLoading={isLoading} canManage={canManage} />
          </div>
        </div>
      ) : null}

      {tab === "trash" && canManage ? (
        <div className="pt-2">
          <TrashPanel />
        </div>
      ) : null}
    </div>
  );
}
