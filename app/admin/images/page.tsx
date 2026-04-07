"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { uploadProductImage } from "@/lib/firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ImagePlus, Package, Save, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ImagesPage() {
  const products = useAdminStore((state) => state.products);
  const updateProductImages = useAdminStore((state) => state.updateProductImages);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadInputKey, setUploadInputKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const clearUploadInput = () => {
    setSelectedUploadFile(null);
    setUploadInputKey((currentKey) => currentKey + 1);
  };

  const showSuccessMessage = (message: string) => {
    setErrorMessage("");
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showErrorMessage = (message: string) => {
    setSuccessMessage("");
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 4000);
  };

  const handleAddImage = () => {
    if (selectedProduct && newImageUrl.trim()) {
      const trimmedImageUrl = newImageUrl.trim();
      const updatedImages = [...selectedProduct.images, trimmedImageUrl];
      updateProductImages(selectedProductId, updatedImages);
      setNewImageUrl("");
      showSuccessMessage("Image added successfully!");
    }
  };

  const handleRemoveImage = (index: number) => {
    if (selectedProduct) {
      if (selectedProduct.images.length <= 1) {
        showErrorMessage("At least one product image is required.");
        return;
      }

      const updatedImages = selectedProduct.images.filter((_, i) => i !== index);
      updateProductImages(selectedProductId, updatedImages);
      showSuccessMessage("Image removed successfully!");
    }
  };

  const handleSetPrimary = (index: number) => {
    if (selectedProduct && index > 0) {
      const updatedImages = [...selectedProduct.images];
      const [removed] = updatedImages.splice(index, 1);
      updatedImages.unshift(removed);
      updateProductImages(selectedProductId, updatedImages);
      showSuccessMessage("Primary image updated successfully!");
    }
  };

  const handleUploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;

    if (!nextFile) {
      setSelectedUploadFile(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      clearUploadInput();
      showErrorMessage("Please choose an image file.");
      return;
    }

    setErrorMessage("");
    setSelectedUploadFile(nextFile);
  };

  const handleUploadImage = async () => {
    if (!selectedProduct || !selectedUploadFile || isUploadingImage) {
      return;
    }

    setIsUploadingImage(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const uploadedImageUrl = await uploadProductImage(
        selectedUploadFile,
        selectedProductId
      );
      const currentProduct = useAdminStore
        .getState()
        .products.find((product) => product.id === selectedProductId);
      const updatedImages = [
        ...(currentProduct?.images ?? selectedProduct.images),
        uploadedImageUrl,
      ];

      updateProductImages(selectedProductId, updatedImages);
      clearUploadInput();
      showSuccessMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload product image:", error);
      showErrorMessage("We couldn't upload that image right now. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Upload Product Images</h1>
          <p className="text-muted-foreground">Manage images for your products</p>
        </div>
      </div>

      {/* Product Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
          <CardDescription>Choose a product to manage its images</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.brand})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProduct ? (
        <>
          {/* Current Images */}
          <Card>
            <CardHeader>
              <CardTitle>Current Images ({selectedProduct.images.length})</CardTitle>
              <CardDescription>
                The first image is shown as the primary product image
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProduct.images.length === 0 ? (
                <div className="text-center py-8">
                  <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedProduct.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-border"
                    >
                      <div className="aspect-square bg-muted">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimary(index)}
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Image */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Image</CardTitle>
              <CardDescription>
                Enter an image URL or upload a file to add to this product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="imageUrl" className="sr-only">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddImage} disabled={!newImageUrl.trim()}>
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex-1">
                  <Label htmlFor="imageUpload" className="sr-only">Upload Image File</Label>
                  <Input
                    key={uploadInputKey}
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFileChange}
                    disabled={isUploadingImage}
                  />
                </div>
                <Button
                  onClick={handleUploadImage}
                  disabled={!selectedUploadFile || isUploadingImage}
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Use high-quality images with a white or neutral background for best results.
                Recommended size: 800x800 pixels or larger.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a product to manage its images</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
