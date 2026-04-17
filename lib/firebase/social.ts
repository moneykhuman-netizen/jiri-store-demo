"use client";

import { normalizeSocialLinks, type SocialLinks } from "@/lib/admin-store";

export const saveSocialLinksToFirebase = async (socialLinks: SocialLinks) => {
  const normalizedSocialLinks = normalizeSocialLinks(socialLinks);
  const [{ doc, setDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);
  const socialLinksDocRef = doc(db, "siteContent", "socialLinks");

  await setDoc(socialLinksDocRef, { socialLinks: normalizedSocialLinks });
};

export const subscribeSocialLinksFromFirebase = (
  callback: (socialLinks: Partial<SocialLinks> | undefined) => void
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

      const socialLinksDocRef = doc(db, "siteContent", "socialLinks");

      unsubscribe = onSnapshot(
        socialLinksDocRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            callback(undefined);
            return;
          }

          const data = snapshot.data();
          const remoteSocialLinks = data.socialLinks;

          if (
            !remoteSocialLinks ||
            typeof remoteSocialLinks !== "object" ||
            Array.isArray(remoteSocialLinks)
          ) {
            callback(undefined);
            return;
          }

          callback(
            normalizeSocialLinks(remoteSocialLinks as Partial<SocialLinks>)
          );
        },
        (error) => {
          console.error("Failed to subscribe to social links in Firebase:", error);
        }
      );
    })
    .catch((error) => {
      console.error("Failed to initialize social links Firebase subscription:", error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};
