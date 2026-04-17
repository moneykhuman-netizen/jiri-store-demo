"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BrandTheme, useAdminStore } from "@/lib/admin-store";
import { Spinner } from "@/components/ui/spinner";
import { subscribeBrandsFromFirebase } from "@/lib/firebase/brands";

const BRANDS_REMOTE_TIMEOUT_MS = 4000;

const brandStyles: Record<string, { bg: string; accent: string; logo: string }> = {
  Nike: {
    bg: "bg-gradient-to-br from-neutral-900 to-neutral-800",
    accent: "text-white",
    logo: "NIKE",
  },
  Adidas: {
    bg: "bg-gradient-to-br from-neutral-900 to-neutral-700",
    accent: "text-white",
    logo: "adidas",
  },
  Puma: {
    bg: "bg-gradient-to-br from-red-600 to-red-700",
    accent: "text-white",
    logo: "PUMA",
  },
  Reebok: {
    bg: "bg-gradient-to-br from-red-700 to-red-800",
    accent: "text-white",
    logo: "Reebok",
  },
  Skechers: {
    bg: "bg-gradient-to-br from-blue-600 to-blue-700",
    accent: "text-white",
    logo: "SKECHERS",
  },
  "New Balance": {
    bg: "bg-gradient-to-br from-neutral-800 to-neutral-900",
    accent: "text-red-500",
    logo: "NB",
  },
  Clarks: {
    bg: "bg-gradient-to-br from-yellow-700 to-yellow-800",
    accent: "text-white",
    logo: "CLARKS",
  },
  Woodland: {
    bg: "bg-gradient-to-br from-green-700 to-green-800",
    accent: "text-white",
    logo: "WOODLAND",
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

export default function BrandsPage() {
  const products = useAdminStore((state) => state.products);
  const productsReady = useAdminStore((state) => state.productsReady);
  const brandPresentations = useAdminStore((state) => state.brandPresentations);
  const setBrandsFromRemote = useAdminStore((state) => state.setBrandsFromRemote);
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);
  const [hasRemoteBrandConfig, setHasRemoteBrandConfig] = useState(false);
  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) =>
              typeof product.brand === "string" ? product.brand.trim() : ""
            )
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [products]
  );

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

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-8 flex flex-col gap-3 md:mb-10">
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Brands
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground md:text-3xl">
                View All Brands
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Browse every brand currently available in the catalog.
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {brands.length} brands
            </span>
          </div>
        </div>

        {!productsReady || !isRemoteResolved ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : brands.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              No brands available
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Products need a valid brand before they can appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map((brand) => {
              const baseStyle = brandStyles[brand] || (() => {
                const fallback = computeFallback(brand);
                return { bg: fallback.bg, accent: fallback.accent, logo: brand };
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
              const colorClassName =
                brandColors[brand] ??
                "bg-gradient-to-br from-stone-100 to-stone-200 text-neutral-900";

              return (
                <Link
                  key={brand}
                  href={`/products?brand=${encodeURIComponent(brand)}`}
                  className={`${colorClassName} group relative flex h-[110px] flex-col items-center justify-center overflow-hidden rounded-xl p-5 text-center shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <span className="z-10 line-clamp-2 text-sm font-semibold leading-tight text-center">
                    {style.logo}
                  </span>

                  {tagline ? (
                    <span className="z-10 mt-1 line-clamp-2 text-center text-xs tracking-wide opacity-70">
                      {tagline}
                    </span>
                  ) : null}

                  <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
