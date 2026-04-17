"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CategorySectionSkeleton } from "@/components/homepage-section-skeletons";
import {
  CATEGORY_CARD_LINKS,
  HeroSection,
  useAdminStore,
} from "@/lib/admin-store";
import { subscribeHomepageCategoriesFromFirebase } from "@/lib/firebase/categories";

const CATEGORIES_REMOTE_TIMEOUT_MS = 4000;

export function CategoriesSection() {
  const homepageCategories = useAdminStore((s) => s.homepageCategories);
  const setHomepageCategoriesFromRemote = useAdminStore(
    (s) => s.setHomepageCategoriesFromRemote
  );
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);
  const [hasRemoteCategories, setHasRemoteCategories] = useState(false);
  const categories = (["men", "women"] as HeroSection[]).map(
    (section) => homepageCategories[section]
  );

  useEffect(() => {
    const unsubscribe = subscribeHomepageCategoriesFromFirebase((remoteCategories) => {
      if (remoteCategories) {
        setHomepageCategoriesFromRemote(remoteCategories);
        setHasRemoteCategories(true);
      } else {
        setHasRemoteCategories(false);
      }

      setIsRemoteResolved(true);
    });

    return unsubscribe;
  }, [setHomepageCategoriesFromRemote]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsRemoteResolved(true);
    }, CATEGORIES_REMOTE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isRemoteResolved) {
    return <CategorySectionSkeleton />;
  }

  if (!hasRemoteCategories) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-3">
            Shop By Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of premium footwear for every occasion
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((category) => {
            const imageSrc =
              typeof category.image === "string" ? category.image.trim() : "";
            const hasImage = imageSrc.length > 0;

            return (
              <Link
                key={category.section}
                href={CATEGORY_CARD_LINKS[category.section]}
                className="group relative overflow-hidden rounded-xl aspect-[16/10] md:aspect-[16/9] shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Background Image */}
                {hasImage ? (
                  <Image
                    src={imageSrc}
                    alt={category.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  {category.label ? (
                    <span className="text-accent text-sm font-medium mb-2">
                      {category.label}
                    </span>
                  ) : null}
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-card mb-2">
                    {category.title}
                  </h3>
                  <p className="text-card/80 text-sm md:text-base mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-card font-medium group-hover:gap-3 transition-all duration-200">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
