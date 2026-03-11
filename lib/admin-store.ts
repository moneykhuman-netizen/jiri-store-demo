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

interface AdminState {
  isAuthenticated: boolean;
  products: AdminProduct[];
  brands: string[];
  categories: { men: string[]; women: string[] };
  // homepage settings
  heroSlides: HeroSlide[];
  promoBanner: PromoBanner;
  socialLinks: SocialLinks;
  // legacy single banner (mirrored from first slide)
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
  addCategory: (gender: "men" | "women", category: string) => void;
  removeCategory: (gender: "men" | "women", category: string) => void;
  // homepage actions
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;
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
      categories: initialCategoriesFromProducts,
      // initialize heroSlides with single default slide for previous banner
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
            categories: updatedCategories,
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

          return {
            products: updatedProducts,
            brands: updatedBrands,
            categories: updatedCategories,
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
            categories: remainingCategories,
          };
        });
      },

      addBrand: (brand: string) => {
        const state = get();
        if (!state.brands.includes(brand)) {
          set({ brands: [...state.brands, brand] });
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
            categories: remainingCategories,
          };
        });
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
        set((state) => ({ heroSlides: [...state.heroSlides, slide] }));
      },
      updateHeroSlide: (slide) => {
        set((state) => ({
          heroSlides: state.heroSlides.map((s) => (s.id === slide.id ? slide : s)),
        }));
      },
      deleteHeroSlide: (id) => {
        set((state) => ({
          heroSlides: state.heroSlides.filter((s) => s.id !== id),
        }));
      },
      updatePromoBanner: (banner) => {
        set({ promoBanner: banner });
      },
      updateSocialLinks: (links) => {
        set({ socialLinks: links });
      },
      updateHeroBanner: (banner) => {
        // keep for legacy compatibility, no-op or copy to slides
        set({ heroBanner: banner });
      },
    }),
    {
      name: "jiri-admin-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        brands: state.brands,
        categories: state.categories,
        heroSlides: state.heroSlides,
        promoBanner: state.promoBanner,
        socialLinks: state.socialLinks,
        // keep heroBanner for backward migration
        heroBanner: state.heroBanner,
      }),
    }
  )
);
