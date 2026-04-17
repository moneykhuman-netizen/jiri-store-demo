"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAdminStore } from "@/lib/admin-store";
import { Spinner } from "@/components/ui/spinner";

export default function BrandsPage() {
  const products = useAdminStore((state) => state.products);
  const productsReady = useAdminStore((state) => state.productsReady);
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

        {!productsReady ? (
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="flex min-h-24 items-center justify-center rounded-xl border border-border bg-card px-4 py-5 text-center text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-foreground/20 active:scale-[0.98]"
              >
                <span className="line-clamp-2">{brand}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
