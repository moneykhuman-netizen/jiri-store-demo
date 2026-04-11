"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { normalizeSocialLinks, useAdminStore } from "@/lib/admin-store";

type FooterSocialLink = {
  type: "facebook" | "instagram" | "whatsapp" | "youtube" | "telegram";
  href: string;
  label: string;
  icon: ReactNode;
};

const brandWordClassName = "text-[17px] font-sans font-semibold tracking-tight";
const socialIconButtonClassName =
  "flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20";

const normalizeSocialValue = (value: string) => value.trim();

const formatWhatsAppHref = (value: string) => {
  const normalizedValue = normalizeSocialValue(value);

  if (!normalizedValue) {
    return "";
  }

  if (/^[+\d\s()-]+$/.test(normalizedValue)) {
    const digitsOnly = normalizedValue.replace(/\D/g, "");
    return digitsOnly ? `https://wa.me/${digitsOnly}` : "";
  }

  return normalizedValue;
};

export function Footer() {
  const social = useAdminStore((s) => s.socialLinks);
  const storePhoneNumber = "918485957694";
  const normalizedSocial = normalizeSocialLinks(social);
  const facebook = normalizeSocialValue(normalizedSocial.facebook);
  const instagram = normalizeSocialValue(normalizedSocial.instagram);
  const whatsapp = formatWhatsAppHref(normalizedSocial.whatsapp);
  const youtube = normalizeSocialValue(normalizedSocial.youtube);
  const telegram = normalizeSocialValue(normalizedSocial.telegram);
  const socialLinks: FooterSocialLink[] = [];

  if (facebook) {
    socialLinks.push({
      type: "facebook",
      href: facebook,
      label: "Facebook",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    });
  }

  if (instagram) {
    socialLinks.push({
      type: "instagram",
      href: instagram,
      label: "Instagram",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    });
  }

  if (whatsapp) {
    socialLinks.push({
      type: "whatsapp",
      href: whatsapp,
      label: "WhatsApp",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    });
  }

  if (youtube) {
    socialLinks.push({
      type: "youtube",
      href: youtube,
      label: "YouTube",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.01 3.01 0 00-2.12-2.13C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.378.51a3.01 3.01 0 00-2.12 2.13C0 8.067 0 12 0 12s0 3.933.502 5.814a3.01 3.01 0 002.12 2.13c1.873.511 9.378.511 9.378.511s7.505 0 9.378-.51a3.01 3.01 0 002.12-2.13C24 15.933 24 12 24 12s0-3.933-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" />
        </svg>
      ),
    });
  }

  if (telegram) {
    socialLinks.push({
      type: "telegram",
      href: telegram,
      label: "Telegram",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.036 15.569l-.37 5.204c.53 0 .759-.228 1.034-.502l2.48-2.372 5.139 3.762c.942.52 1.607.246 1.861-.868l3.373-15.813.001-.001c.3-1.4-.506-1.948-1.423-1.607L1.305 11.02c-1.353.52-1.333 1.274-.23 1.615l5.071 1.58L17.921 6.84c.554-.366 1.058-.164.643.202" />
        </svg>
      ),
    });
  }
  const defaultWhatsAppHref = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(
    "Hi Pickup Jiristore! I have a query."
  )}`;
  const exchangePolicyWhatsAppHref = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(
    "Hi Pickup Jiristore! I have a question about your exchange policy."
  )}`;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 items-start gap-y-8 md:grid-cols-2 md:gap-y-10 lg:grid-cols-[1.02fr_0.98fr_0.98fr_1fr] lg:gap-x-8 lg:gap-y-8">
          {/* Brand */}
          <div className="pt-0.5 lg:pr-4">
            <div className="mb-3.5 inline-flex max-w-full items-baseline gap-1.5 whitespace-nowrap leading-none">
              <span className={`${brandWordClassName} text-primary-foreground/60`}>
                Pickup
              </span>
              <span className={brandWordClassName}>
                Jiristore
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-primary-foreground/78">
              Your trusted destination for premium footwear. We bring you the finest collection of shoes from top brands at unbeatable prices.
            </p>
            {socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.type}
                    href={link.href}
                    className={socialIconButtonClassName}
                    aria-label={link.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            ) : null}
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
                <Link href="/products?newArrivals=true" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
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
                <a
                  href={exchangePolicyWhatsAppHref}
                  className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Exchange Policy
                </a>
              </li>
              <li>
                <Link href="/size-guide" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#footer-contact" className="text-sm leading-6 text-primary-foreground/76 transition-opacity hover:opacity-100">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Store Info */}
          <div id="footer-contact" className="flex scroll-mt-24 flex-col items-start">
            <h3 className="mb-4 text-[17px] font-semibold tracking-tight">Store Location</h3>
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
                  href="tel:+918485957694" 
                  className="text-sm leading-6 text-primary-foreground/78 transition-opacity hover:opacity-100"
                >
                  +91 8485957694
                </a>
              </li>
              <li className="flex items-center gap-3.5">
                <Clock className="h-5 w-5 shrink-0 text-primary-foreground/72" />
                <span className="text-sm leading-6 text-primary-foreground/78">24/7</span>
              </li>
            </ul>
            {/* WhatsApp CTA */}
            <a
              href={defaultWhatsAppHref}
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
            &copy; {new Date().getFullYear()} <span className="whitespace-nowrap">Pickup Jiristore</span>. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:justify-end">
            <Link href="/privacy-policy" className="text-sm text-primary-foreground/60 transition-opacity hover:opacity-100">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-primary-foreground/60 transition-opacity hover:opacity-100">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
