"use client";

import { useState } from "react";
import {
  Baseline,
  CalendarDays,
  Columns3,
  Gauge,
  LayoutGrid,
  PanelTop,
  Save,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { applyPrefs, cachePrefs } from "@/features/design/apply";
import { usePlatformDesign, useUpdateDesign } from "@/features/design/design";
import { cacheCalendarStyle } from "@/features/scheduling/calendar-style";
import type { CalendarStyle, Density } from "@/features/design/types";

/** Calendar-style + global UI toggles (density / motion). Changes preview live
 * on the dashboard scope and persist platform-wide on Save. */
export function LayoutTab() {
  const { data } = usePlatformDesign();
  const update = useUpdateDesign();

  const [calendarStyle, setCalendarStyle] = useState<CalendarStyle>(data?.calendarStyle ?? "grid");
  const [density, setDensity] = useState<Density>(data?.prefs?.density ?? "comfortable");
  const [motion, setMotion] = useState<boolean>(data?.prefs?.motion ?? true);
  const [tabsIcons, setTabsIcons] = useState<boolean>(data?.prefs?.tabsIcons ?? true);

  // Live preview of prefs on the dashboard scope.
  const previewPrefs = (next: { density?: Density; motion?: boolean; tabsIcons?: boolean }) => {
    applyPrefs({
      density: next.density ?? density,
      motion: next.motion ?? motion,
      tabsIcons: next.tabsIcons ?? tabsIcons,
    });
  };

  const save = async () => {
    const prefs = { density, motion, tabsIcons };
    try {
      await update.mutateAsync({ calendarStyle, prefs });
      cacheCalendarStyle(calendarStyle);
      cachePrefs(prefs);
      applyPrefs(prefs);
      toast.success("Layout saved", { description: "Calendar style and UI preferences updated." });
    } catch {
      toast.error("Couldn't save layout", { description: "Check your connection and try again." });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="surface-glass overflow-hidden">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">Layout &amp; motion</h3>
            <p className="max-w-xl text-sm text-muted-foreground">
              Choose the scheduling calendar style and tune global density and motion. Changes
              preview live; Save applies them platform-wide.
            </p>
          </div>
          <Button onClick={save} disabled={update.isPending}>
            <Save className="size-4" /> {update.isPending ? "Saving…" : "Save layout"}
          </Button>
        </CardContent>
      </Card>

      {/* Calendar style */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Scheduling calendar</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <StyleCard
            active={calendarStyle === "grid"}
            onClick={() => setCalendarStyle("grid")}
            icon={Columns3}
            title="Time grid"
            description="Hour-by-hour columns with draggable shift blocks."
            preview={<GridPreview />}
          />
          <StyleCard
            active={calendarStyle === "roster"}
            onClick={() => setCalendarStyle("roster")}
            icon={CalendarDays}
            title="Roster"
            description="Employees down the side, days across the top, with totals."
            preview={<RosterPreview />}
          />
        </div>
      </section>

      {/* Density */}
      <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Gauge className="size-4 text-muted-foreground" /> Density
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleCard
            active={density === "comfortable"}
            onClick={() => {
              setDensity("comfortable");
              previewPrefs({ density: "comfortable" });
            }}
            title="Comfortable"
            description="Roomier rows and padding (default)."
          />
          <ToggleCard
            active={density === "compact"}
            onClick={() => {
              setDensity("compact");
              previewPrefs({ density: "compact" });
            }}
            title="Compact"
            description="Tighter rows — more on screen at once."
          />
        </div>
      </section>

      {/* Motion */}
      <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-muted-foreground" /> Motion
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleCard
            active={motion}
            onClick={() => {
              setMotion(true);
              previewPrefs({ motion: true });
            }}
            icon={Sparkles}
            title="Animations on"
            description="Sliding selections, hover lifts, transitions."
          />
          <ToggleCard
            active={!motion}
            onClick={() => {
              setMotion(false);
              previewPrefs({ motion: false });
            }}
            icon={Zap}
            title="Reduced motion"
            description="Minimal animation for a snappier, calmer feel."
          />
        </div>
      </section>

      {/* Tab style */}
      <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PanelTop className="size-4 text-muted-foreground" /> Tab style
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleCard
            active={tabsIcons}
            onClick={() => {
              setTabsIcons(true);
              previewPrefs({ tabsIcons: true });
            }}
            icon={LayoutGrid}
            title="Tabs with icons"
            description="Show an icon beside each sub-tab label."
          />
          <ToggleCard
            active={!tabsIcons}
            onClick={() => {
              setTabsIcons(false);
              previewPrefs({ tabsIcons: false });
            }}
            icon={Baseline}
            title="Text-only tabs"
            description="Cleaner, label-only sub-tabs."
          />
        </div>
      </section>
    </div>
  );
}

function StyleCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  preview,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Columns3;
  title: string;
  description: string;
  preview: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-3 overflow-hidden rounded-xl border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-accent-md",
        active ? "border-transparent ring-2 ring-primary" : "border-border hover:border-faint",
      )}
    >
      <div className="h-28 overflow-hidden rounded-lg border border-border bg-surface-subtle p-2">
        {preview}
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </span>
        {active ? <span className="text-xs font-medium text-primary">Active</span> : null}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

function ToggleCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon?: typeof Gauge;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-accent-sm",
        active ? "border-transparent ring-2 ring-primary" : "border-border hover:border-faint",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            active ? "bg-accent-soft text-accent-strong" : "bg-surface-subtle text-muted-foreground",
          )}
        >
          <Icon className="size-4.5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

/* Tiny themed previews of each calendar style. */
function GridPreview() {
  return (
    <div className="flex h-full gap-1">
      <div className="w-4 rounded bg-accent-soft/60" />
      <div className="grid flex-1 grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, c) => (
          <div key={c} className="relative rounded bg-surface">
            {c % 2 === 0 ? (
              <span className="absolute inset-x-0.5 top-2 h-6 rounded bg-primary/70" />
            ) : null}
            {c === 1 ? (
              <span className="absolute inset-x-0.5 top-10 h-5 rounded bg-success/60" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function RosterPreview() {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-3 w-10 rounded bg-rail" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-rail/80" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, r) => (
        <div key={r} className="flex flex-1 gap-1">
          <div className="w-10 rounded bg-surface" />
          {Array.from({ length: 5 }).map((_, c) => (
            <div key={c} className="relative flex-1 rounded bg-surface">
              {(r + c) % 2 === 0 ? (
                <span className="absolute inset-0.5 rounded bg-primary/50" />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
