/** Optional fine-grained semantic-token overrides: `{ '--accent': '79 70 229' }`. */
export type TokenMap = Record<string, string>;

export type CalendarStyle = "grid" | "roster";
export type Density = "comfortable" | "compact";

export interface DesignPrefs {
  density?: Density;
  /** Global motion on/off (reduced-motion still always wins). */
  motion?: boolean;
  /** Show icons in module sub-tabs / segmented controls (default on). */
  tabsIcons?: boolean;
}

/**
 * Active platform design. The platform base is white & fixed; `themeKey` is the
 * selected ACCENT preset (indigo/green/blue/…). `tokens` is reserved for
 * advanced per-token overrides on top of the preset. `calendarStyle` + `prefs`
 * drive scheduling style + global UI density/motion.
 */
export interface ActiveDesign {
  themeKey: string;
  tokens: TokenMap;
  calendarStyle: CalendarStyle;
  prefs: DesignPrefs;
}

export interface UpdateDesignInput {
  themeKey?: string;
  tokens?: TokenMap;
  calendarStyle?: CalendarStyle;
  prefs?: DesignPrefs;
}
