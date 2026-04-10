"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  normalizeProductImages,
  normalizeProductVideoUrl,
  type Product,
} from "@/lib/products";
import { saveBrandsToFirebase } from "@/lib/firebase/brands";
import { saveFeaturedCollectionToFirebase } from "@/lib/firebase/featured";
import { saveManagedCategoriesToFirebase } from "@/lib/firebase/managed-categories";
import { saveNewArrivalsCollectionToFirebase } from "@/lib/firebase/new-arrivals";
import { saveProducts } from "@/lib/firebase/products";
import {
  distributeStockAcrossSizes,
  getProductSizeNumbers,
  getTotalSizeStock,
  normalizeProductColors,
  normalizeProductSizeInventory,
  type ProductSizeStock,
} from "@/lib/product-inventory";

// re-export so components can still import from this module
export type { Product };

// Admin credentials (in a real app, this would be server-side)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "jiri2024",
};

export interface AdminProduct extends Omit<Product, "sizes" | "sizeInventory"> {
  sizes: number[];
  sizeInventory: ProductSizeStock[];
  stock: number;
}

type AdminProductInput = Omit<AdminProduct, "sizes" | "sizeInventory"> & {
  sizes?: Product["sizes"];
  sizeInventory?: ProductSizeStock[];
};

export type HeroSection = "men" | "women";

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  image: string;
  section: HeroSection;
}

export interface PromoBanner {
  badge: string;
  title: string;
  description: string;
  code: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  whatsapp: string;
  youtube: string;
  telegram: string;
}

export const normalizeSocialLinks = (
  links?: Partial<SocialLinks> | null
): SocialLinks => ({
  facebook: typeof links?.facebook === "string" ? links.facebook : "",
  instagram: typeof links?.instagram === "string" ? links.instagram : "",
  whatsapp: typeof links?.whatsapp === "string" ? links.whatsapp : "",
  youtube: typeof links?.youtube === "string" ? links.youtube : "",
  telegram: typeof links?.telegram === "string" ? links.telegram : "",
});

export const BRAND_THEME_OPTIONS = [
  "auto",
  "neutral",
  "red",
  "blue",
  "green",
  "gold",
] as const;

export type BrandTheme = (typeof BRAND_THEME_OPTIONS)[number];

export interface BrandPresentation {
  tagline: string;
  theme: BrandTheme;
}

export interface HomepageCategoryCard {
  section: HeroSection;
  title: string;
  description: string;
  image: string;
  label: string;
}

export interface FeaturedCollectionSettings {
  title: string;
  description: string;
  productIds: string[];
}

export interface ManagedCategories {
  men: string[];
  women: string[];
}

export const HERO_BUTTON_LINKS: Record<HeroSection, string> = {
  men: "/products?category=men",
  women: "/products?category=women",
};

export const CATEGORY_CARD_LINKS: Record<HeroSection, string> = {
  men: "/products?category=men",
  women: "/products?category=women",
};

const HERO_DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "hero-women-default",
    badge: "ELEGANCE REDEFINED",
    title: "Women's Collection",
    description: "Heels, flats, sneakers and more. Style that speaks volumes.",
    buttonText: "Shop Women",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80",
    section: "women",
  },
  {
    id: "hero-men-default",
    badge: "MODERN ESSENTIALS",
    title: "Men's Collection",
    description: "Sneakers, boots, formals and more. Built for every step ahead.",
    buttonText: "Shop Men",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80",
    section: "men",
  },
];

const HOMEPAGE_CATEGORY_DEFAULTS: Record<HeroSection, HomepageCategoryCard> = {
  men: {
    section: "men",
    title: "Men's Collection",
    description: "Sneakers, Formals, Boots & More",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    label: "150+ Styles",
  },
  women: {
    section: "women",
    title: "Women's Collection",
    description: "Heels, Flats, Wedges & More",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    label: "200+ Styles",
  },
};

const FEATURED_COLLECTION_COPY_DEFAULTS = {
  title: "Featured Collection",
  description:
    "Handpicked styles that are trending right now. Premium quality at unbeatable prices.",
};

const NEW_ARRIVALS_COPY_DEFAULTS = {
  title: "New Arrivals",
  description: "Be the first to discover our latest additions. Fresh styles just landed.",
};

