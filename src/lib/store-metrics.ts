/**
 * Deterministic per-store MOCK money figures for list/card views — seeded from
 * the store id so the same store always shows the same numbers (no flicker, no
 * per-row fetch). The store DETAIL page uses the real `/analytics` endpoint; this
 * is the lightweight directory-level stand-in. Replace with live POS data later.
 */

function seeded(id: string) {
  let s = [...id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7) || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export interface StoreMoney {
  revenue: number;
  profit: number;
  visitors: number;
  revenueChange: number;
  profitChange: number;
}

export function storeMoney(id: string): StoreMoney {
  const rng = seeded(id);
  const revenue = Math.round(18000 + rng() * 90000);
  const margin = 0.18 + rng() * 0.22;
  return {
    revenue,
    profit: Math.round(revenue * margin),
    visitors: Math.round(1200 + rng() * 9000),
    revenueChange: Math.round((rng() * 40 - 12) * 10) / 10,
    profitChange: Math.round((rng() * 36 - 10) * 10) / 10,
  };
}

/** Compact money formatter (e.g. $48.2k). */
storeMoney.format = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return `$${value}`;
};
