"use client";

import type { BrandPresentation } from "@/lib/admin-store";

export const saveBrandsToFirebase = async (
  brands: string[],
  brandPresentations: Record<string, BrandPresentation>
) => {
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const shopByBrandDocRef = doc(db, "siteContent", "shopByBrand");

  await setDoc(shopByBrandDocRef, {
    brands,
    brandPresentations,
  });
};

export const subscribeBrandsFromFirebase = (
  callback: (
    remote:
      | { brands: string[]; brandPresentations: Record<string, BrandPresentation> }
      | undefined
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

      const shopByBrandDocRef = doc(db, "siteContent", "shopByBrand");

      unsubscribe = onSnapshot(shopByBrandDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const remoteBrands = data.brands;
        const remoteBrandPresentations = data.brandPresentations;

        if (
          !Array.isArray(remoteBrands) ||
          remoteBrands.some((brand) => typeof brand !== "string") ||
          !remoteBrandPresentations ||
          typeof remoteBrandPresentations !== "object" ||
          Array.isArray(remoteBrandPresentations)
        ) {
          callback(undefined);
          return;
        }

        callback({
          brands: remoteBrands as string[],
          brandPresentations: remoteBrandPresentations as Record<string, BrandPresentation>,
        });
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe to shop by brand in Firebase:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
