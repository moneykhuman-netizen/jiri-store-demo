"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

// Admin credentials (in a real app, this would be server-side)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "jiri2024",
};

export interface AdminProduct extends Product {
  stock: number;
}

interface AdminState {
  isAuthenticated: boolean;
  products: AdminProduct[];
  brands: string[];
  categories: { men: string[]; women: string[] };
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addProduct: (product: AdminProduct) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  addCategory: (gender: "men" | "women", category: string) => void;
  removeCategory: (gender: "men" | "women", category: string) => void;
}

// Convert existing products to AdminProducts with stock
import { products as initialProducts, brands as initialBrands, types as initialTypes } from "./products";

const initialAdminProducts: AdminProduct[] = initialProducts.map((p) => ({
  ...p,
  stock: Math.floor(Math.random() * 50) + 10,
}));

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      products: initialAdminProducts,
      brands: initialBrands,
      categories: initialTypes,

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
        set((state) => ({
          products: [...state.products, product],
        }));
      },

      updateProduct: (id: string, updates: Partial<AdminProduct>) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      addBrand: (brand: string) => {
        const state = get();
        if (!state.brands.includes(brand)) {
          set({ brands: [...state.brands, brand] });
        }
      },

      removeBrand: (brand: string) => {
        set((state) => ({
          brands: state.brands.filter((b) => b !== brand),
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
    }),
    {
      name: "jiri-admin-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        brands: state.brands,
        categories: state.categories,
      }),
    }
  )
);
