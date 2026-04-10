export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "men" | "women";
  type: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  sizes: number[];
  colors: string[];
  images: string[];
  description: string;
  features: string[];
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  stock?: number;
  sizeInventory?: ProductSizeInventory[];
  videoUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductSizeInventory {
  size: number;
  stock: number;
}

export const brands = [
  "Nike",
  "Adidas",
  "Puma",
  "Reebok",
  "New Balance",
  "Skechers",
  "Woodland",
  "Bata",
  "Red Tape",
  "Clarks",
];

export const featuredBrands = [
  "Nike",
  "Puma", 
  "Adidas",
  "Reebok",
  "Skechers",
  "New Balance",
];

export const types = {
  men: ["Sneakers", "Formal", "Sports", "Sandals", "Loafers", "Boots"],
  women: ["Heels", "Flats", "Sneakers", "Sandals", "Wedges", "Boots"],
};

export const sizes = {
  men: [6, 7, 8, 9, 10, 11, 12],
  women: [4, 5, 6, 7, 8, 9],
};

export const products: Product[] = [
  // Men's Products
  {
    id: "m1",
    name: "Air Max Velocity Pro",
    brand: "Nike",
    category: "men",
    type: "Sneakers",
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    rating: 4.5,
    reviews: 2847,
    sizes: [7, 8, 9, 10, 11],
    colors: ["Black/White", "Navy Blue", "Grey"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
    description: "Experience ultimate comfort with the Air Max Velocity Pro. Featuring responsive cushioning and a breathable mesh upper, these sneakers are perfect for both athletic performance and everyday wear.",
    features: ["Air cushioning technology", "Breathable mesh upper", "Rubber outsole", "Lightweight design"],
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "m2",
    name: "Classic Leather Oxford",
    brand: "Clarks",
    category: "men",
    type: "Formal",
    price: 6499,
    originalPrice: 8999,
    discount: 28,
    rating: 4.7,
    reviews: 1523,
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ["Black", "Brown", "Tan"],
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80",
    ],
    description: "Elevate your formal attire with these timeless leather oxfords. Handcrafted with premium leather and featuring a cushioned insole for all-day comfort.",
    features: ["Genuine leather", "Cushioned insole", "Durable sole", "Classic design"],
    inStock: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "m3",
    name: "Ultraboost Running Shoe",
    brand: "Adidas",
    category: "men",
    type: "Sports",
    price: 11999,
    originalPrice: 16999,
    discount: 29,
    rating: 4.8,
    reviews: 3241,
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["Core Black", "Cloud White", "Solar Red"],
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80",
    ],
    description: "Unleash your running potential with Ultraboost technology. These shoes provide exceptional energy return and a responsive ride.",
    features: ["Boost midsole", "Primeknit upper", "Continental rubber outsole", "Torsion system"],
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "m4",
    name: "Woodland Adventure Boot",
    brand: "Woodland",
    category: "men",
    type: "Boots",
    price: 5999,
    originalPrice: 7999,
    discount: 25,
    rating: 4.4,
    reviews: 1876,
    sizes: [7, 8, 9, 10, 11],
    colors: ["Camel Brown", "Olive Green", "Black"],
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80",
    ],
    description: "Built for adventure, these rugged boots feature waterproof construction and superior ankle support for all terrains.",
    features: ["Waterproof leather", "Anti-skid sole", "Padded collar", "Steel shank support"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "m5",
    name: "Suede Penny Loafer",
    brand: "Hush Puppies",
    category: "men",
    type: "Loafers",
    price: 4299,
    originalPrice: 5999,
    discount: 28,
    rating: 4.3,
    reviews: 987,
    sizes: [6, 7, 8, 9, 10],
    colors: ["Navy", "Brown", "Grey"],
    images: [
      "https://images.unsplash.com/photo-1626947346165-4c2288dadc2a?w=800&q=80",
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80",
    ],
    description: "Classic penny loafers crafted from premium suede, perfect for smart casual occasions.",
    features: ["Suede upper", "Memory foam insole", "Flexible outsole", "Slip-on design"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "m6",
    name: "RS-X Reinvention",
    brand: "Puma",
    category: "men",
    type: "Sneakers",
    price: 7499,
    originalPrice: 10999,
    discount: 32,
    rating: 4.6,
    reviews: 2134,
    sizes: [7, 8, 9, 10, 11],
    colors: ["White/Royal", "Black/Red", "Grey/Teal"],
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    ],
    description: "Bold chunky sneakers with retro-futuristic design. The RS-X features running system technology for superior comfort.",
    features: ["RS cushioning", "Chunky silhouette", "Mesh and leather upper", "Bold colorways"],
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "m7",
    name: "Fresh Foam 1080",
    brand: "New Balance",
    category: "men",
    type: "Sports",
    price: 9999,
    originalPrice: 14999,
    discount: 33,
    rating: 4.7,
    reviews: 1654,
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["Black/White", "Blue/Orange", "Grey/Lime"],
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
      "https://images.unsplash.com/photo-1584735175315-9d5df23be2c0?w=800&q=80",
    ],
    description: "Premium cushioned running shoe with Fresh Foam X midsole technology for plush comfort mile after mile.",
    features: ["Fresh Foam X midsole", "Hypoknit upper", "Blown rubber outsole", "Ultra heel design"],
    inStock: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: "m8",
    name: "Comfort Floater Sandal",
    brand: "Bata",
    category: "men",
    type: "Sandals",
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    rating: 4.1,
    reviews: 3456,
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ["Black", "Brown", "Navy"],
    images: [
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80",
    ],
    description: "Everyday comfort sandals with adjustable straps and cushioned footbed for all-day wear.",
    features: ["Adjustable straps", "Cushioned footbed", "Lightweight construction", "Non-slip sole"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
  // Women's Products
  {
    id: "w1",
    name: "Elegant Stiletto Pump",
    brand: "Clarks",
    category: "women",
    type: "Heels",
    price: 5999,
    originalPrice: 7999,
    discount: 25,
    rating: 4.6,
    reviews: 1234,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Black", "Nude", "Red"],
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&q=80",
    ],
    description: "Classic stiletto pumps that add elegance to any outfit. Features a cushioned insole for comfortable all-day wear.",
    features: ["4-inch heel", "Cushioned insole", "Slip-resistant sole", "Premium leather"],
    inStock: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "w2",
    name: "Air Zoom Pegasus",
    brand: "Nike",
    category: "women",
    type: "Sneakers",
    price: 8499,
    originalPrice: 11999,
    discount: 29,
    rating: 4.8,
    reviews: 2876,
    sizes: [4, 5, 6, 7, 8, 9],
    colors: ["Pink/White", "Black/Rose Gold", "Grey/Mint"],
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
    ],
    description: "Versatile running shoes with responsive Zoom Air cushioning and a sleek, modern design perfect for both workouts and casual wear.",
    features: ["Zoom Air unit", "Engineered mesh", "Flywire cables", "Waffle outsole"],
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "w3",
    name: "Ballet Flat Elegance",
    brand: "Bata",
    category: "women",
    type: "Flats",
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    rating: 4.4,
    reviews: 1567,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Black", "Nude", "Navy", "Blush"],
    images: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
      "https://images.unsplash.com/photo-1563659702664-6f75cd7f1f9b?w=800&q=80",
    ],
    description: "Timeless ballet flats with a bow detail, perfect for everyday elegance and comfort.",
    features: ["Soft leather lining", "Padded insole", "Rubber outsole", "Bow detail"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "w4",
    name: "Platform Wedge Sandal",
    brand: "Red Tape",
    category: "women",
    type: "Wedges",
    price: 3999,
    originalPrice: 5499,
    discount: 27,
    rating: 4.3,
    reviews: 876,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Tan", "Black", "White"],
    images: [
      "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=800&q=80",
      "https://images.unsplash.com/photo-1590099033615-be195f8d575c?w=800&q=80",
    ],
    description: "Stylish platform wedges with braided detail, perfect for summer outings and casual occasions.",
    features: ["3-inch wedge heel", "Braided jute platform", "Adjustable ankle strap", "Cushioned footbed"],
    inStock: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: "w5",
    name: "Stan Smith Classic",
    brand: "Adidas",
    category: "women",
    type: "Sneakers",
    price: 6999,
    originalPrice: 9999,
    discount: 30,
    rating: 4.7,
    reviews: 3421,
    sizes: [4, 5, 6, 7, 8, 9],
    colors: ["White/Green", "White/Navy", "All White"],
    images: [
      "https://images.unsplash.com/photo-1603808033176-9d134e6f2c74?w=800&q=80",
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80",
    ],
    description: "Iconic tennis-inspired sneakers with clean lines and timeless appeal. A wardrobe essential.",
    features: ["Leather upper", "Perforated 3-Stripes", "Rubber cupsole", "OrthoLite sockliner"],
    inStock: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "w6",
    name: "Strappy Block Heel",
    brand: "Clarks",
    category: "women",
    type: "Heels",
    price: 4499,
    originalPrice: 5999,
    discount: 25,
    rating: 4.5,
    reviews: 1123,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Black", "Tan", "Burgundy"],
    images: [
      "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=80",
      "https://images.unsplash.com/photo-1596091508045-367f69e2e8df?w=800&q=80",
    ],
    description: "Versatile block heels with elegant strappy design, comfortable enough for all-day wear.",
    features: ["2.5-inch block heel", "Ankle strap", "Cushion Plus technology", "Flexible outsole"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "w7",
    name: "Cali Sport Sneaker",
    brand: "Puma",
    category: "women",
    type: "Sneakers",
    price: 5499,
    originalPrice: 7999,
    discount: 31,
    rating: 4.6,
    reviews: 1876,
    sizes: [4, 5, 6, 7, 8, 9],
    colors: ["White/Pink", "Black/Gold", "Pastel Mix"],
    images: [
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80",
      "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=800&q=80",
    ],
    description: "Fashion-forward platform sneakers with bold design elements, perfect for making a statement.",
    features: ["Platform sole", "Leather upper", "Rubber outsole", "Lace closure"],
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "w8",
    name: "Casual Slide Sandal",
    brand: "Reebok",
    category: "women",
    type: "Sandals",
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    rating: 4.2,
    reviews: 2134,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Black", "White", "Pink"],
    images: [
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80",
    ],
    description: "Comfortable slide sandals with contoured footbed, perfect for poolside or casual wear.",
    features: ["Synthetic upper", "Contoured footbed", "Slip-on design", "Lightweight"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "w9",
    name: "Chelsea Ankle Boot",
    brand: "Hush Puppies",
    category: "women",
    type: "Boots",
    price: 5499,
    originalPrice: 7499,
    discount: 27,
    rating: 4.5,
    reviews: 987,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Black", "Brown", "Tan"],
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
      "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&q=80",
    ],
    description: "Classic Chelsea boots with elastic side panels for easy on/off and timeless style.",
    features: ["Leather upper", "Elastic side panels", "Stacked heel", "Pull tab"],
    inStock: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: "w10",
    name: "Suede Loafer Mule",
    brand: "Bata",
    category: "women",
    type: "Flats",
    price: 2999,
    originalPrice: 4299,
    discount: 30,
    rating: 4.3,
    reviews: 654,
    sizes: [4, 5, 6, 7, 8],
    colors: ["Blush", "Black", "Olive"],
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&q=80",
    ],
    description: "Chic loafer mules in soft suede, combining comfort with effortless style.",
    features: ["Suede upper", "Backless design", "Cushioned insole", "Low heel"],
    inStock: true,
    isFeatured: false,
    isNew: false,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: "men" | "women"): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNew);
}

export function filterProducts(
  category?: "men" | "women",
  brand?: string,
  type?: string,
  minPrice?: number,
  maxPrice?: number,
  size?: number
): Product[] {
  return products.filter((p) => {
    if (category && p.category !== category) return false;
    if (brand && p.brand !== brand) return false;
    if (type && p.type !== type) return false;
    if (minPrice && p.price < minPrice) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (size && !p.sizes.includes(size)) return false;
    return true;
  });
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.type.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}
