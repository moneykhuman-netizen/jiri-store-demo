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
    <Link href={`/product/${product.id}`} className="group block">
      <div className={`bg-card rounded-lg overflow-hidden border border-border ${product.inStock ? 'hover:border-ring hover:shadow-lg' : 'opacity-70'} transition-all duration-300`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${!product.inStock ? 'opacity-50' : ''}`}
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
        <div className="p-3 md:p-4">
          {/* Brand */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className="font-medium text-sm md:text-base text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
              {product.rating}
              <Star className="h-3 w-3 fill-current" />
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-foreground">
              Rs {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  Rs {product.originalPrice.toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Type */}
          <p className="text-xs text-muted-foreground mt-1.5 capitalize">
            {product.category}&apos;s {product.type}
          </p>
        </div>
      </div>
    </Link>
  );
}
