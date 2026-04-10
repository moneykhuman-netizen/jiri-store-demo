"use client";

import { useEffect } from "react";
import { initSocialLinksSync } from "@/lib/init-social-links-sync";

export function SocialLinksSyncInit() {
  useEffect(() => {
    initSocialLinksSync();
  }, []);

  return null;
}
