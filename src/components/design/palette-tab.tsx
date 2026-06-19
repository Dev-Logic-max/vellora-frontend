"use client";

import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TOKEN_GROUPS,
  clearTokens,
  cacheTokens,
  hexToRgbTriple,
  rgbTripleToHex,
} from "@/features/design/apply";
import { useResetDesign, useUpdateDesign } from "@/features/design/design";
import type { TokenMap } from "@/features/design/types";

interface Props {
  draft: TokenMap;
  onPreview: (varName: string, triple: string) => void;
  onReset: () => void;
}

/**
 * Palette editor: every editable SEMANTIC token as a swatch + color picker.
 * Edits apply live (CSS vars) and are saved to the platform on Save. Values are
 * stored as `R G B` triples; the picker converts to/from hex.
 */
export function PaletteTab({ draft, onPreview, onReset }: Props) {
  const update = useUpdateDesign();
  const reset = useResetDesign();

  function valueFor(varName: string, fallback: string) {
    return draft[varName] ?? fallback;
  }

  async function save() {
    try {
      await update.mutateAsync({ tokens: draft });
      cacheTokens(draft);
      toast.success("Design saved", { description: "The platform palette has been updated." });
    } catch {
      toast.error("Couldn't save design", { description: "Check your connection and try again." });
    }
  }

  async function resetAll() {
    try {
      await reset.mutateAsync();
      clearTokens();
      cacheTokens({});
      onReset();
      toast.success("Reset to Aurora", { description: "Restored the default palette." });
    } catch {
      toast.error("Couldn't reset design");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={resetAll}
          disabled={reset.isPending}
        >
          <RotateCcw className="size-4" /> Reset to Aurora
        </Button>
        <Button onClick={save} disabled={update.isPending}>
          <Save className="size-4" /> {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {TOKEN_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="text-base">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.tokens.map((t) => {
                const triple = valueFor(t.var, t.default);
                return (
                  <div key={t.var} className="flex items-center gap-3">
                    <label
                      className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border"
                      style={{ backgroundColor: `rgb(${triple})` }}
                    >
                      <input
                        type="color"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        value={rgbTripleToHex(triple)}
                        onChange={(e) => onPreview(t.var, hexToRgbTriple(e.target.value))}
                        aria-label={t.label}
                      />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{t.label}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {t.var} · {triple}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
