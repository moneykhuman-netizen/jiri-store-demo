"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import {
  LayoutDashboard,
  Package,
  Plus,
  Edit,
  Trash2,
  Tags,
  FolderTree,
  ImagePlus,
  DollarSign,
  LogOut,
  Menu,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    icon: Package,
    children: [
      { title: "Add Product", href: "/admin/products/add", icon: Plus },
      { title: "Edit Product", href: "/admin/products/edit", icon: Edit },
      { title: "Delete Product", href: "/admin/products/delete", icon: Trash2 },
    ],
  },
  {
    title: "Manage Brands",
    href: "/admin/brands",
    icon: Tags,
  },
  {
    title: "Manage Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Upload Images",
    href: "/admin/images",
    icon: ImagePlus,
  },
  {
    title: "Price & Stock",
    href: "/admin/inventory",
    icon: DollarSign,
  },
  {
    title: "Manage Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAdminAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Products"]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/admin/login");
    } catch (error) {
      console.error("Failed to sign out from Firebase Auth:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="flex flex-col">
            <span className="text-xl font-sans font-black tracking-tight text-foreground uppercase">
              JIRI
            </span>
            <span className="text-[8px] font-medium tracking-[0.15em] text-muted-foreground uppercase">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.title);
            const isChildActive = hasChildren && item.children.some((child) => pathname === child.href);

            if (hasChildren) {
              return (
                <li key={item.title}>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isChildActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.title}
                    </span>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-border space-y-1">
                      {item.children.map((child) => {
                        const isChildItemActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                isChildItemActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          <LogOut className="w-5 h-5" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <NavContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
        <NavContent />
      </aside>
    </>
  );
}
