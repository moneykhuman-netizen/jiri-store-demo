"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandsSectionSkeleton } from "@/components/homepage-section-skeletons";
import { BrandTheme, useAdminStore } from "@/lib/admin-store";
import { subscribeBrandsFromFirebase } from "@/lib/firebase/brands";
import { ChevronRight } from "lucide-react";

const BRANDS_REMOTE_TIMEOUT_MS = 4000;

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

const brandColors: Record<string, string> = {
  Nike: "bg-gradient-to-br from-neutral-700 to-neutral-900 text-white",
  Adidas: "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900",
  Puma: "bg-gradient-to-br from-rose-900 to-rose-700 text-white",
  Reebok: "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900",
  Skechers: "bg-gradient-to-br from-emerald-900 to-emerald-700 text-white",
  "New Balance": "bg-gradient-to-br from-neutral-700 to-neutral-900 text-white",
  Clarks: "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900",
  Woodland: "bg-gradient-to-br from-emerald-900 to-emerald-700 text-white",
  Bata: "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900",
  "Air Jordan": "bg-gradient-to-br from-neutral-700 to-neutral-900 text-white",
  Asic: "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900",
  Hoka: "bg-gradient-to-br from-emerald-900 to-emerald-700 text-white",
};

export function BrandsSection() {
  const productsReady = useAdminStore((s) => s.productsReady);
  const brands = useAdminStore((s) => s.brands).slice(0, 6);
  const brandPresentations = useAdminStore((s) => s.brandPresentations);
  const setBrandsFromRemote = useAdminStore((s) => s.setBrandsFromRemote);
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);
  const [hasRemoteBrandConfig, setHasRemoteBrandConfig] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeBrandsFromFirebase((remote) => {
      if (remote) {
        setBrandsFromRemote(remote.brands, remote.brandPresentations);
        setHasRemoteBrandConfig(true);
      } else {
        setHasRemoteBrandConfig(false);
      }
      setIsRemoteResolved(true);
    });
    return unsubscribe;
  }, [setBrandsFromRemote]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsRemoteResolved(true);
    }, BRANDS_REMOTE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

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

  if (!productsReady || !isRemoteResolved) {
    return <BrandsSectionSkeleton />;
  }

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
              hasRemoteBrandConfig &&
              presentation?.theme &&
              presentation.theme !== "auto"
                ? themeStyles[presentation.theme]
                : null;
            const style = theme
              ? { ...baseStyle, bg: theme.bg, accent: theme.accent }
              : baseStyle;
            const tagline = hasRemoteBrandConfig
              ? presentation?.tagline?.trim() ?? ""
              : "";
            const colorClassName = brandColors[brand] ?? "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900";

            return (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className={`${colorClassName} rounded-xl text-center flex flex-col items-center justify-center h-[110px] p-5 relative overflow-hidden group shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
              >
                {/* Brand Logo Text */}
                <span className="text-sm font-semibold text-center leading-tight line-clamp-2 z-10">
                  {style.logo}
                </span>
                
                {/* Subtle tagline */}
                {tagline ? (
                  <span className="text-xs mt-1 text-center line-clamp-2 tracking-wide opacity-70 z-10">
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
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
          >
            Explore All Brands
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
