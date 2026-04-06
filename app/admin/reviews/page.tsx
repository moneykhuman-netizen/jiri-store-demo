"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  approveReview,
  deleteReview,
  rejectReview,
  subscribeAllReviews,
} from "@/lib/firebase/reviews";
import { formatReviewDate, type ProductReview, type ReviewStatus } from "@/lib/reviews";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ExternalLink,
  MessageSquareText,
  Star,
  ThumbsDown,
  Trash2,
} from "lucide-react";

type ReviewFilter = "all" | ReviewStatus;
type ReviewAction = "approve" | "reject" | "delete" | null;

const REVIEW_FILTER_LABELS: Record<ReviewFilter, string> = {
  all: "All Reviews",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const REVIEW_FILTERS: ReviewFilter[] = ["all", "pending", "approved", "rejected"];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

const getReviewStatusBadgeClassName = (status: ReviewStatus) => {
  if (status === "approved") {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700 hover:bg-rose-100";
  }

  return "bg-amber-100 text-amber-700 hover:bg-amber-100";
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ReviewAction>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    const unsubscribe = subscribeAllReviews(
      (nextReviews) => {
        setReviews(nextReviews);
        setIsLoading(false);
      },
      () => {
        setReviews([]);
        setIsLoading(false);
        setLoadError("Reviews couldn't be loaded right now.");
      }
    );

    return unsubscribe;
  }, []);

  const reviewCounts = useMemo(
    () =>
      reviews.reduce<Record<ReviewFilter, number>>(
        (counts, review) => {
          counts.all += 1;
          counts[review.status] += 1;
          return counts;
        },
        {
          all: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      ),
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    if (activeFilter === "all") {
      return reviews;
    }

    return reviews.filter((review) => review.status === activeFilter);
  }, [activeFilter, reviews]);

  const runReviewAction = async (
    reviewId: string,
    action: Exclude<ReviewAction, null>,
    operation: () => Promise<void>
  ) => {
    setActionError(null);
    setActiveReviewId(reviewId);
    setActiveAction(action);

    try {
      await operation();
    } catch (error) {
      console.error(`Failed to ${action} review:`, error);
      setActionError("We couldn't update that review right now. Please try again.");
    } finally {
      setActiveReviewId(null);
      setActiveAction(null);
    }
  };

  const handleApprove = (reviewId: string) =>
    runReviewAction(reviewId, "approve", () => approveReview(reviewId));

  const handleReject = (reviewId: string) =>
    runReviewAction(reviewId, "reject", () => rejectReview(reviewId));

  const confirmDelete = async () => {
    if (!reviewToDelete) {
      return;
    }

    const reviewId = reviewToDelete.id;
    setReviewToDelete(null);
    await runReviewAction(reviewId, "delete", () => deleteReview(reviewId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Review Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Approve, reject, or delete product reviews before they appear on the storefront.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {REVIEW_FILTERS.map((filter) => (
          <Card key={filter} className={activeFilter === filter ? "border-primary/30" : ""}>
            <CardContent className="p-5">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setActiveFilter(filter)}
              >
                <p className="text-sm text-muted-foreground">{REVIEW_FILTER_LABELS[filter]}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {reviewCounts[filter]}
                </p>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {REVIEW_FILTERS.map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={activeFilter === filter ? "default" : "outline"}
            onClick={() => setActiveFilter(filter)}
          >
            {REVIEW_FILTER_LABELS[filter]} ({reviewCounts[filter]})
          </Button>
        ))}
      </div>

      {actionError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-80 items-center justify-center text-muted-foreground">
          <Spinner className="mr-3 h-5 w-5" />
          Loading reviews...
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-8 text-sm text-destructive">
          {loadError}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Reviews In This Filter</CardTitle>
            <CardDescription>
              Reviews will appear here as customers submit them.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isMutating = activeReviewId === review.id;

            return (
              <Card key={review.id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getReviewStatusBadgeClassName(review.status)}>
                          {review.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Submitted {formatReviewDate(review.createdAt)}
                        </span>
                        {review.status === "approved" && review.approvedAt && (
                          <span className="text-sm text-muted-foreground">
                            Approved {formatReviewDate(review.approvedAt)}
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {review.productName}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            Product ID:{" "}
                            <span className="font-mono text-foreground">{review.productId}</span>
                          </span>
                          <Link
                            href={`/product/${review.productId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            Open Product
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{review.name}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <RatingStars rating={review.rating} />
                              <span className="text-sm font-medium text-foreground">
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 whitespace-pre-line text-muted-foreground">
                          {review.review}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:w-52 xl:flex-col">
                      {review.status !== "approved" && (
                        <Button
                          type="button"
                          className="gap-2"
                          onClick={() => handleApprove(review.id)}
                          disabled={isMutating}
                        >
                          {isMutating && activeAction === "approve" ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      )}

                      {review.status !== "rejected" && (
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleReject(review.id)}
                          disabled={isMutating}
                        >
                          {isMutating && activeAction === "reject" ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <ThumbsDown className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="destructive"
                        className="gap-2"
                        onClick={() => setReviewToDelete(review)}
                        disabled={isMutating}
                      >
                        {isMutating && activeAction === "delete" ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={Boolean(reviewToDelete)}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the review from {reviewToDelete?.productName ?? "this product"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Review</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
