"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { saveProducts } from "@/lib/firebase/products";
import {
  getActionFeedbackClassName,
  getActionFeedbackLabel,
  useActionFeedback,
} from "@/hooks/use-action-feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Search, Settings2, Save } from "lucide-react";
import Link from "next/link";

const LOW_STOCK_THRESHOLD = 15;
const CHECKMARK = "\u2713";
const PRICE_SAVE_LABELS = {
  idle: "Save",
  running: "Saving...",
  success: `Saved ${CHECKMARK}`,
  error: "Retry",
};

export default function InventoryPage() {
  const products = useAdminStore((state) => state.products);
  const updateProduct = useAdminStore((state) => state.updateProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const [editedValues, setEditedValues] = useState<Record<string, { price?: number }>>({});
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const { statuses, setStatus, runAction } = useActionFeedback<string>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    setShowLowStockOnly(searchParams.get("stock") === "low");
  }, []);

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stock < LOW_STOCK_THRESHOLD).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (showLowStockOnly && product.stock >= LOW_STOCK_THRESHOLD) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, searchQuery, showLowStockOnly]);

  const handleValueChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setEditedValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        price: numValue,
      },
    }));
    setStatus(productId, "idle");
  };

  const handleSave = async (productId: string) => {
    const updates = editedValues[productId];
    if (updates) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const newPrice = updates.price ?? product.price;
        const discount =
          product.originalPrice > newPrice
            ? Math.round(((product.originalPrice - newPrice) / product.originalPrice) * 100)
            : 0;

        try {
          await runAction(productId, async () => {
            updateProduct(productId, {
              price: newPrice,
              discount,
            });
            await saveProducts(useAdminStore.getState().products);
          });
        } catch (error) {
          console.error("Failed to save price update from inventory page:", error);
        }
      }
    }
  };

  const getValue = (productId: string, originalValue: number) => {
    return editedValues[productId]?.price ?? originalValue;
  };

  const hasChanges = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const edited = editedValues[productId];
    if (!product || !edited) return false;
    return edited.price !== undefined && edited.price !== product.price;
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Price & Stock Overview</h1>
          <p className="text-muted-foreground">
            Review rupee pricing here. Manage detailed stock safely from Edit Product.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Package className="h-5 w-5 text-blue-600" />
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
              <div className="rounded-lg bg-green-100 p-2">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, product) => sum + product.stock, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="min-w-0 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name or brand..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full min-w-0 max-w-full pl-10"
              />
            </div>
            {showLowStockOnly ? (
              <Link href="/admin/inventory" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Show All Products
                </Button>
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            {showLowStockOnly
              ? `Showing low-stock products under ${LOW_STOCK_THRESHOLD} units.`
              : "Review stock status, update price safely, and open Edit Product for detailed inventory changes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-sm text-muted-foreground">
              {showLowStockOnly
                ? "No low-stock products match the current search."
                : "No products match the current search."}
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredProducts.map((product) => {
                  const changed = hasChanges(product.id);
                  const activeSizeCount = product.sizeInventory.filter(
                    (entry) => entry.stock > 0
                  ).length;
                  const stockStatus =
                    product.stock === 0
                      ? "Out of stock"
                      : product.stock < LOW_STOCK_THRESHOLD
                        ? "Low stock"
                        : "In stock";
                  const rowStatus = statuses[product.id] ?? "idle";

                  return (
                    <div
                      key={product.id}
                      className="min-w-0 space-y-4 rounded-lg border border-border p-4"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="break-words text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Price (Rs)
                          </p>
                          <Input
                            type="number"
                            value={getValue(product.id, product.price)}
                            onChange={(event) => handleValueChange(product.id, event.target.value)}
                            className="w-full min-w-0 max-w-full text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Status
                          </p>
                          <span
                            className={cn(
                              "inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium",
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : product.stock < LOW_STOCK_THRESHOLD
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            )}
                          >
                            {stockStatus}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{product.stock.toLocaleString()} total units</p>
                        <p className="text-muted-foreground">
                          {activeSizeCount} size{activeSizeCount === 1 ? "" : "s"} currently stocked
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`/admin/products/edit?productId=${product.id}`}>
                            <Settings2 className="mr-1 h-3 w-3" />
                            Manage Stock
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant={rowStatus === "success" ? "outline" : "default"}
                          onClick={() => void handleSave(product.id)}
                          disabled={!changed || rowStatus === "running"}
                          className={cn("w-full", getActionFeedbackClassName(rowStatus))}
                        >
                          <Save className="mr-1 h-3 w-3" />
                          {getActionFeedbackLabel(rowStatus, PRICE_SAVE_LABELS)}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-3 text-left text-sm font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="hidden px-2 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                      Brand
                    </th>
                    <th className="px-2 py-3 text-right text-sm font-medium text-muted-foreground">
                      Price (Rs)
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-medium text-muted-foreground">
                      Stock Summary
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-2 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const changed = hasChanges(product.id);
                    const activeSizeCount = product.sizeInventory.filter(
                      (entry) => entry.stock > 0
                    ).length;
                    const stockStatus =
                      product.stock === 0
                        ? "Out of stock"
                        : product.stock < LOW_STOCK_THRESHOLD
                          ? "Low stock"
                          : "In stock";
                    const rowStatus = statuses[product.id] ?? "idle";

                    return (
                      <tr key={product.id} className="border-b border-border last:border-0">
                        <td className="px-2 py-3">
                          <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {product.brand}
                            </p>
                          </div>
                        </td>
                        <td className="hidden px-2 py-3 text-sm text-muted-foreground md:table-cell">
                          {product.brand}
                        </td>
                        <td className="px-2 py-3">
                          <Input
                            type="number"
                            value={getValue(product.id, product.price)}
                            onChange={(event) => handleValueChange(product.id, event.target.value)}
                            className="ml-auto w-24 text-right"
                          />
                        </td>
                        <td className="px-2 py-3 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium">{product.stock.toLocaleString()} total units</p>
                            <p className="text-muted-foreground">
                              {activeSizeCount} size{activeSizeCount === 1 ? "" : "s"} currently stocked
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-sm">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : product.stock < LOW_STOCK_THRESHOLD
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            )}
                          >
                            {stockStatus}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/products/edit?productId=${product.id}`}>
                                <Settings2 className="mr-1 h-3 w-3" />
                                Manage Stock
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant={rowStatus === "success" ? "outline" : "default"}
                              onClick={() => void handleSave(product.id)}
                              disabled={!changed || rowStatus === "running"}
                              className={cn(getActionFeedbackClassName(rowStatus))}
                            >
                              <Save className="mr-1 h-3 w-3" />
                              {getActionFeedbackLabel(rowStatus, PRICE_SAVE_LABELS)}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
