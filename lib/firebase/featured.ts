"use client";

import type { FeaturedCollectionSettings } from "@/lib/admin-store";

export const saveFeaturedCollectionToFirebase = async (
  featuredCollection: FeaturedCollectionSettings
) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const featuredCollectionDocRef = doc(db, "siteContent", "featuredCollection");

  await setDoc(featuredCollectionDocRef, { featuredCollection });
};

export const subscribeFeaturedCollectionFromFirebase = (
  callback: (featuredCollection: Partial<FeaturedCollectionSettings> | undefined) => void
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

      const featuredCollectionDocRef = doc(db, "siteContent", "featuredCollection");

      unsubscribe = onSnapshot(featuredCollectionDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const remoteFeaturedCollection = data.featuredCollection;

        if (
          !remoteFeaturedCollection ||
          typeof remoteFeaturedCollection !== "object" ||
          Array.isArray(remoteFeaturedCollection)
        ) {
          callback(undefined);
          return;
        }

        callback(remoteFeaturedCollection as Partial<FeaturedCollectionSettings>);
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to featured collection in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
