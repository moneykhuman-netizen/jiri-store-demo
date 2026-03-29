"use client";

import { useEffect } from "react";
import Link from "next/link";
import { type AdminProduct, useAdminStore } from "@/lib/admin-store";
import { subscribeFeaturedCollectionFromFirebase } from "@/lib/firebase/featured";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FeaturedProducts() {
  const products = useAdminStore((state) => state.products);
  const featuredCollection = useAdminStore((state) => state.featuredCollection);
  const setFeaturedCollectionFromRemote = useAdminStore(
    (state) => state.setFeaturedCollectionFromRemote
  );

  useEffect(() => {
    const unsubscribe = subscribeFeaturedCollectionFromFirebase((remoteFeaturedCollection) => {
      if (remoteFeaturedCollection) {
        setFeaturedCollectionFromRemote(remoteFeaturedCollection);
      }
    });

    return unsubscribe;
  }, [setFeaturedCollectionFromRemote]);

  const productMap = new Map(products.map((product) => [product.id, product] as const));
  const featuredProducts = featuredCollection.productIds
    .map((productId) => productMap.get(productId))
    .filter((product): product is AdminProduct => Boolean(product));

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground">
              {featuredCollection.title}
            </h2>
            <p className="text-muted-foreground max-w-xl">
              {featuredCollection.description}
            </p>
          </div>

          <Link href="/products">
            <Button variant="outline" className="gap-2 group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
