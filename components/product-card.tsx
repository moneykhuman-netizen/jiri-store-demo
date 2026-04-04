"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/lib/admin-store";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group block h-full min-w-0">
      <div
        className={`bg-card rounded-lg overflow-hidden border border-border ${
          product.inStock ? "hover:border-ring hover:shadow-lg" : "opacity-70"
        } flex h-full min-w-0 flex-col transition-all duration-300`}
      >
        {/* Image Container */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
              !product.inStock ? "opacity-50" : ""
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-accent text-accent-foreground text-xs">
                NEW
              </Badge>
            )}
            {product.discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {product.discount}% OFF
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col p-3 md:p-4">
          <div className="min-h-[3.75rem] md:min-h-[4.5rem]">
            {/* Brand */}
            <p className="mb-1 truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </p>

            {/* Name */}
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-foreground transition-colors group-hover:text-accent md:min-h-[3rem] md:text-base md:leading-6">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-3">
            {/* Rating */}
            <div className="flex min-h-6 items-center gap-1">
              <div className="flex shrink-0 items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-xs font-medium text-white">
                {product.rating}
                <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="truncate text-xs text-muted-foreground">
                ({product.reviews.toLocaleString()})
              </span>
            </div>

            {/* Price */}
            <div className="flex min-h-[3rem] flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-lg font-bold text-foreground">
                Rs {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  Rs {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Type */}
            <p className="line-clamp-1 min-h-4 text-xs capitalize text-muted-foreground">
              {product.category}&apos;s {product.type}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
