"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getProductSizeNumbers } from "@/lib/product-inventory";
import Link from "next/link";

function ProductsContent() {
  const searchParams = useSearchParams();
  const allProducts = useAdminStore((state) => state.products);
  const featuredCollection = useAdminStore((state) => state.featuredCollection);
  const newArrivalsCollection = useAdminStore((state) => state.newArrivalsCollection);

  const categoryParam = searchParams.get("category")?.toLowerCase();
  const category =
    categoryParam === "men" || categoryParam === "women" ? categoryParam : null;
  const brand = searchParams.get("brand");
  const type = searchParams.get("type");
  const size = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured") === "true";
  const newArrivals = searchParams.get("newArrivals") === "true";

  const filteredProducts = useMemo(() => {
    // Always start from the full products backbone, then apply page filters.
    let result = search
      ? allProducts.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand.toLowerCase().includes(search.toLowerCase()) ||
          p.type.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        )
      : [...allProducts];

    if (featured) {
      const featuredProductIds = new Set(featuredCollection.productIds);
      result = result.filter((p) => featuredProductIds.has(p.id));
    }
    if (newArrivals) {
      const newArrivalProductIds = new Set(newArrivalsCollection.productIds);
      result = result.filter((p) => newArrivalProductIds.has(p.id));
    }
    if (category) {
      result = result.filter((p) => p.category?.toLowerCase() === category);
    }
    if (brand) {
      result = result.filter((p) => p.brand === brand);
    }
    if (type) {
      result = result.filter((p) => p.type === type);
    }
    if (size) {
      result = result.filter((p) =>
        getProductSizeNumbers(p).includes(parseInt(size))
      );
    }
    if (minPrice) {
      result = result.filter((p) => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseInt(maxPrice));
    }

    return result;
  }, [
    category,
    brand,
    type,
    size,
    minPrice,
    maxPrice,
    search,
    featured,
    newArrivals,
    allProducts,
    featuredCollection.productIds,
    newArrivalsCollection.productIds,
  ]);

  const pageTitle = search
    ? `Search Results for "${search}"`
    : featured
    ? featuredCollection.title
    : newArrivals
    ? newArrivalsCollection.title
    : category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`
    : "All Products";

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters currentCategory={category ?? undefined} />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                {pageTitle}
              </h1>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <Link href="/products">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              </div>
            ) : (
              <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16 flex justify-center">
            <Spinner />
          </div>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
