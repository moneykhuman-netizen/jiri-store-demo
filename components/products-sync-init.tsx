"use client";

import { useEffect } from "react";
import { initProductsSync } from "@/lib/init-products-sync";

export function ProductsSyncInit() {
  useEffect(() => {
    initProductsSync();
  }, []);

  return null;
}
