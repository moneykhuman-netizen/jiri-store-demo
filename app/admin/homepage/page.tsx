"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, ImagePlus, Save, Trash2, Upload } from "lucide-react";
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
import {
  uploadHomepageCategoryImage,
  uploadHomepageHeroImage,
} from "@/lib/firebase/storage";
import {
  getActionFeedbackClassName,
  getActionFeedbackLabel,
  useActionFeedback,
} from "@/hooks/use-action-feedback";
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
import { cn } from "@/lib/utils";

const HERO_SUBMIT_LABELS = {
  idle: "Add Slide",
  running: "Saving...",
  success: "Saved ✓",
  error: "Retry",
};

const HERO_UPDATE_LABELS = {
  idle: "Update Slide",
  running: "Saving...",
  success: "Saved ✓",
  error: "Retry",
};

const HERO_UPLOAD_LABELS = {
  idle: "Upload Hero Image",
  running: "Uploading...",
  success: "Uploaded ✓",
  error: "Retry",
};

const CATEGORY_UPLOAD_LABELS = {
  idle: "Upload Image",
  running: "Uploading...",
  success: "Uploaded ✓",
  error: "Retry",
};

const SAVE_LABELS = {
  idle: "Save",
  running: "Saving...",
  success: "Saved ✓",
  error: "Retry",
};

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
  const [slideUploadFile, setSlideUploadFile] = useState<File | null>(null);
  const [slideUploadInputKey, setSlideUploadInputKey] = useState(0);
  const [slideActionError, setSlideActionError] = useState<string | null>(null);
  const [categoryActionError, setCategoryActionError] = useState<string | null>(null);
  const [categoryUploadFiles, setCategoryUploadFiles] = useState<
    Record<HeroSection, File | null>
  >({
    men: null,
    women: null,
  });
  const [categoryUploadInputKeys, setCategoryUploadInputKeys] = useState<
    Record<HeroSection, number>
  >({
    men: 0,
    women: 0,
  });
  const { statuses, setStatus, resetStatus, runAction } = useActionFeedback({
    heroSubmit: "idle",
    heroImageUpload: "idle",
    categoriesSubmit: "idle",
    featuredSubmit: "idle",
    newArrivalsSubmit: "idle",
    promoSubmit: "idle",
    socialSubmit: "idle",
    categoryMenUpload: "idle",
    categoryWomenUpload: "idle",
  });
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

  const clearSlideUploadInput = () => {
    setSlideUploadFile(null);
    setSlideUploadInputKey((currentKey) => currentKey + 1);
  };

  const clearCategoryUploadInput = (section: HeroSection) => {
    setCategoryUploadFiles((current) => ({
      ...current,
      [section]: null,
    }));
    setCategoryUploadInputKeys((current) => ({
      ...current,
      [section]: current[section] + 1,
    }));
  };

  const updateSlideForm = (updates: Partial<HeroSlide>) => {
    resetStatus("heroSubmit");
    setSlideActionError(null);
    setSlideForm((current) => ({
      ...current,
      ...updates,
    }));
  };

  const updateCategoryForm = (
    section: HeroSection,
    updates: Partial<HomepageCategoryCard>
  ) => {
    resetStatus("categoriesSubmit");
    setCategoryActionError(null);
    setCategoryForms((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...updates,
      },
    }));
  };

  const resetSlideForm = (section: HeroSection = slideForm.section) => {
    setSlideForm(createEmptySlide(section));
    setSlideImageError(null);
    setEditingSlide(null);
    setSlideActionError(null);
    clearSlideUploadInput();
    setStatus("heroImageUpload", "idle");
    setStatus("heroSubmit", "idle");
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const image = slideForm.image.trim();

    if (!image) {
      setSlideImageError("Hero image is required.");
      return;
    }

    const nextSlide = {
      ...slideForm,
      id: slideForm.id || editingSlide?.id || Date.now().toString(),
      image,
    };
    const wasEditingSlide = Boolean(editingSlide);

    try {
      await runAction("heroSubmit", async () => {
        if (wasEditingSlide) {
          updateHeroSlide(nextSlide);
        } else {
          addHeroSlide(nextSlide);
        }

        const latestSlides = useAdminStore.getState().heroSlides;
        await saveHeroSlidesToFirebase(latestSlides);
        resetSlideForm(nextSlide.section);
      });
    } catch (error) {
      console.error("Failed to save hero slides to Firebase:", error);
      setSlideActionError("We couldn't save that hero slide right now. Please try again.");
      setEditingSlide(nextSlide);
      setSlideForm(nextSlide);
    }
  };

  const handleSlideImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetStatus("heroImageUpload");
    setSlideActionError(null);

    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setSlideUploadFile(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      clearSlideUploadInput();
      setSlideActionError("Please choose an image file for the hero slide.");
      return;
    }

    setSlideUploadFile(nextFile);
  };

  const handleSlideImageUpload = async () => {
    if (!slideUploadFile) {
      return;
    }

    try {
      await runAction("heroImageUpload", async () => {
        const uploadedImageUrl = await uploadHomepageHeroImage(
          slideUploadFile,
          slideForm.section,
          slideForm.id || editingSlide?.id
        );

        updateSlideForm({ image: uploadedImageUrl });
        setSlideImageError(null);
        clearSlideUploadInput();
      });
    } catch (error) {
      console.error("Failed to upload hero image:", error);
      setSlideActionError("We couldn't upload that hero image right now. Please try again.");
    }
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

    try {
      await runAction("promoSubmit", async () => {
        updatePromo(promoForm);
        await savePromoBannerToFirebase(promoForm);
      });
    } catch (error) {
      console.error("Failed to save promo banner to Firebase:", error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await runAction("categoriesSubmit", async () => {
        updateHomepageCategory(categoryForms.men);
        updateHomepageCategory(categoryForms.women);
        await saveHomepageCategoriesToFirebase({
          men: categoryForms.men,
          women: categoryForms.women,
        });
      });
    } catch (error) {
      console.error("Failed to save homepage categories to Firebase:", error);
      setCategoryActionError("We couldn't save those category cards right now. Please try again.");
    }
  };

  const handleFeaturedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await runAction("featuredSubmit", async () => {
        updateFeaturedCollection({
          ...featuredForm,
          title: featuredForm.title.trim(),
          description: featuredForm.description.trim(),
          productIds: featuredForm.productIds.filter(
            (productId, index, productIds) =>
              availableProductIds.has(productId) &&
              productIds.indexOf(productId) === index
          ),
        });

        const latestFeaturedCollection = useAdminStore.getState().featuredCollection;
        await saveFeaturedCollectionToFirebase(latestFeaturedCollection);
      });
    } catch (error) {
      console.error("Failed to save featured collection to Firebase:", error);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await runAction("socialSubmit", () => {
        updateSocial(socialForm);
      });
    } catch (error) {
      console.error("Failed to save social links locally:", error);
    }
  };

  const handleNewArrivalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await runAction("newArrivalsSubmit", async () => {
        updateNewArrivalsCollection({
          ...newArrivalsForm,
          title: newArrivalsForm.title.trim(),
          description: newArrivalsForm.description.trim(),
          productIds: newArrivalsForm.productIds.filter(
            (productId, index, productIds) =>
              availableProductIds.has(productId) &&
              productIds.indexOf(productId) === index
          ),
        });

        const latestNewArrivalsCollection = useAdminStore.getState().newArrivalsCollection;
        await saveNewArrivalsCollectionToFirebase(latestNewArrivalsCollection);
      });
    } catch (error) {
      console.error("Failed to save new arrivals collection to Firebase:", error);
    }
  };

  const handleCategoryImageFileChange =
    (section: HeroSection) => (event: ChangeEvent<HTMLInputElement>) => {
      resetStatus(section === "men" ? "categoryMenUpload" : "categoryWomenUpload");
      setCategoryActionError(null);

      const nextFile = event.target.files?.[0] ?? null;
      if (!nextFile) {
        setCategoryUploadFiles((current) => ({
          ...current,
          [section]: null,
        }));
        return;
      }

      if (!nextFile.type.startsWith("image/")) {
        clearCategoryUploadInput(section);
        setCategoryActionError("Please choose an image file for the category card.");
        return;
      }

      setCategoryUploadFiles((current) => ({
        ...current,
        [section]: nextFile,
      }));
    };

  const handleCategoryImageUpload = async (section: HeroSection) => {
    const actionKey = section === "men" ? "categoryMenUpload" : "categoryWomenUpload";
    const nextFile = categoryUploadFiles[section];

    if (!nextFile) {
      return;
    }

    try {
      await runAction(actionKey, async () => {
        const uploadedImageUrl = await uploadHomepageCategoryImage(nextFile, section);
        updateCategoryForm(section, { image: uploadedImageUrl });
        clearCategoryUploadInput(section);
      });
    } catch (error) {
      console.error(`Failed to upload ${section} category image:`, error);
      setCategoryActionError("We couldn't upload that category image right now. Please try again.");
    }
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
                            setSlideActionError(null);
                            setStatus("heroSubmit", "idle");
                            setStatus("heroImageUpload", "idle");
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
                  onValueChange={(value: HeroSection) => updateSlideForm({ section: value })}
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
                  onChange={(e) => updateSlideForm({ badge: e.target.value })}
                />

                <Input
                  placeholder="Title"
                  value={slideForm.title}
                  onChange={(e) => updateSlideForm({ title: e.target.value })}
                />

                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={slideForm.description}
                  onChange={(e) => updateSlideForm({ description: e.target.value })}
                />

                <Input
                  placeholder="Button Text"
                  value={slideForm.buttonText}
                  onChange={(e) => updateSlideForm({ buttonText: e.target.value })}
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
                    updateSlideForm({ image });
                    if (slideImageError && image.trim()) {
                      setSlideImageError(null);
                    }
                  }}
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    key={slideUploadInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleSlideImageFileChange}
                    disabled={statuses.heroImageUpload === "running"}
                  />
                  <Button
                    type="button"
                    onClick={handleSlideImageUpload}
                    disabled={statuses.heroImageUpload === "running" || !slideUploadFile}
                    className={cn(getActionFeedbackClassName(statuses.heroImageUpload))}
                  >
                    <Upload className="h-4 w-4" />
                    {getActionFeedbackLabel(statuses.heroImageUpload, HERO_UPLOAD_LABELS)}
                  </Button>
                </div>
                {slideImageError ? (
                  <p className="text-sm text-destructive">{slideImageError}</p>
                ) : null}
                {slideActionError ? (
                  <p className="text-sm text-destructive">{slideActionError}</p>
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
              <Button
                type="submit"
                disabled={statuses.heroSubmit === "running"}
                className={cn(getActionFeedbackClassName(statuses.heroSubmit))}
              >
                <ImagePlus className="h-4 w-4" />
                {getActionFeedbackLabel(
                  statuses.heroSubmit,
                  editingSlide ? HERO_UPDATE_LABELS : HERO_SUBMIT_LABELS
                )}
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
                        onChange={(e) => updateCategoryForm(section, { label: e.target.value })}
                      />

                      <Input
                        placeholder="Title"
                        value={card.title}
                        onChange={(e) => updateCategoryForm(section, { title: e.target.value })}
                      />

                      <Input
                        placeholder="Subtitle / Description"
                        value={card.description}
                        onChange={(e) =>
                          updateCategoryForm(section, { description: e.target.value })
                        }
                      />

                      <Input
                        placeholder="Image URL"
                        value={card.image}
                        onChange={(e) => updateCategoryForm(section, { image: e.target.value })}
                      />

                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Input
                          key={categoryUploadInputKeys[section]}
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageFileChange(section)}
                          disabled={
                            statuses[section === "men" ? "categoryMenUpload" : "categoryWomenUpload"] ===
                            "running"
                          }
                        />
                        <Button
                          type="button"
                          onClick={() => handleCategoryImageUpload(section)}
                          disabled={
                            statuses[section === "men" ? "categoryMenUpload" : "categoryWomenUpload"] ===
                              "running" || !categoryUploadFiles[section]
                          }
                          className={cn(
                            getActionFeedbackClassName(
                              statuses[
                                section === "men" ? "categoryMenUpload" : "categoryWomenUpload"
                              ]
                            )
                          )}
                        >
                          <Upload className="h-4 w-4" />
                          {getActionFeedbackLabel(
                            statuses[
                              section === "men" ? "categoryMenUpload" : "categoryWomenUpload"
                            ],
                            CATEGORY_UPLOAD_LABELS
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {categoryActionError ? (
              <p className="text-sm text-destructive">{categoryActionError}</p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={statuses.categoriesSubmit === "running"}
                className={cn(getActionFeedbackClassName(statuses.categoriesSubmit))}
              >
                <Save className="mr-2 h-4 w-4" />
                {`${getActionFeedbackLabel(statuses.categoriesSubmit, SAVE_LABELS)} Category Cards`}
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
              <Button
                type="submit"
                disabled={statuses.featuredSubmit === "running"}
                className={cn(getActionFeedbackClassName(statuses.featuredSubmit))}
              >
                <Save className="mr-2 h-4 w-4" />
                {`${getActionFeedbackLabel(statuses.featuredSubmit, SAVE_LABELS)} Featured Collection`}
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
              <Button
                type="submit"
                disabled={statuses.newArrivalsSubmit === "running"}
                className={cn(getActionFeedbackClassName(statuses.newArrivalsSubmit))}
              >
                <Save className="mr-2 h-4 w-4" />
                {`${getActionFeedbackLabel(statuses.newArrivalsSubmit, SAVE_LABELS)} New Arrivals`}
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
              <Button
                type="submit"
                disabled={statuses.promoSubmit === "running"}
                className={cn(getActionFeedbackClassName(statuses.promoSubmit))}
              >
                <Save className="mr-2 h-4 w-4" />
                {`${getActionFeedbackLabel(statuses.promoSubmit, SAVE_LABELS)} Promo`}
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
              <Button
                type="submit"
                disabled={statuses.socialSubmit === "running"}
                className={cn(getActionFeedbackClassName(statuses.socialSubmit))}
              >
                <Save className="mr-2 h-4 w-4" />
                {`${getActionFeedbackLabel(statuses.socialSubmit, SAVE_LABELS)} Links`}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
