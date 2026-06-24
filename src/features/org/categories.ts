import {
  Building2,
  Car,
  HeartPulse,
  Hotel,
  Scissors,
  ShoppingBag,
  Shirt,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Company industry/category catalogue — drives the registration "what's your
 * business" cards. Each has an icon, a gradient (always rendered) and an OPTIONAL
 * background image (`/categories/<key>.jpg`) layered under the gradient when the
 * asset exists. Generate those images with Gemini (prompts in the handoff) and
 * drop them in `public/categories/`; until then the gradient alone looks clean.
 */
export interface CompanyCategory {
  key: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the card background tint. */
  gradient: string;
}

export const COMPANY_CATEGORIES: CompanyCategory[] = [
  {
    key: "retail",
    label: "Retail",
    blurb: "Shops, supermarkets & chains",
    icon: ShoppingBag,
    gradient: "from-indigo-500/85 to-violet-600/85",
  },
  {
    key: "hospitality",
    label: "Hospitality",
    blurb: "Hotels, resorts & venues",
    icon: Hotel,
    gradient: "from-amber-500/85 to-orange-600/85",
  },
  {
    key: "food_beverage",
    label: "Food & Beverage",
    blurb: "Restaurants, cafés & QSR",
    icon: UtensilsCrossed,
    gradient: "from-rose-500/85 to-pink-600/85",
  },
  {
    key: "automobile",
    label: "Automobile",
    blurb: "Dealers, workshops & rentals",
    icon: Car,
    gradient: "from-sky-500/85 to-blue-600/85",
  },
  {
    key: "textile",
    label: "Textile & Apparel",
    blurb: "Garments, fabric & fashion",
    icon: Shirt,
    gradient: "from-fuchsia-500/85 to-purple-600/85",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    blurb: "Clinics, pharmacies & care",
    icon: HeartPulse,
    gradient: "from-emerald-500/85 to-teal-600/85",
  },
  {
    key: "beauty_wellness",
    label: "Beauty & Wellness",
    blurb: "Salons, spas & studios",
    icon: Scissors,
    gradient: "from-pink-500/85 to-rose-600/85",
  },
  {
    key: "services",
    label: "Services & Trades",
    blurb: "Maintenance, logistics & more",
    icon: Wrench,
    gradient: "from-cyan-500/85 to-sky-600/85",
  },
  {
    key: "other",
    label: "Other",
    blurb: "Something else entirely",
    icon: Building2,
    gradient: "from-slate-500/85 to-slate-700/85",
  },
];

export function categoryByKey(key: string | null | undefined): CompanyCategory | undefined {
  if (!key) return undefined;
  return COMPANY_CATEGORIES.find((c) => c.key === key);
}
