"use client";

import { useEffect } from "react";
import { initManagedCategoriesSync } from "@/lib/init-managed-categories-sync";

export function ManagedCategoriesSyncInit() {
  useEffect(() => {
    initManagedCategoriesSync();
  }, []);

  return null;
}
