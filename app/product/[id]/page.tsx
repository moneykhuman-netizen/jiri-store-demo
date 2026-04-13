"use client";

import { useEffect, useMemo, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useAdminStore } from "@/lib/admin-store";
import { submitProductReview, subscribeApprovedReviewsForProduct } from "@/lib/firebase/reviews";
import { adaptProductForStorefront } from "@/lib/products/adaptProductForStorefront";
import { normalizeProductImages, normalizeProductVideoUrl } from "@/lib/products";
import {
  calculateAverageRating,
  createProductReviewSlug,
  formatReviewDate,
  type ProductReview,
} from "@/lib/reviews";
import { getProductSizeInventory, isProductAvailable } from "@/lib/product-inventory";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Heart,
  MessageCircle,
  PencilLine,
  Play,
  RotateCcw,
  Share2,
  Shield,
  Star,
  Truck,
} from "lucide-react";

type ProductMediaItem = {
  type: "image" | "video";
  src: string;
};

type ReviewFormState = {
  name: string;
  rating: number;
  review: string;
};

const INITIAL_REVIEW_FORM_STATE: ReviewFormState = {
  name: "",
  rating: 0,
  review: "",
};

function RatingStars({
  rating,
  className,
  iconClassName,
}: {
  rating: number;
  className?: string;
  iconClassName?: string;
}) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className={cn("flex items-center gap-1", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < roundedRating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted",
            iconClassName
          )}
        />
      ))}
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const rawProducts = useAdminStore((state) => state.products);
  const products = useMemo(
    () => rawProducts.map(adaptProductForStorefront),
    [rawProducts]
  );
  const product = useMemo(
    () => products.find((currentProduct) => currentProduct.id === id),
    [id, products]
  );
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<ProductReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsLoadError, setReviewsLoadError] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReviewSuccessOpen, setIsReviewSuccessOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(INITIAL_REVIEW_FORM_STATE);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedMediaIndex(0);
    setSelectedSize(null);
    setSelectedColor(null);
    setIsReviewDialogOpen(false);
    setIsReviewSuccessOpen(false);
    setReviewForm(INITIAL_REVIEW_FORM_STATE);
    setReviewSubmitError(null);
  }, [product?.id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setIsReviewsLoading(true);
    setReviewsLoadError(null);

    const unsubscribe = subscribeApprovedReviewsForProduct(
      product.id,
      (reviews) => {
        setApprovedReviews(reviews);
        setIsReviewsLoading(false);
      },
      () => {
        setApprovedReviews([]);
        setIsReviewsLoading(false);
        setReviewsLoadError("Reviews are unavailable right now.");
      }
    );

    return unsubscribe;
  }, [product?.id]);

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

  const sizeInventory = getProductSizeInventory(product);
  const productImages = normalizeProductImages(product.images);
  const productVideoUrl = normalizeProductVideoUrl(product.videoUrl);
  const productMedia: ProductMediaItem[] = [
    ...productImages.map((src) => ({ type: "image" as const, src })),
    ...(productVideoUrl ? [{ type: "video" as const, src: productVideoUrl }] : []),
  ];
  const activeMediaIndex = Math.min(selectedMediaIndex, productMedia.length - 1);
  const activeMedia = productMedia[activeMediaIndex];
  const productInStock = isProductAvailable(product);
  const hasColorOptions = product.colors.length > 0;
  const approvedReviewCount = approvedReviews.length;
  const averageRating = calculateAverageRating(approvedReviews);
  const formattedAverageRating = approvedReviewCount > 0 ? averageRating.toFixed(1) : "0.0";
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Hello, I want to order the ${product.name} from Pickup Jiristore.` +
        `${selectedSize ? `\nSize: ${selectedSize}` : ""}` +
        `${selectedColor ? `\nColor: ${selectedColor}` : ""}` +
        `\nPrice: Rs ${product.price.toLocaleString()}`
    );
    return `https://wa.me/918485957694?text=${message}`;
  };

  const handleReviewDialogChange = (open: boolean) => {
    setIsReviewDialogOpen(open);

    if (!open) {
      setReviewSubmitError(null);
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = reviewForm.name.trim();
    const normalizedReview = reviewForm.review.trim();

    if (!normalizedName || !normalizedReview || reviewForm.rating < 1) {
      setReviewSubmitError("Please fill in your name, rating, and review.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewSubmitError(null);

    try {
      await submitProductReview({
        productId: product.id,
        productSlug: createProductReviewSlug(product.name),
        productName: product.name,
        name: normalizedName,
        rating: reviewForm.rating,
        review: normalizedReview,
      });

      setReviewForm(INITIAL_REVIEW_FORM_STATE);
      setIsReviewDialogOpen(false);
      setIsReviewSuccessOpen(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setReviewSubmitError("We couldn't submit your review right now. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
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
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="order-2 flex gap-3 overflow-x-auto pb-1 md:order-1 md:max-h-[34rem] md:w-24 md:flex-col md:overflow-y-auto md:pb-0">
                {productMedia.map((media, index) => (
                  <button
                    key={`${media.type}-${media.src}`}
                    type="button"
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-card transition-all md:h-24 md:w-24 ${
                      activeMediaIndex === index
                        ? "border-accent shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                        : "border-transparent hover:border-muted"
                    }`}
                    aria-label={
                      media.type === "image"
                        ? `Show image ${index + 1}`
                        : "Show product video"
                    }
                    aria-pressed={activeMediaIndex === index}
                  >
                    {media.type === "image" ? (
                      <Image
                        src={media.src}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          src={productImages[0]}
                          alt={`${product.name} video thumbnail`}
                          fill
                          className="object-cover opacity-50"
                          sizes="96px"
                        />
                        <div className="absolute inset-0 bg-slate-950/45" />
                        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 text-white">
                          <div className="rounded-full bg-white/90 p-2 text-slate-950 shadow-sm">
                            <Play className="h-4 w-4 fill-current" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                            Video
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="order-1 flex-1 md:order-2">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
                  {activeMedia.type === "image" ? (
                    <Image
                      src={activeMedia.src}
                      alt={product.name}
                      fill
                      className={`object-cover ${!productInStock ? "opacity-60" : ""}`}
                      priority={activeMediaIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black">
                      <video
                        controls
                        preload="none"
                        playsInline
                        className="h-full w-full object-contain"
                      >
                        <source src={activeMedia.src} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                      <Badge className="bg-accent text-accent-foreground">NEW</Badge>
                    )}
                    {product.discount > 0 && (
                      <Badge variant="destructive">{product.discount}% OFF</Badge>
                    )}
                    {!productInStock && (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-1">
                {product.brand}
              </p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-balance">
                {product.name}
              </h1>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex min-h-9 min-w-[5rem] items-center justify-center gap-1 rounded px-2 py-1 text-sm font-medium",
                      approvedReviewCount > 0
                        ? "bg-green-600 text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {isReviewsLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        {formattedAverageRating}
                        <Star className="h-4 w-4 fill-current" />
                      </>
                    )}
                  </div>
                  <div className="min-h-9">
                    <p className="text-muted-foreground">
                      {isReviewsLoading
                        ? "Loading reviews..."
                        : approvedReviewCount === 1
                          ? "1 Review"
                          : `${approvedReviewCount.toLocaleString()} Reviews`}
                    </p>
                    {!isReviewsLoading && (
                      <p className="text-xs text-muted-foreground">
                        {approvedReviewCount > 0
                          ? "Calculated from approved reviews"
                          : "Be the first to review this product"}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 sm:self-start"
                  onClick={() => setIsReviewDialogOpen(true)}
                >
                  <PencilLine className="h-4 w-4" />
                  Write a Review
                </Button>
              </div>
              {reviewsLoadError && (
                <p className="text-sm text-destructive">{reviewsLoadError}</p>
              )}
            </div>

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

            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Color:{" "}
                <span className="font-normal text-muted-foreground">
                  {hasColorOptions
                    ? selectedColor || "Select a color"
                    : "No color options listed"}
                </span>
              </h3>
              {hasColorOptions ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  This product does not currently have any color-specific options configured.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Size:{" "}
                  <span className="font-normal text-muted-foreground">
                    {selectedSize ? `${selectedSize}` : "Select a size"}
                  </span>
                </h3>
                <button className="text-sm text-accent hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeInventory.map((entry) => (
                  <button
                    key={entry.size}
                    type="button"
                    onClick={() => entry.stock > 0 && setSelectedSize(entry.size)}
                    disabled={entry.stock === 0}
                    className={`w-12 h-12 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize === entry.size
                        ? "border-accent bg-accent text-accent-foreground"
                        : entry.stock === 0
                          ? "border-border text-muted-foreground opacity-40 cursor-not-allowed"
                          : "border-border hover:border-ring text-foreground"
                    }`}
                  >
                    {entry.size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Disabled sizes are currently unavailable.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <a
                href={productInStock ? generateWhatsAppLink() : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-14 text-lg"
                  disabled={
                    !productInStock || !selectedSize || (hasColorOptions && !selectedColor)
                  }
                >
                  <MessageCircle className="w-5 h-5" />
                  {productInStock ? "Order on WhatsApp" : "Out of Stock"}
                </Button>
              </a>
              {(!selectedSize || (hasColorOptions && !selectedColor)) && productInStock && (
                <p className="text-sm text-center text-muted-foreground">
                  {hasColorOptions
                    ? "Please select size and color to proceed"
                    : "Please select a size to proceed"}
                </p>
              )}
              {!productInStock && (
                <p className="text-sm text-center text-muted-foreground">
                  This product is currently out of stock. Please check back later.
                </p>
              )}
            </div>

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

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Customer Reviews</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Ratings based on customer reviews
              </p>
            </div>

            <div className="space-y-3">
              {isReviewsLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Spinner className="h-5 w-5" />
                  <span>Loading reviews...</span>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-foreground">
                    {formattedAverageRating}
                  </div>
                  <RatingStars rating={averageRating} iconClassName="h-5 w-5" />
                  <p className="text-sm text-muted-foreground">
                    {approvedReviewCount === 1
                      ? "1 customer review"
                      : `${approvedReviewCount.toLocaleString()} customer reviews`}
                  </p>
                </>
              )}
            </div>

            <Button
              type="button"
              className="w-full gap-2"
              onClick={() => setIsReviewDialogOpen(true)}
            >
              <PencilLine className="h-4 w-4" />
              Write a Review
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">What Customers Say</h2>
                <p className="text-sm text-muted-foreground">
                  See what our customers are saying
                </p>
              </div>
              {!isReviewsLoading && approvedReviewCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {approvedReviewCount} {approvedReviewCount === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {isReviewsLoading ? (
              <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                <Spinner className="h-5 w-5 mr-3" />
                Loading reviews...
              </div>
            ) : reviewsLoadError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {reviewsLoadError}
              </div>
            ) : approvedReviewCount === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
                <h3 className="text-lg font-medium text-foreground">No reviews yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to share your experience.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {approvedReviews.map((review, index) => (
                  <article
                    key={review.id}
                    className={cn("space-y-3", index > 0 && "border-t border-border pt-5")}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{review.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatReviewDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <RatingStars rating={review.rating} />
                          <span className="text-sm font-medium text-foreground">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {review.review}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-4 md:grid-cols-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={handleReviewDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Tell us what you thought about {product.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reviewer-name">Your Name</Label>
              <Input
                id="reviewer-name"
                value={reviewForm.name}
                onChange={(event) =>
                  setReviewForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Enter your name"
                maxLength={80}
                disabled={isSubmittingReview}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  const isSelected = reviewForm.rating >= starValue;

                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() =>
                        setReviewForm((prev) => ({ ...prev, rating: starValue }))
                      }
                      className={cn(
                        "rounded-full p-1 transition-transform hover:scale-105",
                        isSubmittingReview && "cursor-not-allowed opacity-60"
                      )}
                      aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
                      disabled={isSubmittingReview}
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          isSelected
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground/50"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {reviewForm.rating > 0
                  ? `${reviewForm.rating} out of 5 stars`
                  : "Select a rating from 1 to 5 stars."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-text">Your Review</Label>
              <Textarea
                id="review-text"
                value={reviewForm.review}
                onChange={(event) =>
                  setReviewForm((prev) => ({ ...prev, review: event.target.value }))
                }
                placeholder="Share what you liked, how it fits, or what stood out."
                rows={5}
                maxLength={1200}
                disabled={isSubmittingReview}
                required
              />
            </div>

            {reviewSubmitError && (
              <p className="text-sm text-destructive">{reviewSubmitError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingReview}>
                {isSubmittingReview ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewSuccessOpen} onOpenChange={setIsReviewSuccessOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <DialogHeader className="items-center">
              <DialogTitle>Review Submitted</DialogTitle>
              <DialogDescription className="text-base text-foreground">
                Thanks for your review! It will be visible soon.
              </DialogDescription>
            </DialogHeader>

            <Button onClick={() => setIsReviewSuccessOpen(false)} className="w-full sm:w-auto">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
