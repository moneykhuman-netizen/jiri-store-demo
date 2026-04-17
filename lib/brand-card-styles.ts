import type { BrandTheme } from "@/lib/admin-store";

const MANUAL_THEME_CLASSNAMES: Record<Exclude<BrandTheme, "auto">, string> = {
  neutral: "bg-gradient-to-br from-neutral-950 via-neutral-900 to-slate-700 text-white",
  red: "bg-gradient-to-br from-rose-950 via-red-800 to-orange-600 text-white",
  blue: "bg-gradient-to-br from-sky-950 via-blue-800 to-cyan-500 text-white",
  green: "bg-gradient-to-br from-emerald-950 via-green-800 to-teal-500 text-white",
  gold: "bg-gradient-to-br from-stone-950 via-amber-800 to-yellow-500 text-white",
};

const BRAND_LOGO_OVERRIDES: Record<string, string> = {
  Nike: "NIKE",
  Adidas: "adidas",
  Puma: "PUMA",
  Reebok: "Reebok",
  Skechers: "SKECHERS",
  "New Balance": "NB",
  Clarks: "CLARKS",
  Woodland: "WOODLAND",
};

const PREMIUM_FALLBACK_CLASSNAMES = [
  "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-700 text-white",
  "bg-gradient-to-br from-zinc-950 via-stone-900 to-amber-700 text-white",
  "bg-gradient-to-br from-neutral-950 via-fuchsia-900 to-rose-700 text-white",
  "bg-gradient-to-br from-slate-950 via-indigo-900 to-violet-700 text-white",
  "bg-gradient-to-br from-neutral-950 via-teal-900 to-cyan-600 text-white",
  "bg-gradient-to-br from-zinc-950 via-emerald-900 to-lime-600 text-white",
  "bg-gradient-to-br from-stone-950 via-red-900 to-orange-700 text-white",
  "bg-gradient-to-br from-slate-950 via-blue-900 to-sky-600 text-white",
  "bg-gradient-to-br from-zinc-950 via-purple-900 to-fuchsia-700 text-white",
  "bg-gradient-to-br from-neutral-950 via-amber-900 to-yellow-600 text-white",
];

const normalizeBrandName = (brand: string) => brand.trim().toLowerCase();

const hashBrandName = (brand: string) => {
  let hash = 0;
  const normalizedBrand = normalizeBrandName(brand);

  for (let index = 0; index < normalizedBrand.length; index += 1) {
    hash = (hash * 33 + normalizedBrand.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const isManualBrandTheme = (
  theme: string
): theme is Exclude<BrandTheme, "auto"> => theme in MANUAL_THEME_CLASSNAMES;

export const getBrandLogoText = (brand: string) =>
  BRAND_LOGO_OVERRIDES[brand] ?? brand;

export const getPremiumBrandCardClassName = (
  brand: string,
  theme?: BrandTheme | string | null
) => {
  const normalizedTheme =
    typeof theme === "string" ? theme.trim().toLowerCase() : "";

  if (normalizedTheme && normalizedTheme !== "auto" && isManualBrandTheme(normalizedTheme)) {
    return MANUAL_THEME_CLASSNAMES[normalizedTheme];
  }

  return PREMIUM_FALLBACK_CLASSNAMES[
    hashBrandName(brand) % PREMIUM_FALLBACK_CLASSNAMES.length
  ];
};
