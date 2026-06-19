"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette, LayoutGrid, Sparkles } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatformDesign } from "@/features/design/design";
import { applyTokens, cacheTokens, readCachedTokens } from "@/features/design/apply";
import type { TokenMap } from "@/features/design/types";
import { PaletteTab } from "./palette-tab";
import { ComponentsTab } from "./components-tab";
import { ThemePacksTab } from "./theme-packs-tab";

/**
 * Design Settings module — tabbed shell. The effective palette = server tokens
 * (or cached, before the API responds) merged with the admin's in-session edits.
 * Effects only sync the DOM/localStorage (never setState) to keep renders clean.
 */
export function DesignSettingsView() {
  const { data } = usePlatformDesign();
  // Cached tokens read once (lazy init) for instant, no-flash preview.
  const [cached] = useState<TokenMap>(() => readCachedTokens());
  // Only the admin's in-session edits live in state; base comes from the query.
  const [edits, setEdits] = useState<TokenMap>({});

  const base = data?.tokens ?? cached;
  const draft = useMemo<TokenMap>(() => ({ ...base, ...edits }), [base, edits]);

  // Apply the effective palette to the live dashboard scope + cache it.
  useEffect(() => {
    applyTokens(draft);
    cacheTokens(draft);
  }, [draft]);

  function previewToken(varName: string, triple: string) {
    setEdits((prev) => ({ ...prev, [varName]: triple }));
  }

  function resetDraft() {
    setEdits({});
  }

  return (
    <Tabs defaultValue="palette" className="space-y-6">
      <TabsList>
        <TabsTrigger value="palette">
          <Palette className="size-4" /> Palette
        </TabsTrigger>
        <TabsTrigger value="components">
          <LayoutGrid className="size-4" /> Components
        </TabsTrigger>
        <TabsTrigger value="packs">
          <Sparkles className="size-4" /> Theme packs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="palette">
        <PaletteTab draft={draft} onPreview={previewToken} onReset={resetDraft} />
      </TabsContent>
      <TabsContent value="components">
        <ComponentsTab />
      </TabsContent>
      <TabsContent value="packs">
        <ThemePacksTab />
      </TabsContent>
    </Tabs>
  );
}
