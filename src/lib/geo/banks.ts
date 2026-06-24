/**
 * Curated per-country bank catalog (subset). Shape mirrors the MIT-licensed
 * BanksDataWorldWide dataset (name / officialName / swift / website / brandColor)
 * plus a `logoKey` we resolve to an optional vendored logo. Rendered as a brand-
 * color initials badge until logo images are dropped into `public/banks/` (see
 * `docs note`). Easy to extend; the backend `ref_banks` catalog seeds from the
 * same shape.
 *
 * To add real logos later: place `<logoKey>.svg|png` under
 * `vellora-frontend/public/banks/` and `bankLogoUrl()` will pick them up.
 */
export interface BankDef {
  /** ISO-3166-1 alpha-2 country. */
  country: string;
  name: string;
  officialName?: string;
  /** SWIFT/BIC prefix (8 or 11 chars). */
  swift?: string;
  website?: string;
  /** Brand hex, used for the initials badge + accents. */
  brandColor: string;
  /** Filename stem under public/banks (no extension). */
  logoKey: string;
}

export const BANKS: BankDef[] = [
  // United Kingdom
  { country: "GB", name: "Barclays", swift: "BARCGB22", website: "barclays.co.uk", brandColor: "#00AEEF", logoKey: "barclays" },
  { country: "GB", name: "HSBC UK", swift: "HBUKGB4B", website: "hsbc.co.uk", brandColor: "#DB0011", logoKey: "hsbc" },
  { country: "GB", name: "Lloyds Bank", swift: "LOYDGB2L", website: "lloydsbank.com", brandColor: "#024731", logoKey: "lloyds" },
  { country: "GB", name: "NatWest", swift: "NWBKGB2L", website: "natwest.com", brandColor: "#42145F", logoKey: "natwest" },
  { country: "GB", name: "Revolut", swift: "REVOGB21", website: "revolut.com", brandColor: "#0666EB", logoKey: "revolut" },
  // United States
  { country: "US", name: "JPMorgan Chase", swift: "CHASUS33", website: "chase.com", brandColor: "#117ACA", logoKey: "chase" },
  { country: "US", name: "Bank of America", swift: "BOFAUS3N", website: "bankofamerica.com", brandColor: "#E31837", logoKey: "bofa" },
  { country: "US", name: "Wells Fargo", swift: "WFBIUS6S", website: "wellsfargo.com", brandColor: "#D71E2B", logoKey: "wellsfargo" },
  { country: "US", name: "Citibank", swift: "CITIUS33", website: "citi.com", brandColor: "#003B70", logoKey: "citi" },
  // UAE
  { country: "AE", name: "Emirates NBD", swift: "EBILAEAD", website: "emiratesnbd.com", brandColor: "#E40521", logoKey: "emiratesnbd" },
  { country: "AE", name: "First Abu Dhabi Bank", swift: "NBADAEAA", website: "bankfab.com", brandColor: "#00205B", logoKey: "fab" },
  { country: "AE", name: "Abu Dhabi Commercial Bank", swift: "ADCBAEAA", website: "adcb.com", brandColor: "#E2231A", logoKey: "adcb" },
  { country: "AE", name: "Mashreq", swift: "BOMLAEAD", website: "mashreq.com", brandColor: "#FF5800", logoKey: "mashreq" },
  // Saudi Arabia
  { country: "SA", name: "Al Rajhi Bank", swift: "RJHISARI", website: "alrajhibank.com.sa", brandColor: "#005DAA", logoKey: "alrajhi" },
  { country: "SA", name: "Saudi National Bank", swift: "NCBKSAJE", website: "alahli.com", brandColor: "#00A651", logoKey: "snb" },
  { country: "SA", name: "Riyad Bank", swift: "RIBLSARI", website: "riyadbank.com", brandColor: "#0033A0", logoKey: "riyad" },
  // Pakistan
  { country: "PK", name: "HBL", officialName: "Habib Bank Limited", swift: "HABBPKKA", website: "hbl.com", brandColor: "#00833F", logoKey: "hbl" },
  { country: "PK", name: "Meezan Bank", swift: "MEZNPKKA", website: "meezanbank.com", brandColor: "#00573F", logoKey: "meezan" },
  { country: "PK", name: "UBL", officialName: "United Bank Limited", swift: "UNILPKKA", website: "ubldigital.com", brandColor: "#0B6FB8", logoKey: "ubl" },
  // India
  { country: "IN", name: "HDFC Bank", swift: "HDFCINBB", website: "hdfcbank.com", brandColor: "#004C8F", logoKey: "hdfc" },
  { country: "IN", name: "State Bank of India", swift: "SBININBB", website: "sbi.co.in", brandColor: "#22409A", logoKey: "sbi" },
  { country: "IN", name: "ICICI Bank", swift: "ICICINBB", website: "icicibank.com", brandColor: "#F58220", logoKey: "icici" },
  // Germany
  { country: "DE", name: "Deutsche Bank", swift: "DEUTDEFF", website: "deutsche-bank.de", brandColor: "#0018A8", logoKey: "deutsche" },
  { country: "DE", name: "Commerzbank", swift: "COBADEFF", website: "commerzbank.de", brandColor: "#FFD700", logoKey: "commerzbank" },
  { country: "DE", name: "N26", swift: "NTSBDEB1", website: "n26.com", brandColor: "#36A18B", logoKey: "n26" },
  // France
  { country: "FR", name: "BNP Paribas", swift: "BNPAFRPP", website: "bnpparibas.fr", brandColor: "#00915A", logoKey: "bnp" },
  { country: "FR", name: "Société Générale", swift: "SOGEFRPP", website: "societegenerale.fr", brandColor: "#E60028", logoKey: "socgen" },
  // Spain
  { country: "ES", name: "Santander", swift: "BSCHESMM", website: "bancosantander.es", brandColor: "#EC0000", logoKey: "santander" },
  { country: "ES", name: "BBVA", swift: "BBVAESMM", website: "bbva.es", brandColor: "#004481", logoKey: "bbva" },
  // Italy
  { country: "IT", name: "UniCredit", swift: "UNCRITMM", website: "unicredit.it", brandColor: "#E2001A", logoKey: "unicredit" },
  { country: "IT", name: "Intesa Sanpaolo", swift: "BCITITMM", website: "intesasanpaolo.com", brandColor: "#007A33", logoKey: "intesa" },
  // Canada
  { country: "CA", name: "Royal Bank of Canada", swift: "ROYCCAT2", website: "rbc.com", brandColor: "#005DAA", logoKey: "rbc" },
  { country: "CA", name: "TD Canada Trust", swift: "TDOMCATTTOR", website: "td.com", brandColor: "#1A7A3D", logoKey: "td" },
  // Australia
  { country: "AU", name: "Commonwealth Bank", swift: "CTBAAU2S", website: "commbank.com.au", brandColor: "#FFCC00", logoKey: "commbank" },
  { country: "AU", name: "ANZ", swift: "ANZBAU3M", website: "anz.com.au", brandColor: "#007DBA", logoKey: "anz" },
];

/** Payment card networks (for the optional linked-card section). Brand colors
 * are used for the badge tint. */
export const CARD_NETWORKS: { value: string; label: string; color: string }[] = [
  { value: "visa", label: "Visa", color: "#1A1F71" },
  { value: "mastercard", label: "Mastercard", color: "#EB001B" },
  { value: "amex", label: "American Express", color: "#2E77BC" },
  { value: "discover", label: "Discover", color: "#FF6000" },
  { value: "unionpay", label: "UnionPay", color: "#E21836" },
  { value: "maestro", label: "Maestro", color: "#0099DF" },
  { value: "other", label: "Other", color: "#64748B" },
];

/** Banks available for a given ISO country code. */
export function banksForCountry(countryCode: string | null | undefined): BankDef[] {
  if (!countryCode) return [];
  const cc = countryCode.toUpperCase();
  return BANKS.filter((b) => b.country === cc);
}

/**
 * Optional vendored logo URL for a bank. Returns the conventional path; the UI
 * falls back to a brand-color initials badge via `onError` when the file is
 * absent, so this is safe to use before any logo files are added.
 */
export function bankLogoUrl(logoKey: string): string {
  return `/banks/${logoKey}.svg`;
}
