"use client";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "@/lib/firebase/client";
import type { HeroSection } from "@/lib/site-data";

const STORAGE_PRODUCT_IMAGES_ROOT = "products";
const STORAGE_SITE_MEDIA_ROOT = "site-content";

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

const normalizeStoragePathSegment = (value: string, fallback: string) => {
  const trimmedValue = value.trim().toLowerCase();
  const safeSegment = trimmedValue
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeSegment || fallback;
};

const uploadStorageAsset = async ({
  file,
  storagePath,
  fileTypePrefix,
  invalidTypeMessage,
}: {
  file: File;
  storagePath: string;
  fileTypePrefix: "image/" | "video/";
  invalidTypeMessage: string;
}) => {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error(`A valid ${fileTypePrefix === "image/" ? "image" : "video"} file is required.`);
  }

  if (!file.type.startsWith(fileTypePrefix)) {
    throw new Error(invalidTypeMessage);
  }

  const storage = getStorage(app);
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(snapshot.ref);
};

export const uploadProductImage = async (file: File, productId: string) => {
  const normalizedProductId = normalizeStoragePathSegment(productId, "product");

  if (!normalizedProductId) {
    throw new Error("Product ID is required for image upload.");
  }

  const uploadId = createUploadId();
  const normalizedFileName = normalizeStorageFileName(file.name);
  const storagePath =
    `${STORAGE_PRODUCT_IMAGES_ROOT}/${normalizedProductId}/images/` +
    `${uploadId}-${normalizedFileName}`;

  return uploadStorageAsset({
    file,
    storagePath,
    fileTypePrefix: "image/",
    invalidTypeMessage: "Only image files can be uploaded.",
  });
};

export const uploadProductVideo = async (file: File, productId: string) => {
  const normalizedProductId = normalizeStoragePathSegment(productId, "product");

  if (!normalizedProductId) {
    throw new Error("Product ID is required for video upload.");
  }

  const uploadId = createUploadId();
  const normalizedFileName = normalizeStorageFileName(file.name).replace(/^image$/, "video");
  const storagePath =
    `${STORAGE_PRODUCT_IMAGES_ROOT}/${normalizedProductId}/videos/` +
    `${uploadId}-${normalizedFileName}`;

  return uploadStorageAsset({
    file,
    storagePath,
    fileTypePrefix: "video/",
    invalidTypeMessage: "Only video files can be uploaded.",
  });
};

export const uploadHomepageHeroImage = async (
  file: File,
  section: HeroSection,
  slideId?: string
) => {
  const normalizedSection = normalizeStoragePathSegment(section, "hero");
  const normalizedSlideId = normalizeStoragePathSegment(slideId ?? "draft-slide", "draft-slide");
  const uploadId = createUploadId();
  const normalizedFileName = normalizeStorageFileName(file.name);
  const storagePath =
    `${STORAGE_SITE_MEDIA_ROOT}/homepage/hero-slides/${normalizedSection}/` +
    `${normalizedSlideId}/${uploadId}-${normalizedFileName}`;

  return uploadStorageAsset({
    file,
    storagePath,
    fileTypePrefix: "image/",
    invalidTypeMessage: "Only image files can be uploaded for hero slides.",
  });
};

export const uploadHomepageCategoryImage = async (
  file: File,
  section: HeroSection
) => {
  const normalizedSection = normalizeStoragePathSegment(section, "category");
  const uploadId = createUploadId();
  const normalizedFileName = normalizeStorageFileName(file.name);
  const storagePath =
    `${STORAGE_SITE_MEDIA_ROOT}/homepage/category-cards/${normalizedSection}/` +
    `${uploadId}-${normalizedFileName}`;

  return uploadStorageAsset({
    file,
    storagePath,
    fileTypePrefix: "image/",
    invalidTypeMessage: "Only image files can be uploaded for category cards.",
  });
};
