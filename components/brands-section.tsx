"use client";

import Link from "next/link";
import { featuredBrands } from "@/lib/products";
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
};

export function BrandsSection() {
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
          {featuredBrands.map((brand) => {
            const style = brandStyles[brand] || { 
              bg: "bg-gradient-to-br from-muted to-muted/80", 
              accent: "text-foreground",
              logo: brand 
            };
            return (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className={`${style.bg} rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center aspect-square relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
              >
                {/* Brand Logo Text */}
                <span className={`text-2xl md:text-3xl font-black tracking-tight text-white text-center z-10`}>
                  {style.logo}
                </span>
                
                {/* Subtle tagline */}
                <span className="text-white/60 text-xs mt-2 font-medium uppercase tracking-wider z-10">
                  {brand === "New Balance" ? "Fresh Foam" : 
                   brand === "Nike" ? "Just Do It" :
                   brand === "Adidas" ? "Impossible is Nothing" :
                   brand === "Puma" ? "Forever Faster" :
                   brand === "Reebok" ? "Be More Human" :
                   brand === "Skechers" ? "Comfort Tech" : ""}
                </span>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Shop Now indicator */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    Shop Now
                  </span>
                </div>
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
