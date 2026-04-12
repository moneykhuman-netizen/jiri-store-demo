"use client";

import { Skeleton } from "@/components/ui/skeleton";

const PRODUCT_CARD_SKELETON_COUNT = 4;
const BRAND_CARD_SKELETON_COUNT = 6;
const CATEGORY_CARD_SKELETON_COUNT = 2;

export function HeroSectionSkeleton() {
  return (
    <section className="relative mt-3 h-[50vh] overflow-hidden bg-secondary md:h-[70vh] lg:h-[80vh]">
      <div className="absolute inset-0 bg-muted/20" />
      <div className="relative container mx-auto flex h-full items-center px-4">
        <div className="w-full max-w-xl space-y-4 md:space-y-6">
          <Skeleton className="h-4 w-36 bg-white/20" />
          <Skeleton className="h-10 w-full max-w-lg bg-white/20 md:h-12" />
          <Skeleton className="h-10 w-4/5 bg-white/15 md:h-12" />
          <Skeleton className="h-4 w-full max-w-md bg-white/15" />
          <Skeleton className="h-4 w-11/12 max-w-sm bg-white/15" />
          <Skeleton className="h-12 w-40 bg-white/20" />
        </div>
      </div>
    </section>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-center gap-3 md:mb-14">
          <Skeleton className="h-8 w-64 md:h-10" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {Array.from({ length: CATEGORY_CARD_SKELETON_COUNT }).map((_, index) => (
            <div
              key={index}
              className="relative aspect-[16/10] overflow-hidden rounded-xl md:aspect-[16/9]"
            >
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 md:p-8">
                <Skeleton className="h-4 w-24 bg-white/35" />
                <Skeleton className="h-8 w-2/3 bg-white/40" />
                <Skeleton className="h-4 w-3/4 bg-white/30" />
                <Skeleton className="h-4 w-32 bg-white/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandsSectionSkeleton() {
  return (
    <section className="bg-card py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-12">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-52 md:h-10" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: BRAND_CARD_SKELETON_COUNT }).map((_, index) => (
            <Skeleton key={index} className="h-[110px] rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CollectionSectionSkeleton({
  backgroundClassName,
}: {
  backgroundClassName: string;
}) {
  return (
    <section className={`${backgroundClassName} py-12 md:py-16 lg:py-20`}>
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56 md:h-10" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: PRODUCT_CARD_SKELETON_COUNT }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromoBannerSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 lg:p-16">
        <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-10 w-full max-w-xl bg-white/20 md:h-12" />
          <Skeleton className="h-10 w-4/5 max-w-2xl bg-white/15 md:h-12" />
          <Skeleton className="h-4 w-full max-w-xl bg-white/15" />
          <Skeleton className="h-12 w-40 bg-white/20" />
        </div>
      </div>
    </div>
  );
}
