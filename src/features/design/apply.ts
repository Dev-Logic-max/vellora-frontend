import type { TokenMap } from "./types";

/**
 * The editable SEMANTIC tokens (the layer themes swap), grouped for the editor.
 * Values here are the Aurora defaults (`R G B` triples) — the baseline shown
 * when there's no override. Only these are exposed; primitives are never edited.
 * Keep in sync with `dashboard.css`.
 */
export interface TokenDef {
  var: string;
  label: string;
  default: string; // R G B
}
export interface TokenGroup {
  title: string;
  tokens: TokenDef[];
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    title: "Brand & accents",
    tokens: [
      { var: "--accent", label: "Primary (indigo)", default: "79 70 229" },
      { var: "--accent-strong", label: "Primary hover", default: "67 56 202" },
      { var: "--secondary-accent", label: "Secondary (teal)", default: "20 184 166" },
      { var: "--tertiary-accent", label: "Accent (violet)", default: "139 92 246" },
    ],
  },
  {
    title: "Surfaces",
    tokens: [
      { var: "--background", label: "Canvas", default: "250 250 251" },
      { var: "--surface", label: "Card", default: "255 255 255" },
      { var: "--surface-subtle", label: "Subtle", default: "244 244 246" },
      { var: "--surface-3", label: "Deepest", default: "237 238 242" },
      { var: "--border", label: "Border", default: "231 231 233" },
    ],
  },
  {
    title: "Text",
    tokens: [
      { var: "--foreground", label: "Foreground", default: "10 10 11" },
      { var: "--muted", label: "Muted", default: "107 114 128" },
      { var: "--faint", label: "Faint", default: "156 163 175" },
    ],
  },
  {
    title: "Semantic states",
    tokens: [
      { var: "--success", label: "Success", default: "22 163 74" },
      { var: "--warning", label: "Warning", default: "217 119 6" },
      { var: "--danger", label: "Danger", default: "220 38 38" },
      { var: "--info", label: "Info", default: "14 165 233" },
    ],
  },
  {
    title: "Chart series",
    tokens: [
      { var: "--chart-1", label: "Series 1", default: "79 70 229" },
      { var: "--chart-2", label: "Series 2", default: "59 130 246" },
      { var: "--chart-3", label: "Series 3", default: "139 92 246" },
      { var: "--chart-4", label: "Series 4", default: "20 184 166" },
      { var: "--chart-5", label: "Series 5", default: "16 185 129" },
      { var: "--chart-6", label: "Series 6", default: "244 114 182" },
    ],
  },
];

/** Flat default token map (every editable token → its Aurora default). */
export const AURORA_DEFAULT_TOKENS: TokenMap = Object.fromEntries(
  TOKEN_GROUPS.flatMap((g) => g.tokens.map((t) => [t.var, t.default])),
);

const SCOPE_SELECTOR = ".app-shell";
const STORAGE_KEY = "vellora-design-tokens";

/** Applies overrides to the live dashboard scope via inline CSS variables. */
export function applyTokens(tokens: TokenMap) {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(SCOPE_SELECTOR);
  if (!el) return;
  for (const [k, v] of Object.entries(tokens)) {
    el.style.setProperty(k, v);
  }
}

/** Clears all inline overrides, falling back to dashboard.css Aurora values. */
export function clearTokens() {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(SCOPE_SELECTOR);
  if (!el) return;
  for (const def of TOKEN_GROUPS.flatMap((g) => g.tokens)) {
    el.style.removeProperty(def.var);
  }
}

/** localStorage cache for instant apply before the API responds (degrade-safe). */
export function cacheTokens(tokens: TokenMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    /* ignore quota/availability errors */
  }
}
export function readCachedTokens(): TokenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenMap) : {};
  } catch {
    return {};
  }
}

/* ── color conversion helpers (the editor uses <input type=color> = hex) ── */

export function rgbTripleToHex(triple: string): string {
  const [r, g, b] = triple.trim().split(/\s+/).map(Number);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "#000000";
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function hexToRgbTriple(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "0 0 0";
  const int = parseInt(m[1], 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}
