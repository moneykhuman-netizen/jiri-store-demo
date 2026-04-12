"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CollectionSectionSkeleton } from "@/components/homepage-section-skeletons";
import { type AdminProduct, useAdminStore } from "@/lib/admin-store";
import { subscribeFeaturedCollectionFromFirebase } from "@/lib/firebase/featured";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FEATURED_REMOTE_TIMEOUT_MS = 4000;

export function FeaturedProducts() {
  const productsReady = useAdminStore((state) => state.productsReady);
  const products = useAdminStore((state) => state.products);
  const featuredCollection = useAdminStore((state) => state.featuredCollection);
  const setFeaturedCollectionFromRemote = useAdminStore(
    (state) => state.setFeaturedCollectionFromRemote
  );
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);
  const [hasRemoteFeaturedCollection, setHasRemoteFeaturedCollection] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeFeaturedCollectionFromFirebase((remoteFeaturedCollection) => {
      if (remoteFeaturedCollection) {
        setFeaturedCollectionFromRemote(remoteFeaturedCollection);
        setHasRemoteFeaturedCollection(true);
      } else {
        setHasRemoteFeaturedCollection(false);
      }
      setIsRemoteResolved(true);
    });

    return unsubscribe;
  }, [setFeaturedCollectionFromRemote]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsRemoteResolved(true);
    }, FEATURED_REMOTE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const productMap = new Map(products.map((product) => [product.id, product] as const));
  const featuredProducts = [...featuredCollection.productIds]
    .reverse()
    .map((productId) => productMap.get(productId))
    .filter((product): product is AdminProduct => Boolean(product));

  if (!productsReady || !isRemoteResolved) {
    return <CollectionSectionSkeleton backgroundClassName="bg-secondary" />;
  }

  if (!hasRemoteFeaturedCollection) {
    return null;
  }

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

        <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
