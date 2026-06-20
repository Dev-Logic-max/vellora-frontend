"use client";

import { useState } from "react";
import { Folder, FolderOpen, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCreateFolder, useDeleteFolder, useDocFolders } from "@/features/documents/documents";

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  canManage: boolean;
}

/** Left folder rail with an "All documents" root + per-company folders. */
export function FolderTree({ selectedId, onSelect, canManage }: Props) {
  const { data: folders, isLoading } = useDocFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    createFolder.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          setAdding(false);
        },
      },
    );
  };

  return (
    <aside className="w-full shrink-0 space-y-1 sm:w-60">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          selectedId === null
            ? "bg-accent-soft font-medium text-accent-strong"
            : "text-muted-foreground hover:bg-surface-subtle",
        )}
      >
        <FolderOpen className="size-4" />
        All documents
      </button>

      {isLoading ? (
        <div className="px-3 py-2 text-xs text-muted-foreground">Loading folders…</div>
      ) : (
        (folders ?? []).map((f) => (
          <div key={f.id} className="group flex items-center">
            <button
              type="button"
              onClick={() => onSelect(f.id)}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                selectedId === f.id
                  ? "bg-accent-soft font-medium text-accent-strong"
                  : "text-muted-foreground hover:bg-surface-subtle",
              )}
            >
              <Folder className="size-4" />
              <span className="truncate">{f.name}</span>
            </button>
            {canManage ? (
              <button
                type="button"
                aria-label={`Delete ${f.name}`}
                onClick={() => deleteFolder.mutate(f.id)}
                className="hidden p-1.5 text-muted-foreground hover:text-danger group-hover:block"
              >
                <Trash2 className="size-3.5" />
              </button>
            ) : null}
          </div>
        ))
      )}

      {canManage ? (
        adding ? (
          <div className="flex items-center gap-1 px-1 pt-1">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Folder name"
              className="h-8"
            />
            <Button size="sm" onClick={submit} disabled={createFolder.isPending}>
              Add
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-subtle"
          >
            <Plus className="size-4" />
            New folder
          </button>
        )
      ) : null}
    </aside>
  );
}
