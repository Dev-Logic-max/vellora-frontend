"use client";

import { useEffect, useState } from "react";
import { Blocks, LayoutGrid, LayoutTemplate, Palette, SwatchBook } from "lucide-react";

import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { usePlatformDesign } from "@/features/design/design";
import { applyAccent, cacheAccent, readCachedAccent } from "@/features/design/apply";
import { AccentTab } from "./accent-tab";
import { ComponentsTab } from "./components-tab";
import { LayoutTab } from "./layout-tab";
import { PaletteTab } from "./palette-tab";
import { WidgetsTab } from "./widgets-tab";

type DesignTab = "accent" | "layout" | "palette" | "components" | "widgets";

const TABS: SegmentedTab<DesignTab>[] = [
  { value: "accent", label: "Theme", icon: SwatchBook },
  { value: "layout", label: "Layout", icon: LayoutTemplate },
  { value: "palette", label: "Palette", icon: Palette },
  { value: "components", label: "Components", icon: LayoutGrid },
  { value: "widgets", label: "Widgets", icon: Blocks },
];

/**
 * Design Settings module — tabbed shell. The platform base is white & fixed; the
 * selected accent only tints the dashboard. Applies the effective accent live to
 * `.app-shell` via `data-accent` (with hover-preview), and hosts the tabs.
 */
export function DesignSettingsView() {
  const { data } = usePlatformDesign();
  const [tab, setTab] = useState<DesignTab>("accent");
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
    <div className="space-y-6">
      <div className="overflow-x-auto pb-1">
        <SegmentedTabs tabs={TABS} value={tab} onValueChange={setTab} layoutGroup="design-tabs" />
      </div>

      {tab === "accent" ? (
        <AccentTab accent={committed} onSelect={setPick} onPreview={setPreview} />
      ) : null}
      {tab === "layout" ? <LayoutTab /> : null}
      {tab === "palette" ? <PaletteTab accent={effective} /> : null}
      {tab === "components" ? <ComponentsTab /> : null}
      {tab === "widgets" ? <WidgetsTab /> : null}
    </div>
  );
}
