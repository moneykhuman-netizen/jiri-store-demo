"use client";

import { useAdminStore } from "@/lib/admin-store";
import { saveProducts, subscribeProducts } from "@/lib/firebase/products";

let isInitialized = false;
const PRODUCTS_SYNC_TIMEOUT_MS = 4000;

export function initProductsSync() {
  if (isInitialized) return;
  isInitialized = true;

  const setProductsFromRemote = useAdminStore.getState().setProductsFromRemote;
  const fallbackTimer = window.setTimeout(() => {
    setProductsFromRemote([]);
  }, PRODUCTS_SYNC_TIMEOUT_MS);

  void (async () => {
    try {
      const [{ doc, getDoc }, { auth, db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase/client"),
      ]);
      const productsDocRef = doc(db, "siteContent", "products");
      const snapshot = await getDoc(productsDocRef);

      const seedProductsIfMissing = async () => {
        if (!snapshot.exists()) {
          if (!auth.currentUser) return;
          await saveProducts(useAdminStore.getState().products);
        }
      };

      await seedProductsIfMissing();
      const remoteProducts = snapshot.exists()
        ? snapshot.data().products
        : [];

      setProductsFromRemote(
        Array.isArray(remoteProducts) ? remoteProducts : []
      );
      window.clearTimeout(fallbackTimer);

      subscribeProducts((products) => {
        setProductsFromRemote(products);
        window.clearTimeout(fallbackTimer);
      });
    } catch (error) {
      window.clearTimeout(fallbackTimer);
      setProductsFromRemote([]);
      console.error("Failed to initialize products from Firebase:", error);
    }
  })();
}
