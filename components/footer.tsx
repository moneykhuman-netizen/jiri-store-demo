"use client";
import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export function Footer() {
  const social = useAdminStore((s) => s.socialLinks);
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 items-start gap-y-8 md:grid-cols-2 md:gap-y-10 lg:grid-cols-[1.02fr_0.98fr_0.98fr_1fr] lg:gap-x-8 lg:gap-y-8">
          {/* Brand */}
          <div className="pt-0.5 lg:pr-4">
            <div className="mb-3.5 flex flex-col items-start gap-0 leading-none">
              <span className="text-[11px] font-medium tracking-[0.18em] text-primary-foreground/60 sm:text-xs">
                Pickup
              </span>
              <span className="text-[17px] font-sans font-semibold tracking-tight">
                Jiristore
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-primary-foreground/78">
              Your trusted destination for premium footwear. We bring you the finest collection of shoes from top brands at unbeatable prices.
            </p>
            <div className="mt-5 flex gap-4">
              {social.facebook ? (
                <a
                  href={social.facebook}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              ) : null}
              {social.instagram ? (
                <a
                  href={social.instagram}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              ) : null}
              {social.whatsapp ? (
                <a
                  href={social.whatsapp}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              ) : null}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:pr-2">
            <h3 className="mb-4 text-[17px] font-semibold tracking-tight">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products?category=men" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Women&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Sale Items
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Featured Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:pr-2">
            <h3 className="mb-4 text-[17px] font-semibold tracking-tight">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Exchange Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Store Info */}
          <div className="flex flex-col items-start">
            <h3 className="mb-4 text-[17px] font-semibold tracking-tight">Visit Our Store</h3>
            <ul className="space-y-[18px]">
              <li className="flex items-start gap-3.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/72" />
                <span className="text-sm leading-6 text-primary-foreground/78">
                  Babupura, Jiribam, Manipur - 795116<br />
                  Near Railway Station
                </span>
              </li>
              <li className="flex items-center gap-3.5">
                <Phone className="h-5 w-5 shrink-0 text-primary-foreground/72" />
                <a 
                  href="tel:+919863146558" 
                  className="text-sm leading-6 text-primary-foreground/78 transition-opacity hover:opacity-100"
                >
                  +91 9863146558
                </a>
              </li>
              <li className="flex items-center gap-3.5">
                <Clock className="h-5 w-5 shrink-0 text-primary-foreground/72" />
                <span className="text-sm leading-6 text-primary-foreground/78">24/7</span>
              </li>
            </ul>
            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919863146558?text=Hi%20Pickup%20Jiristore!%20I%20have%20a%20query."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[22px] inline-flex items-center gap-2 self-start rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat with Us
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-primary-foreground/20 pt-7 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Pickup Jiristore. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:justify-end">
            <a href="#" className="text-sm text-primary-foreground/60 transition-opacity hover:opacity-100">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-primary-foreground/60 transition-opacity hover:opacity-100">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
