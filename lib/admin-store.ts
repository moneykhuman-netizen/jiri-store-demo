"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products";

// re-export so components can still import from this module
export type { Product };

// Admin credentials (in a real app, this would be server-side)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "jiri2024",
};

export interface AdminProduct extends Product {
  id: string;
  stock: number;
}

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
}

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

interface AdminState {
  isAuthenticated: boolean;
  products: AdminProduct[];
  brands: string[];
  brandPresentations: Record<string, BrandPresentation>;
  categories: { men: string[]; women: string[] };
  // homepage settings
  heroSlides: HeroSlide[];
  homepageCategories: Record<HeroSection, HomepageCategoryCard>;
  featuredCollection: FeaturedCollectionSettings;
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
  deleteProduct: (id: string) => void;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  updateBrandPresentation: (
    brand: string,
    updates: Partial<BrandPresentation>
  ) => void;
  addCategory: (gender: "men" | "women", category: string) => void;
  removeCategory: (gender: "men" | "women", category: string) => void;
  // homepage actions
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;
  updateHomepageCategory: (category: HomepageCategoryCard) => void;
  updateFeaturedCollection: (featuredCollection: FeaturedCollectionSettings) => void;
  updatePromoBanner: (banner: PromoBanner) => void;
  updateSocialLinks: (links: SocialLinks) => void;
  // legacy (kept for compatibility but not used anymore)
  updateHeroBanner: (banner: any) => void;
}

// Convert existing products to AdminProducts with stock
import { products as initialProducts, brands as initialBrands, types as initialTypes } from "./products";

const initialAdminProducts: AdminProduct[] = initialProducts.map((p) => {
  const stock = Math.floor(Math.random() * 50) + 10;
  return {
    ...p,
    stock,
    // derive availability from the assigned stock
    inStock: stock > 0,
  };
});

