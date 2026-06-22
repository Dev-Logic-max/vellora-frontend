"use client";

import { useState } from "react";
import {
  Baseline,
  CalendarDays,
  Columns3,
  Gauge,
  LayoutGrid,
  LayoutTemplate,
  PanelTop,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { GradientHeaderCard } from "@/components/ui/gradient-header-card";
import { SectionDecor } from "@/components/dashboard/section-decor";
import { cn } from "@/lib/utils";
import { applyPrefs, cachePrefs } from "@/features/design/apply";
import { usePlatformDesign, useUpdateDesign } from "@/features/design/design";
import { cacheCalendarStyle } from "@/features/scheduling/calendar-style";
import {
  SECTION_PATTERN_OPTIONS,
  cacheSectionPattern,
} from "@/features/design/section-pattern";
import type { CalendarStyle, Density, SectionPattern } from "@/features/design/types";

/** Calendar-style + global UI toggles (density / motion). Changes preview live
 * on the dashboard scope and persist platform-wide via the bottom action bar. */
export function LayoutTab() {
  const { data } = usePlatformDesign();
  const update = useUpdateDesign();

  const savedCalendar = data?.calendarStyle ?? "grid";
  const savedDensity = data?.prefs?.density ?? "comfortable";
  const savedMotion = data?.prefs?.motion ?? true;
  const savedTabsIcons = data?.prefs?.tabsIcons ?? true;
  const savedPattern = data?.prefs?.sectionPattern ?? "glance";

  const [calendarStyle, setCalendarStyle] = useState<CalendarStyle>(savedCalendar);
  const [density, setDensity] = useState<Density>(savedDensity);
  const [motion, setMotion] = useState<boolean>(savedMotion);
  const [tabsIcons, setTabsIcons] = useState<boolean>(savedTabsIcons);
  const [pattern, setPattern] = useState<SectionPattern>(savedPattern);

  const dirty =
    calendarStyle !== savedCalendar ||
    density !== savedDensity ||
    motion !== savedMotion ||
    tabsIcons !== savedTabsIcons ||
    pattern !== savedPattern;

  // Live preview of prefs on the dashboard scope.
  const previewPrefs = (next: { density?: Density; motion?: boolean; tabsIcons?: boolean }) => {
    applyPrefs({
      density: next.density ?? density,
      motion: next.motion ?? motion,
      tabsIcons: next.tabsIcons ?? tabsIcons,
    });
  };

  const save = async () => {
    const prefs = { density, motion, tabsIcons, sectionPattern: pattern };
    try {
      await update.mutateAsync({ calendarStyle, prefs });
      cacheCalendarStyle(calendarStyle);
      cachePrefs(prefs);
      cacheSectionPattern(pattern);
      applyPrefs(prefs);
      toast.success("Layout saved", { description: "Calendar style and UI preferences updated." });
    } catch {
      toast.error("Couldn't save layout", { description: "Check your connection and try again." });
    }
  };

  const resetToSaved = () => {
    setCalendarStyle(savedCalendar);
    setDensity(savedDensity);
    setMotion(savedMotion);
    setTabsIcons(savedTabsIcons);
    setPattern(savedPattern);
    applyPrefs({ density: savedDensity, motion: savedMotion, tabsIcons: savedTabsIcons });
  };

  return (
    <div className="space-y-6">
      <GradientHeaderCard
        title="Layout & motion"
        icon={<LayoutTemplate className="size-5" />}
        pattern="grid"
        description="Choose the scheduling calendar style and tune global density, motion, and tab style. Changes preview live; save from the bar that appears at the bottom."
      />

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

      {/* Dashboard section pattern */}
      <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <LayoutGrid className="size-4 text-muted-foreground" /> Dashboard section design
        </h4>
        <p className="-mt-1 text-xs text-muted-foreground">
          The motif behind dashboard cards and sections.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTION_PATTERN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPattern(opt.value)}
              className={cn(
                "group flex flex-col gap-2 rounded-xl border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-accent-sm",
                pattern === opt.value
                  ? "border-transparent ring-2 ring-primary"
                  : "border-border hover:border-faint",
              )}
            >
              <SectionDecor
                kind={opt.value}
                className="h-16 rounded-lg border border-border bg-surface-subtle/50"
              >
                <span className="sr-only">{opt.label} preview</span>
              </SectionDecor>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                {pattern === opt.value ? (
                  <span className="text-xs font-medium text-primary">Active</span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{opt.hint}</p>
            </button>
          ))}
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

      <BottomActionBar
        open={dirty}
        message="You have unsaved layout changes."
        onSave={save}
        onReset={resetToSaved}
        saveLabel="Save layout"
        saving={update.isPending}
        showCancel={false}
      />
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
