/** Sparse map of overridden semantic tokens: `{ '--accent': '79 70 229' }` (R G B). */
export type TokenMap = Record<string, string>;

/** Active platform design returned by the backend (Aurora defaults if unset). */
export interface ActiveDesign {
  themeKey: string;
  tokens: TokenMap;
}

export interface UpdateDesignInput {
  themeKey?: string;
  tokens?: TokenMap;
}

/** A theme pack shown in the Theme Packs tab. Only `aurora` is live in v1.1. */
export interface ThemePack {
  key: string;
  label: string;
  description: string;
  /** Preview swatches as `R G B` triples. */
  swatches: string[];
  status: "active" | "soon";
}
