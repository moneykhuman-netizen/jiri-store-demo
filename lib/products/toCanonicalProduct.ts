import { normalizeProductImages, normalizeProductVideoUrl } from "@/lib/products";
import type { CanonicalProduct, CanonicalTimestamp } from "./productSchema";

const toTrimmedString = (value: unknown, fallback = "") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue || fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return fallback;
};

const toNonNegativeNumber = (value: unknown, fallback = 0) =>
  Math.max(0, toNumber(value, fallback));

const toBoolean = (value: unknown) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1";

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

const toOptionalString = (value: unknown) => {
  const normalizedValue = toTrimmedString(value);
  return normalizedValue || undefined;
};

const toOptionalTimestamp = (value: unknown): CanonicalTimestamp | undefined => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return undefined;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeSizeInventory = (value: unknown) => {
  const normalizedInventory: Record<string, number> = {};

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (!entry || typeof entry !== "object" || !("size" in entry)) {
        return;
      }

      const sizeKey = toTrimmedString(entry.size);
      if (!sizeKey) {
        return;
      }

      normalizedInventory[sizeKey] = toNonNegativeNumber(
        "stock" in entry ? entry.stock : 0
      );
    });

    return normalizedInventory;
  }

  if (!value || typeof value !== "object") {
    return normalizedInventory;
  }

  Object.entries(value).forEach(([size, stock]) => {
    const sizeKey = toTrimmedString(size);
    if (!sizeKey) {
      return;
    }

    normalizedInventory[sizeKey] = toNonNegativeNumber(stock);
  });

  return normalizedInventory;
};

const normalizeLegacySizeInventory = (
  sizes: unknown,
  stock: unknown,
  inStock: unknown
) => {
  if (!Array.isArray(sizes)) {
    return {} as Record<string, number>;
  }

  const fallbackStock = toNonNegativeNumber(stock) > 0 || toBoolean(inStock) ? 1 : 0;
  const normalizedInventory: Record<string, number> = {};

  sizes.forEach((size) => {
    const sizeKey =
      typeof size === "number"
        ? String(size)
        : typeof size === "string"
          ? size.trim()
          : "";

    if (!sizeKey || normalizedInventory[sizeKey] !== undefined) {
      return;
    }

    normalizedInventory[sizeKey] = fallbackStock;
  });

  return normalizedInventory;
};

export function toCanonicalProduct(input: any): CanonicalProduct {
  const name = toTrimmedString(input?.name, "Untitled Product");
  const fallbackId = slugify(name) || "product";
  const id = toTrimmedString(input?.id, fallbackId);
  const slug = toTrimmedString(input?.slug, slugify(name) || id);
  const normalizedSizeInventory = normalizeSizeInventory(input?.sizeInventory);
  const sizeInventory =
    Object.keys(normalizedSizeInventory).length > 0
      ? normalizedSizeInventory
      : normalizeLegacySizeInventory(input?.sizes, input?.stock, input?.inStock);
  const hasInventoryAvailability = Object.values(sizeInventory).some(
    (sizeStock) => sizeStock > 0
  );
  const derivedStock = Object.values(sizeInventory).reduce(
    (total, sizeStock) => total + sizeStock,
    0
  );
  const stock = input?.stock == null
    ? derivedStock
    : toNonNegativeNumber(input.stock, derivedStock);
  const hasExplicitInStock =
    input !== null &&
    typeof input === "object" &&
    input.inStock !== undefined &&
    input.inStock !== null;
  const imageCandidates = Array.isArray(input?.images)
    ? input.images
    : [input?.image, input?.primaryImage].filter(Boolean);
  const images = normalizeProductImages(imageCandidates);
  const videoUrl = normalizeProductVideoUrl(input?.videoUrl);
  const description = toOptionalString(input?.description);
  const colors = toStringArray(input?.colors);
  const sizes = toStringArray(input?.sizes);
  const createdAt = toOptionalTimestamp(input?.createdAt);
  const updatedAt = toOptionalTimestamp(input?.updatedAt);

  return {
    id,
    name,
    slug,
    price: toNumber(input?.price, 0),
    brand: toTrimmedString(input?.brand),
    category: toTrimmedString(input?.category),
    images,
    ...(videoUrl ? { videoUrl } : {}),
    stock,
    inStock: hasExplicitInStock
      ? toBoolean(input.inStock)
      : Object.keys(sizeInventory).length > 0
        ? hasInventoryAvailability
        : stock > 0,
    sizeInventory,
    featured: toBoolean(input?.featured ?? input?.isFeatured),
    newArrival: toBoolean(input?.newArrival ?? input?.isNew),
    ...(description ? { description } : {}),
    ...(colors.length > 0 ? { colors } : {}),
    ...(sizes.length > 0 ? { sizes } : {}),
    ...(createdAt !== undefined ? { createdAt } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
  };
}
