"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { Spinner } from "@/components/ui/spinner";
import { UNAUTHORIZED_ADMIN_ERROR_CODE } from "@/lib/firebase/auth";

const AUTH_ROUTES = new Set(["/admin", "/admin/login"]);

const buildLoginRedirect = (pathname: string, authErrorCode: string | null) => {
  const searchParams = new URLSearchParams({
    next: pathname,
  });

  if (authErrorCode === UNAUTHORIZED_ADMIN_ERROR_CODE) {
    searchParams.set("error", "unauthorized");
  }

  return `/admin/login?${searchParams.toString()}`;
};

export function AdminRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, authErrorCode } = useAdminAuth();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    if (!isLoading && !user && !isAuthRoute) {
      router.replace(buildLoginRedirect(pathname, authErrorCode));
    }
  }, [authErrorCode, isAuthRoute, isLoading, pathname, router, user]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
