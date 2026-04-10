"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Film,
  ImagePlus,
  Package,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAdminStore, type AdminProduct } from "@/lib/admin-store";
import { saveProducts } from "@/lib/firebase/products";
import { uploadProductImage, uploadProductVideo } from "@/lib/firebase/storage";
import {
  normalizeProductImages,
  normalizeProductVideoUrl,
} from "@/lib/products";
import {
  QUICK_SELECT_SIZES,
  getTotalSizeStock,
  normalizeProductColors,
  normalizeProductSizeInventory,
  type ProductSizeStock,
} from "@/lib/product-inventory";
import {
  getActionFeedbackClassName,
  getActionFeedbackLabel,
  useActionFeedback,
} from "@/hooks/use-action-feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ADD_IMAGE_LABELS = {
  idle: "Add Image",
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

const SAVE_PRODUCT_LABELS = {
  idle: "Save Changes",
  running: "Saving...",
  success: "Saved ✓",
  error: "Retry",
};

const DEFAULT_SELECTION_MESSAGE =
  "Select a product from the list below to open the full Edit Product form.";
const MISSING_PRODUCT_MESSAGE =
  "That product could not be found. Select another product to continue editing.";

const buildEditableProductFormData = (
  product: AdminProduct
): Partial<AdminProduct> => {
  const sizeInventory = normalizeProductSizeInventory(product);

  return {
    ...product,
    sizes: sizeInventory.map((entry) => entry.size),
    sizeInventory: sizeInventory.map((entry) => ({ ...entry })),
    colors: normalizeProductColors(product.colors),
    images: [...normalizeProductImages(product.images)],
    videoUrl: normalizeProductVideoUrl(product.videoUrl) ?? "",
  };
};

