"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowLeft, Plus, Trash2, FolderTree } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const categories = useAdminStore((state) => state.categories);
  const products = useAdminStore((state) => state.products);
  const addCategory = useAdminStore((state) => state.addCategory);
  const removeCategory = useAdminStore((state) => state.removeCategory);

  const [newCategoryMen, setNewCategoryMen] = useState("");
  const [newCategoryWomen, setNewCategoryWomen] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<{ gender: "men" | "women"; name: string } | null>(null);
  const [error, setError] = useState<{ men?: string; women?: string }>({});

  const handleAddCategory = (gender: "men" | "women") => {
    const value = gender === "men" ? newCategoryMen : newCategoryWomen;
    const trimmed = value.trim();

    if (!trimmed) {
      setError((prev) => ({ ...prev, [gender]: "Category name is required" }));
      return;
    }

    if (categories[gender].some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError((prev) => ({ ...prev, [gender]: "Category already exists" }));
      return;
    }

    addCategory(gender, trimmed);
    if (gender === "men") {
      setNewCategoryMen("");
    } else {
      setNewCategoryWomen("");
    }
    setError((prev) => ({ ...prev, [gender]: undefined }));
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      removeCategory(categoryToDelete.gender, categoryToDelete.name);
      setCategoryToDelete(null);
    }
  };

  const getProductCount = (gender: "men" | "women", type: string) => {
    return products.filter((p) => p.category === gender && p.type === type).length;
  };

  const categoryToDeleteInfo = categoryToDelete
    ? { ...categoryToDelete, count: getProductCount(categoryToDelete.gender, categoryToDelete.name) }
    : null;

  const renderCategoryList = (gender: "men" | "women") => {
    const categoryList = categories[gender];
    const newValue = gender === "men" ? newCategoryMen : newCategoryWomen;
    const setNewValue = gender === "men" ? setNewCategoryMen : setNewCategoryWomen;

    return (
      <div className="space-y-6">
        {/* Add Category */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder={`Enter ${gender === "men" ? "men's" : "women's"} category`}
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value);
                setError((prev) => ({ ...prev, [gender]: undefined }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory(gender)}
            />
            {error[gender] && (
              <p className="text-sm text-destructive mt-1">{error[gender]}</p>
            )}
          </div>
          <Button onClick={() => handleAddCategory(gender)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Categories List */}
        {categoryList.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories added yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {categoryList.map((category) => {
              const productCount = getProductCount(gender, category);
              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderTree className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{category}</p>
                      <p className="text-xs text-muted-foreground">
                        {productCount} {productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setCategoryToDelete({ gender, name: category })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
          <h1 className="text-2xl font-bold">Manage Categories</h1>
          <p className="text-muted-foreground">Add and remove product categories</p>
        </div>
      </div>

      {/* Categories Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>
            Manage categories for men&apos;s and women&apos;s footwear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="men">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="men">
                Men ({categories.men.length})
              </TabsTrigger>
              <TabsTrigger value="women">
                Women ({categories.women.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="men" className="mt-6">
              {renderCategoryList("men")}
            </TabsContent>
            <TabsContent value="women" className="mt-6">
              {renderCategoryList("women")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{categoryToDeleteInfo?.name}</strong> from{" "}
              {categoryToDeleteInfo?.gender === "men" ? "men's" : "women's"} categories?
              {categoryToDeleteInfo && categoryToDeleteInfo.count > 0 && (
                <span className="block mt-2 text-amber-600">
                  Warning: This category has {categoryToDeleteInfo.count} associated products.
                  Deleting it will remove those products from the backbone and clean any featured or new-arrival references automatically.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
