"use client";

import type { ManagedCategories } from "@/lib/admin-store";

export const saveManagedCategoriesToFirebase = async (
  categories: ManagedCategories
) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const managedCategoriesDocRef = doc(db, "siteContent", "managedCategories");

  await setDoc(managedCategoriesDocRef, { categories });
};

export const subscribeManagedCategoriesFromFirebase = (
  callback: (categories: ManagedCategories | undefined) => void
) => {
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

      const managedCategoriesDocRef = doc(db, "siteContent", "managedCategories");

      unsubscribe = onSnapshot(managedCategoriesDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const remoteCategories = data.categories;

        if (
          !remoteCategories ||
          typeof remoteCategories !== "object" ||
          Array.isArray(remoteCategories)
        ) {
          callback(undefined);
          return;
        }

        callback(remoteCategories as ManagedCategories);
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to managed categories in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
