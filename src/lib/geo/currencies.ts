/**
 * ISO-4217 currency metadata (code, name, symbol) + resolution from a country
 * code via `country-to-currency`. Stored separately from the country list so the
 * DB can persist `currency` (code) and a display symbol independently. Compact,
 * in-repo; extend as needed.
 */
import countryToCurrency from "country-to-currency";

export interface CurrencyDef {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "ARS", name: "Argentine Peso", symbol: "$" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "VND", name: "Vietnamese Đồng", symbol: "₫" },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function currencyByCode(code: string | null | undefined): CurrencyDef | undefined {
  return code ? BY_CODE.get(code.toUpperCase()) : undefined;
}

export function currencySymbol(code: string | null | undefined): string {
  return currencyByCode(code)?.symbol ?? code ?? "";
}

/** Default currency code for an ISO country code (e.g. "GB" → "GBP"). */
export function currencyForCountry(countryCode: string | null | undefined): string | undefined {
  if (!countryCode) return undefined;
  const map = countryToCurrency as Record<string, string>;
  return map[countryCode.toUpperCase()];
}
