"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products";
import { products as initialProducts } from "./products";
import {
  createProductDocument,
  deleteProductDocument,
  deleteProductsByIds,
  updateProductDocument,
} from "@/lib/firebase/products";
import {
  normalizeLegacySeedProduct,
  sortProductsForStore,
  type NormalizedProduct,
} from "@/lib/product-normalization";

// re-export so components can still import from this module
export type { Product };

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "jiri2024",
};

export type AdminProduct = NormalizedProduct;

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
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

interface CategoryState {
  men: string[];
  women: string[];
}

interface AdminState {
  isAuthenticated: boolean;
  products: AdminProduct[];
  brands: string[];
  categories: CategoryState;
  manualBrands: string[];
  manualCategories: CategoryState;
  heroSlides: HeroSlide[];
  promoBanner: PromoBanner;
  socialLinks: SocialLinks;
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
  setProductsFromRemote: (products: AdminProduct[]) => void;
  addProduct: (product: Product) => Promise<AdminProduct>;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => Promise<AdminProduct | null>;
  deleteProduct: (id: string) => Promise<void>;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => Promise<void>;
  addCategory: (gender: "men" | "women", category: string) => void;
  removeCategory: (gender: "men" | "women", category: string) => void;
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;
  updatePromoBanner: (banner: PromoBanner) => void;
  updateSocialLinks: (links: SocialLinks) => void;
  updateHeroBanner: (banner: unknown) => void;
}

const mergeUniqueStrings = (values: string[]): string[] =>
  Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));

const deriveBrandsFromProducts = (products: AdminProduct[]) =>
  mergeUniqueStrings(products.map((product) => product.brand));

const deriveCategoriesFromProducts = (products: AdminProduct[]): CategoryState => {
  const menCategories = products
    .filter((product) => product.category === "men")
    .map((product) => product.type);
  const womenCategories = products
    .filter((product) => product.category === "women")
    .map((product) => product.type);

  return {
    men: mergeUniqueStrings(menCategories),
    women: mergeUniqueStrings(womenCategories),
  };
};

const buildCatalogState = (
  products: AdminProduct[],
  manualBrands: string[],
  manualCategories: CategoryState
) => {
  const normalizedProducts = sortProductsForStore(products);
  const derivedBrands = deriveBrandsFromProducts(normalizedProducts);
  const derivedCategories = deriveCategoriesFromProducts(normalizedProducts);

  return {
    products: normalizedProducts,
    brands: mergeUniqueStrings([...manualBrands, ...derivedBrands]),
    categories: {
      men: mergeUniqueStrings([...manualCategories.men, ...derivedCategories.men]),
      women: mergeUniqueStrings([...manualCategories.women, ...derivedCategories.women]),
    },
  };
};

const initialAdminProducts: AdminProduct[] = sortProductsForStore(
  initialProducts.map((product, index) => normalizeLegacySeedProduct(product, index))
);

const initialManualBrands: string[] = [];
const initialManualCategories: CategoryState = {
  men: [],
  women: [],
};

