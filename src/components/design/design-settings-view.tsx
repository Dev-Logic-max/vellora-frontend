"use client";

import { useEffect, useState } from "react";
import { Blocks, LayoutGrid, Palette, SwatchBook } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatformDesign } from "@/features/design/design";
import { applyAccent, cacheAccent, readCachedAccent } from "@/features/design/apply";
import { AccentTab } from "./accent-tab";
import { ComponentsTab } from "./components-tab";
import { PaletteTab } from "./palette-tab";
import { WidgetsTab } from "./widgets-tab";

/**
 * Design Settings module — tabbed shell. The platform base is white & fixed; the
 * selected accent only tints the dashboard. Applies the effective accent live to
 * `.app-shell` via `data-accent` (with hover-preview), and hosts the four tabs.
 */
export function DesignSettingsView() {
  const { data } = usePlatformDesign();
  // Committed pick (null → fall back to server/cache) + a transient hover preview.
  const [pick, setPick] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const committed = pick ?? data?.themeKey ?? readCachedAccent();
  const effective = preview ?? committed;

  // Apply the previewed-or-committed accent live; only the COMMITTED one is cached.
  useEffect(() => {
    applyAccent(effective);
  }, [effective]);
  useEffect(() => {
    cacheAccent(committed);
  }, [committed]);

  return (
    <Tabs defaultValue="accent" className="space-y-6">
      <TabsList>
        <TabsTrigger value="accent">
          <SwatchBook className="size-4" /> Theme
        </TabsTrigger>
        <TabsTrigger value="palette">
          <Palette className="size-4" /> Palette
        </TabsTrigger>
        <TabsTrigger value="components">
          <LayoutGrid className="size-4" /> Components
        </TabsTrigger>
        <TabsTrigger value="widgets">
          <Blocks className="size-4" /> Widgets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="accent">
        <AccentTab accent={committed} onSelect={setPick} onPreview={setPreview} />
      </TabsContent>
      <TabsContent value="palette">
        <PaletteTab accent={effective} />
      </TabsContent>
      <TabsContent value="components">
        <ComponentsTab />
      </TabsContent>
      <TabsContent value="widgets">
        <WidgetsTab />
      </TabsContent>
    </Tabs>
  );
}
