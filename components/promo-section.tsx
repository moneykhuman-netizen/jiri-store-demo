"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above Rs 2,999",
  },
  {
    icon: Shield,
    title: "Genuine Products",
    description: "100% authentic brands",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "WhatsApp & call support",
  },
];

export function PromoSection() {
  const promo = useAdminStore((s) => s.promoBanner);
  return (
    <section className="bg-background">
      {/* Features Bar */}
      <div className="border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 md:py-10">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="bg-primary rounded-2xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-sm uppercase tracking-widest mb-4">
              {promo.badge}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-4">
              {promo.title}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              {promo.description.split(promo.code).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="font-bold text-primary-foreground">{promo.code}</span>
                  </span>
                ) : (
                  part
                )
              )}
            </p>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
