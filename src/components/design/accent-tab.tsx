"use client";

import { useState } from "react";
import { Check, Crown, Eye, Moon, Palette, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientHeaderCard } from "@/components/ui/gradient-header-card";
import {
  ACCENT_OPTIONS,
  DEFAULT_ACCENT,
  accentRamp,
  applyAccent,
  cacheAccent,
} from "@/features/design/apply";
import { usePlatformDesign, useResetDesign, useUpdateDesign } from "@/features/design/design";
import { cn } from "@/lib/utils";

interface Props {
  /** The committed pick (what Save would persist). */
  accent: string;
  /** Commit a selection (the "Set" action). */
  onSelect: (accent: string) => void;
  /** Temporarily preview an accent (null = revert to the committed pick). */
  onPreview: (accent: string | null) => void;
}

// First 8 presets are the free "Standard" set; the rest are Pro.
const STANDARD_COUNT = 8;

/**
 * Theme (accent) switcher. The platform stays white; a theme only re-tints
 * accents. Click "Preview" to apply temporarily, "Set" to choose it — then Save
 * from the bottom action bar to persist platform-wide.
 */
export function AccentTab({ accent, onSelect, onPreview }: Props) {
  const { data } = usePlatformDesign();
  const update = useUpdateDesign();
  const reset = useResetDesign();

  const savedTheme = data?.themeKey ?? DEFAULT_ACCENT;
  const [previewing, setPreviewing] = useState<string | null>(null);
  // The bar shows whenever the committed pick differs from what's saved.
  const dirty = accent !== savedTheme;

  const standard = ACCENT_OPTIONS.slice(0, STANDARD_COUNT);
  const pro = ACCENT_OPTIONS.slice(STANDARD_COUNT);

  function preview(key: string) {
    setPreviewing(key);
    onPreview(key);
  }
  function set(key: string) {
    setPreviewing(null);
    onPreview(null);
    onSelect(key);
  }

  async function save() {
    try {
      await update.mutateAsync({ themeKey: accent });
      toast.success("Theme saved", {
        description: `“${labelFor(accent)}” is now the platform theme.`,
      });
    } catch {
      toast.error("Couldn't save theme", { description: "Check your connection and try again." });
    }
  }

  function cancel() {
    setPreviewing(null);
    onPreview(null);
    onSelect(savedTheme);
    applyAccent(savedTheme);
  }

  async function resetTheme() {
    try {
      await reset.mutateAsync();
      onSelect(DEFAULT_ACCENT);
      applyAccent(DEFAULT_ACCENT);
      cacheAccent(DEFAULT_ACCENT);
      setPreviewing(null);
      onPreview(null);
      toast.success("Reset", { description: "Restored the default Indigo theme." });
    } catch {
      toast.error("Couldn't reset theme");
    }
  }

  return (
    <div className="space-y-6">
      <GradientHeaderCard
        title="Platform theme"
        icon={<Palette className="size-5" />}
        pattern="dots"
        description={
          <>
            The base stays <span className="font-medium text-foreground">premium white</span>. A
            theme only tints accents across the dashboard — nav, hovers, focus, charts and
            gradients. Click <span className="font-medium text-foreground">Preview</span> to try one
            live, <span className="font-medium text-foreground">Set</span> to choose it, then Save.
          </>
        }
      >
        <div className="mt-2 flex flex-wrap gap-2">
          <Hint icon={Eye} text="Preview — apply temporarily" />
          <Hint icon={Check} text="Set — make it your pick" />
          <Hint icon={Crown} text="Pro themes need a plan" />
        </div>
      </GradientHeaderCard>

      {/* Standard themes */}
      <section className="space-y-3">
        <SectionTitle icon={Sparkles} title="Standard themes" note="Free on every plan." />
        <ThemeGrid
          options={standard}
          accent={accent}
          previewing={previewing}
          onPreview={preview}
          onSet={set}
        />
      </section>

      {/* Pro themes */}
      <section className="space-y-3">
        <SectionTitle
          icon={Crown}
          title="Pro themes"
          note="Premium palettes — selectable now, plan-gated later."
        />
        <ThemeGrid
          options={pro}
          accent={accent}
          previewing={previewing}
          onPreview={preview}
          onSet={set}
          pro
        />
      </section>

      {/* Dark mode — coming soon (kept as-is) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="size-4 text-muted-foreground" /> Dark mode
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Coming soon
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A full dark theme is on the roadmap. For now Vellora runs in premium white mode only.
          </p>
        </CardContent>
      </Card>

      <BottomActionBar
        open={dirty}
        message={
          <>
            Theme set to <span className="font-medium text-foreground">{labelFor(accent)}</span> —
            save to apply platform-wide.
          </>
        }
        onSave={save}
        onReset={resetTheme}
        onCancel={cancel}
        saveLabel="Save theme"
        saving={update.isPending}
      />
    </div>
  );
}

function ThemeGrid({
  options,
  accent,
  previewing,
  onPreview,
  onSet,
  pro,
}: {
  options: typeof ACCENT_OPTIONS;
  accent: string;
  previewing: string | null;
  onPreview: (key: string) => void;
  onSet: (key: string) => void;
  pro?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {options.map((opt) => (
        <ThemeCard
          key={opt.key}
          opt={opt}
          selected={opt.key === accent}
          previewing={opt.key === previewing}
          onPreview={() => onPreview(opt.key)}
          onSet={() => onSet(opt.key)}
          pro={pro}
        />
      ))}
    </div>
  );
}

function ThemeCard({
  opt,
  selected,
  previewing,
  onPreview,
  onSet,
  pro,
}: {
  opt: (typeof ACCENT_OPTIONS)[number];
  selected: boolean;
  previewing: boolean;
  onPreview: () => void;
  onSet: () => void;
  pro?: boolean;
}) {
  const ramp = accentRamp(opt.swatch);
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg",
        selected ? "border-transparent ring-2 ring-primary" : "border-border hover:border-faint",
        previewing && !selected && "ring-2 ring-accent/40",
      )}
    >
      {/* gradient header */}
      <div
        className="relative h-16 rounded-lg"
        style={{
          backgroundImage: `linear-gradient(135deg, rgb(${opt.swatch}), rgb(${opt.swatch} / 0.45))`,
        }}
      >
        {pro && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
            <Crown className="size-3 text-amber-500" /> PRO
          </span>
        )}
        {selected && (
          <span className="absolute top-2 left-2 inline-flex size-5 items-center justify-center rounded-full bg-white text-foreground shadow-sm">
            <Check className="size-3.5" />
          </span>
        )}
        {previewing && !selected && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
            <Eye className="size-3" /> Preview
          </span>
        )}
      </div>

      {/* shade ramp */}
      <div className="flex gap-1">
        {ramp.map((c, i) => (
          <span key={i} className="h-4 flex-1 rounded-sm" style={{ backgroundColor: c }} />
        ))}
      </div>

      <div className="flex items-center justify-between px-0.5">
        <span className="text-sm font-medium text-foreground">{opt.label}</span>
        {selected ? <span className="text-xs font-medium text-primary">Active</span> : null}
      </div>

      {/* Action icons (bottom-right) — expand to icon + label on hover. */}
      <div className="flex items-center justify-end gap-1.5">
        {pro ? (
          <IconAction
            icon={Plus}
            label="Custom"
            onClick={() => toast.info("Custom blend", { description: "Two-color custom themes are coming with Pro." })}
          />
        ) : null}
        <IconAction icon={Eye} label="Preview" onClick={onPreview} />
        <IconAction icon={Check} label="Set" primary onClick={onSet} />
      </div>
    </div>
  );
}

/** A compact icon button that grows to icon + text on hover. */
function IconAction({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group/act inline-flex h-7 items-center gap-1 rounded-lg border px-1.5 text-xs font-medium transition-all",
        primary
          ? "border-accent/30 bg-accent-soft text-accent-strong hover:bg-accent hover:text-(--accent-foreground,white)"
          : "border-border bg-surface text-muted-foreground hover:border-accent/30 hover:bg-accent-soft hover:text-accent-strong",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover/act:max-w-20 group-hover/act:opacity-100">
        {label}
      </span>
    </button>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  note,
}: {
  icon: typeof Sparkles;
  title: string;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-accent-strong" />
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {note ? <span className="text-xs text-muted-foreground">· {note}</span> : null}
    </div>
  );
}

function Hint({ icon: Icon, text }: { icon: typeof Eye; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-2.5 py-1 text-xs font-medium text-foreground-2 backdrop-blur-sm">
      <Icon className="size-3.5 text-accent-strong" /> {text}
    </span>
  );
}

function labelFor(key: string) {
  return ACCENT_OPTIONS.find((o) => o.key === key)?.label ?? key;
}
