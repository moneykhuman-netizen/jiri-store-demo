"use client";

import { useAdminStore, type ManagedCategories } from "@/lib/admin-store";
import {
  saveManagedCategoriesToFirebase,
  subscribeManagedCategoriesFromFirebase,
} from "@/lib/firebase/managed-categories";

const EMPTY_MANAGED_CATEGORIES: ManagedCategories = {
  men: [],
  women: [],
};

let isInitialized = false;

export function initManagedCategoriesSync() {
  if (isInitialized) return;
  isInitialized = true;

  const setManagedCategoriesFromRemote =
    useAdminStore.getState().setManagedCategoriesFromRemote;

  void (async () => {
    try {
      const [{ doc, getDoc }, { auth, db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase/client"),
      ]);
      const managedCategoriesDocRef = doc(db, "siteContent", "managedCategories");
      const snapshot = await getDoc(managedCategoriesDocRef);

      const seedManagedCategoriesIfMissing = async () => {
        if (!snapshot.exists()) {
          if (!auth.currentUser) return;
          await saveManagedCategoriesToFirebase(EMPTY_MANAGED_CATEGORIES);
        }
      };

      await seedManagedCategoriesIfMissing();

      subscribeManagedCategoriesFromFirebase((categories) => {
        setManagedCategoriesFromRemote(categories ?? EMPTY_MANAGED_CATEGORIES);
      });
    } catch (error) {
      console.error("Failed to initialize managed categories from Firebase:", error);
    }
  })();
}
