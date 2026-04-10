import type { Product, ProductSizeInventory } from "@/lib/products";

export interface NormalizedProduct extends Omit<Product, "stock" | "sizeInventory"> {
  stock: number;
  sizeInventory: ProductSizeInventory[];
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";

const toNonNegativeInteger = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
};

const uniqueStrings = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
    )
  );
};

const uniqueSizes = (values: unknown): number[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.floor(value))
    )
  ).sort((left, right) => left - right);
};

const normalizeImages = (values: unknown): string[] => {
  const images = uniqueStrings(values);
  return images.length > 0 ? images : [DEFAULT_FALLBACK_IMAGE];
};

const distributeStockAcrossSizes = (
  totalStock: number,
  sizes: number[]
): ProductSizeInventory[] => {
  const safeTotalStock = toNonNegativeInteger(totalStock);
  const normalizedSizes = uniqueSizes(sizes);

  if (normalizedSizes.length === 0) {
    return [];
  }

  const baseAllocation = Math.floor(safeTotalStock / normalizedSizes.length);
  let remainder = safeTotalStock % normalizedSizes.length;

  return normalizedSizes.map((size) => {
    const stock = baseAllocation + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);

    return { size, stock };
  });
};

const normalizeProvidedInventory = (
  values: unknown,
  allowedSizes: number[]
): ProductSizeInventory[] => {
  if (!Array.isArray(values) || allowedSizes.length === 0) {
    return [];
  }

  const inventoryBySize = new Map<number, number>();

  values.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const rawSize = "size" in entry ? (entry as { size?: unknown }).size : undefined;
    const size = Number(rawSize);
    if (!Number.isFinite(size)) {
      return;
    }

    const normalizedSize = Math.floor(size);
    if (!allowedSizes.includes(normalizedSize)) {
      return;
    }

    const stock = toNonNegativeInteger(
      "stock" in entry ? (entry as { stock?: unknown }).stock : 0
    );
    inventoryBySize.set(normalizedSize, stock);
  });

  return allowedSizes.map((size) => ({
    size,
    stock: inventoryBySize.get(size) ?? 0,
  }));
};

const calculateDiscount = (price: number, originalPrice: number): number => {
  if (originalPrice <= price || originalPrice <= 0) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const sumSizeInventory = (inventory: ProductSizeInventory[]): number =>
  inventory.reduce((sum, entry) => sum + toNonNegativeInteger(entry.stock), 0);

export const sortProductsForStore = (
  products: NormalizedProduct[]
): NormalizedProduct[] =>
  [...products].sort((left, right) => {
    const leftFreshness = left.updatedAt ?? left.createdAt ?? 0;
    const rightFreshness = right.updatedAt ?? right.createdAt ?? 0;

    if (leftFreshness !== rightFreshness) {
      return rightFreshness - leftFreshness;
    }

    return left.name.localeCompare(right.name);
  });

export function normalizeProduct(
  product: Product,
  options?: {
    deriveInventoryFromStock?: boolean;
    fallbackLegacyStock?: number;
  }
): NormalizedProduct {
  const normalizedSizes = uniqueSizes(product.sizes);
  const normalizedColors = uniqueStrings(product.colors);
  const normalizedFeatures = uniqueStrings(product.features);
  const normalizedImages = normalizeImages(product.images);
  const normalizedPrice = toNonNegativeInteger(product.price);
  const normalizedOriginalPrice = Math.max(
    normalizedPrice,
    toNonNegativeInteger(product.originalPrice)
  );
  const requestedStock =
    product.stock !== undefined
      ? toNonNegativeInteger(product.stock)
      : toNonNegativeInteger(options?.fallbackLegacyStock);

  const shouldDeriveInventoryFromStock = options?.deriveInventoryFromStock ?? false;
  const providedInventory = shouldDeriveInventoryFromStock
    ? []
    : normalizeProvidedInventory(product.sizeInventory, normalizedSizes);
  const normalizedSizeInventory =
    normalizedSizes.length === 0
      ? []
      : providedInventory.length > 0
        ? providedInventory
        : distributeStockAcrossSizes(requestedStock, normalizedSizes);

  const normalizedStock =
    normalizedSizeInventory.length > 0 ? sumSizeInventory(normalizedSizeInventory) : requestedStock;
  const normalizedCreatedAt = toNonNegativeInteger(product.createdAt);
  const normalizedUpdatedAt = toNonNegativeInteger(product.updatedAt);

  return {
    ...product,
    brand: typeof product.brand === "string" ? product.brand.trim() : "",
    name: typeof product.name === "string" ? product.name.trim() : "",
    type: typeof product.type === "string" ? product.type.trim() : "",
    description: typeof product.description === "string" ? product.description.trim() : "",
    features: normalizedFeatures,
    colors: normalizedColors,
    images: normalizedImages,
    sizes: normalizedSizes,
    sizeInventory: normalizedSizeInventory,
    price: normalizedPrice,
    originalPrice: normalizedOriginalPrice,
    discount: calculateDiscount(normalizedPrice, normalizedOriginalPrice),
    rating: Number.isFinite(product.rating) ? Number(product.rating) : 0,
    reviews: toNonNegativeInteger(product.reviews),
    stock: normalizedStock,
    inStock: normalizedStock > 0,
    videoUrl: typeof product.videoUrl === "string" ? product.videoUrl.trim() || undefined : undefined,
    createdAt: normalizedCreatedAt > 0 ? normalizedCreatedAt : undefined,
    updatedAt: normalizedUpdatedAt > 0 ? normalizedUpdatedAt : undefined,
  };
}

export function mergeProduct(
  currentProduct: NormalizedProduct,
  updates: Partial<NormalizedProduct>
): NormalizedProduct {
  const stockUpdated = Object.prototype.hasOwnProperty.call(updates, "stock");
  const sizeInventoryUpdated = Object.prototype.hasOwnProperty.call(updates, "sizeInventory");
  const sizesUpdated = Object.prototype.hasOwnProperty.call(updates, "sizes");

  return normalizeProduct(
    {
      ...currentProduct,
      ...updates,
    },
    {
      deriveInventoryFromStock: (stockUpdated || sizesUpdated) && !sizeInventoryUpdated,
    }
  );
}

export function normalizeLegacySeedProduct(
  product: Product,
  index = 0
): NormalizedProduct {
  const fallbackLegacyStock =
    product.stock !== undefined
      ? product.stock
      : product.inStock
        ? Math.max(uniqueSizes(product.sizes).length, 1)
        : 0;
  const baseTimestamp = 1_700_000_000_000;

  return normalizeProduct(
    {
      ...product,
      createdAt: product.createdAt ?? baseTimestamp + index,
      updatedAt: product.updatedAt ?? baseTimestamp + index,
    },
    {
      deriveInventoryFromStock: true,
      fallbackLegacyStock,
    }
  );
}
