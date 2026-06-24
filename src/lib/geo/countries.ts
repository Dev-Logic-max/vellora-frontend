/**
 * Compact ISO-3166-1 country list (alpha-2 + display name). Flags are rendered
 * from `country-flag-icons` keyed by this code; currency is resolved via
 * `country-to-currency` in `currencies.ts`. Kept in-repo (no runtime fetch) and
 * easy to extend. Ordered alphabetically by name.
 */
export interface CountryDef {
  /** ISO-3166-1 alpha-2 (uppercase). */
  code: string;
  name: string;
}

export const COUNTRIES: CountryDef[] = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "AR", name: "Argentina" },
  { code: "AT", name: "Austria" },
  { code: "AU", name: "Australia" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CH", name: "Switzerland" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CZ", name: "Czechia" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "ES", name: "Spain" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "MA", name: "Morocco" },
  { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" },
  { code: "NG", name: "Nigeria" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "NZ", name: "New Zealand" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Türkiye" },
  { code: "UA", name: "Ukraine" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
  { code: "ZA", name: "South Africa" },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
const BY_NAME = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]));

export function countryName(code: string | null | undefined): string | undefined {
  return code ? BY_CODE.get(code.toUpperCase())?.name : undefined;
}

/**
 * Resolve a stored country/nationality value (either an alpha-2 code OR a full
 * name like "United States") to its ISO alpha-2 code, for flag rendering. Returns
 * undefined when it can't be matched.
 */
export function countryCode(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (/^[A-Za-z]{2}$/.test(v) && BY_CODE.has(v.toUpperCase())) return v.toUpperCase();
  return BY_NAME.get(v.toLowerCase())?.code;
}

/**
 * Representative IANA timezone per country (point 17) — picks a sensible default
 * so selecting a country pre-fills the timezone. Not exhaustive for large
 * multi-zone countries; the user can refine. Falls back to "UTC".
 */
const COUNTRY_TIMEZONES: Record<string, string> = {
  AE: "Asia/Dubai",
  AR: "America/Argentina/Buenos_Aires",
  AT: "Europe/Vienna",
  AU: "Australia/Sydney",
  BE: "Europe/Brussels",
  BR: "America/Sao_Paulo",
  CA: "America/Toronto",
  CH: "Europe/Zurich",
  CL: "America/Santiago",
  CN: "Asia/Shanghai",
  CO: "America/Bogota",
  CZ: "Europe/Prague",
  DE: "Europe/Berlin",
  DK: "Europe/Copenhagen",
  EG: "Africa/Cairo",
  ES: "Europe/Madrid",
  FI: "Europe/Helsinki",
  FR: "Europe/Paris",
  GB: "Europe/London",
  GR: "Europe/Athens",
  HK: "Asia/Hong_Kong",
  HU: "Europe/Budapest",
  ID: "Asia/Jakarta",
  IE: "Europe/Dublin",
  IL: "Asia/Jerusalem",
  IN: "Asia/Kolkata",
  IT: "Europe/Rome",
  JP: "Asia/Tokyo",
  KE: "Africa/Nairobi",
  KR: "Asia/Seoul",
  KW: "Asia/Kuwait",
  MX: "America/Mexico_City",
  MY: "Asia/Kuala_Lumpur",
  NG: "Africa/Lagos",
  NL: "Europe/Amsterdam",
  NO: "Europe/Oslo",
  NZ: "Pacific/Auckland",
  PH: "Asia/Manila",
  PK: "Asia/Karachi",
  PL: "Europe/Warsaw",
  PT: "Europe/Lisbon",
  QA: "Asia/Qatar",
  SA: "Asia/Riyadh",
  SE: "Europe/Stockholm",
  SG: "Asia/Singapore",
  TH: "Asia/Bangkok",
  TR: "Europe/Istanbul",
  UA: "Europe/Kyiv",
  US: "America/New_York",
  VN: "Asia/Ho_Chi_Minh",
  ZA: "Africa/Johannesburg",
};

/** Default timezone for an ISO alpha-2 country code (falls back to "UTC"). */
export function timezoneForCountry(code: string | null | undefined): string {
  return code ? (COUNTRY_TIMEZONES[code.toUpperCase()] ?? "UTC") : "UTC";
}
