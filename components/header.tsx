"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, ChevronDown, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const announcementMessage =
    "Free Delivery Across India \u2022 COD Available \u2022 T&C apply";

  const menTypes = useAdminStore((state) => state.categories.men);
  const womenTypes = useAdminStore((state) => state.categories.women);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top Banner */}
      <div className="announcement-bar group relative overflow-hidden py-2 text-center text-sm font-medium text-white">
        <div className="announcement-glow pointer-events-none absolute inset-0" />
        <div className="announcement-vignette pointer-events-none absolute inset-0" />

        <div className="relative z-10 overflow-hidden">
          <div className="announcement-track flex w-max items-center whitespace-nowrap">
            {Array.from({ length: 6 }, (_, blockIndex) => (
              <span
                key={blockIndex}
                aria-hidden={blockIndex > 0}
                className="announcement-block inline-flex shrink-0 items-center px-8 pr-20 md:px-10 md:pr-24"
              >
                {announcementMessage}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-1">
        <div className="flex items-center justify-between h-[72px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 -ml-4 relative top-[2px]">
  <div className="flex flex-col items-start justify-center">
    <Image
      src="/logo.png"
      alt="Pickup Jiristore"
      width={180}
      height={70}
      priority
      unoptimized
      className="h-27 w-auto object-contain"
    />
    <Image
     src="/manipuri.png"
      alt="Manipuri text"
      width={180}
      height={24
}
      className="mt-1 h-5 w-auto object-contain"
    />
  </div>
</Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 font-medium">
                  Men <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/products?category=men" className="w-full font-medium">
                    All Men&apos;s Footwear
                  </Link>
                </DropdownMenuItem>
                {menTypes.map((type) => (
                  <DropdownMenuItem key={type} asChild>
                    <Link href={`/products?category=men&type=${encodeURIComponent(type)}`} className="w-full">
                      {type}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 font-medium">
                  Women <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/products?category=women" className="w-full font-medium">
                    All Women&apos;s Footwear
                  </Link>
                </DropdownMenuItem>
                {womenTypes.map((type) => (
                  <DropdownMenuItem key={type} asChild>
                    <Link href={`/products?category=women&type=${encodeURIComponent(type)}`} className="w-full">
                      {type}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/products">
              <Button variant="ghost" className="font-medium">
                All Products
              </Button>
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for shoes, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link href="/products" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Shop Now</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full bg-secondary border-0"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-2">MEN</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/products?category=men"
                  className="text-sm py-2 px-3 bg-secondary rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Men&apos;s
                </Link>
                {menTypes.map((type) => (
                  <Link
                    key={type}
                    href={`/products?category=men&type=${encodeURIComponent(type)}`}
                    className="text-sm py-2 px-3 bg-secondary rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {type}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-2">WOMEN</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/products?category=women"
                  className="text-sm py-2 px-3 bg-secondary rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Women&apos;s
                </Link>
                {womenTypes.map((type) => (
                  <Link
                    key={type}
                    href={`/products?category=women&type=${encodeURIComponent(type)}`}
                    className="text-sm py-2 px-3 bg-secondary rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {type}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      <style jsx>{`
        .announcement-bar {
          background: linear-gradient(
            90deg,
            #160714 0%,
            #281127 28%,
            #4d213c 50%,
            #281127 72%,
            #160714 100%
          );
        }

        .announcement-glow {
          background:
            radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.11), transparent 44%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 70%);
          opacity: 0.72;
        }

        .announcement-vignette {
          background:
            radial-gradient(circle at 50% 50%, transparent 34%, rgba(0, 0, 0, 0.16) 100%);
        }

        .announcement-track {
          animation: announcement-marquee 32s linear infinite;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .announcement-block {
          letter-spacing: 0.08em;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.28);
        }

        .group:hover .announcement-track {
          animation-play-state: paused;
        }

        @keyframes announcement-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-16.6667%, 0, 0);
          }
        }
      `}</style>
    </header>
  );
}
