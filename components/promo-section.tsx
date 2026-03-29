"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Across India & select global locations",
  },
  {
    icon: Shield,
    title: "Genuine Products",
    description: "Guaranteed authentic brands",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day easy returns",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "WhatsApp support anytime",
  },
];

export function PromoSection() {
  const promo = useAdminStore((s) => s.promoBanner);
  return (
    <section className="bg-background">
      {/* Features Bar */}
      <div className="border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:py-10">
            {features.map((feature) => (
              <div key={feature.title} className="flex w-full items-start gap-3">
                <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-tight text-gray-500">
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
        <div className="promo-banner relative overflow-hidden rounded-2xl bg-primary p-8 text-center md:p-12 lg:p-16">
          <div className="promo-sheen pointer-events-none absolute inset-0 opacity-70" />
          <div className="promo-depth pointer-events-none absolute inset-0 opacity-75" />
          <div className="promo-vignette pointer-events-none absolute inset-0" />
          <div className="promo-streak pointer-events-none absolute inset-y-[-24%] -left-1/3 w-1/2 opacity-25" />
          <div className="promo-orb promo-orb-left pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="promo-orb promo-orb-right pointer-events-none absolute -right-12 bottom-6 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl" />

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground/5" />
          <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-primary-foreground/5" />

          <div className="promo-copy relative z-10">
            <p className="promo-copy-item mb-4 text-sm uppercase tracking-widest text-primary-foreground/80">
              {promo.badge}
            </p>
            <h2 className="promo-copy-item promo-heading mb-2.5 font-serif text-3xl font-bold tracking-[0.015em] text-primary-foreground md:text-4xl lg:text-5xl">
              {promo.title}
            </h2>
            <p className="promo-copy-item promo-description mx-auto mb-8 max-w-xl text-lg text-primary-foreground/88">
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
            <Link href="/products" className="promo-copy-item inline-flex">
              <Button
                size="lg"
                className="promo-cta border border-white/10 px-8 font-semibold text-accent-foreground"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .promo-banner {
          isolation: isolate;
        }

        .promo-sheen {
          background:
            radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.12), transparent 42%),
            radial-gradient(circle at 82% 78%, rgba(255, 255, 255, 0.08), transparent 38%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.03), transparent 42%, rgba(255, 255, 255, 0.06));
          animation: promo-ambient 18s ease-in-out infinite alternate;
        }

        .promo-depth {
          background:
            radial-gradient(circle at 50% 34%, rgba(255, 255, 255, 0.1), transparent 34%),
            radial-gradient(circle at 42% 62%, rgba(255, 255, 255, 0.06), transparent 42%),
            radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.04), transparent 52%);
          animation: promo-depth-drift 28s ease-in-out infinite alternate;
        }

        .promo-vignette {
          background:
            radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.03) 0%, transparent 28%),
            radial-gradient(circle at 50% 42%, rgba(0, 0, 0, 0.02) 24%, rgba(0, 0, 0, 0.16) 100%);
          opacity: 1;
        }

        .promo-streak {
          background: linear-gradient(
            104deg,
            transparent 0%,
            rgba(255, 255, 255, 0.02) 30%,
            rgba(255, 255, 255, 0.1) 48%,
            rgba(255, 255, 255, 0.04) 62%,
            transparent 100%
          );
          filter: blur(12px);
          transform: skewX(-14deg);
          animation: promo-streak-sweep 24s ease-in-out infinite;
        }

        .promo-orb {
          animation: promo-float 16s ease-in-out infinite;
        }

        .promo-orb-right {
          animation-delay: -8s;
        }

        .promo-heading {
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.08),
            0 0 18px rgba(255, 255, 255, 0.04),
            0 12px 28px rgba(0, 0, 0, 0.22);
        }

        .promo-description {
          text-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
        }

        .promo-copy-item {
          opacity: 0;
          animation: promo-fade-up 0.8s ease forwards;
        }

        .promo-cta {
          background-color: hsl(var(--accent));
          background-image:
            linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 38%, rgba(0, 0, 0, 0.12) 100%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 58%);
          box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.2),
            0 0 22px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
          transition:
            transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 480ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 480ms cubic-bezier(0.22, 1, 0.36, 1),
            background-position 560ms ease;
          will-change: transform, box-shadow;
          background-size: 170% 170%;
          background-position: 0% 50%;
          transform: translateZ(0);
        }

        .promo-cta:hover {
          transform: translateY(-3px) scale(1.03);
          filter: brightness(1.06);
          background-position: 100% 50%;
          box-shadow:
            0 22px 42px rgba(0, 0, 0, 0.28),
            0 0 28px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        .promo-copy-item:nth-child(1) {
          animation-delay: 0.08s;
        }

        .promo-copy-item:nth-child(2) {
          animation-delay: 0.16s;
        }

        .promo-copy-item:nth-child(3) {
          animation-delay: 0.24s;
        }

        .promo-copy-item:nth-child(4) {
          animation-delay: 0.32s;
        }

        @keyframes promo-ambient {
          0% {
            transform: translate3d(-1%, 0, 0) scale(1);
            opacity: 0.52;
          }

          50% {
            transform: translate3d(1%, -1.5%, 0) scale(1.04);
            opacity: 0.7;
          }

          100% {
            transform: translate3d(2%, 1%, 0) scale(1.08);
            opacity: 0.58;
          }
        }

        @keyframes promo-depth-drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-1.5%, 1.5%, 0) scale(1.03);
          }

          100% {
            transform: translate3d(1%, -1%, 0) scale(1.05);
          }
        }

        @keyframes promo-streak-sweep {
          0% {
            transform: translate3d(-12%, 0, 0) skewX(-14deg);
            opacity: 0.12;
          }

          50% {
            transform: translate3d(10%, 0, 0) skewX(-14deg);
            opacity: 0.26;
          }

          100% {
            transform: translate3d(22%, 0, 0) skewX(-14deg);
            opacity: 0.14;
          }
        }

        @keyframes promo-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(10px, -12px, 0) scale(1.05);
          }
        }

        @keyframes promo-fade-up {
          from {
            opacity: 0;
            transform: translate3d(0, 14px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-sheen,
          .promo-depth,
          .promo-streak,
          .promo-orb,
          .promo-copy-item {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
