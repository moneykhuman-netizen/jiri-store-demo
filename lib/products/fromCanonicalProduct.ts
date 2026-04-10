import { normalizeProductImages } from "@/lib/products";
import type { CanonicalProduct } from "./productSchema";

const toNonNegativeNumber = (value: unknown, fallback = 0) => {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(0, parsedValue);
};

const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  const normalizedValues: string[] = [];

  value.forEach((entry) => {
    if (typeof entry !== "string") {
      return;
    }

    const trimmedEntry = entry.trim();
    if (!trimmedEntry || normalizedValues.includes(trimmedEntry)) {
      return;
    }

    normalizedValues.push(trimmedEntry);
  });

  return normalizedValues;
};

const sortSizeKeys = (sizeKeys: string[]) =>
  [...sizeKeys].sort((left, right) => {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const leftIsNumeric = Number.isFinite(leftNumber);
    const rightIsNumeric = Number.isFinite(rightNumber);

    if (leftIsNumeric && rightIsNumeric) {
      return leftNumber - rightNumber;
    }

    return left.localeCompare(right);
  });

export function fromCanonicalProduct(product: CanonicalProduct): any {
  const images = normalizeProductImages(product.images);
  const primaryImage = images[0];
  const inventoryRecord =
    product.sizeInventory && typeof product.sizeInventory === "object"
      ? product.sizeInventory
      : {};
  const inventoryKeys = sortSizeKeys(
    Object.keys(inventoryRecord).filter((size) => size.trim().length > 0)
  );
  const sizeInventory = inventoryKeys.map((size) => {
    const numericSize = Number(size);

    return {
      size: Number.isFinite(numericSize) ? numericSize : size,
      stock: toNonNegativeNumber(inventoryRecord[size]),
    };
  });
  const sizes = toStringArray(product.sizes);
  const resolvedSizes = sizes.length > 0 ? sizes : inventoryKeys;
  const inventoryStock = sizeInventory.reduce((total, entry) => total + entry.stock, 0);
  const stock = toNonNegativeNumber(product.stock, inventoryStock);
  const price = toNonNegativeNumber(product.price, 0);
  const colors = toStringArray(product.colors);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price,
    brand: product.brand || "",
    category: product.category || "",
    images,
    image: primaryImage,
    primaryImage,
    videoUrl: product.videoUrl ?? "",
    stock,
    inStock: Boolean(product.inStock),
    sizeInventory,
    sizes: resolvedSizes,
    featured: Boolean(product.featured),
    newArrival: Boolean(product.newArrival),
    isFeatured: Boolean(product.featured),
    isNew: Boolean(product.newArrival),
    description: product.description ?? "",
    colors,
    originalPrice: price,
    discount: 0,
    rating: 0,
    reviews: 0,
    type: "",
    features: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