const DEFAULT_BRAND_PRESENTATIONS: Record<string, Partial<BrandPresentation>> = {
  Nike: { tagline: "Just Do It" },
  Adidas: { tagline: "Impossible is Nothing" },
  Puma: { tagline: "Forever Faster" },
  Reebok: { tagline: "Be More Human" },
  Skechers: { tagline: "Comfort Tech" },
  "New Balance": { tagline: "Fresh Foam" },
};

type PersistedHeroSlide = Partial<HeroSlide> & {
  buttonLink?: string;
};

type PersistedBrandPresentation = Partial<BrandPresentation>;

type PersistedHomepageCategoryCard = Partial<HomepageCategoryCard> & {
  id?: string;
  count?: string;
};

const isBrandTheme = (theme: string): theme is BrandTheme =>
  BRAND_THEME_OPTIONS.includes(theme as BrandTheme);

const normalizeBrandPresentation = (
  brand: string,
  presentation?: PersistedBrandPresentation
): BrandPresentation => {
  const defaults = DEFAULT_BRAND_PRESENTATIONS[brand];
  const hasCustomTagline = presentation && "tagline" in presentation;

  return {
    tagline: hasCustomTagline
      ? presentation?.tagline ?? ""
      : defaults?.tagline ?? "",
    theme: presentation?.theme && isBrandTheme(presentation.theme)
      ? presentation.theme
      : defaults?.theme && isBrandTheme(defaults.theme)
        ? defaults.theme
        : "auto",
  };
};

const syncBrandPresentations = (
  brands: string[],
  presentations?: Record<string, PersistedBrandPresentation>
): Record<string, BrandPresentation> =>
  Object.fromEntries(
    brands.map((brand) => [
      brand,
      normalizeBrandPresentation(brand, presentations?.[brand]),
    ])
  );

const inferHomepageCategorySection = (
  category?: PersistedHomepageCategoryCard,
  fallbackSection: HeroSection = "women"
): HeroSection => {
  if (category?.section === "men" || category?.section === "women") {
    return category.section;
  }
  if (category?.id === "men" || category?.id === "women") {
    return category.id;
  }
  return fallbackSection;
};

