"use client";

import type { HeroSection, HomepageCategoryCard } from "@/lib/admin-store";

export const saveHomepageCategoriesToFirebase = async (
  homepageCategories: Record<HeroSection, HomepageCategoryCard>
) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const shopByCategoryDocRef = doc(db, "siteContent", "shopByCategory");

  await setDoc(shopByCategoryDocRef, { homepageCategories });
};

export const subscribeHomepageCategoriesFromFirebase = (
  callback: (
    homepageCategories: Record<HeroSection, HomepageCategoryCard> | undefined
  ) => void
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

      const shopByCategoryDocRef = doc(db, "siteContent", "shopByCategory");

      unsubscribe = onSnapshot(shopByCategoryDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const remoteHomepageCategories = data.homepageCategories;

        if (
          !remoteHomepageCategories ||
          typeof remoteHomepageCategories !== "object" ||
          Array.isArray(remoteHomepageCategories)
        ) {
          callback(undefined);
          return;
        }

        callback(
          remoteHomepageCategories as Record<HeroSection, HomepageCategoryCard>
        );
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to shop by category in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
