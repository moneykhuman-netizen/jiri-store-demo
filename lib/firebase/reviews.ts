"use client";

import type { ProductReview, ProductReviewSubmission } from "@/lib/reviews";
import {
  createProductReviewSlug,
  isApprovedReview,
  normalizeReviewRating,
  normalizeReviewerName,
  normalizeReviewStatus,
  normalizeReviewText,
  sortReviewsByNewest,
} from "@/lib/reviews";

const REVIEWS_COLLECTION = "reviews";

const getTimestampMillis = (value: unknown) => {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return null;
};

const mapReviewDocument = (reviewId: string, value: unknown): ProductReview | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawReview = value as Record<string, unknown>;
  const productId =
    typeof rawReview.productId === "string" ? rawReview.productId.trim() : "";
  const productName =
    typeof rawReview.productName === "string" ? rawReview.productName.trim() : "";
  const reviewerName = normalizeReviewerName(rawReview.name);
  const reviewText = normalizeReviewText(rawReview.review);
  const rating = normalizeReviewRating(rawReview.rating);

  if (!productId || !productName || !reviewerName || !reviewText || rating < 1) {
    return null;
  }

  const status = normalizeReviewStatus(rawReview.status);
  const approved =
    typeof rawReview.approved === "boolean"
      ? rawReview.approved
      : status === "approved";
  const productSlug =
    typeof rawReview.productSlug === "string" && rawReview.productSlug.trim()
      ? rawReview.productSlug.trim()
      : createProductReviewSlug(productName);

  return {
    id: reviewId,
    productId,
    productSlug,
    productName,
    name: reviewerName,
    rating,
    review: reviewText,
    status,
    approved,
    createdAt: getTimestampMillis(rawReview.createdAt),
    approvedAt: getTimestampMillis(rawReview.approvedAt),
  };
};

const normalizeReviewSubmission = (review: ProductReviewSubmission) => {
  const productId = review.productId.trim();
  const productName = review.productName.trim();
  const name = normalizeReviewerName(review.name);
  const rating = normalizeReviewRating(review.rating);
  const reviewText = normalizeReviewText(review.review);
  const productSlug = review.productSlug.trim() || createProductReviewSlug(productName);

  if (!productId || !productName || !name || !reviewText || rating < 1) {
    throw new Error("Invalid review submission");
  }

  return {
    productId,
    productSlug,
    productName,
    name,
    rating,
    review: reviewText,
  };
};

export const submitProductReview = async (review: ProductReviewSubmission) => {
  const normalizedReview = normalizeReviewSubmission(review);
  const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);

  await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...normalizedReview,
    status: "pending",
    approved: false,
    createdAt: serverTimestamp(),
    approvedAt: null,
  });
};

export const subscribeApprovedReviewsForProduct = (
  productId: string,
  callback: (reviews: ProductReview[]) => void,
  onError?: (error: Error) => void
) => {
  let didUnsubscribe = false;
  let unsubscribe: (() => void) | undefined;

  void Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ])
    .then(([{ collection, onSnapshot, query, where }, { db }]) => {
      if (didUnsubscribe) {
        return;
      }

      const approvedReviewsQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where("productId", "==", productId),
        where("approved", "==", true)
      );

      unsubscribe = onSnapshot(
        approvedReviewsQuery,
        (snapshot) => {
          const approvedReviews = snapshot.docs
            .map((document) => mapReviewDocument(document.id, document.data()))
            .filter((review): review is ProductReview => Boolean(review))
            .filter(isApprovedReview)
            .sort(sortReviewsByNewest);

          callback(approvedReviews);
        },
        (error) => {
          console.error("Failed to subscribe to approved product reviews:", error);
          onError?.(error);
        }
      );
    })
    .catch((error) => {
      console.error("Failed to initialize approved reviews subscription:", error);
      onError?.(error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};

export const subscribeAllReviews = (
  callback: (reviews: ProductReview[]) => void,
  onError?: (error: Error) => void
) => {
  let didUnsubscribe = false;
  let unsubscribe: (() => void) | undefined;

  void Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ])
    .then(([{ collection, onSnapshot, orderBy, query }, { db }]) => {
      if (didUnsubscribe) {
        return;
      }

      const reviewsQuery = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy("createdAt", "desc")
      );

      unsubscribe = onSnapshot(
        reviewsQuery,
        (snapshot) => {
          const reviews = snapshot.docs
            .map((document) => mapReviewDocument(document.id, document.data()))
            .filter((review): review is ProductReview => Boolean(review))
            .sort(sortReviewsByNewest);

          callback(reviews);
        },
        (error) => {
          console.error("Failed to subscribe to all reviews:", error);
          onError?.(error);
        }
      );
    })
    .catch((error) => {
      console.error("Failed to initialize reviews subscription:", error);
      onError?.(error);
    });

  return () => {
    didUnsubscribe = true;
    unsubscribe?.();
  };
};

export const approveReview = async (reviewId: string) => {
  const [{ doc, serverTimestamp, updateDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);

  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    approved: true,
    status: "approved",
    approvedAt: serverTimestamp(),
  });
};

export const rejectReview = async (reviewId: string) => {
  const [{ doc, updateDoc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);

  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    approved: false,
    status: "rejected",
    approvedAt: null,
  });
};

export const deleteReview = async (reviewId: string) => {
  const [{ deleteDoc, doc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/client"),
  ]);

  await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
};
