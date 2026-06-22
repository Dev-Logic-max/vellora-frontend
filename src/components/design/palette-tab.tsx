"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PALETTE_GROUPS, readLiveToken } from "@/features/design/apply";
import { cn } from "@/lib/utils";

/** "79 70 229" → "#4F46E5" for display/copy. */
function tripleToHex(triple: string): string {
  const [r, g, b] = triple.trim().split(/\s+/).map(Number);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "#000000";
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** Relative luminance (0 = black, 1 = white) of an "R G B" triple — for ordering. */
function luminance(triple: string): number {
  const [r, g, b] = triple.trim().split(/\s+/).map(Number);
  if ([r, g, b].some((n) => Number.isNaN(n))) return 0;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Live palette display. Shows resolved colors for the current theme — the fixed
 * white base vs the themed accent/semantic groups — 12 per section. Click a
 * swatch to copy its hex. Read-only (the Theme tab is the control).
 */
export function PaletteTab({ accent }: { accent: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const values = useMemo(() => {
    const next: Record<string, string> = {};
    for (const group of PALETTE_GROUPS) {
      for (const t of group.tokens) next[t.var] = readLiveToken(t.var);
    }
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent]);

  function copy(varName: string, hex: string) {
    navigator.clipboard?.writeText(hex).then(
      () => {
        setCopied(varName);
        toast.success(`Copied ${hex}`);
        setTimeout(() => setCopied((c) => (c === varName ? null : c)), 1200);
      },
      () => toast.error("Couldn't copy"),
    );
  }

  return (
    <div className="space-y-6">
      {PALETTE_GROUPS.map((group) => {
        // Order tokens by darkness for a smooth visual gradient down the row.
        // Fixed white base → light → dark; themed accent group → dark → light.
        const ordered = [...group.tokens].sort((a, b) => {
          const la = luminance(values[a.var] ?? "0 0 0");
          const lb = luminance(values[b.var] ?? "0 0 0");
          return group.themed ? la - lb : lb - la;
        });
        return (
          <Card key={group.title} className="relative">
            {/* Plain flex header so the Fixed/Themed badge sits on the RIGHT in the
                same row as the title (CardHeader is a grid → flex wouldn't apply). */}
            <div className="flex items-start justify-between gap-3 px-4">
              <div className="space-y-0.5 pr-2">
                <CardTitle className="text-base">{group.title}</CardTitle>
                {group.note && <p className="text-sm text-muted-foreground">{group.note}</p>}
              </div>
              {group.themed ? (
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong">
                  <Sparkles className="size-3" /> Themed
                </span>
              ) : (
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <Lock className="size-3" /> Fixed
                </span>
              )}
            </div>
            <CardContent>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                {ordered.map((t) => {
                  const triple = values[t.var] ?? "0 0 0";
                  const hex = tripleToHex(triple);
                  const isCopied = copied === t.var;
                  return (
                    <button
                      key={t.var}
                      type="button"
                      onClick={() => copy(t.var, hex)}
                      title={`${t.var} · ${hex} — click to copy`}
                      className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span
                        className="relative h-11 w-full rounded-md border border-border/60"
                        style={{ backgroundColor: `rgb(${triple})` }}
                      >
                        <span
                          className={cn(
                            "absolute inset-0 flex items-center justify-center rounded-md bg-black/0 text-white transition-colors",
                            "group-hover:bg-black/15",
                          )}
                        >
                          {isCopied ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-3.5 opacity-0 transition-opacity group-hover:opacity-90" />
                          )}
                        </span>
                      </span>
                      {/* Compact: name on the left, hex code small on the right. */}
                      <span className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-[11px] font-medium text-foreground">
                          {t.label}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
                          {hex}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
