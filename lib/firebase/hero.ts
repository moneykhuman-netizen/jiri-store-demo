"use client";

import type { HeroSlide } from "@/lib/admin-store";

const HERO_DOC_PATH = "siteContent/homeHero";

export const saveHeroSlidesToFirebase = async (slides: HeroSlide[]) => {
  console.log("[Hero Firebase][write] saveHeroSlidesToFirebase called", {
    path: HERO_DOC_PATH,
    heroSlidesLength: slides.length,
  });

  try {
    const [{ doc, setDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("@/lib/firebase/client"),
    ]);
    const heroDocRef = doc(db, "siteContent", "homeHero");

    console.log("[Hero Firebase][write] Writing heroSlides to Firestore", {
      path: HERO_DOC_PATH,
      heroSlidesLength: slides.length,
    });

    await setDoc(heroDocRef, { heroSlides: slides });

    console.log("[Hero Firebase][write] Firestore write completed successfully", {
      path: HERO_DOC_PATH,
      heroSlidesLength: slides.length,
    });
  } catch (error) {
    console.error("[Hero Firebase][write] Firestore write failed", error);
    throw error;
  }
};

export const subscribeHeroSlidesFromFirebase = (
  callback: (slides: HeroSlide[] | undefined) => void
) => {
  console.log("[Hero Firebase][subscribe] Starting Hero Firestore subscription", {
    path: HERO_DOC_PATH,
  });

  let didUnsubscribe = false;
  let unsubscribe: (() => void) | undefined;

  void Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]).then(([{ doc, onSnapshot }, { db }]) => {
    if (didUnsubscribe) {
      return;
    }

    const heroDocRef = doc(db, "siteContent", "homeHero");

    console.log("[Hero Firebase][subscribe] Subscribing to Firestore doc", {
      path: HERO_DOC_PATH,
    });

    unsubscribe = onSnapshot(
      heroDocRef,
      (snapshot) => {
        const documentExists = snapshot.exists();

        console.log("[Hero Firebase][subscribe] Snapshot received", {
          path: HERO_DOC_PATH,
          documentExists,
        });

        if (!documentExists) {
          console.log(
            "[Hero Firebase][subscribe] Hero doc missing, sending callback(undefined)"
          );
          callback(undefined);
          return;
        }

        const data = snapshot.data();
        const heroSlidesIsArray = Array.isArray(data.heroSlides);

        console.log("[Hero Firebase][subscribe] Snapshot payload inspection", {
          path: HERO_DOC_PATH,
          heroSlidesIsArray,
          heroSlidesLength: heroSlidesIsArray ? data.heroSlides.length : null,
        });

        if (!heroSlidesIsArray) {
          console.log(
            "[Hero Firebase][subscribe] heroSlides missing or invalid, sending callback(undefined)"
          );
          callback(undefined);
          return;
        }

        callback(data.heroSlides as HeroSlide[]);
      },
      (error) => {
        console.error("[Hero Firebase][subscribe] Firestore subscription error", error);
      }
    );
  }).catch((error) => {
    console.error("[Hero Firebase][subscribe] Failed to initialize subscription", error);
  });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
