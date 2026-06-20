"use client";

import { Check, Crown, Moon, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACCENT_OPTIONS,
  DEFAULT_ACCENT,
  accentRamp,
  applyAccent,
  cacheAccent,
} from "@/features/design/apply";
import { useResetDesign, useUpdateDesign } from "@/features/design/design";
import { cn } from "@/lib/utils";

interface Props {
  accent: string;
  onSelect: (accent: string) => void;
  /** Preview an accent on hover (null = revert to the committed selection). */
  onPreview: (accent: string | null) => void;
}

/**
 * Theme (accent) switcher. The platform stays white; a theme only re-tints
 * accents. Cards preview on hover, select on click; Save persists platform-wide.
 */
export function AccentTab({ accent, onSelect, onPreview }: Props) {
  const update = useUpdateDesign();
  const reset = useResetDesign();

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

  async function resetTheme() {
    try {
      await reset.mutateAsync();
      onSelect(DEFAULT_ACCENT);
      applyAccent(DEFAULT_ACCENT);
      cacheAccent(DEFAULT_ACCENT);
      toast.success("Reset", { description: "Restored the default Indigo theme." });
    } catch {
      toast.error("Couldn't reset theme");
    }
  }

  return (
    <div className="space-y-6" onMouseLeave={() => onPreview(null)}>
      {/* Header / intro */}
      <Card className="surface-glass overflow-hidden">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">Platform theme</h3>
            <p className="max-w-xl text-sm text-muted-foreground">
              The base stays <span className="font-medium text-foreground">premium white</span>. Pick a
              theme to tint accents across the dashboard — nav, hovers, focus, charts and gradients.
              Hover a card to preview, click to apply, then Save.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetTheme} disabled={reset.isPending}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button onClick={save} disabled={update.isPending}>
              <Save className="size-4" /> {update.isPending ? "Saving…" : "Save theme"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ACCENT_OPTIONS.map((opt) => {
          const selected = opt.key === accent;
          const ramp = accentRamp(opt.swatch);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              onMouseEnter={() => onPreview(opt.key)}
              onFocus={() => onPreview(opt.key)}
              className={cn(
                "group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg",
                selected
                  ? "border-transparent ring-2 ring-primary"
                  : "border-border hover:border-faint",
              )}
            >
              {/* gradient header */}
              <div
                className="relative h-16 rounded-lg"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgb(${opt.swatch}), rgb(${opt.swatch} / 0.45))`,
                }}
              >
                {opt.pro && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
                    <Crown className="size-3 text-amber-500" /> PRO
                  </span>
                )}
                {selected && (
                  <span className="absolute left-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-white text-foreground shadow-sm">
                    <Check className="size-3.5" />
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
                {selected ? (
                  <span className="text-xs font-medium text-primary">Active</span>
                ) : (
                  <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Preview
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dark mode — coming soon */}
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
    </div>
  );
}

function labelFor(key: string) {
  return ACCENT_OPTIONS.find((o) => o.key === key)?.label ?? key;
}
