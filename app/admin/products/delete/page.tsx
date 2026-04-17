"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteProductPage() {
  const products = useAdminStore((state) => state.products);
  const deleteProduct = useAdminStore((state) => state.deleteProduct);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) => {
        return (
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.id.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery)
        );
      })
    : products;

  const productInfo =
    productToDelete === null
      ? null
      : products.find((product) => product.id === productToDelete) ?? null;

  const handleDelete = () => {
    if (!productToDelete) {
      return;
    }

    deleteProduct(productToDelete);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Delete Products</h1>
          <p className="text-muted-foreground">Remove products from inventory</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Deleting a product is permanent and cannot be undone.
      </div>

      <div className="space-y-2">
        <label htmlFor="delete-product-search" className="text-sm font-medium">
          Search Products
        </label>
        <Input
          id="delete-product-search"
          placeholder="Search by product name, id, or category..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
          {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">No products found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-medium">{product.name}</p>
                  <p className="break-all text-xs text-muted-foreground">ID: {product.id}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Category: {product.category}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setProductToDelete(product.id)}
                  className="w-full sm:w-auto"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{productInfo?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
