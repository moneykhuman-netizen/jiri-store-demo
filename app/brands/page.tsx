"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAdminStore } from "@/lib/admin-store";
import { Spinner } from "@/components/ui/spinner";
import { subscribeBrandsFromFirebase } from "@/lib/firebase/brands";
import {
  getBrandLogoText,
  getPremiumBrandCardClassName,
} from "@/lib/brand-card-styles";

const BRANDS_REMOTE_TIMEOUT_MS = 4000;

export default function BrandsPage() {
  const products = useAdminStore((state) => state.products);
  const productsReady = useAdminStore((state) => state.productsReady);
  const brandPresentations = useAdminStore((state) => state.brandPresentations);
  const setBrandsFromRemote = useAdminStore((state) => state.setBrandsFromRemote);
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);
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
              const presentation = brandPresentations[brand];
              const tagline = presentation?.tagline?.trim() ?? "";
              const colorClassName = getPremiumBrandCardClassName(brand, presentation?.theme);
              const logoText = getBrandLogoText(brand);

              return (
                <Link
                  key={brand}
                  href={`/products?brand=${encodeURIComponent(brand)}`}
                  className={`${colorClassName} group relative flex h-[110px] flex-col items-center justify-center overflow-hidden rounded-xl p-5 text-center shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <span className="z-10 line-clamp-2 text-sm font-semibold leading-tight text-center">
                    {logoText}
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
