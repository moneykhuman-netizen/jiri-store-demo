import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  mergeProduct,
  normalizeLegacySeedProduct,
  normalizeProduct,
  sortProductsForStore,
  type NormalizedProduct,
} from "@/lib/product-normalization";
import type { Product } from "@/lib/products";

const PRODUCTS_COLLECTION = "products";
const LEGACY_PRODUCTS_DOC_PATH = ["siteContent", "products"] as const;

const productsCollectionRef = () => {
  if (!db) {
    throw new Error("Firebase is not configured");
  }

  return collection(db, PRODUCTS_COLLECTION);
};

const productDocRef = (productId: string) => {
  if (!db) {
    throw new Error("Firebase is not configured");
  }

  return doc(db, PRODUCTS_COLLECTION, productId);
};

const serializeProduct = (product: NormalizedProduct) => ({
  ...product,
  videoUrl: product.videoUrl ?? null,
});

const sortLegacyProducts = (products: Product[]) =>
  [...products].sort((left, right) => {
    const leftFreshness = Number(left.updatedAt ?? left.createdAt ?? 0);
    const rightFreshness = Number(right.updatedAt ?? right.createdAt ?? 0);

    if (leftFreshness !== rightFreshness) {
      return rightFreshness - leftFreshness;
    }

    return left.name.localeCompare(right.name);
  });

const extractLegacyProducts = (rawData: unknown): Product[] => {
  if (Array.isArray(rawData)) {
    return rawData as Product[];
  }

  if (!rawData || typeof rawData !== "object") {
    return [];
  }

  const record = rawData as Record<string, unknown>;
  const candidates = ["products", "items", "data"]
    .map((key) => record[key])
    .filter(Array.isArray);

  if (candidates.length > 0) {
    return candidates[0] as Product[];
  }

  const objectValues = Object.values(record);
  if (
    objectValues.length > 0 &&
    objectValues.every(
      (value) => value && typeof value === "object" && "id" in (value as Record<string, unknown>)
    )
  ) {
    return objectValues as Product[];
  }

  return [];
};

export const subscribeToProductsCollection = (
  onProducts: (products: NormalizedProduct[]) => void,
  onError?: (error: Error) => void
) => {
  if (!isFirebaseConfigured || !db) {
    return () => undefined;
  }

  return onSnapshot(
    productsCollectionRef(),
    (snapshot) => {
      const products = snapshot.docs.map((snapshotDoc) =>
        normalizeProduct(snapshotDoc.data() as Product)
      );
      onProducts(sortProductsForStore(products));
    },
    (error) => {
      onError?.(error);
    }
  );
};

export const createProductDocument = async (
  product: Product
): Promise<NormalizedProduct> => {
  if (!isFirebaseConfigured || !db) {
    return normalizeProduct(product, {
      deriveInventoryFromStock: true,
    });
  }

  const now = Date.now();
  const normalizedProduct = normalizeProduct(
    {
      ...product,
      createdAt: product.createdAt ?? now,
      updatedAt: now,
    },
    {
      deriveInventoryFromStock: true,
    }
  );

  await setDoc(productDocRef(normalizedProduct.id), serializeProduct(normalizedProduct));
  return normalizedProduct;
};

export const updateProductDocument = async (
  currentProduct: NormalizedProduct,
  updates: Partial<NormalizedProduct>
): Promise<NormalizedProduct> => {
  const mergedProduct = mergeProduct(currentProduct, {
    ...updates,
    createdAt: currentProduct.createdAt,
    updatedAt: Date.now(),
  });

  if (!isFirebaseConfigured || !db) {
    return mergedProduct;
  }

  await setDoc(productDocRef(currentProduct.id), serializeProduct(mergedProduct));
  return mergedProduct;
};

export const deleteProductDocument = async (productId: string): Promise<void> => {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  await deleteDoc(productDocRef(productId));
};

export const deleteProductsByIds = async (productIds: string[]): Promise<void> => {
  if (!isFirebaseConfigured || !db || productIds.length === 0) {
    return;
  }

  const batch = writeBatch(db);
  productIds.forEach((productId) => {
    batch.delete(productDocRef(productId));
  });
  await batch.commit();
};

const readLegacyProductsDocument = async (): Promise<Product[]> => {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const legacyDocRef = doc(db, ...LEGACY_PRODUCTS_DOC_PATH);
  const snapshot = await getDoc(legacyDocRef);
  if (!snapshot.exists()) {
    return [];
  }

  return sortLegacyProducts(extractLegacyProducts(snapshot.data()));
};

export const backfillProductCollectionIfEmpty = async (
  fallbackProducts: Product[]
): Promise<boolean> => {
  if (!isFirebaseConfigured || !db) {
    return false;
  }

  const existingDocs = await getDocs(query(productsCollectionRef(), limit(1)));
  if (!existingDocs.empty) {
    return false;
  }

  const legacyProducts = await readLegacyProductsDocument();
  const sourceProducts = legacyProducts.length > 0 ? legacyProducts : fallbackProducts;
  if (sourceProducts.length === 0) {
    return false;
  }

  const batch = writeBatch(db);
  sourceProducts.forEach((product, index) => {
    const normalizedProduct =
      product.stock !== undefined || (product.sizeInventory?.length ?? 0) > 0
        ? normalizeProduct(product)
        : normalizeLegacySeedProduct(product, index);
    batch.set(productDocRef(normalizedProduct.id), serializeProduct(normalizedProduct));
  });

  await batch.commit();
  return true;
};
