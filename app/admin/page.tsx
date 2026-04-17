"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { Spinner } from "@/components/ui/spinner";
import { UNAUTHORIZED_ADMIN_ERROR_CODE } from "@/lib/firebase/auth";

export default function AdminEntryPage() {
  const router = useRouter();
  const { user, isLoading, authErrorCode } = useAdminAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      router.replace("/admin/dashboard");
      return;
    }

    router.replace(
      authErrorCode === UNAUTHORIZED_ADMIN_ERROR_CODE
        ? "/admin/login?error=unauthorized"
        : "/admin/login"
    );
  }, [authErrorCode, isLoading, router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
