export type CanonicalTimestamp = string | number | Date;

export type CanonicalProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string;
  category: string;
  images: string[];
  videoUrl?: string;
  stock: number;
  inStock: boolean;
  sizeInventory: Record<string, number>;
  featured: boolean;
  newArrival: boolean;
  description?: string;
  colors?: string[];
  sizes?: string[];
  createdAt?: CanonicalTimestamp;
  updatedAt?: CanonicalTimestamp;
};