// Calculate initial brands and categories from products
const brandSet = new Set<string>();
const menTypes = new Set<string>();
const womenTypes = new Set<string>();
initialAdminProducts.forEach(p => {
  brandSet.add(p.brand);
  if (p.category === 'men') {
    menTypes.add(p.type);
  } else if (p.category === 'women') {
    womenTypes.add(p.type);
  }
});
const initialBrandsFromProducts = Array.from(brandSet);
const initialCategoriesFromProducts = {
  men: Array.from(menTypes),
  women: Array.from(womenTypes),
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      products: initialAdminProducts,
      brands: initialBrandsFromProducts,
      brandPresentations: syncBrandPresentations(initialBrandsFromProducts),
      categories: initialCategoriesFromProducts,
      heroSlides: HERO_DEFAULT_SLIDES.map((slide) => ({ ...slide })),
      homepageCategories: normalizeHomepageCategories(),
      featuredCollection: getDefaultFeaturedCollection(initialAdminProducts),
      promoBanner: {
        badge: "Limited Time Offer",
        title: "Flat 30% Off on First Order",
        description: "Use code STEPSTYLE30 at checkout. Valid for new customers only.",
        code: "STEPSTYLE30",
      },
      socialLinks: {
        facebook: "",
        instagram: "",
        whatsapp: "",
      },
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
        set((state) => {
          // ensure inStock mirrors stock
          const newProduct = {
            ...product,
            inStock: product.stock > 0,
          };
          const newProducts = [...state.products, newProduct];

          const brandSet = new Set<string>();
          newProducts.forEach(p => brandSet.add(p.brand));
          const updatedBrands = Array.from(brandSet);

          const menTypes = new Set<string>();
          const womenTypes = new Set<string>();
          newProducts.forEach(p => {
            if (p.category === 'men') {
              menTypes.add(p.type);
            } else if (p.category === 'women') {
              womenTypes.add(p.type);
            }
          });
          const updatedCategories = {
            men: Array.from(menTypes),
            women: Array.from(womenTypes),
          };

          return {
            products: newProducts,
            brands: updatedBrands,
            brandPresentations: syncBrandPresentations(
              updatedBrands,
              state.brandPresentations
            ),
            categories: updatedCategories,
            featuredCollection: newProduct.isFeatured
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
              : normalizeFeaturedCollection(state.featuredCollection, newProducts),
          };
        });
      },

      updateProduct: (id: string, updates: Partial<AdminProduct>) => {
        set((state) => {
          const updatedProducts = state.products.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            // always sync availability based on final stock value
            merged.inStock = merged.stock > 0;
            return merged;
          });
          const brandSet = new Set<string>();
          updatedProducts.forEach(p => brandSet.add(p.brand));
          const updatedBrands = Array.from(brandSet);

          const menTypes = new Set<string>();
          const womenTypes = new Set<string>();
          updatedProducts.forEach(p => {
            if (p.category === 'men') {
              menTypes.add(p.type);
            } else if (p.category === 'women') {
              womenTypes.add(p.type);
            }
          });
          const updatedCategories = {
            men: Array.from(menTypes),
            women: Array.from(womenTypes),
          };
          const updatedProduct = updatedProducts.find((product) => product.id === id);
          const nextFeaturedIds =
            updatedProduct && "isFeatured" in updates
              ? updatedProduct.isFeatured
                ? [...state.featuredCollection.productIds, id]
                : state.featuredCollection.productIds.filter((productId) => productId !== id)
              : state.featuredCollection.productIds;

          return {
            products: updatedProducts,
            brands: updatedBrands,
            brandPresentations: syncBrandPresentations(
              updatedBrands,
              state.brandPresentations
            ),
            categories: updatedCategories,
            featuredCollection: normalizeFeaturedCollection(
              {
                ...state.featuredCollection,
                productIds: nextFeaturedIds,
              },
              updatedProducts
            ),
          };
        });
      },

      deleteProduct: (id: string) => {
        set((state) => {
          const remainingProducts = state.products.filter((p) => p.id !== id);

          // Recalculate brands from remaining products
          const brandSet = new Set<string>();
          remainingProducts.forEach(p => brandSet.add(p.brand));
          const remainingBrands = Array.from(brandSet);

          // Recalculate categories from remaining products
          const menTypes = new Set<string>();
          const womenTypes = new Set<string>();
          remainingProducts.forEach(p => {
            if (p.category === 'men') {
              menTypes.add(p.type);
            } else if (p.category === 'women') {
              womenTypes.add(p.type);
            }
          });
          const remainingCategories = {
            men: Array.from(menTypes),
            women: Array.from(womenTypes),
          };

          return {
            products: remainingProducts,
            brands: remainingBrands,
            brandPresentations: syncBrandPresentations(
              remainingBrands,
              state.brandPresentations
            ),
            categories: remainingCategories,
            featuredCollection: normalizeFeaturedCollection(
              {
                ...state.featuredCollection,
                productIds: state.featuredCollection.productIds.filter(
                  (productId) => productId !== id
                ),
              },
              remainingProducts
            ),
          };
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
        }
      },

      removeBrand: (brand: string) => {
        set((state) => {
          // Remove all products belonging to this brand
          const remainingProducts = state.products.filter(p => p.brand !== brand);
          
          // Recalculate brands from remaining products
          const brandSet = new Set<string>();
          remainingProducts.forEach(p => brandSet.add(p.brand));
          const remainingBrands = Array.from(brandSet);
          
          // Recalculate categories from remaining products
          const menTypes = new Set<string>();
          const womenTypes = new Set<string>();
          remainingProducts.forEach(p => {
            if (p.category === 'men') {
              menTypes.add(p.type);
            } else if (p.category === 'women') {
              womenTypes.add(p.type);
            }
          });
          const remainingCategories = {
            men: Array.from(menTypes),
            women: Array.from(womenTypes),
          };
          
          return {
            products: remainingProducts,
            brands: remainingBrands,
            brandPresentations: syncBrandPresentations(
              remainingBrands,
              state.brandPresentations
            ),
            categories: remainingCategories,
          };
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
      },

      addCategory: (gender: "men" | "women", category: string) => {
        const state = get();
        if (!state.categories[gender].includes(category)) {
          set({
            categories: {
              ...state.categories,
              [gender]: [...state.categories[gender], category],
            },
          });
        }
      },

      removeCategory: (gender: "men" | "women", category: string) => {
        set((state) => ({
          categories: {
            ...state.categories,
            [gender]: state.categories[gender].filter((c) => c !== category),
          },
        }));
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
      updateHomepageCategory: (category) => {
        set((state) => ({
          homepageCategories: {
            ...state.homepageCategories,
            [category.section]: normalizeHomepageCategoryCard(category, category.section),
          },
        }));
      },
      updateFeaturedCollection: (featuredCollection) => {
        set((state) => ({
          featuredCollection: normalizeFeaturedCollection(
            featuredCollection,
            state.products
          ),
        }));
      },
      updatePromoBanner: (banner) => {
        set({ promoBanner: banner });
      },
      updateSocialLinks: (links) => {
        set({ socialLinks: links });
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
        categories: state.categories,
        heroSlides: state.heroSlides,
        homepageCategories: state.homepageCategories,
        featuredCollection: state.featuredCollection,
        promoBanner: state.promoBanner,
        socialLinks: state.socialLinks,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AdminState> | undefined;
        const mergedBrands = persisted?.brands ?? currentState.brands;
        const mergedProducts = persisted?.products ?? currentState.products;

        return {
          ...currentState,
          ...persisted,
          products: mergedProducts,
          brands: mergedBrands,
          brandPresentations: syncBrandPresentations(
            mergedBrands,
            persisted?.brandPresentations as
              | Record<string, PersistedBrandPresentation>
              | undefined
          ),
          heroSlides: normalizeHeroSlides(
            persisted?.heroSlides as PersistedHeroSlide[] | undefined
          ),
          homepageCategories: normalizeHomepageCategories(
            persisted?.homepageCategories as
              | Partial<Record<HeroSection, PersistedHomepageCategoryCard>>
              | PersistedHomepageCategoryCard[]
              | undefined
          ),
          featuredCollection: normalizeFeaturedCollection(
            persisted?.featuredCollection as Partial<FeaturedCollectionSettings> | undefined,
            mergedProducts
          ),
          heroBanner: currentState.heroBanner,
        };
      },
    }
  )
);
