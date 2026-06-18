"use client";

import { useState } from "react";
import { Building2, Search, Store as StoreIcon } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";
import { useSearch } from "@/features/org/search";
import type { SearchResult } from "@/features/org/types";

const ICONS = { company: Building2, store: StoreIcon, employee: Building2 } as const;

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useSearch(query);
  const router = useRouter();

  const go = (result: SearchResult) => {
    onOpenChange(false);
    setQuery("");
    router.push(result.href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[15%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, stores…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {query.length < 1 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type to search your company and stores.
            </p>
          ) : (results?.length ?? 0) === 0 && !isFetching ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results.</p>
          ) : (
            results?.map((result) => {
              const Icon = ICONS[result.type];
              return (
                <button
                  key={`${result.type}:${result.id}`}
                  onClick={() => go(result)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{result.label}</span>
                  <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    {result.type}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
