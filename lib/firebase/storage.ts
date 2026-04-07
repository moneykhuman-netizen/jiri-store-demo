"use client";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "@/lib/firebase/client";

const STORAGE_PRODUCT_IMAGES_ROOT = "products";

const createUploadId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeStorageFileName = (fileName: string) => {
  const trimmedFileName = fileName.trim();
  const safeFileName = trimmedFileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeFileName || "image";
};

export const uploadProductImage = async (file: File, productId: string) => {
  const normalizedProductId = productId.trim();

  if (!normalizedProductId) {
    throw new Error("Product ID is required for image upload.");
  }

  if (!(file instanceof File) || file.size <= 0) {
    throw new Error("A valid image file is required.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  const storage = getStorage(app);
  const uploadId = createUploadId();
  const normalizedFileName = normalizeStorageFileName(file.name);
  const storagePath =
    `${STORAGE_PRODUCT_IMAGES_ROOT}/${normalizedProductId}/images/` +
    `${uploadId}-${normalizedFileName}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(snapshot.ref);
};
