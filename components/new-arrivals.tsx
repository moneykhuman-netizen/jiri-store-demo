"use client";

import Link from "next/link";
import { useAdminStore } from "@/lib/admin-store";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function NewArrivals() {
  const products = useAdminStore((state) => state.products);
  const newProducts = products.filter((product) => product.isNew);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground">
              New Arrivals
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Be the first to discover our latest additions. Fresh styles just landed.
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
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}