import { type Product, products as seedProducts } from "./products";

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

export interface LegacyHeroBanner {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export interface SharedSiteData {
  products: Product[];
  brands: string[];
  brandPresentations: Record<string, BrandPresentation>;
  categories: { men: string[]; women: string[] };
  heroSlides: HeroSlide[];
  homepageCategories: Record<HeroSection, HomepageCategoryCard>;
  featuredCollection: FeaturedCollectionSettings;
  promoBanner: PromoBanner;
  socialLinks: SocialLinks;
  heroBanner: LegacyHeroBanner;
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

const DEFAULT_PROMO_BANNER: PromoBanner = {
  badge: "Limited Time Offer",
  title: "Flat 30% Off on First Order",
  description: "Use code STEPSTYLE30 at checkout. Valid for new customers only.",
  code: "STEPSTYLE30",
};

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  facebook: "",
  instagram: "",
  whatsapp: "",
};

const DEFAULT_HERO_BANNER: LegacyHeroBanner = {
  badge: "ELEGANCE REDEFINED",
  title: "Women's Collection",
  description: "Heels, flats, sneakers and more. Style that speaks volumes.",
  buttonText: "Shop Women",
  buttonLink: HERO_BUTTON_LINKS.women,
  image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80",
};

const DEFAULT_BRAND_PRESENTATIONS: Record<string, Partial<BrandPresentation>> = {
  Nike: { tagline: "Just Do It" },
  Adidas: { tagline: "Impossible is Nothing" },
  Puma: { tagline: "Forever Faster" },
  Reebok: { tagline: "Be More Human" },
  Skechers: { tagline: "Comfort Tech" },
  "New Balance": { tagline: "Fresh Foam" },
};

export type PersistedHeroSlide = Partial<HeroSlide> & {
  buttonLink?: string;
};

export type PersistedBrandPresentation = Partial<BrandPresentation>;

export type PersistedHomepageCategoryCard = Partial<HomepageCategoryCard> & {
  id?: string;
  count?: string;
};

const isBrandTheme = (theme: string): theme is BrandTheme =>
  BRAND_THEME_OPTIONS.includes(theme as BrandTheme);

export const normalizeBrandPresentation = (
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

export const syncBrandPresentations = (
  brands: string[],
  presentations?: Record<string, PersistedBrandPresentation>
): Record<string, BrandPresentation> =>
  Object.fromEntries(
    brands.map((brand) => [
      brand,
      normalizeBrandPresentation(brand, presentations?.[brand]),
    ])
  );

export const deriveCatalogCollections = (products: Product[]) => {
  const brandSet = new Set<string>();
  const menTypes = new Set<string>();
  const womenTypes = new Set<string>();

  products.forEach((product) => {
    brandSet.add(product.brand);

    if (product.category === "men") {
      menTypes.add(product.type);
    } else if (product.category === "women") {
      womenTypes.add(product.type);
    }
  });

  return {
    brands: Array.from(brandSet),
    categories: {
      men: Array.from(menTypes),
      women: Array.from(womenTypes),
    },
  };
};

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

export const normalizeHeroSlide = (
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

export const normalizeHeroSlides = (slides?: PersistedHeroSlide[]): HeroSlide[] => {
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

export const normalizeHomepageCategoryCard = (
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

export const normalizeHomepageCategories = (
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

export const getDefaultFeaturedCollection = (
  products: Product[]
): FeaturedCollectionSettings => ({
  ...FEATURED_COLLECTION_COPY_DEFAULTS,
  productIds: products.filter((product) => product.isFeatured).map((product) => product.id),
});

export const normalizeFeaturedCollection = (
  featuredCollection: Partial<FeaturedCollectionSettings> | undefined,
  products: Product[]
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

const cloneProduct = (product: Product): Product => ({
  ...product,
  sizes: [...product.sizes],
  colors: [...product.colors],
  images: [...product.images],
  features: [...product.features],
});

export const createSharedSiteData = (): SharedSiteData => {
  const products = seedProducts.map(cloneProduct);
  const derivedCollections = deriveCatalogCollections(products);

  return {
    products,
    brands: derivedCollections.brands,
    brandPresentations: syncBrandPresentations(derivedCollections.brands),
    categories: derivedCollections.categories,
    heroSlides: HERO_DEFAULT_SLIDES.map((slide) => ({ ...slide })),
    homepageCategories: normalizeHomepageCategories(),
    featuredCollection: getDefaultFeaturedCollection(products),
    promoBanner: { ...DEFAULT_PROMO_BANNER },
    socialLinks: { ...DEFAULT_SOCIAL_LINKS },
    heroBanner: { ...DEFAULT_HERO_BANNER },
  };
};

export const sharedSiteData = createSharedSiteData();
