"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { products, searchProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

function ProductsContent() {
  const searchParams = useSearchParams();
  
  const category = searchParams.get("category") as "men" | "women" | null;
  const brand = searchParams.get("brand");
  const type = searchParams.get("type");
  const size = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");

  const filteredProducts = useMemo(() => {
    let result = search ? searchProducts(search) : [...products];

    if (category) {
      result = result.filter((p) => p.category === category);
    }
    if (brand) {
      result = result.filter((p) => p.brand === brand);
    }
    if (type) {
      result = result.filter((p) => p.type === type);
    }
    if (size) {
      result = result.filter((p) => p.sizes.includes(parseInt(size)));
    }
    if (minPrice) {
      result = result.filter((p) => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseInt(maxPrice));
    }

    return result;
  }, [category, brand, type, size, minPrice, maxPrice, search]);

  const pageTitle = search
    ? `Search results for "${search}"`
    : category
    ? `${category === "men" ? "Men's" : "Women's"} ${type || "Footwear"}`
    : type
    ? type
    : brand
    ? `${brand} Collection`
    : "All Products";

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={`/products?category=${category}`}
                className="hover:text-foreground transition-colors capitalize"
              >
                {category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{type || brand || "All Products"}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground capitalize">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>
          
          {/* Category Quick Links */}
          <div className="flex gap-2">
            <Link href="/products?category=men">
              <Button
                variant={category === "men" ? "default" : "outline"}
                size="sm"
              >
                Men
              </Button>
            </Link>
            <Link href="/products?category=women">
              <Button
                variant={category === "women" ? "default" : "outline"}
                size="sm"
              >
                Women
              </Button>
            </Link>
            <Link href="/products">
              <Button
                variant={!category ? "default" : "outline"}
                size="sm"
              >
                All
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filters */}
          <ProductFilters currentCategory={category || undefined} />

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <ProductFilters currentCategory={category || undefined} />
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No products found
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn&apos;t find any products matching your criteria. Try adjusting your filters or browse our full collection.
                </p>
                <Link href="/products">
                  <Button>View All Products</Button>
                </Link>
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
          <Header />
          <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <Spinner className="w-8 h-8" />
          </div>
          <Footer />
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
