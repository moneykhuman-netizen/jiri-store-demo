"use client";

import type { PromoBanner } from "@/lib/admin-store";

export const savePromoBannerToFirebase = async (promoBanner: PromoBanner) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const promoBannerDocRef = doc(db, "siteContent", "promoBanner");

  await setDoc(promoBannerDocRef, { promoBanner });
};

export const subscribePromoBannerFromFirebase = (
  callback: (promoBanner: PromoBanner | undefined) => void
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

      const promoBannerDocRef = doc(db, "siteContent", "promoBanner");

      unsubscribe = onSnapshot(promoBannerDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const remotePromoBanner = data.promoBanner;

        if (
          !remotePromoBanner ||
          typeof remotePromoBanner !== "object" ||
          Array.isArray(remotePromoBanner) ||
          typeof remotePromoBanner.badge !== "string" ||
          typeof remotePromoBanner.title !== "string" ||
          typeof remotePromoBanner.description !== "string" ||
          typeof remotePromoBanner.code !== "string"
        ) {
          callback(undefined);
          return;
        }

        callback(remotePromoBanner as PromoBanner);
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to promo banner in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
