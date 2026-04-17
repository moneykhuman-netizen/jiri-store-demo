"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandsSectionSkeleton } from "@/components/homepage-section-skeletons";
import { useAdminStore } from "@/lib/admin-store";
import { subscribeBrandsFromFirebase } from "@/lib/firebase/brands";
import {
  getBrandLogoText,
  getPremiumBrandCardClassName,
} from "@/lib/brand-card-styles";
import { ChevronRight } from "lucide-react";

const BRANDS_REMOTE_TIMEOUT_MS = 4000;

export function BrandsSection() {
  const productsReady = useAdminStore((s) => s.productsReady);
  const brands = useAdminStore((s) => s.brands).slice(0, 6);
  const brandPresentations = useAdminStore((s) => s.brandPresentations);
  const setBrandsFromRemote = useAdminStore((s) => s.setBrandsFromRemote);
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);

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
            href="/brands" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 mt-4 sm:mt-0 text-sm font-medium transition-colors group"
          >
            View all brands
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand) => {
            const presentation = brandPresentations[brand];
            const tagline = presentation?.tagline?.trim() ?? "";
            const colorClassName = getPremiumBrandCardClassName(brand, presentation?.theme);
            const logoText = getBrandLogoText(brand);

            return (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className={`${colorClassName} rounded-xl text-center flex flex-col items-center justify-center h-[110px] p-5 relative overflow-hidden group shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
              >
                {/* Brand Logo Text */}
                <span className="text-sm font-semibold text-center leading-tight line-clamp-2 z-10">
                  {logoText}
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
            href="/brands"
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