export default function EditProductPage() {
  const products = useAdminStore((state) => state.products);
  const brands = useAdminStore((state) => state.brands);
  const categories = useAdminStore((state) => state.categories);
  const updateProduct = useAdminStore((state) => state.updateProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProduct>>({});
  const [newSize, setNewSize] = useState("");
  const [newSizeStock, setNewSizeStock] = useState("1");
  const [newColor, setNewColor] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [imageUploadInputKey, setImageUploadInputKey] = useState(0);
  const [videoUploadInputKey, setVideoUploadInputKey] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingRouteProductId, setPendingRouteProductId] = useState<string | null>(null);
  const [routeSelectionMessage, setRouteSelectionMessage] = useState<string | null>(
    DEFAULT_SELECTION_MESSAGE
  );
  const { statuses, setStatus, resetStatus, runAction } = useActionFeedback({
    addImage: "idle",
    uploadImage: "idle",
    uploadVideo: "idle",
    saveProduct: "idle",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentSizeInventory = normalizeProductSizeInventory({
    sizeInventory: formData.sizeInventory ?? editingProduct?.sizeInventory,
    sizes: formData.sizes ?? editingProduct?.sizes,
    stock: formData.stock ?? editingProduct?.stock,
    inStock: formData.inStock ?? editingProduct?.inStock,
  });
  const currentColors = normalizeProductColors(formData.colors ?? editingProduct?.colors);
  const currentImages = normalizeProductImages(formData.images ?? editingProduct?.images);
  const currentVideoUrl =
    normalizeProductVideoUrl(formData.videoUrl ?? editingProduct?.videoUrl) ?? "";
  const selectedCategory =
    formData.category === "men" || formData.category === "women"
      ? formData.category
      : editingProduct?.category;
  const availableTypes = selectedCategory ? categories[selectedCategory].filter(Boolean) : [];

  const clearImageUploadInput = () => {
    setSelectedImageFile(null);
    setImageUploadInputKey((currentKey) => currentKey + 1);
  };

  const clearVideoUploadInput = () => {
    setSelectedVideoFile(null);
    setVideoUploadInputKey((currentKey) => currentKey + 1);
  };

  const resetEditorState = () => {
    setNewSize("");
    setNewSizeStock("1");
    setNewColor("");
    setNewImageUrl("");
    clearImageUploadInput();
    clearVideoUploadInput();
    setMediaError(null);
    setSaveError(null);
    setStatus("addImage", "idle");
    setStatus("uploadImage", "idle");
    setStatus("uploadVideo", "idle");
    setStatus("saveProduct", "idle");
  };

  const patchFormData = (
    updates:
      | Partial<AdminProduct>
      | ((current: Partial<AdminProduct>) => Partial<AdminProduct>)
  ) => {
    resetStatus("saveProduct");
    setSaveError(null);
    setFormData((current) => ({
      ...current,
      ...(typeof updates === "function" ? updates(current) : updates),
    }));
  };

  const openEditDialog = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData(buildEditableProductFormData(product));
    setRouteSelectionMessage(null);
    resetEditorState();
  };

  const closeEditDialog = () => {
    setEditingProduct(null);
    setFormData({});
    setRouteSelectionMessage(DEFAULT_SELECTION_MESSAGE);
    resetEditorState();
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const requestedProductId = searchParams.get("productId");

    if (!requestedProductId) {
      setPendingRouteProductId(null);
      setRouteSelectionMessage(DEFAULT_SELECTION_MESSAGE);
      return;
    }

    setPendingRouteProductId(requestedProductId);
    setRouteSelectionMessage("Opening the requested product...");
  }, []);

  useEffect(() => {
    if (!pendingRouteProductId) {
      return;
    }

    const requestedProduct = products.find((product) => product.id === pendingRouteProductId);

    if (!requestedProduct) {
      if (products.length === 0) {
        return;
      }

      setPendingRouteProductId(null);
      setRouteSelectionMessage(MISSING_PRODUCT_MESSAGE);

      if (typeof window !== "undefined") {
        window.history.replaceState(window.history.state, "", window.location.pathname);
      }

      return;
    }

    openEditDialog(requestedProduct);
    setSearchQuery(requestedProduct.name);
    setPendingRouteProductId(null);

    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, [pendingRouteProductId, products]);

  const handleSave = async () => {
    if (!editingProduct) {
      return;
    }

    setSaveError(null);

    try {
      await runAction("saveProduct", async () => {
        const price = formData.price || 0;
        const originalPrice = formData.originalPrice || price;
        const discount =
          originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
        const sizeInventory = currentSizeInventory;
        const stock =
          formData.sizeInventory !== undefined
            ? getTotalSizeStock(sizeInventory)
            : formData.stock ?? editingProduct.stock;
        const inStock = sizeInventory.some((entry) => entry.stock > 0);

        updateProduct(editingProduct.id, {
          ...formData,
          discount,
          sizes: sizeInventory.map((entry) => entry.size),
          sizeInventory,
          colors: formData.colors ?? editingProduct.colors,
          images: currentImages,
          videoUrl: currentVideoUrl,
          stock,
          inStock,
        });

        await saveProducts(useAdminStore.getState().products);
        closeEditDialog();
      });
    } catch (error) {
      console.error("Failed to save edited product:", error);
      setSaveError("We couldn't save those product changes right now. Please try again.");
    }
  };

  const syncSizeInventory = (sizeInventory: ProductSizeStock[]) => {
    const normalizedInventory = [...sizeInventory].sort((a, b) => a.size - b.size);

    patchFormData({
      sizes: normalizedInventory.map((entry) => entry.size),
      sizeInventory: normalizedInventory,
      stock: getTotalSizeStock(normalizedInventory),
      inStock: normalizedInventory.some((entry) => entry.stock > 0),
    });
  };

  const updateSizeStock = (size: number, stockValue: string) => {
    const parsedStock = parseInt(stockValue, 10);
    const normalizedStock = Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 0;
    const currentInventory = formData.sizeInventory ?? editingProduct?.sizeInventory ?? [];

    syncSizeInventory(
      currentInventory.map((entry) =>
        entry.size === size ? { ...entry, stock: normalizedStock } : entry
      )
    );
  };

  const removeSize = (size: number) => {
    const currentInventory = formData.sizeInventory ?? editingProduct?.sizeInventory ?? [];
    syncSizeInventory(currentInventory.filter((entry) => entry.size !== size));
  };

  const addSize = () => {
    const parsedSize = parseInt(newSize, 10);
    if (!Number.isFinite(parsedSize) || parsedSize < 1) {
      return;
    }

    const parsedStock = parseInt(newSizeStock, 10);
    const currentInventory = formData.sizeInventory ?? editingProduct?.sizeInventory ?? [];
    if (currentInventory.some((entry) => entry.size === parsedSize)) {
      return;
    }

    syncSizeInventory([
      ...currentInventory,
      {
        size: parsedSize,
        stock: Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 1,
      },
    ]);
    setNewSize("");
    setNewSizeStock("1");
  };

  const addColor = () => {
    const trimmedColor = newColor.trim();
    if (!trimmedColor) {
      return;
    }

    const existingColors = formData.colors ?? editingProduct?.colors ?? [];
    if (existingColors.some((color) => color.toLowerCase() === trimmedColor.toLowerCase())) {
      return;
    }

    patchFormData((current) => ({
      colors: [...(current.colors ?? editingProduct?.colors ?? []), trimmedColor],
    }));
    setNewColor("");
  };

  const updateColor = (index: number, value: string) => {
    patchFormData((current) => ({
      colors: (current.colors ?? editingProduct?.colors ?? []).map((color, colorIndex) =>
        colorIndex === index ? value : color
      ),
    }));
  };

  const removeColor = (index: number) => {
    patchFormData((current) => ({
      colors: (current.colors ?? editingProduct?.colors ?? []).filter(
        (_, colorIndex) => colorIndex !== index
      ),
    }));
  };

  const handleAddImage = async () => {
    try {
      await runAction("addImage", () => {
        const trimmedImageUrl = newImageUrl.trim();

        if (!trimmedImageUrl) {
          throw new Error("Enter an image URL before adding it.");
        }

        if (currentImages.includes(trimmedImageUrl)) {
          throw new Error("That image URL is already attached to this product.");
        }

        patchFormData((current) => ({
          images: [...(current.images ?? editingProduct?.images ?? []), trimmedImageUrl],
        }));
        setMediaError(null);
        setNewImageUrl("");
      });
    } catch (error) {
      setMediaError(
        error instanceof Error
          ? error.message
          : "We couldn't add that image right now. Please try again."
      );
    }
  };

  const handleRemoveImage = (index: number) => {
    if (currentImages.length <= 1) {
      setMediaError("At least one product image is required.");
      return;
    }

    patchFormData((current) => ({
      images: (current.images ?? editingProduct?.images ?? []).filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
    setMediaError(null);
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index <= 0) {
      return;
    }

    patchFormData((current) => {
      const nextImages = [...(current.images ?? editingProduct?.images ?? [])];
      const [selectedImage] = nextImages.splice(index, 1);
      nextImages.unshift(selectedImage);
      return { images: nextImages };
    });
    setMediaError(null);
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
    if (!editingProduct || !selectedImageFile) {
      return;
    }

    try {
      await runAction("uploadImage", async () => {
        const nextImageUrl = await uploadProductImage(selectedImageFile, editingProduct.id);

        patchFormData((current) => ({
          images: [...(current.images ?? editingProduct.images), nextImageUrl],
        }));
        clearImageUploadInput();
        setMediaError(null);
      });
    } catch (error) {
      console.error("Failed to upload product image:", error);
      setMediaError(
        error instanceof Error
          ? error.message
          : "We couldn't upload that image right now. Please try again."
      );
    }
  };

  const handleUploadVideo = async () => {
    if (!editingProduct || !selectedVideoFile) {
      return;
    }

    try {
      await runAction("uploadVideo", async () => {
        const nextVideoUrl = await uploadProductVideo(selectedVideoFile, editingProduct.id);

        patchFormData({ videoUrl: nextVideoUrl });
        clearVideoUploadInput();
        setMediaError(null);
      });
    } catch (error) {
      console.error("Failed to upload product video:", error);
      setMediaError(
        error instanceof Error
          ? error.message
          : "We couldn't upload that video right now. Please try again."
      );
    }
  };

  const handleClearVideo = () => {
    patchFormData({ videoUrl: "" });
    resetStatus("uploadVideo");
    setMediaError(null);
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Edit Products</h1>
          <p className="text-muted-foreground">Search and edit existing products</p>
        </div>
      </div>

      <Card>
        <CardContent className="min-w-0 pt-6">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product name or brand..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full min-w-0 max-w-full pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingProduct ? `Editing ${editingProduct.name}` : "Select a product"}
          </CardTitle>
          <CardDescription>
            {editingProduct
              ? "Use the editor to update stock, sizes, colors, pricing, description, and media."
              : routeSelectionMessage}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>Click on a product to edit its details</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.brand} • {product.category} • Rs {product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                    className="w-full flex-shrink-0 sm:ml-4 sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-h-[90vh] w-[95vw] min-w-0 max-w-[95vw] overflow-x-hidden overflow-y-auto px-4 sm:max-w-3xl sm:px-6">
          <DialogHeader className="min-w-0 pr-8 sm:pr-0">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below</DialogDescription>
          </DialogHeader>

          {editingProduct ? (
            <div className="min-w-0 space-y-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(event) => patchFormData({ name: event.target.value })}
                    className="w-full min-w-0 max-w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => patchFormData({ brand: value })}
                  >
                    <SelectTrigger className="w-full min-w-0 max-w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands
                        .filter(Boolean)
                        .map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      patchFormData({ category: value as "men" | "women" })
                    }
                  >
                    <SelectTrigger className="w-full min-w-0 max-w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => patchFormData({ type: value })}
                  >
                    <SelectTrigger className="w-full min-w-0 max-w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Selling Price (Rs)</Label>
                  <Input
                    type="number"
                    value={formData.price || ""}
                    onChange={(event) =>
                      patchFormData({ price: parseInt(event.target.value, 10) || 0 })
                    }
                    className="w-full min-w-0 max-w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (Rs)</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(event) =>
                      patchFormData({
                        originalPrice: parseInt(event.target.value, 10) || 0,
                      })
                    }
                    className="w-full min-w-0 max-w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(event) =>
                      patchFormData({ stock: parseInt(event.target.value, 10) || 0 })
                    }
                    className="w-full min-w-0 max-w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Editing total stock keeps the legacy flow working. Per-size stock below
                    controls actual availability.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label>Per-Size Stock</Label>
                  <span className="text-xs text-muted-foreground">
                    Quick sizes: {QUICK_SELECT_SIZES.join(", ")}
                  </span>
                </div>

                {currentSizeInventory.length > 0 ? (
                  <div className="space-y-2">
                    {currentSizeInventory.map((entry) => (
                      <div
                        key={`size-stock-${entry.size}`}
                        className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
                      >
                        <div className="text-sm font-medium sm:min-w-20">UK {entry.size}</div>
                        <Input
                          type="number"
                          min={0}
                          value={entry.stock}
                          onChange={(event) => updateSizeStock(entry.size, event.target.value)}
                          className="w-full min-w-0 max-w-full sm:w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSize(entry.size)}
                          className="ml-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sizes configured yet. Add one below to start tracking stock by size.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Add size"
                    value={newSize}
                    onChange={(event) => setNewSize(event.target.value)}
                    className="w-full min-w-0 max-w-full"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={newSizeStock}
                    onChange={(event) => setNewSizeStock(event.target.value)}
                    className="w-full min-w-0 max-w-full"
                  />
                  <Button type="button" variant="outline" onClick={addSize} className="w-full sm:w-auto">
                    Add Size
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label>Colors</Label>
                  <span className="text-xs text-muted-foreground">
                    {currentColors.length} option{currentColors.length === 1 ? "" : "s"}
                  </span>
                </div>

                {currentColors.length > 0 ? (
                  <div className="space-y-2">
                    {currentColors.map((color, index) => (
                      <div
                        key={`edit-color-${index}`}
                        className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3 sm:flex-1">
                          <div
                            className="h-3 w-3 rounded-full border border-border bg-muted"
                            aria-hidden="true"
                          />
                          <Input
                            value={color}
                            onChange={(event) => updateColor(index, event.target.value)}
                            placeholder={`Color ${index + 1}`}
                            className="w-full min-w-0 max-w-full sm:flex-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeColor(index)}
                          className="w-full sm:self-stretch sm:w-auto"
                          aria-label={`Remove color ${color || index + 1}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                    No color options are configured for this product right now. You can save with
                    no colors or add a new one below.
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Add custom color"
                    value={newColor}
                    onChange={(event) => setNewColor(event.target.value)}
                    className="w-full min-w-0 max-w-full"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addColor();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addColor} className="w-full sm:w-auto">
                    Add Color
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(event) => patchFormData({ description: event.target.value })}
                  rows={3}
                  className="w-full min-w-0 max-w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Product Media</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep URL fallback support, add Storage uploads, and preserve the first image as
                    the primary product image.
                  </p>
                </div>

                {mediaError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {mediaError}
                  </div>
                ) : null}

                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">Images ({currentImages.length})</p>
                    <span className="text-xs text-muted-foreground">
                      Image 1 stays primary unless you choose a different primary image below.
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {currentImages.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="min-w-0 space-y-3 rounded-lg border border-border p-3"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                          <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {index === 0 ? (
                            <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                              Primary
                            </div>
                          ) : null}
                        </div>

                        <div className="min-w-0 space-y-2">
                          <p className="break-all text-xs text-muted-foreground">{image}</p>
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {index > 0 ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPrimaryImage(index)}
                                className="w-full sm:w-auto"
                              >
                                Set Primary
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                              className="w-full text-destructive hover:text-destructive sm:w-auto"
                            >
                              Remove
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
                              <a href={image} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <Input
                        type="url"
                        placeholder="https://example.com/product-image.jpg"
                        value={newImageUrl}
                        onChange={(event) => {
                          resetStatus("addImage");
                          setMediaError(null);
                          setNewImageUrl(event.target.value);
                        }}
                        className="w-full min-w-0 max-w-full"
                      />
                      <Button
                        type="button"
                        onClick={handleAddImage}
                        disabled={statuses.addImage === "running" || !newImageUrl.trim()}
                        className={cn("w-full sm:w-auto", getActionFeedbackClassName(statuses.addImage))}
                      >
                        <ImagePlus className="h-4 w-4" />
                        {getActionFeedbackLabel(statuses.addImage, ADD_IMAGE_LABELS)}
                      </Button>
                    </div>

                    <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <Input
                        key={imageUploadInputKey}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={statuses.uploadImage === "running"}
                        className="w-full min-w-0 max-w-full"
                      />
                      <Button
                        type="button"
                        onClick={handleUploadImage}
                        disabled={statuses.uploadImage === "running" || !selectedImageFile}
                        className={cn("w-full sm:w-auto", getActionFeedbackClassName(statuses.uploadImage))}
                      >
                        <Upload className="h-4 w-4" />
                        {getActionFeedbackLabel(statuses.uploadImage, UPLOAD_IMAGE_LABELS)}
                      </Button>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Uploads are wired for Firebase Storage and still end up as plain image URL
                      strings in the product data.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="edit-video-url">Product Video (optional)</Label>
                      <p className="text-xs text-muted-foreground">
                        Keep the existing URL field, or upload a video to Storage and use its URL.
                      </p>
                    </div>
                    {currentVideoUrl ? (
                      <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
                        <a href={currentVideoUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Video
                        </a>
                      </Button>
                    ) : null}
                  </div>

                  <Input
                    id="edit-video-url"
                    type="url"
                    placeholder="https://example.com/product-video.mp4"
                    value={currentVideoUrl}
                    onChange={(event) => {
                      resetStatus("uploadVideo");
                      setMediaError(null);
                      patchFormData({ videoUrl: event.target.value });
                    }}
                    className="mt-3 w-full min-w-0 max-w-full"
                  />

                  <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Input
                      key={videoUploadInputKey}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      disabled={statuses.uploadVideo === "running"}
                      className="w-full min-w-0 max-w-full"
                    />
                    <Button
                      type="button"
                      onClick={handleUploadVideo}
                      disabled={statuses.uploadVideo === "running" || !selectedVideoFile}
                      className={cn("w-full sm:w-auto", getActionFeedbackClassName(statuses.uploadVideo))}
                    >
                      <Film className="h-4 w-4" />
                      {getActionFeedbackLabel(statuses.uploadVideo, UPLOAD_VIDEO_LABELS)}
                    </Button>
                  </div>

                  {currentVideoUrl ? (
                    <div className="mt-3">
                      <Button type="button" variant="outline" onClick={handleClearVideo} className="w-full sm:w-auto">
                        Remove Video
                      </Button>
                    </div>
                  ) : null}
                </div>

              </div>

              {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={closeEditDialog} className="w-full sm:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={statuses.saveProduct === "running"}
                  className={cn("w-full sm:w-auto", getActionFeedbackClassName(statuses.saveProduct))}
                >
                  <Save className="h-4 w-4" />
                  {getActionFeedbackLabel(statuses.saveProduct, SAVE_PRODUCT_LABELS)}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              {routeSelectionMessage}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
