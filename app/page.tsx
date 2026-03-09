import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { CategoriesSection } from "@/components/categories-section";
import { FeaturedProducts } from "@/components/featured-products";
import { BrandsSection } from "@/components/brands-section";
import { NewArrivals } from "@/components/new-arrivals";
import { PromoSection } from "@/components/promo-section";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <BrandsSection />
      <FeaturedProducts />
      <PromoSection />
      <NewArrivals />
      <Footer />
    </main>
  );
}
