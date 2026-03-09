"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Trash2, Tags, Package } from "lucide-react";
import Link from "next/link";

export default function BrandsPage() {
  const brands = useAdminStore((state) => state.brands);
  const products = useAdminStore((state) => state.products);
  const addBrand = useAdminStore((state) => state.addBrand);
  const removeBrand = useAdminStore((state) => state.removeBrand);

  const [newBrand, setNewBrand] = useState("");
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAddBrand = () => {
    const trimmed = newBrand.trim();
    if (!trimmed) {
      setError("Brand name is required");
      return;
    }
    if (brands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      setError("Brand already exists");
      return;
    }
    addBrand(trimmed);
    setNewBrand("");
    setError("");
  };

  const handleDeleteBrand = () => {
    if (brandToDelete) {
      removeBrand(brandToDelete);
      setBrandToDelete(null);
    }
  };

  const getProductCount = (brand: string) => {
    return products.filter((p) => p.brand === brand).length;
  };

  const brandToDeleteInfo = brandToDelete
    ? { name: brandToDelete, count: getProductCount(brandToDelete) }
    : null;

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
          <h1 className="text-2xl font-bold">Manage Brands</h1>
          <p className="text-muted-foreground">Add, view, and remove brands</p>
        </div>
      </div>

      {/* Add Brand */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Brand</CardTitle>
          <CardDescription>Enter a brand name to add to the store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter brand name"
                value={newBrand}
                onChange={(e) => {
                  setNewBrand(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAddBrand()}
              />
              {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
            <Button onClick={handleAddBrand}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brands List */}
      <Card>
        <CardHeader>
          <CardTitle>All Brands ({brands.length})</CardTitle>
          <CardDescription>Brands available in your store</CardDescription>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <div className="text-center py-12">
              <Tags className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No brands added yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {brands.map((brand) => {
                const productCount = getProductCount(brand);
                return (
                  <div
                    key={brand}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tags className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{brand}</p>
                        <p className="text-xs text-muted-foreground">
                          {productCount} {productCount === 1 ? "product" : "products"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setBrandToDelete(brand)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{brandToDeleteInfo?.name}</strong>?
              {brandToDeleteInfo && brandToDeleteInfo.count > 0 && (
                <span className="block mt-2 text-amber-600">
                  Warning: This brand has {brandToDeleteInfo.count} associated products.
                  The products will not be deleted but will need to be reassigned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
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
