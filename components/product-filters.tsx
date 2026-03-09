"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { brands, types, sizes } from "@/lib/products";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductFiltersProps {
  currentCategory?: "men" | "women";
}

export function ProductFilters({ currentCategory }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedBrand = searchParams.get("brand");
  const selectedType = searchParams.get("type");
  const selectedSize = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 20000,
  ]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }
    if (priceRange[1] < 20000) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters = selectedBrand || selectedType || selectedSize || minPrice || maxPrice;

  const availableTypes = currentCategory
    ? types[currentCategory]
    : [...new Set([...types.men, ...types.women])];

  const availableSizes = currentCategory
    ? sizes[currentCategory]
    : [...new Set([...sizes.men, ...sizes.women])].sort((a, b) => a - b);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                {selectedBrand}
                <button onClick={() => updateFilters("brand", null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                {selectedType}
                <button onClick={() => updateFilters("type", null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                Size {selectedSize}
                <button onClick={() => updateFilters("size", null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                Rs {minPrice || 0} - Rs {maxPrice || "20,000"}
                <button onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("minPrice");
                  params.delete("maxPrice");
                  router.push(`/products?${params.toString()}`);
                }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["brand", "type", "size", "price"]} className="w-full">
        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-semibold">Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrand === brand}
                    onCheckedChange={(checked) =>
                      updateFilters("brand", checked ? brand : null)
                    }
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Type Filter */}
        <AccordionItem value="type">
          <AccordionTrigger className="text-sm font-semibold">Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {availableTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedType === type}
                    onCheckedChange={(checked) =>
                      updateFilters("type", checked ? type : null)
                    }
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size Filter */}
        <AccordionItem value="size">
          <AccordionTrigger className="text-sm font-semibold">Size</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    updateFilters("size", selectedSize === size.toString() ? null : size.toString())
                  }
                  className={`py-2 text-sm rounded-md border transition-colors ${
                    selectedSize === size.toString()
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-ring"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-1">
              <Slider
                value={priceRange}
                min={0}
                max={20000}
                step={500}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Rs {priceRange[0].toLocaleString()}</span>
                <span>Rs {priceRange[1].toLocaleString()}</span>
              </div>
              <Button onClick={applyPriceFilter} size="sm" className="w-full">
                Apply Price Filter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Filters</h2>
          <FilterContent />
        </div>
      </div>
    </>
  );
}
