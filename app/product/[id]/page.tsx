"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { getProductById, products } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Check,
  MessageCircle,
} from "lucide-react";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const product = getProductById(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Hello, I want to order ${product.name} from JIRI Pick Up Store.` +
      `${selectedSize ? `\nSize: UK ${selectedSize}` : ''}` +
      `${selectedColor ? `\nColor: ${selectedColor}` : ''}` +
      `\nPrice: Rs ${product.price.toLocaleString()}`
    );
    return `https://wa.me/919863146558?text=${message}`;
  };

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
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-foreground transition-colors capitalize"
          >
            {product.category}
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}&type=${product.type}`}
            className="hover:text-foreground transition-colors"
          >
            {product.type}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground">NEW</Badge>
                )}
                {product.discount > 0 && (
                  <Badge variant="destructive">{product.discount}% OFF</Badge>
                )}
              </div>
              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-accent"
                        : "border-transparent hover:border-muted"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Name */}
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-1">
                {product.brand}
              </p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-balance">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                {product.rating}
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-muted-foreground">
                {product.reviews.toLocaleString()} Reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                Rs {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    Rs {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {product.discount}% Off
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Color: <span className="font-normal text-muted-foreground">{selectedColor || "Select a color"}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedColor === color
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border hover:border-ring text-muted-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Size: <span className="font-normal text-muted-foreground">{selectedSize ? `UK ${selectedSize}` : "Select a size"}</span>
                </h3>
                <button className="text-sm text-accent hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border hover:border-ring text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Order Button */}
            <div className="space-y-3 pt-4">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-14 text-lg"
                  disabled={!selectedSize || !selectedColor}
                >
                  <MessageCircle className="w-5 h-5" />
                  Order on WhatsApp
                </Button>
              </a>
              {(!selectedSize || !selectedColor) && (
                <p className="text-sm text-center text-muted-foreground">
                  Please select size and color to proceed
                </p>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Genuine Product</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-secondary flex items-center justify-center mb-2">
                  <RotateCcw className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">7 Day Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Product Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Key Features
            </h2>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
