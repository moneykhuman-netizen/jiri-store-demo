"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore, type AdminProduct } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import Link from "next/link";
import { QUICK_SELECT_SIZES } from "@/lib/product-inventory";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const price = parseInt(formData.price) || 0;
    const originalPrice = parseInt(formData.originalPrice) || price;
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const stockVal = parseInt(formData.stock) || 0;
    const normalizedSelectedSizes = [...new Set(selectedSizes)].sort((a, b) => a - b);
    const newProduct: AdminProduct = {
      id: `p${Date.now()}`,
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
      images: formData.imageUrl ? [formData.imageUrl] : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
      videoUrl: formData.videoUrl,
      description: formData.description,
      features: features.filter((f) => f.trim() !== ""),
      inStock: stockVal > 0,
      isFeatured,
      isNew,
      stock: stockVal,
    };

    addProduct(newProduct);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/admin/products/edit");
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
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
                    setFormData({ ...formData, category: value as "men" | "women", type: "" });
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
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>Add product image URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use a default product image
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Product Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://example.com/product-video.mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the product image-only.
                </p>
              </div>
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

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link href="/admin/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
