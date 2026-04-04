"use client";

import { useEffect } from "react";
import Link from "next/link";
import { type AdminProduct, useAdminStore } from "@/lib/admin-store";
import { subscribeNewArrivalsCollectionFromFirebase } from "@/lib/firebase/new-arrivals";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function NewArrivals() {
  const products = useAdminStore((state) => state.products);
  const newArrivalsCollection = useAdminStore((state) => state.newArrivalsCollection);
  const setNewArrivalsCollectionFromRemote = useAdminStore(
    (state) => state.setNewArrivalsCollectionFromRemote
  );

  useEffect(() => {
    const unsubscribe = subscribeNewArrivalsCollectionFromFirebase(
      (remoteNewArrivalsCollection) => {
        if (remoteNewArrivalsCollection) {
          setNewArrivalsCollectionFromRemote(remoteNewArrivalsCollection);
        }
      }
    );

    return unsubscribe;
  }, [setNewArrivalsCollectionFromRemote]);

  const productMap = new Map(products.map((product) => [product.id, product] as const));
  const newProducts = newArrivalsCollection.productIds
    .map((productId) => productMap.get(productId))
    .filter((product): product is AdminProduct => Boolean(product));

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground">
              {newArrivalsCollection.title}
            </h2>
            <p className="text-muted-foreground max-w-xl">
              {newArrivalsCollection.description}
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
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
