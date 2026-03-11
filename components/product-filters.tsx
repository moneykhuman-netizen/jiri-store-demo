"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAdminStore } from "@/lib/admin-store";
import { sizes } from "@/lib/products";
import { SlidersHorizontal } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const brands = useAdminStore((state) => state.brands);
  const categories = useAdminStore((state) => state.categories);
  
  const selectedBrand = searchParams.get("brand");
  const selectedType = searchParams.get("type");
  const selectedSize = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 20000,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  const availableTypes = [...new Set(currentCategory ? categories[currentCategory] : [...categories.men, ...categories.women])];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["brands", "types", "sizes", "price"]} className="w-full">
        {/* Brands */}
        <AccordionItem value="brands">
          <AccordionTrigger className="text-sm font-medium">Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <div key={`brand-${brand}`} className="flex items-center space-x-2">
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

        {/* Types */}
        <AccordionItem value="types">
          <AccordionTrigger className="text-sm font-medium">Types</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {availableTypes.map((type) => (
                <div key={`type-${type}`} className="flex items-center space-x-2">
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

        {/* Sizes */}
        <AccordionItem value="sizes">
          <AccordionTrigger className="text-sm font-medium">Sizes</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {[...new Set(currentCategory ? sizes[currentCategory] : [...sizes.men, ...sizes.women])].sort((a, b) => a - b).map((size) => (
                <div key={`size-${size}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSize === size.toString()}
                    onCheckedChange={(checked) =>
                      updateFilters("size", checked ? size.toString() : null)
                    }
                  />
                  <Label
                    htmlFor={`size-${size}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    UK {size}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={20000}
                min={0}
                step={500}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Rs {priceRange[0].toLocaleString()}</span>
                <span>Rs {priceRange[1].toLocaleString()}</span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  updateFilters("minPrice", priceRange[0].toString());
                  updateFilters("maxPrice", priceRange[1].toString());
                }}
                className="w-full"
              >
                Apply Price Filter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full mt-4 lg:hidden">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Accordion type="multiple" defaultValue={["brands", "types", "sizes", "price"]} className="w-full">
              {/* Same content as above */}
              <AccordionItem value="brands">
                <AccordionTrigger className="text-sm font-medium">Brands</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <div key={`mobile-brand-${brand}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-brand-${brand}`}
                          checked={selectedBrand === brand}
                          onCheckedChange={(checked) =>
                            updateFilters("brand", checked ? brand : null)
                          }
                        />
                        <Label
                          htmlFor={`mobile-brand-${brand}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="types">
                <AccordionTrigger className="text-sm font-medium">Types</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {availableTypes.map((type) => (
                      <div key={`mobile-type-${type}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-type-${type}`}
                          checked={selectedType === type}
                          onCheckedChange={(checked) =>
                            updateFilters("type", checked ? type : null)
                          }
                        />
                        <Label
                          htmlFor={`mobile-type-${type}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sizes">
                <AccordionTrigger className="text-sm font-medium">Sizes</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {[...new Set(currentCategory ? sizes[currentCategory] : [...sizes.men, ...sizes.women])].sort((a, b) => a - b).map((size) => (
                      <div key={`mobile-size-${size}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-size-${size}`}
                          checked={selectedSize === size.toString()}
                          onCheckedChange={(checked) =>
                            updateFilters("size", checked ? size.toString() : null)
                          }
                        />
                        <Label
                          htmlFor={`mobile-size-${size}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          UK {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={20000}
                      min={0}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Rs {priceRange[0].toLocaleString()}</span>
                      <span>Rs {priceRange[1].toLocaleString()}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateFilters("minPrice", priceRange[0].toString());
                        updateFilters("maxPrice", priceRange[1].toString());
                      }}
                      className="w-full"
                    >
                      Apply Price Filter
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
