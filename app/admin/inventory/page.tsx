"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Save, Package, DollarSign } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const products = useAdminStore((state) => state.products);
  const updateProduct = useAdminStore((state) => state.updateProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const [editedValues, setEditedValues] = useState<Record<string, { price?: number; stock?: number }>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleValueChange = (productId: string, field: "price" | "stock", value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: numValue,
      },
    }));
    // Remove from saved list if editing again
    setSavedIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleSave = async (productId: string) => {
    const updates = editedValues[productId];
    if (updates) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const newPrice = updates.price ?? product.price;
        const newStock = updates.stock ?? product.stock;

        await updateProduct(productId, {
          price: newPrice,
          stock: newStock,
        });
      }
      setSavedIds((prev) => [...prev, productId]);
    }
  };

  const getValue = (productId: string, field: "price" | "stock", originalValue: number) => {
    return editedValues[productId]?.[field] ?? originalValue;
  };

  const hasChanges = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const edited = editedValues[productId];
    if (!product || !edited) return false;
    return (
      (edited.price !== undefined && edited.price !== product.price) ||
      (edited.stock !== undefined && edited.stock !== product.stock)
    );
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
          <h1 className="text-2xl font-bold">Price & Stock Management</h1>
          <p className="text-muted-foreground">Update prices and stock quantities</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.stock < 15).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Edit price and stock for each product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Product</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm hidden md:table-cell">Brand</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground text-sm">Price (Rs)</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground text-sm">Stock</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isSaved = savedIds.includes(product.id);
                  const changed = hasChanges(product.id);
                  
                  return (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{product.brand}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                        {product.brand}
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          value={getValue(product.id, "price", product.price)}
                          onChange={(e) => handleValueChange(product.id, "price", e.target.value)}
                          className="w-24 text-right ml-auto"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          value={getValue(product.id, "stock", product.stock)}
                          onChange={(e) => handleValueChange(product.id, "stock", e.target.value)}
                          className={`w-20 text-right ml-auto ${
                            getValue(product.id, "stock", product.stock) < 15 ? "border-amber-500" : ""
                          }`}
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          onClick={() => handleSave(product.id)}
                          disabled={!changed && !isSaved}
                          className={isSaved ? "text-green-600 border-green-600" : ""}
                        >
                          {isSaved ? "Saved" : <><Save className="w-3 h-3 mr-1" /> Save</>}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
