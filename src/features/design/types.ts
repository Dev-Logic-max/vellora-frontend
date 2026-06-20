/** Optional fine-grained semantic-token overrides: `{ '--accent': '79 70 229' }`. */
export type TokenMap = Record<string, string>;

/**
 * Active platform design. The platform base is white & fixed; `themeKey` is the
 * selected ACCENT preset (indigo/green/blue/…). `tokens` is reserved for
 * advanced per-token overrides on top of the preset.
 */
export interface ActiveDesign {
  themeKey: string;
  tokens: TokenMap;
}

export interface UpdateDesignInput {
  themeKey?: string;
  tokens?: TokenMap;
}
