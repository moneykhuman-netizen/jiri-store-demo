"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2 } from "lucide-react";
import {
  CATEGORY_CARD_LINKS,
  FeaturedCollectionSettings,
  HERO_BUTTON_LINKS,
  HeroSection,
  HeroSlide,
  HomepageCategoryCard,
  PromoBanner,
  SocialLinks,
  useAdminStore,
} from "@/lib/admin-store";
import { saveHomepageCategoriesToFirebase } from "@/lib/firebase/categories";
import { saveFeaturedCollectionToFirebase } from "@/lib/firebase/featured";
import { saveHeroSlidesToFirebase } from "@/lib/firebase/hero";
import { saveNewArrivalsCollectionToFirebase } from "@/lib/firebase/new-arrivals";
import { savePromoBannerToFirebase } from "@/lib/firebase/promo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const createEmptySlide = (section: HeroSection = "women"): HeroSlide => ({
  id: "",
  badge: "",
  title: "",
  description: "",
  buttonText: "",
  image: "",
  section,
});

export default function HomepageSettingsPage() {
  const slides = useAdminStore((s) => s.heroSlides);
  const addHeroSlide = useAdminStore((s) => s.addHeroSlide);
  const updateHeroSlide = useAdminStore((s) => s.updateHeroSlide);
  const deleteHeroSlide = useAdminStore((s) => s.deleteHeroSlide);
  const homepageCategories = useAdminStore((s) => s.homepageCategories);
  const updateHomepageCategory = useAdminStore((s) => s.updateHomepageCategory);
  const products = useAdminStore((s) => s.products);
  const featuredCollection = useAdminStore((s) => s.featuredCollection);
  const updateFeaturedCollection = useAdminStore((s) => s.updateFeaturedCollection);
  const newArrivalsCollection = useAdminStore((s) => s.newArrivalsCollection);
  const updateNewArrivalsCollection = useAdminStore((s) => s.updateNewArrivalsCollection);
  const promo = useAdminStore((s) => s.promoBanner);
  const updatePromo = useAdminStore((s) => s.updatePromoBanner);
  const social = useAdminStore((s) => s.socialLinks);
  const updateSocial = useAdminStore((s) => s.updateSocialLinks);

  const [activeTab, setActiveTab] = useState("hero");
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideForm, setSlideForm] = useState<HeroSlide>(createEmptySlide());
  const [slideImageError, setSlideImageError] = useState<string | null>(null);
  const [categoryForms, setCategoryForms] = useState<
    Record<HeroSection, HomepageCategoryCard>
  >(homepageCategories);
  const [featuredForm, setFeaturedForm] = useState<FeaturedCollectionSettings>(
    featuredCollection
  );
  const [newArrivalsForm, setNewArrivalsForm] = useState<FeaturedCollectionSettings>(
    newArrivalsCollection
  );
  const [promoForm, setPromoForm] = useState<PromoBanner>(promo);
  const [socialForm, setSocialForm] = useState<SocialLinks>(social);
  const availableProductIds = new Set(products.map((product) => product.id));

  useEffect(() => {
    setCategoryForms(homepageCategories);
  }, [homepageCategories]);

  useEffect(() => {
    setFeaturedForm(featuredCollection);
  }, [featuredCollection]);

  useEffect(() => {
    setNewArrivalsForm(newArrivalsCollection);
  }, [newArrivalsCollection]);

  const resetSlideForm = (section: HeroSection = slideForm.section) => {
    setSlideForm(createEmptySlide(section));
    setSlideImageError(null);
    setEditingSlide(null);
  };

  const handleSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const image = slideForm.image.trim();

    if (!image) {
      setSlideImageError("Hero image is required.");
      return;
    }

    const nextSlide = {
      ...slideForm,
      image,
    };

    if (editingSlide) {
      updateHeroSlide(nextSlide);
    } else {
      addHeroSlide({ ...nextSlide, id: Date.now().toString() });
    }

    const latestSlides = useAdminStore.getState().heroSlides;
    resetSlideForm(nextSlide.section);

    console.log("[Hero Firebase][admin] Local Hero slide save succeeded", {
      latestSlidesLength: latestSlides.length,
    });
    console.log("[Hero Firebase][admin] Starting remote Firebase write for Hero slides", {
      latestSlidesLength: latestSlides.length,
    });

    void (async () => {
      try {
        await saveHeroSlidesToFirebase(latestSlides);
      } catch (error) {
        console.error("Failed to save hero slides to Firebase:", error);
      }
    })();
  };

  const handleDeleteSlide = (id: string) => {
    if (editingSlide?.id === id) {
      resetSlideForm(slideForm.section);
    }

    deleteHeroSlide(id);
    const latestSlides = useAdminStore.getState().heroSlides;

    console.log("[Hero Firebase][admin] Local Hero slide delete succeeded", {
      latestSlidesLength: latestSlides.length,
    });
    console.log("[Hero Firebase][admin] Starting remote Firebase write for Hero slides", {
      latestSlidesLength: latestSlides.length,
    });

    void (async () => {
      try {
        await saveHeroSlidesToFirebase(latestSlides);
      } catch (error) {
        console.error("Failed to save hero slides to Firebase:", error);
      }
    })();
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updatePromo(promoForm);
    await savePromoBannerToFirebase(promoForm);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateHomepageCategory(categoryForms.men);
    updateHomepageCategory(categoryForms.women);
    await saveHomepageCategoriesToFirebase({
      men: categoryForms.men,
      women: categoryForms.women,
    });
  };

  const handleFeaturedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateFeaturedCollection({
      ...featuredForm,
      title: featuredForm.title.trim(),
      description: featuredForm.description.trim(),
      productIds: featuredForm.productIds.filter(
        (productId, index, productIds) =>
          availableProductIds.has(productId) && productIds.indexOf(productId) === index
      ),
    });

    const latestFeaturedCollection = useAdminStore.getState().featuredCollection;

    void (async () => {
      try {
        await saveFeaturedCollectionToFirebase(latestFeaturedCollection);
      } catch (error) {
        console.error("Failed to save featured collection to Firebase:", error);
      }
    })();
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocial(socialForm);
  };

  const handleNewArrivalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateNewArrivalsCollection({
      ...newArrivalsForm,
      title: newArrivalsForm.title.trim(),
      description: newArrivalsForm.description.trim(),
      productIds: newArrivalsForm.productIds.filter(
        (productId, index, productIds) =>
          availableProductIds.has(productId) && productIds.indexOf(productId) === index
      ),
    });

    const latestNewArrivalsCollection = useAdminStore.getState().newArrivalsCollection;

    void (async () => {
      try {
        await saveNewArrivalsCollectionToFirebase(latestNewArrivalsCollection);
      } catch (error) {
        console.error("Failed to save new arrivals collection to Firebase:", error);
      }
    })();
  };

  const validFeaturedProductIds = featuredForm.productIds.filter(
    (productId, index, productIds) =>
      availableProductIds.has(productId) &&
      productIds.indexOf(productId) === index
  );
  const selectedFeaturedIds = new Set(validFeaturedProductIds);
  const validNewArrivalsProductIds = newArrivalsForm.productIds.filter(
    (productId, index, productIds) =>
      availableProductIds.has(productId) &&
      productIds.indexOf(productId) === index
  );
  const selectedNewArrivalsIds = new Set(validNewArrivalsProductIds);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Homepage Settings</h1>
          <p className="text-muted-foreground">Manage homepage content</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="categories">Category Cards</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
          <TabsTrigger value="promo">Promo Banner</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Existing Slides</CardTitle>
              <CardDescription>Manage homepage hero slides</CardDescription>
            </CardHeader>
            <CardContent>
              {slides.length === 0 ? (
                <p className="text-muted-foreground">No slides added yet</p>
              ) : (
                <div className="space-y-4">
                  {slides.map((slide) => (
                    <div
                      key={slide.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{slide.title || "(no title)"}</p>
                        <p className="text-xs text-muted-foreground">
                          {slide.section === "men" ? "Men" : "Women"} hero
                          {slide.badge ? ` - ${slide.badge}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingSlide(slide);
                            setSlideForm({ ...slide });
                            setSlideImageError(null);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSlide(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSlideSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</CardTitle>
                <CardDescription>
                  Each slide should include image, text and section. CTA routing is fixed by section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={slideForm.section}
                  onValueChange={(value: HeroSection) =>
                    setSlideForm({ ...slideForm, section: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men&apos;s Hero</SelectItem>
                    <SelectItem value="women">Women&apos;s Hero</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Badge"
                  value={slideForm.badge}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, badge: e.target.value })
                  }
                />

                <Input
                  placeholder="Title"
                  value={slideForm.title}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, title: e.target.value })
                  }
                />

                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={slideForm.description}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, description: e.target.value })
                  }
                />

                <Input
                  placeholder="Button Text"
                  value={slideForm.buttonText}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, buttonText: e.target.value })
                  }
                />

                <p className="text-sm text-muted-foreground">
                  CTA destination: {HERO_BUTTON_LINKS[slideForm.section]}
                </p>

                <Input
                  placeholder="Image URL"
                  value={slideForm.image}
                  aria-invalid={Boolean(slideImageError)}
                  onChange={(e) => {
                    const image = e.target.value;
                    setSlideForm({ ...slideForm, image });
                    if (slideImageError && image.trim()) {
                      setSlideImageError(null);
                    }
                  }}
                />
                {slideImageError ? (
                  <p className="text-sm text-destructive">{slideImageError}</p>
                ) : null}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              {editingSlide && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => resetSlideForm()}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingSlide ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="categories">
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shop By Category Cards</CardTitle>
                <CardDescription>
                  Update the content for the men&apos;s and women&apos;s category cards. Routing stays fixed by section.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {(["men", "women"] as HeroSection[]).map((section) => {
                  const card = categoryForms[section];

                  return (
                    <div
                      key={section}
                      className="space-y-4 rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {section === "men" ? "Men's Card" : "Women's Card"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Explore route: {CATEGORY_CARD_LINKS[section]}
                        </p>
                      </div>

                      <Input
                        placeholder="Top Label (optional)"
                        value={card.label}
                        onChange={(e) =>
                          setCategoryForms((prev) => ({
                            ...prev,
                            [section]: {
                              ...prev[section],
                              label: e.target.value,
                            },
                          }))
                        }
                      />

                      <Input
                        placeholder="Title"
                        value={card.title}
                        onChange={(e) =>
                          setCategoryForms((prev) => ({
                            ...prev,
                            [section]: {
                              ...prev[section],
                              title: e.target.value,
                            },
                          }))
                        }
                      />

                      <Input
                        placeholder="Subtitle / Description"
                        value={card.description}
                        onChange={(e) =>
                          setCategoryForms((prev) => ({
                            ...prev,
                            [section]: {
                              ...prev[section],
                              description: e.target.value,
                            },
                          }))
                        }
                      />

                      <Input
                        placeholder="Image URL"
                        value={card.image}
                        onChange={(e) =>
                          setCategoryForms((prev) => ({
                            ...prev,
                            [section]: {
                              ...prev[section],
                              image: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Category Cards
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="featured">
          <form onSubmit={handleFeaturedSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Featured Collection</CardTitle>
                <CardDescription>
                  Choose which products appear on the homepage featured grid. Product cards and
                  the View All link stay unchanged.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Section Title"
                    value={featuredForm.title}
                    onChange={(e) =>
                      setFeaturedForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />

                  <Textarea
                    placeholder="Section Description"
                    rows={2}
                    value={featuredForm.description}
                    onChange={(e) =>
                      setFeaturedForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />

                  <p className="text-sm text-muted-foreground">
                    Selected products: {validFeaturedProductIds.length}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Choose Products</p>
                    <p className="text-sm text-muted-foreground">
                      Selected products are saved in the admin store and shown in the same product
                      card layout on the homepage.
                    </p>
                  </div>

                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products available yet.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {products.map((product) => {
                        const checkboxId = `featured-product-${product.id}`;
                        const isChecked = selectedFeaturedIds.has(product.id);

                        return (
                          <div
                            key={product.id}
                            className="flex items-start gap-3 rounded-lg border border-border p-4"
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                setFeaturedForm((prev) => ({
                                  ...prev,
                                  productIds:
                                    checked === true
                                      ? prev.productIds.includes(product.id)
                                        ? prev.productIds
                                        : [...prev.productIds, product.id]
                                      : prev.productIds.filter(
                                          (productId) => productId !== product.id
                                        ),
                                }))
                              }
                            />
                            <Label
                              htmlFor={checkboxId}
                              className="flex-1 cursor-pointer flex-col items-start gap-1"
                            >
                              <span className="text-sm font-medium leading-none">
                                {product.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {product.brand} | {product.category} | Rs. {product.price}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Featured Collection
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="new-arrivals">
          <form onSubmit={handleNewArrivalsSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Arrivals</CardTitle>
                <CardDescription>
                  Choose which products appear on the homepage new arrivals grid. Product cards and
                  the View All link stay unchanged.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Section Title"
                    value={newArrivalsForm.title}
                    onChange={(e) =>
                      setNewArrivalsForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />

                  <Textarea
                    placeholder="Section Description"
                    rows={2}
                    value={newArrivalsForm.description}
                    onChange={(e) =>
                      setNewArrivalsForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />

                  <p className="text-sm text-muted-foreground">
                    Selected products: {validNewArrivalsProductIds.length}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Choose Products</p>
                    <p className="text-sm text-muted-foreground">
                      Selected products are saved in the admin store and shown in the same product
                      card layout on the homepage.
                    </p>
                  </div>

                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products available yet.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {products.map((product) => {
                        const checkboxId = `new-arrivals-product-${product.id}`;
                        const isChecked = selectedNewArrivalsIds.has(product.id);

                        return (
                          <div
                            key={product.id}
                            className="flex items-start gap-3 rounded-lg border border-border p-4"
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                setNewArrivalsForm((prev) => ({
                                  ...prev,
                                  productIds:
                                    checked === true
                                      ? prev.productIds.includes(product.id)
                                        ? prev.productIds
                                        : [...prev.productIds, product.id]
                                      : prev.productIds.filter(
                                          (productId) => productId !== product.id
                                        ),
                                }))
                              }
                            />
                            <Label
                              htmlFor={checkboxId}
                              className="flex-1 cursor-pointer flex-col items-start gap-1"
                            >
                              <span className="text-sm font-medium leading-none">
                                {product.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {product.brand} | {product.category} | Rs. {product.price}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save New Arrivals
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="promo">
          <form onSubmit={handlePromoSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promo Banner</CardTitle>
                <CardDescription>Modify promo section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Badge"
                  value={promoForm.badge}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, badge: e.target.value })
                  }
                />
                <Input
                  placeholder="Title"
                  value={promoForm.title}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, description: e.target.value })
                  }
                />
                <Input
                  placeholder="Code (used inline)"
                  value={promoForm.code}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, code: e.target.value })
                  }
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Promo
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="social">
          <form onSubmit={handleSocialSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>URLs for footer icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Facebook URL"
                  value={socialForm.facebook}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, facebook: e.target.value })
                  }
                />
                <Input
                  placeholder="Instagram URL"
                  value={socialForm.instagram}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, instagram: e.target.value })
                  }
                />
                <Input
                  placeholder="WhatsApp URL or wa.me link"
                  value={socialForm.whatsapp}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, whatsapp: e.target.value })
                  }
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Links
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
