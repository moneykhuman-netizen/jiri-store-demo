"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import {
  backfillProductCollectionIfEmpty,
  subscribeToProductsCollection,
} from "@/lib/firebase/products";

export function ProductsSyncInit() {
  const pathname = usePathname();
  const setProductsFromRemote = useAdminStore((state) => state.setProductsFromRemote);

  useEffect(() => {
    let hasSeenRemoteProducts = false;
    let isDisposed = false;

    if (pathname?.startsWith("/admin")) {
      void backfillProductCollectionIfEmpty(useAdminStore.getState().products).catch(() => {
        // The existing local store remains the fallback path until the collection is available.
      });
    }

    const unsubscribe = subscribeToProductsCollection((products) => {
      if (isDisposed) {
        return;
      }

      if (products.length > 0) {
        hasSeenRemoteProducts = true;
        setProductsFromRemote(products);
        return;
      }

      if (hasSeenRemoteProducts || useAdminStore.getState().products.length === 0) {
        setProductsFromRemote([]);
      }
    });

    return () => {
      isDisposed = true;
      unsubscribe();
    };
  }, [pathname, setProductsFromRemote]);

  return null;
}
