"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "New Season Collection",
    subtitle: "Step Into Style",
    description: "Discover the latest trends in footwear. Premium comfort meets modern design.",
    cta: "Shop Now",
    href: "/products",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&q=80",
    align: "left" as const,
  },
  {
    id: 2,
    title: "Men's Exclusive",
    subtitle: "Crafted For Comfort",
    description: "From casual sneakers to formal elegance. Find your perfect pair.",
    cta: "Shop Men",
    href: "/products?category=men",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1600&q=80",
    align: "right" as const,
  },
  {
    id: 3,
    title: "Women's Collection",
    subtitle: "Elegance Redefined",
    description: "Heels, flats, sneakers and more. Style that speaks volumes.",
    cta: "Shop Women",
    href: "/products?category=women",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80",
    align: "left" as const,
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-secondary">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div
              className={`max-w-xl ${
                slide.align === "right" ? "ml-auto text-right" : ""
              }`}
            >
              <p className="text-accent font-medium text-sm md:text-base uppercase tracking-widest mb-2 md:mb-4">
                {slide.subtitle}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-card mb-3 md:mb-6 text-balance">
                {slide.title}
              </h2>
              <p className="text-card/80 text-sm md:text-lg mb-6 md:mb-8 max-w-md leading-relaxed">
                {slide.description}
              </p>
              <Link href={slide.href}>
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
                >
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-card hover:bg-card/40 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-card hover:bg-card/40 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? "bg-card w-8"
                : "bg-card/50 hover:bg-card/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
