"use client";

import type { FeaturedCollectionSettings } from "@/lib/admin-store";

export const saveNewArrivalsCollectionToFirebase = async (
  newArrivalsCollection: FeaturedCollectionSettings
) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const newArrivalsCollectionDocRef = doc(db, "siteContent", "newArrivalsCollection");

  await setDoc(newArrivalsCollectionDocRef, { newArrivalsCollection });
};

export const subscribeNewArrivalsCollectionFromFirebase = (
  callback: (newArrivalsCollection: Partial<FeaturedCollectionSettings> | undefined) => void
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

      const newArrivalsCollectionDocRef = doc(db, "siteContent", "newArrivalsCollection");

      unsubscribe = onSnapshot(newArrivalsCollectionDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const remoteNewArrivalsCollection = data.newArrivalsCollection;

        if (
          !remoteNewArrivalsCollection ||
          typeof remoteNewArrivalsCollection !== "object" ||
          Array.isArray(remoteNewArrivalsCollection)
        ) {
          callback(undefined);
          return;
        }

        callback(remoteNewArrivalsCollection as Partial<FeaturedCollectionSettings>);
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to new arrivals collection in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
