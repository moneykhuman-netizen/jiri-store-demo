"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAdminStore } from "@/lib/admin-store";
import { getProductSizeNumbers } from "@/lib/product-inventory";
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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const brands = useAdminStore((state) => state.brands);
  const categories = useAdminStore((state) => state.categories);
  const products = useAdminStore((state) => state.products);

  const defaultPriceRange: [number, number] = [0, 20000];
  const appliedBrand = searchParams.get("brand");
  const appliedType = searchParams.get("type");
  const appliedSize = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const appliedPriceRange: [number, number] = [
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 20000,
  ];
  const [draftBrand, setDraftBrand] = useState<string | null>(appliedBrand);
  const [draftType, setDraftType] = useState<string | null>(appliedType);
  const [draftSize, setDraftSize] = useState<string | null>(appliedSize);
  const [priceRange, setPriceRange] = useState<[number, number]>(appliedPriceRange);
  const selectedFilterCount =
    [appliedBrand, appliedType, appliedSize].filter(Boolean).length +
    (minPrice || maxPrice ? 1 : 0);
  const categoryContextLabel =
    currentCategory === "men"
      ? "Men"
      : currentCategory === "women"
        ? "Women"
        : "All Products";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftBrand(appliedBrand);
    setDraftType(appliedType);
    setDraftSize(appliedSize);
    setPriceRange(appliedPriceRange);
  }, [appliedBrand, appliedType, appliedSize, minPrice, maxPrice]);

  if (!mounted) return null;

  const clearFilters = () => {
    setIsMobileFiltersOpen(false);
    setDraftBrand(null);
    setDraftType(null);
    setDraftSize(null);
    setPriceRange(defaultPriceRange);
    router.push("/products");
  };

  const applyFilters = (closeAfterApply = false) => {
    const params = new URLSearchParams(searchParams.toString());
    const hasCustomPrice =
      priceRange[0] > defaultPriceRange[0] || priceRange[1] < defaultPriceRange[1];

    if (draftBrand) {
      params.set("brand", draftBrand);
    } else {
      params.delete("brand");
    }

    if (draftType) {
      params.set("type", draftType);
    } else {
      params.delete("type");
    }

    if (draftSize) {
      params.set("size", draftSize);
    } else {
      params.delete("size");
    }

    if (hasCustomPrice) {
      params.set("minPrice", priceRange[0].toString());
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("minPrice");
      params.delete("maxPrice");
    }

    if (closeAfterApply) {
      setIsMobileFiltersOpen(false);
    }

    const nextQuery = params.toString();
    router.push(nextQuery ? `/products?${nextQuery}` : "/products");
  };

  const handleMobileFiltersOpenChange = (open: boolean) => {
    setIsMobileFiltersOpen(open);
    if (!open) {
      setDraftBrand(appliedBrand);
      setDraftType(appliedType);
      setDraftSize(appliedSize);
      setPriceRange(appliedPriceRange);
    }
  };

  const availableTypes = [...new Set(currentCategory ? categories[currentCategory] : [...categories.men, ...categories.women])];
  const availableSizes = Array.from(
    new Set(
      products
        .filter((product) => !currentCategory || product.category === currentCategory)
        .flatMap((product) => getProductSizeNumbers(product))
    )
  ).sort((a, b) => a - b);

  const filterListClass =
    "w-full max-w-full space-y-3 overflow-x-hidden overflow-y-auto max-h-40 md:max-h-48";
  const filterRowClass =
    "flex w-full max-w-full items-start gap-2 overflow-hidden md:items-center";
  const filterLabelClass =
    "min-w-0 flex-1 cursor-pointer break-words text-sm font-normal leading-snug md:flex-none md:break-normal md:leading-none";

  const renderAccordion = (mode: "desktop" | "mobile") => {
    const isMobile = mode === "mobile";
    const idPrefix = isMobile ? "mobile-" : "";
    const accordionClass = isMobile ? "w-full max-w-full space-y-1" : "w-full max-w-full";
    const listClass = isMobile
      ? "w-full max-w-full space-y-3 overflow-x-hidden overflow-y-auto max-h-44 pr-1"
      : filterListClass;
    const rowClass = isMobile
      ? "flex w-full max-w-full items-start gap-3 overflow-hidden rounded-md py-1"
      : filterRowClass;
    const labelClass = isMobile
      ? "min-w-0 flex-1 cursor-pointer break-words text-sm font-normal leading-snug"
      : filterLabelClass;
    const priceMetaClass = isMobile
      ? "flex items-center justify-between gap-3 text-sm text-muted-foreground"
      : "flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between";

    return (
      <Accordion
        type="multiple"
        defaultValue={["brands", "types", "sizes", "price"]}
        className={accordionClass}
      >
        <AccordionItem value="brands">
          <AccordionTrigger className="text-sm font-medium">Brands</AccordionTrigger>
          <AccordionContent>
            <div className={listClass}>
              {brands.map((brand) => (
                <div key={`${idPrefix}brand-${brand}`} className={rowClass}>
                  <Checkbox
                    id={`${idPrefix}brand-${brand}`}
                    checked={draftBrand === brand}
                    onCheckedChange={(checked) => setDraftBrand(checked ? brand : null)}
                  />
                  <Label
                    htmlFor={`${idPrefix}brand-${brand}`}
                    className={labelClass}
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
            <div className={listClass}>
              {availableTypes.map((type) => (
                <div key={`${idPrefix}type-${type}`} className={rowClass}>
                  <Checkbox
                    id={`${idPrefix}type-${type}`}
                    checked={draftType === type}
                    onCheckedChange={(checked) => setDraftType(checked ? type : null)}
                  />
                  <Label
                    htmlFor={`${idPrefix}type-${type}`}
                    className={labelClass}
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
            <div className={listClass}>
              {availableSizes.map((size) => (
                <div key={`${idPrefix}size-${size}`} className={rowClass}>
                  <Checkbox
                    id={`${idPrefix}size-${size}`}
                    checked={draftSize === size.toString()}
                    onCheckedChange={(checked) =>
                      setDraftSize(checked ? size.toString() : null)
                    }
                  />
                  <Label
                    htmlFor={`${idPrefix}size-${size}`}
                    className={labelClass}
                  >
                    {size}
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
                onValueChange={(value) =>
                  setPriceRange([value[0] ?? defaultPriceRange[0], value[1] ?? defaultPriceRange[1]])
                }
                max={20000}
                min={0}
                step={500}
                className="w-full"
              />
              <div className={priceMetaClass}>
                <span>Rs {priceRange[0].toLocaleString()}</span>
                <span>Rs {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <>
      <div className="hidden lg:block">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Category: {categoryContextLabel}
              </p>
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          {renderAccordion("desktop")}
          <Button onClick={() => applyFilters(false)} className="mt-6 w-full">
            Apply Filters
          </Button>
        </div>
      </div>

      <Sheet open={isMobileFiltersOpen} onOpenChange={handleMobileFiltersOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 z-40 h-12 rounded-full border-border bg-card/95 px-4 text-sm font-semibold shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {selectedFilterCount > 0 ? `Filters (${selectedFilterCount})` : "Filters"}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="flex h-auto max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border-t border-border px-0 pb-0 lg:hidden"
        >
          <SheetHeader className="border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
            <div className="mt-3 flex items-center justify-between gap-3 pr-8">
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Category: {categoryContextLabel}
                </p>
                <SheetTitle className="text-left text-base font-semibold">
                  Filters
                </SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto px-0 text-sm text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-4">
            {renderAccordion("mobile")}
          </div>

          <div className="border-t border-border bg-background/95 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur">
            <Button onClick={() => applyFilters(true)} className="h-11 w-full">
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