const initialCatalogState = buildCatalogState(
  initialAdminProducts,
  initialManualBrands,
  initialManualCategories
);

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      products: initialCatalogState.products,
      brands: initialCatalogState.brands,
      categories: initialCatalogState.categories,
      manualBrands: initialManualBrands,
      manualCategories: initialManualCategories,
      heroSlides: [
        {
          id: Date.now().toString(),
          badge: "ELEGANCE REDEFINED",
          title: "Women's Collection",
          description: "Heels, flats, sneakers and more. Style that speaks volumes.",
          buttonText: "Shop Women",
          buttonLink: "/products?category=women",
          image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80",
        },
      ],
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
        buttonLink: "/products?category=women",
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

      setProductsFromRemote: (products: AdminProduct[]) => {
        set((state) => ({
          ...buildCatalogState(products, state.manualBrands, state.manualCategories),
        }));
      },

      addProduct: async (product: Product) => {
        const savedProduct = await createProductDocument(product);
        set((state) => ({
          ...buildCatalogState(
            [...state.products.filter((item) => item.id !== savedProduct.id), savedProduct],
            state.manualBrands,
            state.manualCategories
          ),
        }));
        return savedProduct;
      },

      updateProduct: async (id: string, updates: Partial<AdminProduct>) => {
        const currentProduct = get().products.find((product) => product.id === id);
        if (!currentProduct) {
          return null;
        }

        const savedProduct = await updateProductDocument(currentProduct, updates);
        set((state) => ({
          ...buildCatalogState(
            state.products.map((product) => (product.id === id ? savedProduct : product)),
            state.manualBrands,
            state.manualCategories
          ),
        }));

        return savedProduct;
      },

      deleteProduct: async (id: string) => {
        await deleteProductDocument(id);
        set((state) => ({
          ...buildCatalogState(
            state.products.filter((product) => product.id !== id),
            state.manualBrands,
            state.manualCategories
          ),
        }));
      },

      addBrand: (brand: string) => {
        const trimmedBrand = brand.trim();
        if (!trimmedBrand) {
          return;
        }

        set((state) => {
          const manualBrands = mergeUniqueStrings([...state.manualBrands, trimmedBrand]);
          return {
            manualBrands,
            ...buildCatalogState(state.products, manualBrands, state.manualCategories),
          };
        });
      },

      removeBrand: async (brand: string) => {
        const matchingProducts = get().products.filter((product) => product.brand === brand);
        if (matchingProducts.length > 0) {
          await deleteProductsByIds(matchingProducts.map((product) => product.id));
        }

        set((state) => {
          const remainingProducts = state.products.filter((product) => product.brand !== brand);
          const manualBrands = state.manualBrands.filter((item) => item !== brand);

          return {
            manualBrands,
            ...buildCatalogState(remainingProducts, manualBrands, state.manualCategories),
          };
        });
      },

      addCategory: (gender: "men" | "women", category: string) => {
        const trimmedCategory = category.trim();
        if (!trimmedCategory) {
          return;
        }

        set((state) => {
          const manualCategories = {
            ...state.manualCategories,
            [gender]: mergeUniqueStrings([...state.manualCategories[gender], trimmedCategory]),
          };

          return {
            manualCategories,
            ...buildCatalogState(state.products, state.manualBrands, manualCategories),
          };
        });
      },

      removeCategory: (gender: "men" | "women", category: string) => {
        set((state) => {
          const manualCategories = {
            ...state.manualCategories,
            [gender]: state.manualCategories[gender].filter((item) => item !== category),
          };

          return {
            manualCategories,
            ...buildCatalogState(state.products, state.manualBrands, manualCategories),
          };
        });
      },

      addHeroSlide: (slide) => {
        set((state) => ({ heroSlides: [...state.heroSlides, slide] }));
      },
      updateHeroSlide: (slide) => {
        set((state) => ({
          heroSlides: state.heroSlides.map((item) => (item.id === slide.id ? slide : item)),
        }));
      },
      deleteHeroSlide: (id) => {
        set((state) => ({
          heroSlides: state.heroSlides.filter((item) => item.id !== id),
        }));
      },
      updatePromoBanner: (banner) => {
        set({ promoBanner: banner });
      },
      updateSocialLinks: (links) => {
        set({ socialLinks: links });
      },
      updateHeroBanner: (banner) => {
        set({ heroBanner: banner as AdminState["heroBanner"] });
      },
    }),
    {
      name: "jiri-admin-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        brands: state.brands,
        categories: state.categories,
        manualBrands: state.manualBrands,
        manualCategories: state.manualCategories,
        heroSlides: state.heroSlides,
        promoBanner: state.promoBanner,
        socialLinks: state.socialLinks,
        heroBanner: state.heroBanner,
      }),
    }
  )
);
