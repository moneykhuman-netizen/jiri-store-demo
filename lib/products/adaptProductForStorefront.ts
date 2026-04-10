import { fromCanonicalProduct } from "@/lib/products/fromCanonicalProduct";
import { toCanonicalProduct } from "@/lib/products/toCanonicalProduct";

export const adaptProductForStorefront = (rawProduct: any) => {
  const adaptedProduct = fromCanonicalProduct(toCanonicalProduct(rawProduct));

  return {
    ...adaptedProduct,
    originalPrice:
      typeof rawProduct?.originalPrice === "number"
        ? rawProduct.originalPrice
        : adaptedProduct.originalPrice,
    discount:
      typeof rawProduct?.discount === "number"
        ? rawProduct.discount
        : adaptedProduct.discount,
    rating:
      typeof rawProduct?.rating === "number"
        ? rawProduct.rating
        : adaptedProduct.rating,
    reviews:
      typeof rawProduct?.reviews === "number"
        ? rawProduct.reviews
        : adaptedProduct.reviews,
    type: typeof rawProduct?.type === "string" ? rawProduct.type : adaptedProduct.type,
    description:
      typeof rawProduct?.description === "string"
        ? rawProduct.description
        : adaptedProduct.description,
    features: Array.isArray(rawProduct?.features)
      ? rawProduct.features.filter(
          (feature: unknown): feature is string => typeof feature === "string"
        )
      : adaptedProduct.features,
  };
};
