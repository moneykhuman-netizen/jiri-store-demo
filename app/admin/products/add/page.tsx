"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore, type AdminProduct } from "@/lib/admin-store";
import { uploadProductImage, uploadProductVideo } from "@/lib/firebase/storage";
import {
  getActionFeedbackClassName,
  getActionFeedbackLabel,
  useActionFeedback,
} from "@/hooks/use-action-feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ExternalLink, Film, Plus, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { QUICK_SELECT_SIZES } from "@/lib/product-inventory";

const ADD_PRODUCT_LABELS = {
  idle: "Add Product",
  running: "Adding...",
  success: "Added ✓",
  error: "Retry",
};

const UPLOAD_IMAGE_LABELS = {
  idle: "Upload Image",
  running: "Uploading...",
  success: "Uploaded ✓",
  error: "Retry",
};

const UPLOAD_VIDEO_LABELS = {
  idle: "Upload Video",
  running: "Uploading...",
  success: "Uploaded ✓",
  error: "Retry",
};

const colorOptions = [
  "Black",
  "White",
  "Brown",
  "Navy",
  "Grey",
  "Red",
  "Blue",
  "Green",
  "Tan",
  "Pink",
  "Beige",
];

export default function AddProductPage() {
  const router = useRouter();
  const brands = useAdminStore((state) => state.brands);
  const categories = useAdminStore((state) => state.categories);
  const addProduct = useAdminStore((state) => state.addProduct);
  const draftProductIdRef = useRef(`p${Date.now()}`);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "" as "men" | "women" | "",
    type: "",
    price: "",
    originalPrice: "",
    description: "",
    stock: "",
    imageUrl: "",
    videoUrl: "",
  });

  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [imageUploadInputKey, setImageUploadInputKey] = useState(0);
  const [videoUploadInputKey, setVideoUploadInputKey] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { statuses, resetStatus, runAction } = useActionFeedback({
    addProduct: "idle",
    uploadImage: "idle",
    uploadVideo: "idle",
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    resetStatus("addProduct");
    setSubmitError(null);
    setFormData((current) => ({
      ...current,
      ...updates,
    }));
  };

  const clearImageUploadInput = () => {
    setSelectedImageFile(null);
    setImageUploadInputKey((currentKey) => currentKey + 1);
  };

  const clearVideoUploadInput = () => {
    setSelectedVideoFile(null);
    setVideoUploadInputKey((currentKey) => currentKey + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitError(null);

    try {
      await runAction("addProduct", async () => {
        const price = parseInt(formData.price, 10) || 0;
        const originalPrice = parseInt(formData.originalPrice, 10) || price;
        const discount =
          originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;

        const stockVal = parseInt(formData.stock, 10) || 0;
        const normalizedSelectedSizes = [...new Set(selectedSizes)].sort((a, b) => a - b);
        const trimmedImageUrl = formData.imageUrl.trim();
        const trimmedVideoUrl = formData.videoUrl.trim();
        const newProduct: AdminProduct = {
          id: draftProductIdRef.current,
          name: formData.name,
          brand: formData.brand,
          category: formData.category as "men" | "women",
          type: formData.type,
          price,
          originalPrice,
          discount,
          rating: 4.0,
          reviews: 0,
          sizes: normalizedSelectedSizes,
          sizeInventory: normalizedSelectedSizes.map((size) => ({ size, stock: 1 })),
          colors: selectedColors.map((color) => color.trim()).filter(Boolean),
          images: trimmedImageUrl
            ? [trimmedImageUrl]
            : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
          ...(trimmedVideoUrl ? { videoUrl: trimmedVideoUrl } : {}),
          description: formData.description,
          features: features.filter((feature) => feature.trim() !== ""),
          inStock: stockVal > 0,
          isFeatured,
          isNew,
          stock: stockVal,
        };

        addProduct(newProduct);
        await new Promise((resolve) => setTimeout(resolve, 350));
        router.push("/admin/products/edit");
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      setSubmitError("We couldn't add that product right now. Please try again.");
    }
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetStatus("uploadImage");
    setMediaError(null);

    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setSelectedImageFile(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      clearImageUploadInput();
      setMediaError("Please choose an image file.");
      return;
    }

    setSelectedImageFile(nextFile);
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetStatus("uploadVideo");
    setMediaError(null);

    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setSelectedVideoFile(null);
      return;
    }

    if (!nextFile.type.startsWith("video/")) {
      clearVideoUploadInput();
      setMediaError("Please choose a video file.");
      return;
    }

    setSelectedVideoFile(nextFile);
  };

  const handleUploadImage = async () => {
    if (!selectedImageFile) {
      return;
    }

    try {
      await runAction("uploadImage", async () => {
        const uploadedImageUrl = await uploadProductImage(
          selectedImageFile,
          draftProductIdRef.current
        );
        updateFormData({ imageUrl: uploadedImageUrl });
        clearImageUploadInput();
        setMediaError(null);
      });
    } catch (error) {
      console.error("Failed to upload add-product image:", error);
      setMediaError("We couldn't upload that image right now. Please try again.");
    }
  };

  const handleUploadVideo = async () => {
    if (!selectedVideoFile) {
      return;
    }

    try {
      await runAction("uploadVideo", async () => {
        const uploadedVideoUrl = await uploadProductVideo(
          selectedVideoFile,
          draftProductIdRef.current
        );
        updateFormData({ videoUrl: uploadedVideoUrl });
        clearVideoUploadInput();
        setMediaError(null);
      });
    } catch (error) {
      console.error("Failed to upload add-product video:", error);
      setMediaError("We couldn't upload that video right now. Please try again.");
    }
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const addCustomColor = () => {
    const trimmedColor = customColor.trim();
    if (!trimmedColor) {
      return;
    }

    setSelectedColors((prev) => {
      if (prev.some((color) => color.toLowerCase() === trimmedColor.toLowerCase())) {
        return prev;
      }

      return [...prev, trimmedColor];
    });
    setCustomColor("");
  };

  const updateColor = (index: number, value: string) => {
    setSelectedColors((prev) =>
      prev.map((color, colorIndex) => (colorIndex === index ? value : color))
    );
  };

  const removeColor = (index: number) => {
    setSelectedColors((prev) => prev.filter((_, colorIndex) => colorIndex !== index));
  };

  const availableSizes = QUICK_SELECT_SIZES;
  const availableTypes = formData.category ? categories[formData.category] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Fill in the details to add a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product name, brand, and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Air Max Running Shoe"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => updateFormData({ brand: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands
                      .filter((b) => b) // drop empty strings
                      .map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Gender/Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    updateFormData({ category: value as "men" | "women", type: "" });
                    setSelectedSizes([]);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Product Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateFormData({ type: value })}
                  disabled={!formData.category}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes
                      .filter((t) => t) // never render blank type
                      .map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the product..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
            <CardDescription>Set the price and stock quantity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (Rs) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 4999"
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (Rs)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="e.g., 6999"
                  value={formData.originalPrice}
                  onChange={(e) => updateFormData({ originalPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.stock}
                  onChange={(e) => updateFormData({ stock: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sizes & Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Sizes & Colors</CardTitle>
            <CardDescription>Available sizes and color options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Available Sizes (UK)</Label>
              {formData.category ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-12 rounded-lg border-2 font-medium transition-colors ${
                          selectedSizes.includes(size)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected sizes start with stock 1 each. You can edit per-size stock later from Edit Product.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a category first</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Available Colors</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedColors.includes(color)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>

                {selectedColors.length > 0 && (
                  <div className="space-y-2">
                    {selectedColors.map((color, index) => (
                      <div key={`${color}-${index}`} className="flex gap-2">
                        <Input
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          placeholder={`Color ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeColor(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomColor();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addCustomColor}>
                    Add Color
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Product Features</CardTitle>
            <CardDescription>Key features of the product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                />
                {features.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </CardContent>
        </Card>

        {/* Product Media */}
        <Card>
          <CardHeader>
            <CardTitle>Product Media</CardTitle>
            <CardDescription>
              Set the primary product image now. Additional images and media management stay in
              Edit Product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mediaError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {mediaError}
              </div>
            ) : null}

            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-1">
                <Label htmlFor="imageUrl">Primary Image</Label>
                <p className="text-xs text-muted-foreground">
                  URL input stays supported. Uploading stores a URL string for the same primary
                  image field.
                </p>
              </div>

              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => {
                  resetStatus("uploadImage");
                  setMediaError(null);
                  updateFormData({ imageUrl: e.target.value });
                }}
              />

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  key={imageUploadInputKey}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={statuses.uploadImage === "running"}
                />
                <Button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={statuses.uploadImage === "running" || !selectedImageFile}
                  className={cn(getActionFeedbackClassName(statuses.uploadImage))}
                >
                  <Upload className="h-4 w-4" />
                  {getActionFeedbackLabel(statuses.uploadImage, UPLOAD_IMAGE_LABELS)}
                </Button>
              </div>

              {formData.imageUrl.trim() ? (
                <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                  <div className="overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={formData.imageUrl.trim()}
                      alt="Primary product preview"
                      className="aspect-square h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Primary image ready</p>
                    <p className="break-all text-xs text-muted-foreground">
                      {formData.imageUrl.trim()}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={formData.imageUrl.trim()} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Image
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the default product image for now.
                </p>
              )}
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-1">
                <Label htmlFor="videoUrl">Product Video (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  URL fallback stays supported. Uploading stores the returned video URL in the same
                  optional field.
                </p>
              </div>

              <Input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/product-video.mp4"
                value={formData.videoUrl}
                onChange={(e) => {
                  resetStatus("uploadVideo");
                  setMediaError(null);
                  updateFormData({ videoUrl: e.target.value });
                }}
              />

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  key={videoUploadInputKey}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  disabled={statuses.uploadVideo === "running"}
                />
                <Button
                  type="button"
                  onClick={handleUploadVideo}
                  disabled={statuses.uploadVideo === "running" || !selectedVideoFile}
                  className={cn(getActionFeedbackClassName(statuses.uploadVideo))}
                >
                  <Film className="h-4 w-4" />
                  {getActionFeedbackLabel(statuses.uploadVideo, UPLOAD_VIDEO_LABELS)}
                </Button>
              </div>

              {formData.videoUrl.trim() ? (
                <Button variant="ghost" size="sm" asChild>
                  <a href={formData.videoUrl.trim()} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Video
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the product image-only.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
            <CardDescription>How the product appears on the store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Product (shows on homepage)
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="new"
                checked={isNew}
                onCheckedChange={(checked) => setIsNew(checked as boolean)}
              />
              <Label htmlFor="new" className="cursor-pointer">
                Mark as New Arrival
              </Label>
            </div>
          </CardContent>
        </Card>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={statuses.addProduct === "running"}
            className={cn(getActionFeedbackClassName(statuses.addProduct))}
          >
            <Save className="mr-2 h-4 w-4" />
            {getActionFeedbackLabel(statuses.addProduct, ADD_PRODUCT_LABELS)}
          </Button>
        </div>
      </form>
    </div>
  );
}
