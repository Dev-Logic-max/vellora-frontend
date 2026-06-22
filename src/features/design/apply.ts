const SCOPE_SELECTOR = ".app-shell";

/**
 * Palette catalog for the Design module's display. Values are read LIVE from the
 * dashboard scope (so they reflect the active accent), not hard-coded. Grouped
 * into the FIXED white base (never themed) and the THEME accent (swappable).
 */
export interface TokenDef {
  var: string;
  label: string;
}
export interface TokenGroup {
  title: string;
  note?: string;
  /** Whether this group changes with the selected theme. */
  themed: boolean;
  tokens: TokenDef[];
}

export const PALETTE_GROUPS: TokenGroup[] = [
  {
    title: "Platform base — white & neutrals (fixed)",
    note: "The permanent foundation — never changes with the theme.",
    themed: false,
    tokens: [
      { var: "--background", label: "Canvas" },
      { var: "--surface", label: "Surface" },
      { var: "--surface-subtle", label: "Subtle" },
      { var: "--surface-3", label: "Deepest" },
      { var: "--border", label: "Border" },
      { var: "--rail-bg", label: "Sidebar" },
      { var: "--foreground", label: "Text" },
      { var: "--muted", label: "Muted text" },
      { var: "--faint", label: "Faint text" },
      { var: "--rail-muted", label: "Nav idle" },
      { var: "--rail-foreground", label: "Nav text" },
      { var: "--rail-border", label: "Sidebar line" },
    ],
  },
  {
    title: "Theme accent & shades (changes with theme)",
    note: "Derived from the selected theme — tints actions, nav, focus, gradients.",
    themed: true,
    tokens: [
      { var: "--accent", label: "Accent" },
      { var: "--accent-strong", label: "Strong" },
      { var: "--accent-soft", label: "Soft" },
      { var: "--primary", label: "Primary" },
      { var: "--secondary-accent", label: "Secondary" },
      { var: "--tertiary-accent", label: "Tertiary" },
      { var: "--ring", label: "Focus ring" },
      { var: "--accent-foreground", label: "On-accent" },
      { var: "--chart-1", label: "Chart lead" },
      { var: "--chart-3", label: "Chart alt" },
      { var: "--chart-4", label: "Chart 3rd" },
      { var: "--chart-2", label: "Chart blue" },
    ],
  },
  {
    title: "Semantic & data colors",
    note: "Status meanings (success/warning/danger/info) + chart series order.",
    themed: true,
    tokens: [
      { var: "--success", label: "Success" },
      { var: "--success-soft", label: "Success soft" },
      { var: "--warning", label: "Warning" },
      { var: "--warning-soft", label: "Warning soft" },
      { var: "--danger", label: "Danger" },
      { var: "--danger-soft", label: "Danger soft" },
      { var: "--info", label: "Info" },
      { var: "--info-soft", label: "Info soft" },
      { var: "--chart-2", label: "Series blue" },
      { var: "--chart-4", label: "Series teal" },
      { var: "--chart-5", label: "Series green" },
      { var: "--chart-6", label: "Series pink" },
    ],
  },
];

/** Reads a CSS variable's live resolved `R G B` value from the dashboard scope. */
export function readLiveToken(varName: string): string {
  if (typeof document === "undefined") return "0 0 0";
  const el = document.querySelector<HTMLElement>(SCOPE_SELECTOR);
  if (!el) return "0 0 0";
  return getComputedStyle(el).getPropertyValue(varName).trim() || "0 0 0";
}

const ACCENT_STORAGE_KEY = "vellora-accent";

/**
 * Selectable accent presets. The platform BASE stays white; the accent only
 * tints active nav, hovers, focus rings, borders, badges, gradients, charts.
 * Each preset's actual shades live in `dashboard.css` under
 * `.app-shell[data-accent="<key>"]`; the swatch here is just for the picker.
 */
export interface AccentOption {
  key: string;
  label: string;
  /** R G B of the main accent shade (used to render shade ramps + gradient). */
  swatch: string;
  /** Premium theme — selectable now, gated to a paid plan later. */
  pro?: boolean;
}
export const ACCENT_OPTIONS: AccentOption[] = [
  { key: "indigo", label: "Indigo", swatch: "79 70 229" },
  { key: "blue", label: "Blue", swatch: "37 99 235" },
  { key: "sky", label: "Sky", swatch: "2 132 199" },
  { key: "cyan", label: "Cyan", swatch: "8 145 178" },
  { key: "teal", label: "Teal", swatch: "13 148 136" },
  { key: "emerald", label: "Emerald", swatch: "5 150 105" },
  { key: "green", label: "Green", swatch: "22 163 74" },
  { key: "lime", label: "Lime", swatch: "101 163 13", pro: true },
  { key: "amber", label: "Amber", swatch: "217 119 6" },
  { key: "orange", label: "Orange", swatch: "234 88 12" },
  { key: "red", label: "Red", swatch: "220 38 38" },
  { key: "rose", label: "Rose", swatch: "225 29 72" },
  { key: "pink", label: "Pink", swatch: "219 39 119", pro: true },
  { key: "fuchsia", label: "Fuchsia", swatch: "192 38 211", pro: true },
  { key: "violet", label: "Violet", swatch: "124 58 237" },
  { key: "purple", label: "Purple", swatch: "147 51 234", pro: true },
  { key: "slate", label: "Slate", swatch: "71 85 105" },
];
export const DEFAULT_ACCENT = "indigo";

/** A 6-step light→full ramp of an accent for swatch rows (rgba alphas). */
export function accentRamp(swatch: string): string[] {
  return [0.1, 0.25, 0.45, 0.7, 0.9, 1].map((a) => `rgb(${swatch} / ${a})`);
}

/** Applies the accent preset to the live dashboard scope via `data-accent`. */
export function applyAccent(accent: string) {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLElement>(SCOPE_SELECTOR).forEach((el) => {
    el.dataset.accent = accent;
  });
}

export function cacheAccent(accent: string) {
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    /* ignore */
  }
}
export function readCachedAccent(): string {
  try {
    return localStorage.getItem(ACCENT_STORAGE_KEY) ?? DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

// ── UI prefs (density / motion) ─────────────────────────────────────────────
const PREFS_STORAGE_KEY = "vellora-ui-prefs";

export interface UiPrefs {
  density?: "comfortable" | "compact";
  motion?: boolean;
  tabsIcons?: boolean;
  /** Dashboard section motif (glance/dots/hexagons/squares). */
  sectionPattern?: "glance" | "dots" | "hexagons" | "squares";
}

/** Applies UI prefs to the dashboard scope via data attributes:
 * `data-density`, `data-motion`, and `data-tabs-icons`. */
export function applyPrefs(prefs: UiPrefs) {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLElement>(SCOPE_SELECTOR).forEach((el) => {
    el.dataset.density = prefs.density ?? "comfortable";
    el.dataset.motion = prefs.motion === false ? "off" : "on";
    el.dataset.tabsIcons = prefs.tabsIcons === false ? "off" : "on";
  });
}

export function cachePrefs(prefs: UiPrefs) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function readCachedPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UiPrefs) : {};
  } catch {
    return {};
  }
}

