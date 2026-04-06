export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface ProductReview {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  name: string;
  rating: number;
  review: string;
  status: ReviewStatus;
  approved: boolean;
  createdAt: number | null;
  approvedAt: number | null;
}

export interface ProductReviewSubmission {
  productId: string;
  productSlug: string;
  productName: string;
  name: string;
  rating: number;
  review: string;
}

export const createProductReviewSlug = (productName: string) =>
  productName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeReviewStatus = (value: unknown): ReviewStatus => {
  if (typeof value !== "string") {
    return "pending";
  }

  return REVIEW_STATUSES.includes(value as ReviewStatus)
    ? (value as ReviewStatus)
    : "pending";
};

export const normalizeReviewRating = (value: unknown) => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(5, Math.max(1, Math.round(numericValue)));
};

export const normalizeReviewerName = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const normalizeReviewText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const isApprovedReview = (review: ProductReview) =>
  review.approved && review.status === "approved";

export const sortReviewsByNewest = (left: ProductReview, right: ProductReview) =>
  (right.createdAt ?? 0) - (left.createdAt ?? 0);

export const calculateAverageRating = (reviews: ProductReview[]) => {
  if (reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / reviews.length) * 10) / 10;
};

export const formatReviewDate = (timestamp: number | null) => {
  if (!timestamp) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp);
};
