"use client";

import { usePlatformDesign } from "@/features/design/design";
import type { SectionPattern } from "./types";

export type { SectionPattern };
export const DEFAULT_SECTION_PATTERN: SectionPattern = "glance";
const STORAGE_KEY = "vellora-section-pattern";

export const SECTION_PATTERN_OPTIONS: { value: SectionPattern; label: string; hint: string }[] = [
  { value: "glance", label: "Glance", hint: "Soft accent glow only" },
  { value: "dots", label: "Dots", hint: "Dot field, bottom-right" },
  { value: "hexagons", label: "Hexagons", hint: "Honeycomb outline" },
  { value: "squares", label: "Squares", hint: "Line grid" },
];

const ALL: SectionPattern[] = ["glance", "dots", "hexagons", "squares"];
const isPattern = (v: unknown): v is SectionPattern =>
  typeof v === "string" && (ALL as string[]).includes(v);

export function cacheSectionPattern(value: SectionPattern) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readCachedSectionPattern(): SectionPattern {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isPattern(v) ? v : DEFAULT_SECTION_PATTERN;
  } catch {
    return DEFAULT_SECTION_PATTERN;
  }
}

/**
 * Resolves the active dashboard section pattern. Reads the platform-design pref
 * once loaded (persisted in `prefs.sectionPattern`); falls back to the
 * localStorage cache so the choice survives before the backend value arrives.
 */
export function useSectionPattern(): SectionPattern {
  const { data } = usePlatformDesign();
  const fromServer = data?.prefs?.sectionPattern;
  if (isPattern(fromServer)) return fromServer;
  return readCachedSectionPattern();
}
