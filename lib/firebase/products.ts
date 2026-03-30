"use client";

import type { AdminProduct } from "@/lib/admin-store";

export const saveProducts = async (products: AdminProduct[]) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const productsDocRef = doc(db, "siteContent", "products");

  await setDoc(productsDocRef, { products });
};

export const subscribeProducts = (callback: (products: AdminProduct[]) => void) => {
  let didUnsubscribe = false;
  let unsubscribe: (() => void) | undefined;

  void Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ])
    .then(([{ doc, onSnapshot }, { db }]) => {
      if (didUnsubscribe) {
        return;
      }

      const productsDocRef = doc(db, "siteContent", "products");

      unsubscribe = onSnapshot(productsDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const data = snapshot.data();
        const remoteProducts = data.products;

        if (!Array.isArray(remoteProducts)) {
          callback([]);
          return;
        }

        callback(remoteProducts as AdminProduct[]);
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to products in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
