"use client";

import { useAdminStore } from "@/lib/admin-store";
import { subscribeSocialLinksFromFirebase } from "@/lib/firebase/social";

let isInitialized = false;

export function initSocialLinksSync() {
  if (isInitialized) return;
  isInitialized = true;

  const setSocialLinksFromRemote =
    useAdminStore.getState().setSocialLinksFromRemote;

  subscribeSocialLinksFromFirebase((socialLinks) => {
    if (socialLinks) {
      setSocialLinksFromRemote(socialLinks);
    }
  });
}
