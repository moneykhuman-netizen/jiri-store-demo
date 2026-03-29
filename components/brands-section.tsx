"use client";

import Link from "next/link";
import { BrandTheme, useAdminStore } from "@/lib/admin-store";
import { ChevronRight } from "lucide-react";

const brandStyles: Record<string, { bg: string; accent: string; logo: string }> = {
  Nike: { 
    bg: "bg-gradient-to-br from-neutral-900 to-neutral-800", 
    accent: "text-white",
    logo: "NIKE"
  },
  Adidas: { 
    bg: "bg-gradient-to-br from-neutral-900 to-neutral-700", 
    accent: "text-white",
    logo: "adidas"
  },
  Puma: { 
    bg: "bg-gradient-to-br from-red-600 to-red-700", 
    accent: "text-white",
    logo: "PUMA"
  },
  Reebok: { 
    bg: "bg-gradient-to-br from-red-700 to-red-800", 
    accent: "text-white",
    logo: "Reebok"
  },
  Skechers: { 
    bg: "bg-gradient-to-br from-blue-600 to-blue-700", 
    accent: "text-white",
    logo: "SKECHERS"
  },
  "New Balance": { 
    bg: "bg-gradient-to-br from-neutral-800 to-neutral-900", 
    accent: "text-red-500",
    logo: "NB"
  },
  Clarks: {
    bg: "bg-gradient-to-br from-yellow-700 to-yellow-800",
    accent: "text-white",
    logo: "CLARKS"
  },
  Woodland: {
    bg: "bg-gradient-to-br from-green-700 to-green-800",
    accent: "text-white",
    logo: "WOODLAND"
  },
};

const themeStyles: Record<Exclude<BrandTheme, "auto">, { bg: string; accent: string }> = {
  neutral: {
    bg: "bg-gradient-to-br from-neutral-900 to-neutral-700",
    accent: "text-white",
  },
  red: {
    bg: "bg-gradient-to-br from-red-600 to-red-700",
    accent: "text-white",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-600 to-blue-700",
    accent: "text-white",
  },
  green: {
    bg: "bg-gradient-to-br from-green-700 to-green-800",
    accent: "text-white",
  },
  gold: {
    bg: "bg-gradient-to-br from-yellow-700 to-yellow-800",
    accent: "text-white",
  },
};

export function BrandsSection() {
  const brands = useAdminStore((s) => s.brands).slice(0, 6);
  const brandPresentations = useAdminStore((s) => s.brandPresentations);

  // light-themed fallback styles for unknown brands
  const fallbackStyles = [
    { bg: "bg-yellow-100", accent: "text-black" },
    { bg: "bg-blue-100", accent: "text-black" },
    { bg: "bg-pink-100", accent: "text-black" },
    { bg: "bg-green-100", accent: "text-black" },
    { bg: "bg-orange-100", accent: "text-black" },
    { bg: "bg-purple-100", accent: "text-black" },
  ];

  const computeFallback = (brand: string) => {
    let sum = 0;
    for (let i = 0; i < brand.length; i++) sum += brand.charCodeAt(i);
    return fallbackStyles[sum % fallbackStyles.length];
  };

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-12">
          <div>
            <span className="text-accent font-medium text-sm uppercase tracking-wider mb-2 block">
              Top Brands
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground text-balance">
              Shop by Brand
            </h2>
          </div>
          <Link 
            href="/products" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 mt-4 sm:mt-0 text-sm font-medium transition-colors group"
          >
            View all brands
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand) => {
            const baseStyle = brandStyles[brand] || (() => {
              const f = computeFallback(brand);
              return { bg: f.bg, accent: f.accent, logo: brand };
            })();
            const presentation = brandPresentations[brand];
            const theme =
              presentation?.theme && presentation.theme !== "auto"
                ? themeStyles[presentation.theme]
                : null;
            const style = theme
              ? { ...baseStyle, bg: theme.bg, accent: theme.accent }
              : baseStyle;
            const tagline = presentation?.tagline?.trim() ?? "";
            const taglineClass =
              style.accent === "text-black" ? "text-black/60" : "text-white/60";

            return (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className={`${style.bg} rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center aspect-square relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
              >
                {/* Brand Logo Text */}
                <span className={`text-2xl md:text-3xl font-black tracking-tight ${style.accent} text-center z-10`}>
                  {style.logo}
                </span>
                
                {/* Subtle tagline */}
                {tagline ? (
                  <span className={`${taglineClass} text-xs mt-2 font-medium uppercase tracking-wider z-10`}>
                    {tagline}
                  </span>
                ) : null}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>

        {/* All Brands Link for Mobile */}
        <div className="mt-8 text-center lg:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Explore All Brands
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
