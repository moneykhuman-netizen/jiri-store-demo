"use client";

import { useAdminStore } from "@/lib/admin-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tags, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const products = useAdminStore((state) => state.products);
  const brands = useAdminStore((state) => state.brands);
  const categories = useAdminStore((state) => state.categories);

  const totalProducts = products.length;
  const totalBrands = brands.length;
  const totalCategories = categories.men.length + categories.women.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock < 15);
  const outOfStock = products.filter((p) => p.stock === 0);

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/products/edit",
    },
    {
      title: "Active Brands",
      value: totalBrands,
      icon: Tags,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/brands",
    },
    {
      title: "Categories",
      value: totalCategories,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/categories",
    },
    {
      title: "Homepage",
      value: "-",
      icon: CheckCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      href: "/admin/homepage",
    },
    {
      title: "Inventory Value",
      value: `Rs ${(totalValue / 100000).toFixed(1)}L`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      href: "/admin/inventory",
    },
  ];

  const recentProducts = products.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-2 sm:p-3 rounded-lg`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Low Stock Alert */}
        <Card className={lowStockProducts.length > 0 ? "border-amber-200 bg-amber-50/50" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className={`w-5 h-5 ${lowStockProducts.length > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              Products with less than 15 units in stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <li key={product.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{product.name}</span>
                    <span className="font-medium text-amber-600 ml-2">{product.stock} left</span>
                  </li>
                ))}
                {lowStockProducts.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    +{lowStockProducts.length - 5} more items
                  </li>
                )}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>All products are well stocked</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card className={outOfStock.length > 0 ? "border-red-200 bg-red-50/50" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className={`w-5 h-5 ${outOfStock.length > 0 ? "text-red-600" : "text-muted-foreground"}`} />
              Out of Stock
            </CardTitle>
            <CardDescription>
              Products that need immediate restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {outOfStock.length > 0 ? (
              <ul className="space-y-2">
                {outOfStock.map((product) => (
                  <li key={product.id} className="text-sm">
                    {product.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>No products out of stock</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>Latest products in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground text-sm">Product</th>
                  <th className="pb-3 font-medium text-muted-foreground text-sm hidden sm:table-cell">Brand</th>
                  <th className="pb-3 font-medium text-muted-foreground text-sm hidden md:table-cell">Category</th>
                  <th className="pb-3 font-medium text-muted-foreground text-sm text-right">Price</th>
                  <th className="pb-3 font-medium text-muted-foreground text-sm text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <span className="font-medium text-sm">{product.name}</span>
                      <span className="block sm:hidden text-xs text-muted-foreground">{product.brand}</span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {product.brand}
                    </td>
                    <td className="py-3 text-sm hidden md:table-cell">
                      <span className="capitalize bg-muted px-2 py-1 rounded text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-right font-medium">
                      Rs {product.price.toLocaleString()}
                    </td>
                    <td className="py-3 text-sm text-right">
                      <span className={product.stock < 15 ? "text-amber-600 font-medium" : ""}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/products/add"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"
            >
              <Package className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">Add Product</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"
            >
              <DollarSign className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">Update Prices</span>
            </Link>
            <Link
              href="/admin/brands"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"
            >
              <Tags className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">Add Brand</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"
            >
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">View Store</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
