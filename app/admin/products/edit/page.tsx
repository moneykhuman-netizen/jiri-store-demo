"use client";

import { useState } from "react";
import { useAdminStore, type AdminProduct } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Edit, X, Save, Package } from "lucide-react";
import Link from "next/link";
import { QUICK_SELECT_SIZES, getTotalSizeStock, type ProductSizeStock } from "@/lib/product-inventory";

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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentSizeInventory = formData.sizeInventory ?? editingProduct?.sizeInventory ?? [];
  const currentColors = formData.colors ?? editingProduct?.colors ?? [];

  const openEditDialog = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      sizes: [...product.sizes],
      sizeInventory: product.sizeInventory.map((entry) => ({ ...entry })),
      colors: [...product.colors],
    });
    setNewSize("");
    setNewSizeStock("1");
    setNewColor("");
  };

  const closeEditDialog = () => {
    setEditingProduct(null);
    setFormData({});
    setNewSize("");
    setNewSizeStock("1");
    setNewColor("");
  };

  const handleSave = () => {
    if (editingProduct && formData) {
      // Calculate discount
      const price = formData.price || 0;
      const originalPrice = formData.originalPrice || price;
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      const sizeInventory = formData.sizeInventory ?? editingProduct.sizeInventory;
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
        stock,
        inStock,
      });
      closeEditDialog();
    }
  };

  const syncSizeInventory = (sizeInventory: ProductSizeStock[]) => {
    const normalizedInventory = [...sizeInventory].sort((a, b) => a.size - b.size);

    setFormData((prev) => ({
      ...prev,
      sizes: normalizedInventory.map((entry) => entry.size),
      sizeInventory: normalizedInventory,
      stock: getTotalSizeStock(normalizedInventory),
      inStock: normalizedInventory.some((entry) => entry.stock > 0),
    }));
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

    const currentColors = formData.colors ?? editingProduct?.colors ?? [];
    if (currentColors.some((color) => color.toLowerCase() === trimmedColor.toLowerCase())) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colors: [...(prev.colors ?? editingProduct?.colors ?? []), trimmedColor],
    }));
    setNewColor("");
  };

  const updateColor = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: (prev.colors ?? editingProduct?.colors ?? []).map((color, colorIndex) =>
        colorIndex === index ? value : color
      ),
    }));
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: (prev.colors ?? editingProduct?.colors ?? []).filter(
        (_, colorIndex) => colorIndex !== index
      ),
    }));
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
          <h1 className="text-2xl font-bold">Edit Products</h1>
          <p className="text-muted-foreground">Search and edit existing products</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>Click on a product to edit its details</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.brand} • {product.category} • Rs {product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                    className="ml-4 flex-shrink-0"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => setFormData({ ...formData, brand: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands
                        .filter((b) => b)
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
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as "men" | "women" })}
                  >
                    <SelectTrigger>
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
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.category &&
                        categories[formData.category]
                          .filter((t) => t)
                          .map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Selling Price (Rs)</Label>
                  <Input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (Rs)</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Editing total stock keeps the legacy flow working. Per-size stock below controls actual availability.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
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
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="min-w-20 text-sm font-medium">UK {entry.size}</div>
                        <Input
                          type="number"
                          min={0}
                          value={entry.stock}
                          onChange={(e) => updateSizeStock(entry.size, e.target.value)}
                          className="w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSize(entry.size)}
                          className="ml-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sizes configured yet. Add one below to start tracking stock by size.
                  </p>
                )}

                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Add size"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={newSizeStock}
                    onChange={(e) => setNewSizeStock(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addSize}>
                    Add Size
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Colors</Label>
                {currentColors.length > 0 && (
                  <div className="space-y-2">
                    {currentColors.map((color, index) => (
                      <div key={`edit-color-${index}`} className="flex gap-2">
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
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addColor();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addColor}>
                    Add Color
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeEditDialog}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
