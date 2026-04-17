"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSectionSkeleton } from "@/components/homepage-section-skeletons";
import { HERO_BUTTON_LINKS, useAdminStore } from "@/lib/admin-store";
import { subscribeHeroSlidesFromFirebase } from "@/lib/firebase/hero";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const HERO_REMOTE_TIMEOUT_MS = 4000;

export function HeroSection() {
  const slides = useAdminStore((s) => s.heroSlides);
  const setHeroSlidesFromRemote = useAdminStore((s) => s.setHeroSlidesFromRemote);
  const [current, setCurrent] = useState(0);
  const [isRemoteResolved, setIsRemoteResolved] = useState(false);
  const [hasRemoteSlides, setHasRemoteSlides] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("[Hero Firebase][storefront] HeroSection subscription effect started");

    const unsubscribe = subscribeHeroSlidesFromFirebase((remoteSlides) => {
      const currentLocalSlidesLength = useAdminStore.getState().heroSlides.length;

      if (remoteSlides === undefined) {
        console.log(
          "[Hero Firebase][storefront] Received undefined remote heroSlides, suppressing storefront hero until live content is available",
          { currentLocalSlidesLength }
        );
        setHasRemoteSlides(false);
        setIsRemoteResolved(true);
        return;
      }

      console.log("[Hero Firebase][storefront] Applying remote heroSlides", {
        currentLocalSlidesLength,
        remoteHeroSlidesLength: remoteSlides.length,
      });

      setHeroSlidesFromRemote(remoteSlides);
      setHasRemoteSlides(true);
      setIsRemoteResolved(true);
    });

    return unsubscribe;
  }, [setHeroSlidesFromRemote]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsRemoteResolved(true);
    }, HERO_REMOTE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // autoplay every 5s
  useEffect(() => {
    if (slides.length > 1) {
      timeout.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => {
        if (timeout.current) clearTimeout(timeout.current);
      };
    }
  }, [current, slides.length]);

  // if the current index is out of range (slides removed), reset to 0
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  const goTo = (index: number) => {
    setCurrent(index);
  };
  const prev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const next = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  if (!isRemoteResolved) return <HeroSectionSkeleton />;

  if (!hasRemoteSlides || slides.length === 0) return null;

  const activeIndex = current >= slides.length ? 0 : current;
  const slide = slides[activeIndex];
  const imageSrc = typeof slide.image === "string" ? slide.image.trim() : "";
  const hasImage = imageSrc.length > 0;

  return (
    <section className="relative mt-3 h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-secondary">
      {/* background */}
      <div className="absolute inset-0">
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={slide.title}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
      </div>

      {/* content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-xl">
          <p className="text-accent font-medium text-sm md:text-base uppercase tracking-widest mb-2 md:mb-4">
            {slide.badge}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-card mb-3 md:mb-6 text-balance">
            {slide.title}
          </h2>
          <p className="text-card/80 text-sm md:text-lg mb-6 md:mb-8 max-w-md leading-relaxed">
            {slide.description}
          </p>
          <Link href={HERO_BUTTON_LINKS[slide.section]}>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {slide.buttonText}
            </Button>
          </Link>
        </div>
      </div>

      {/* controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${idx === activeIndex ? "bg-accent" : "bg-white/60"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
