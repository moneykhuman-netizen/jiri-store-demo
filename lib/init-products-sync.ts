"use client";

import { useAdminStore } from "@/lib/admin-store";
import { saveProducts, subscribeProducts } from "@/lib/firebase/products";

let isInitialized = false;

export function initProductsSync() {
  if (isInitialized) return;
  isInitialized = true;

  const setProductsFromRemote = useAdminStore.getState().setProductsFromRemote;

  void (async () => {
    try {
      const [{ doc, getDoc }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase/client"),
      ]);
      const productsDocRef = doc(db, "siteContent", "products");
      const snapshot = await getDoc(productsDocRef);

      if (!snapshot.exists()) {
        await saveProducts(useAdminStore.getState().products);
      }

      subscribeProducts((products) => {
        setProductsFromRemote(products);
      });
    } catch (error) {
      console.error("Failed to initialize products from Firebase:", error);
    }
  })();
}
