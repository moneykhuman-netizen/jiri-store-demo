export interface ProductSizeStock {
  size: number;
  stock: number;
}

export const QUICK_SELECT_SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type InventoryProductLike = {
  sizes?: unknown;
  sizeInventory?: unknown;
  stock?: unknown;
  inStock?: unknown;
};

const normalizeNonNegativeInteger = (value: unknown) => {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsedValue));
};

export const normalizeSizeNumber = (value: unknown) => {
  const normalizedSize = normalizeNonNegativeInteger(value);
  return normalizedSize > 0 ? normalizedSize : null;
};

export const normalizeProductColors = (colors: unknown) => {
  if (!Array.isArray(colors)) {
    return [] as string[];
  }

  const normalizedColors: string[] = [];
  const seenColors = new Set<string>();

  colors.forEach((color) => {
    if (typeof color !== "string") {
      return;
    }

    const normalizedColor = color.trim();
    const dedupeKey = normalizedColor.toLowerCase();

    if (!normalizedColor || seenColors.has(dedupeKey)) {
      return;
    }

    seenColors.add(dedupeKey);
    normalizedColors.push(normalizedColor);
  });

  return normalizedColors;
};

export const normalizeProductSizeInventory = ({
  sizes,
  sizeInventory,
  stock,
  inStock,
}: InventoryProductLike) => {
  const normalizedInventory = new Map<number, ProductSizeStock>();
  const fallbackStock = normalizeNonNegativeInteger(stock) > 0 || Boolean(inStock) ? 1 : 0;
  const rawSizes = Array.isArray(sizeInventory)
    ? sizeInventory
    : Array.isArray(sizes)
      ? sizes
      : [];

  rawSizes.forEach((rawSize) => {
    if (typeof rawSize === "object" && rawSize !== null && "size" in rawSize) {
      const normalizedSize = normalizeSizeNumber(rawSize.size);
      if (normalizedSize === null) {
        return;
      }

      const nextStock =
        "stock" in rawSize
          ? normalizeNonNegativeInteger(rawSize.stock)
          : fallbackStock;

      normalizedInventory.set(normalizedSize, {
        size: normalizedSize,
        stock: nextStock,
      });
      return;
    }

    const normalizedSize = normalizeSizeNumber(rawSize);
    if (normalizedSize === null) {
      return;
    }

    normalizedInventory.set(normalizedSize, {
      size: normalizedSize,
      stock: fallbackStock,
    });
  });

  return Array.from(normalizedInventory.values()).sort((a, b) => a.size - b.size);
};

export const getProductSizeInventory = (product: InventoryProductLike) =>
  normalizeProductSizeInventory(product);

export const getProductSizeNumbers = (product: InventoryProductLike) =>
  getProductSizeInventory(product).map((entry) => entry.size);

export const getTotalSizeStock = (product: InventoryProductLike | ProductSizeStock[]) => {
  const inventory = Array.isArray(product) ? product : getProductSizeInventory(product);
  return inventory.reduce((total, entry) => total + normalizeNonNegativeInteger(entry.stock), 0);
};

export const isProductAvailable = (product: InventoryProductLike) =>
  getProductSizeInventory(product).some((entry) => entry.stock > 0);

export const isSizeAvailable = (product: InventoryProductLike, size: number) =>
  getProductSizeInventory(product).some(
    (entry) => entry.size === size && entry.stock > 0
  );

export const distributeStockAcrossSizes = (
  sizes: number[],
  totalStock: number
): ProductSizeStock[] => {
  const normalizedSizes = Array.from(new Set(sizes))
    .map((size) => normalizeSizeNumber(size))
    .filter((size): size is number => size !== null)
    .sort((a, b) => a - b);

  if (normalizedSizes.length === 0) {
    return [];
  }

  const normalizedStock = normalizeNonNegativeInteger(totalStock);
  const baseStock = Math.floor(normalizedStock / normalizedSizes.length);
  let remainder = normalizedStock % normalizedSizes.length;

  return normalizedSizes.map((size) => {
    const stockForSize = baseStock + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);

    return {
      size,
      stock: stockForSize,
    };
  });
};