const inferHeroSection = (
  slide?: PersistedHeroSlide,
  fallbackSection: HeroSection = "women"
): HeroSection => {
  if (slide?.section === "men" || slide?.section === "women") {
    return slide.section;
  }

  const legacyLink = slide?.buttonLink?.toLowerCase() ?? "";
  if (legacyLink.includes("category=men")) {
    return "men";
  }
  if (legacyLink.includes("category=women")) {
    return "women";
  }

  const sectionCopy = [
    slide?.badge,
    slide?.title,
    slide?.description,
    slide?.buttonText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (sectionCopy.includes("women")) {
    return "women";
  }
  if (sectionCopy.includes("men")) {
    return "men";
  }

  return fallbackSection;
};

const getDefaultHeroSlide = (section: HeroSection) =>
  HERO_DEFAULT_SLIDES.find((slide) => slide.section === section) ?? HERO_DEFAULT_SLIDES[0];

const normalizeHeroSlide = (
  slide: PersistedHeroSlide,
  fallbackSection: HeroSection = "women"
): HeroSlide => {
  const section = inferHeroSection(slide, fallbackSection);
  const defaults = getDefaultHeroSlide(section);

  return {
    id: slide.id?.toString() || defaults.id,
    badge: slide.badge ?? defaults.badge,
    title: slide.title ?? defaults.title,
    description: slide.description ?? defaults.description,
    buttonText: slide.buttonText ?? defaults.buttonText,
    image: slide.image ?? defaults.image,
    section,
  };
};

const normalizeHeroSlides = (slides?: PersistedHeroSlide[]): HeroSlide[] => {
  if (!Array.isArray(slides)) {
    return HERO_DEFAULT_SLIDES.map((slide) => ({ ...slide }));
  }

  if (slides.length === 0) {
    return [];
  }

  return slides.map((slide, index) =>
    normalizeHeroSlide(
      slide,
      HERO_DEFAULT_SLIDES[index % HERO_DEFAULT_SLIDES.length]?.section ?? "women"
    )
  );
};

const normalizeHomepageCategoryCard = (
  category: PersistedHomepageCategoryCard | undefined,
  fallbackSection: HeroSection
): HomepageCategoryCard => {
  const section = inferHomepageCategorySection(category, fallbackSection);
  const defaults = HOMEPAGE_CATEGORY_DEFAULTS[section];

  return {
    section,
    title: category?.title ?? defaults.title,
    description: category?.description ?? defaults.description,
    image: category?.image ?? defaults.image,
    label: category?.label ?? category?.count ?? defaults.label,
  };
};

const normalizeHomepageCategories = (
  categories?:
    | Partial<Record<HeroSection, PersistedHomepageCategoryCard>>
    | PersistedHomepageCategoryCard[]
): Record<HeroSection, HomepageCategoryCard> => {
  if (Array.isArray(categories)) {
    const bySection = categories.reduce<
      Partial<Record<HeroSection, PersistedHomepageCategoryCard>>
    >((acc, category, index) => {
      const section = inferHomepageCategorySection(
        category,
        index === 0 ? "men" : "women"
      );
      acc[section] = category;
      return acc;
    }, {});

    return {
      men: normalizeHomepageCategoryCard(bySection.men, "men"),
      women: normalizeHomepageCategoryCard(bySection.women, "women"),
    };
  }

  return {
    men: normalizeHomepageCategoryCard(categories?.men, "men"),
    women: normalizeHomepageCategoryCard(categories?.women, "women"),
  };
};

const getDefaultFeaturedCollection = (
  products: AdminProduct[]
): FeaturedCollectionSettings => ({
  ...FEATURED_COLLECTION_COPY_DEFAULTS,
  productIds: products.filter((product) => product.isFeatured).map((product) => product.id),
});

const getDefaultNewArrivalsCollection = (
  products: AdminProduct[]
): FeaturedCollectionSettings => ({
  ...NEW_ARRIVALS_COPY_DEFAULTS,
  productIds: products.filter((product) => product.isNew).map((product) => product.id),
});

const normalizeFeaturedCollection = (
  featuredCollection: Partial<FeaturedCollectionSettings> | undefined,
  products: AdminProduct[]
): FeaturedCollectionSettings => {
  const defaults = getDefaultFeaturedCollection(products);
  const validProductIds = new Set(products.map((product) => product.id));
  const normalizedProductIds = Array.isArray(featuredCollection?.productIds)
    ? featuredCollection.productIds.filter(
        (productId, index, productIds) =>
          validProductIds.has(productId) && productIds.indexOf(productId) === index
      )
    : defaults.productIds;

  return {
    title: featuredCollection?.title ?? defaults.title,
    description: featuredCollection?.description ?? defaults.description,
    productIds: normalizedProductIds,
  };
};

const normalizeNewArrivalsCollection = (
  newArrivalsCollection: Partial<FeaturedCollectionSettings> | undefined,
  products: AdminProduct[]
): FeaturedCollectionSettings => {
  const defaults = getDefaultNewArrivalsCollection(products);
  const validProductIds = new Set(products.map((product) => product.id));
  const normalizedProductIds = Array.isArray(newArrivalsCollection?.productIds)
    ? newArrivalsCollection.productIds.filter(
        (productId, index, productIds) =>
          validProductIds.has(productId) && productIds.indexOf(productId) === index
      )
    : defaults.productIds;

  return {
    title: newArrivalsCollection?.title ?? defaults.title,
    description: newArrivalsCollection?.description ?? defaults.description,
    productIds: normalizedProductIds,
  };
};

const normalizeAdminProduct = (product: AdminProductInput): AdminProduct => {
  const sizeInventory = normalizeProductSizeInventory(product);
  const normalizedVideoUrl = normalizeProductVideoUrl(product.videoUrl);
  const normalizedStock =
    typeof product.stock === "number" && Number.isFinite(product.stock)
      ? Math.max(0, Math.trunc(product.stock))
      : getTotalSizeStock(sizeInventory);
  const { videoUrl: _videoUrl, ...productWithoutVideo } = product;

  return {
    ...productWithoutVideo,
    sizes: getProductSizeNumbers({ sizeInventory }),
    sizeInventory,
    colors: normalizeProductColors(product.colors),
    images: normalizeProductImages(product.images),
    ...(normalizedVideoUrl ? { videoUrl: normalizedVideoUrl } : {}),
    stock: normalizedStock,
    inStock: sizeInventory.some((entry) => entry.stock > 0),
  };
};

const normalizeAdminProducts = (products: AdminProductInput[]) =>
  products.map((product) => normalizeAdminProduct(product));

const createEmptyManagedCategories = (): ManagedCategories => ({
  men: [],
  women: [],
});

const normalizeManagedCategoryList = (categories: unknown): string[] => {
  if (!Array.isArray(categories)) {
    return [];
  }

  const seen = new Set<string>();

  return categories.reduce<string[]>((acc, category) => {
    if (typeof category !== "string") {
      return acc;
    }

    const trimmed = category.trim();
    if (!trimmed) {
      return acc;
    }

    const normalizedKey = trimmed.toLowerCase();
    if (seen.has(normalizedKey)) {
      return acc;
    }

    seen.add(normalizedKey);
    acc.push(trimmed);
    return acc;
  }, []);
};

const normalizeManagedCategories = (categories?: Partial<ManagedCategories>): ManagedCategories => ({
  men: normalizeManagedCategoryList(categories?.men),
  women: normalizeManagedCategoryList(categories?.women),
});

const deriveCategoriesFromProducts = (
  products: AdminProduct[]
): ManagedCategories => {
  const menTypes = new Set<string>();
  const womenTypes = new Set<string>();

  products.forEach((product) => {
    if (product.category === "men") {
      menTypes.add(product.type);
    } else if (product.category === "women") {
      womenTypes.add(product.type);
    }
  });

  return {
    men: Array.from(menTypes),
    women: Array.from(womenTypes),
  };
};

const mergeManagedCategories = (
  derivedCategories: ManagedCategories,
  managedCategories: ManagedCategories
): ManagedCategories => ({
  men: [...derivedCategories.men, ...managedCategories.men.filter((category) => !derivedCategories.men.includes(category))],
  women: [...derivedCategories.women, ...managedCategories.women.filter((category) => !derivedCategories.women.includes(category))],
});

const buildCatalogStateFromProducts = ({
  products,
  brandPresentations,
  featuredCollection,
  newArrivalsCollection,
  managedCategories,
}: {
  products: AdminProduct[];
  brandPresentations: Record<string, PersistedBrandPresentation>;
  featuredCollection: Partial<FeaturedCollectionSettings> | undefined;
  newArrivalsCollection: Partial<FeaturedCollectionSettings> | undefined;
  managedCategories: ManagedCategories;
}) => {
  const normalizedProducts = normalizeAdminProducts(products);
  const brandSet = new Set<string>();

  normalizedProducts.forEach((product) => {
    brandSet.add(product.brand);
  });

  const brands = Array.from(brandSet);
  const categories = mergeManagedCategories(
    deriveCategoriesFromProducts(normalizedProducts),
    managedCategories
  );

  return {
    products: normalizedProducts,
    brands,
    brandPresentations: syncBrandPresentations(brands, brandPresentations),
    categories,
    featuredCollection: normalizeFeaturedCollection(
      featuredCollection,
      normalizedProducts
    ),
    newArrivalsCollection: normalizeNewArrivalsCollection(
      newArrivalsCollection,
      normalizedProducts
    ),
  };
};

interface AdminState {
  isAuthenticated: boolean;
  products: AdminProduct[];
  brands: string[];
  brandPresentations: Record<string, BrandPresentation>;
  managedCategories: ManagedCategories;
  categories: { men: string[]; women: string[] };
  // homepage settings
  heroSlides: HeroSlide[];
  homepageCategories: Record<HeroSection, HomepageCategoryCard>;
  featuredCollection: FeaturedCollectionSettings;
  newArrivalsCollection: FeaturedCollectionSettings;
  promoBanner: PromoBanner;
  socialLinks: SocialLinks;
  // legacy single banner retained for backward compatibility only
  heroBanner: {
    badge: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  };
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addProduct: (product: AdminProduct) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  updateProductImages: (id: string, images: string[]) => void;
  deleteProduct: (id: string) => void;
  setProductsFromRemote: (products: AdminProduct[]) => void;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  updateBrandPresentation: (
    brand: string,
    updates: Partial<BrandPresentation>
  ) => void;
  setBrandsFromRemote: (
    brands: string[],
    brandPresentations: Record<string, BrandPresentation>
  ) => void;
  setManagedCategoriesFromRemote: (categories: ManagedCategories) => void;
  addCategory: (gender: "men" | "women", category: string) => void;
  removeCategory: (gender: "men" | "women", category: string) => void;
  // homepage actions
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;
  setHeroSlidesFromRemote: (slides: HeroSlide[]) => void;
  updateHomepageCategory: (category: HomepageCategoryCard) => void;
  setHomepageCategoriesFromRemote: (
    homepageCategories: Record<HeroSection, HomepageCategoryCard>
  ) => void;
  updateFeaturedCollection: (featuredCollection: FeaturedCollectionSettings) => void;
  setFeaturedCollectionFromRemote: (
    featuredCollection: Partial<FeaturedCollectionSettings>
  ) => void;
  updateNewArrivalsCollection: (newArrivalsCollection: FeaturedCollectionSettings) => void;
  setNewArrivalsCollectionFromRemote: (
    newArrivalsCollection: Partial<FeaturedCollectionSettings>
  ) => void;
  updatePromoBanner: (banner: PromoBanner) => void;
  setPromoBannerFromRemote: (banner: PromoBanner) => void;
  setSocialLinksFromRemote: (links: Partial<SocialLinks>) => void;
  updateSocialLinks: (links: SocialLinks) => void;
  // legacy (kept for compatibility but not used anymore)
  updateHeroBanner: (banner: any) => void;
}

// Convert existing products to AdminProducts with stock
import { products as initialProducts } from "./products";

const initialAdminProducts: AdminProduct[] = initialProducts.map((p) => {
  const stock = Math.floor(Math.random() * 50) + 10;
  return normalizeAdminProduct({
    ...p,
    stock,
    // derive availability from the assigned stock
    inStock: stock > 0,
  });
});

// Calculate initial brands and categories from products
const brandSet = new Set<string>();
initialAdminProducts.forEach(p => {
  brandSet.add(p.brand);
});
const initialBrandsFromProducts = Array.from(brandSet);
const initialManagedCategories = createEmptyManagedCategories();
const initialCategoriesFromProducts = mergeManagedCategories(
  deriveCategoriesFromProducts(initialAdminProducts),
  initialManagedCategories
);

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      products: initialAdminProducts,
      brands: initialBrandsFromProducts,
      brandPresentations: syncBrandPresentations(initialBrandsFromProducts),
      managedCategories: initialManagedCategories,
      categories: initialCategoriesFromProducts,
      heroSlides: HERO_DEFAULT_SLIDES.map((slide) => ({ ...slide })),
      homepageCategories: normalizeHomepageCategories(),
      featuredCollection: getDefaultFeaturedCollection(initialAdminProducts),
      newArrivalsCollection: getDefaultNewArrivalsCollection(initialAdminProducts),
      promoBanner: {
        badge: "Limited Time Offer",
        title: "Flat 30% Off on First Order",
        description: "Use code STEPSTYLE30 at checkout. Valid for new customers only.",
        code: "STEPSTYLE30",
      },
      socialLinks: normalizeSocialLinks(),
      heroBanner: {
        badge: "ELEGANCE REDEFINED",
        title: "Women's Collection",
        description: "Heels, flats, sneakers and more. Style that speaks volumes.",
        buttonText: "Shop Women",
        buttonLink: HERO_BUTTON_LINKS.women,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80",
      },

      login: (username: string, password: string) => {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      addProduct: (product: AdminProduct) => {
        let updatedProducts: AdminProduct[] = [];
        set((state) => {
          const newProduct = normalizeAdminProduct({
            ...product,
            inStock: product.stock > 0,
          });
          const newProducts = [...state.products, newProduct];
          updatedProducts = newProducts;
          const nextFeaturedCollection = newProduct.isFeatured
            ? normalizeFeaturedCollection(
                {
                  ...state.featuredCollection,
                  productIds: [
                    ...state.featuredCollection.productIds,
                    newProduct.id,
                  ],
                },
                newProducts
              )
            : normalizeFeaturedCollection(state.featuredCollection, newProducts);
          const nextNewArrivalsCollection = newProduct.isNew
            ? normalizeNewArrivalsCollection(
                {
                  ...state.newArrivalsCollection,
                  productIds: [
                    ...state.newArrivalsCollection.productIds,
                    newProduct.id,
                  ],
                },
                newProducts
              )
            : normalizeNewArrivalsCollection(
                state.newArrivalsCollection,
                newProducts
              );

          return buildCatalogStateFromProducts({
            products: newProducts,
            brandPresentations: state.brandPresentations,
            featuredCollection: nextFeaturedCollection,
            newArrivalsCollection: nextNewArrivalsCollection,
            managedCategories: state.managedCategories,
          });
        });
        const nextState = get();
        void Promise.all([
          saveProducts(updatedProducts),
          saveFeaturedCollectionToFirebase(nextState.featuredCollection),
          saveNewArrivalsCollectionToFirebase(nextState.newArrivalsCollection),
        ]).catch((error) => {
          console.error("Failed to persist new product collections:", error);
        });
      },

      updateProduct: (id: string, updates: Partial<AdminProduct>) => {
        let updatedProducts: AdminProduct[] = [];
        set((state) => {
          updatedProducts = state.products.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            const nextSizeInventory =
              Array.isArray(updates.sizeInventory) || Array.isArray(updates.sizes)
                ? normalizeProductSizeInventory({
                    sizeInventory: updates.sizeInventory ?? merged.sizeInventory,
                    sizes:
                      updates.sizeInventory === undefined
                        ? updates.sizes ?? merged.sizes
                        : merged.sizes,
                    stock: merged.stock,
                    inStock: merged.inStock,
                  })
                : updates.stock !== undefined
                  ? distributeStockAcrossSizes(p.sizes, updates.stock)
                  : p.sizeInventory;
            const nextStock =
              Array.isArray(updates.sizeInventory) ||
              Array.isArray(updates.sizes) ||
              updates.stock !== undefined
                ? getTotalSizeStock(nextSizeInventory)
                : merged.stock;

            return normalizeAdminProduct({
              ...merged,
              sizes: nextSizeInventory.map((entry) => entry.size),
              sizeInventory: nextSizeInventory,
              stock: nextStock,
            });
          });
          const updatedProduct = updatedProducts.find((product) => product.id === id);
          const nextFeaturedIds =
            updatedProduct && "isFeatured" in updates
              ? updatedProduct.isFeatured === false
                ? state.featuredCollection.productIds.filter((productId) => productId !== id)
                : state.featuredCollection.productIds
              : state.featuredCollection.productIds;
          const nextNewArrivalsIds =
            updatedProduct && "isNew" in updates
              ? updatedProduct.isNew === false
                ? state.newArrivalsCollection.productIds.filter(
                    (productId) => productId !== id
                  )
                : state.newArrivalsCollection.productIds
              : state.newArrivalsCollection.productIds;

          return buildCatalogStateFromProducts({
            products: updatedProducts,
            brandPresentations: state.brandPresentations,
            featuredCollection: normalizeFeaturedCollection(
              {
                ...state.featuredCollection,
                productIds: nextFeaturedIds,
              },
              updatedProducts
            ),
            newArrivalsCollection: normalizeNewArrivalsCollection(
              {
                ...state.newArrivalsCollection,
                productIds: nextNewArrivalsIds,
              },
              updatedProducts
            ),
            managedCategories: state.managedCategories,
          });
        });
        void saveProducts(updatedProducts).catch((error) => {
          console.error("Failed to save products to Firebase:", error);
        });
      },

      updateProductImages: (id, images) => {
        get().updateProduct(id, { images: normalizeProductImages(images) });
      },

      deleteProduct: (id: string) => {
        let updatedProducts: AdminProduct[] = [];
        set((state) => {
          const remainingProducts = state.products.filter((p) => p.id !== id);
          updatedProducts = remainingProducts;
          return buildCatalogStateFromProducts({
            products: remainingProducts,
            brandPresentations: state.brandPresentations,
            featuredCollection: {
              ...state.featuredCollection,
              productIds: state.featuredCollection.productIds.filter(
                (productId) => productId !== id
              ),
            },
            newArrivalsCollection: {
              ...state.newArrivalsCollection,
              productIds: state.newArrivalsCollection.productIds.filter(
                (productId) => productId !== id
              ),
            },
            managedCategories: state.managedCategories,
          });
        });
        void saveProducts(updatedProducts).catch((error) => {
          console.error("Failed to save products to Firebase:", error);
        });
      },

      addBrand: (brand: string) => {
        const state = get();
        if (!state.brands.includes(brand)) {
          const nextBrands = [...state.brands, brand];
          set({
            brands: nextBrands,
            brandPresentations: syncBrandPresentations(
              nextBrands,
              state.brandPresentations
            ),
          });
          void saveBrandsToFirebase(get().brands, get().brandPresentations).catch((error) => {
            console.error("Failed to save brands to Firebase:", error);
          });
        }
      },

      removeBrand: (brand: string) => {
        let updatedProducts: AdminProduct[] = [];
        set((state) => {
          const deletedProductIds = new Set(
            state.products
              .filter((product) => product.brand === brand)
              .map((product) => product.id)
          );
          const remainingProducts = state.products.filter(
            (product) => product.brand !== brand
          );
          updatedProducts = remainingProducts;

          return buildCatalogStateFromProducts({
            products: remainingProducts,
            brandPresentations: state.brandPresentations,
            featuredCollection: {
              ...state.featuredCollection,
              productIds: state.featuredCollection.productIds.filter(
                (productId) => !deletedProductIds.has(productId)
              ),
            },
            newArrivalsCollection: {
              ...state.newArrivalsCollection,
              productIds: state.newArrivalsCollection.productIds.filter(
                (productId) => !deletedProductIds.has(productId)
              ),
            },
            managedCategories: state.managedCategories,
          });
        });
        const nextState = get();
        void Promise.all([
          saveProducts(updatedProducts),
          saveBrandsToFirebase(nextState.brands, nextState.brandPresentations),
          saveFeaturedCollectionToFirebase(nextState.featuredCollection),
          saveNewArrivalsCollectionToFirebase(nextState.newArrivalsCollection),
        ]).catch((error) => {
          console.error("Failed to persist brand cascade delete:", error);
        });
      },

      setProductsFromRemote: (products) => {
        set((state) => {
          return buildCatalogStateFromProducts({
            products,
            brandPresentations: state.brandPresentations,
            featuredCollection: state.featuredCollection,
            newArrivalsCollection: state.newArrivalsCollection,
            managedCategories: state.managedCategories,
          });
        });
      },

      updateBrandPresentation: (brand, updates) => {
        set((state) => ({
          brandPresentations: {
            ...state.brandPresentations,
            [brand]: normalizeBrandPresentation(brand, {
              ...state.brandPresentations[brand],
              ...updates,
            }),
          },
        }));
        void saveBrandsToFirebase(get().brands, get().brandPresentations).catch((error) => {
          console.error("Failed to save brands to Firebase:", error);
        });
      },
      setBrandsFromRemote: (brands, brandPresentations) => {
        set({
          brands,
          brandPresentations,
        });
      },

      setManagedCategoriesFromRemote: (categories) => {
        set((state) => ({
          managedCategories: normalizeManagedCategories(categories),
          categories: mergeManagedCategories(
            deriveCategoriesFromProducts(state.products),
            normalizeManagedCategories(categories)
          ),
        }));
      },

      addCategory: (gender: "men" | "women", category: string) => {
        const state = get();
        if (!state.categories[gender].includes(category)) {
          const nextManagedCategories = normalizeManagedCategories({
            ...state.managedCategories,
            [gender]: [...state.managedCategories[gender], category],
          });

          set({
            managedCategories: nextManagedCategories,
            categories: mergeManagedCategories(
              deriveCategoriesFromProducts(state.products),
              nextManagedCategories
            ),
          });

          void saveManagedCategoriesToFirebase(nextManagedCategories).catch((error) => {
            console.error("Failed to save managed categories to Firebase:", error);
          });
        }
      },

      removeCategory: (gender: "men" | "women", category: string) => {
        let updatedProducts: AdminProduct[] = [];
        let nextManagedCategories = createEmptyManagedCategories();

        set((state) => {
          const deletedProductIds = new Set(
            state.products
              .filter(
                (product) =>
                  product.category === gender && product.type === category
              )
              .map((product) => product.id)
          );
          const remainingProducts = state.products.filter(
            (product) => !deletedProductIds.has(product.id)
          );
          updatedProducts = remainingProducts;

          return {
            managedCategories: nextManagedCategories,
            ...buildCatalogStateFromProducts({
              products: remainingProducts,
              brandPresentations: state.brandPresentations,
              featuredCollection: {
                ...state.featuredCollection,
                productIds: state.featuredCollection.productIds.filter(
                  (productId) => !deletedProductIds.has(productId)
                ),
              },
              newArrivalsCollection: {
                ...state.newArrivalsCollection,
                productIds: state.newArrivalsCollection.productIds.filter(
                  (productId) => !deletedProductIds.has(productId)
                ),
              },
              managedCategories: nextManagedCategories,
            }),
          };
        });

        const nextState = get();
        void Promise.all([
          saveProducts(updatedProducts),
          saveManagedCategoriesToFirebase(nextManagedCategories),
          saveBrandsToFirebase(nextState.brands, nextState.brandPresentations),
          saveFeaturedCollectionToFirebase(nextState.featuredCollection),
          saveNewArrivalsCollectionToFirebase(nextState.newArrivalsCollection),
        ]).catch((error) => {
          console.error("Failed to persist category cascade delete:", error);
        });
      },

      // homepage actions
      addHeroSlide: (slide) => {
        set((state) => ({
          heroSlides: [...state.heroSlides, normalizeHeroSlide(slide, slide.section)],
        }));
      },
      updateHeroSlide: (slide) => {
        set((state) => ({
          heroSlides: state.heroSlides.map((s) =>
            s.id === slide.id ? normalizeHeroSlide(slide, s.section) : s
          ),
        }));
      },
      deleteHeroSlide: (id) => {
        set((state) => ({
          heroSlides: state.heroSlides.filter((s) => s.id !== id),
        }));
      },
      setHeroSlidesFromRemote: (slides) => {
        set({
          heroSlides: normalizeHeroSlides(slides),
        });
      },
      updateHomepageCategory: (category) => {
        set((state) => ({
          homepageCategories: {
            ...state.homepageCategories,
            [category.section]: normalizeHomepageCategoryCard(category, category.section),
          },
        }));
      },
      setHomepageCategoriesFromRemote: (homepageCategories) => {
        set({
          homepageCategories,
        });
      },
      updateFeaturedCollection: (featuredCollection) => {
        set((state) => ({
          featuredCollection: normalizeFeaturedCollection(
            featuredCollection,
            state.products
          ),
        }));
      },
      setFeaturedCollectionFromRemote: (featuredCollection) => {
        set((state) => ({
          featuredCollection: normalizeFeaturedCollection(
            featuredCollection,
            state.products
          ),
        }));
      },
      updateNewArrivalsCollection: (newArrivalsCollection) => {
        set((state) => ({
          newArrivalsCollection: normalizeNewArrivalsCollection(
            newArrivalsCollection,
            state.products
          ),
        }));
      },
      setNewArrivalsCollectionFromRemote: (newArrivalsCollection) => {
        set((state) => ({
          newArrivalsCollection: normalizeNewArrivalsCollection(
            newArrivalsCollection,
            state.products
          ),
        }));
      },
      updatePromoBanner: (banner) => {
        set({ promoBanner: banner });
      },
      setPromoBannerFromRemote: (banner) => {
        set({ promoBanner: banner });
      },
      setSocialLinksFromRemote: (links) => {
        set({ socialLinks: normalizeSocialLinks(links) });
      },
      updateSocialLinks: (links) => {
        set({ socialLinks: normalizeSocialLinks(links) });
      },
      updateHeroBanner: (banner) => {
        // legacy-only state retained for backward compatibility
        set({ heroBanner: banner });
      },
    }),
    {
      name: "jiri-admin-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        brands: state.brands,
        brandPresentations: state.brandPresentations,
        managedCategories: state.managedCategories,
        categories: state.categories,
        heroSlides: state.heroSlides,
        homepageCategories: state.homepageCategories,
        featuredCollection: state.featuredCollection,
        newArrivalsCollection: state.newArrivalsCollection,
        promoBanner: state.promoBanner,
        socialLinks: state.socialLinks,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AdminState> | undefined;
        const mergedProducts = normalizeAdminProducts(
          (persisted?.products ?? currentState.products) as AdminProductInput[]
        );
        const mergedManagedCategories = normalizeManagedCategories(
          persisted?.managedCategories
        );
        const catalogState = buildCatalogStateFromProducts({
          products: mergedProducts,
          brandPresentations:
            (persisted?.brandPresentations as
              | Record<string, PersistedBrandPresentation>
              | undefined) ?? currentState.brandPresentations,
          featuredCollection:
            (persisted?.featuredCollection as
              | Partial<FeaturedCollectionSettings>
              | undefined) ?? currentState.featuredCollection,
          newArrivalsCollection:
            (persisted?.newArrivalsCollection as
              | Partial<FeaturedCollectionSettings>
              | undefined) ?? currentState.newArrivalsCollection,
          managedCategories: mergedManagedCategories,
        });

        return {
          ...currentState,
          ...persisted,
          ...catalogState,
          managedCategories: mergedManagedCategories,
          heroSlides: normalizeHeroSlides(
            persisted?.heroSlides as PersistedHeroSlide[] | undefined
          ),
          homepageCategories: normalizeHomepageCategories(
            persisted?.homepageCategories as
              | Partial<Record<HeroSection, PersistedHomepageCategoryCard>>
              | PersistedHomepageCategoryCard[]
              | undefined
          ),
          socialLinks: normalizeSocialLinks(
            persisted?.socialLinks as Partial<SocialLinks> | undefined
          ),
          heroBanner: currentState.heroBanner,
        };
      },
    }
  )
);
