"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm">
        Free Delivery on Orders Above Rs 2,999 | Use Code: JIRI10 for 10% Off
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="flex flex-col items-start leading-none">
              <span className="text-xl sm:text-2xl font-sans font-black tracking-tight text-foreground uppercase">
                JIRI
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase group-hover:text-foreground transition-colors">
                Pick Up Store
              </span>
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
    </header>
  );
}
