"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  isAuthorizedAdminUser,
  signInAdmin,
  signOutAdmin,
  subscribeToAdminAuth,
  UNAUTHORIZED_ADMIN_ERROR_CODE,
} from "@/lib/firebase/auth";

type AdminAuthContextValue = {
  user: User | null;
  isLoading: boolean;
  authErrorCode: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAdminAuth((nextUser) => {
      setIsLoading(true);

      if (!nextUser) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      void (async () => {
        try {
          const isAuthorized = await isAuthorizedAdminUser(nextUser.uid);

          if (!isMounted) {
            return;
          }

          if (isAuthorized) {
            setUser(nextUser);
            setAuthErrorCode(null);
            setIsLoading(false);
            return;
          }

          await signOutAdmin();

          if (!isMounted) {
            return;
          }

          setUser(null);
          setAuthErrorCode(UNAUTHORIZED_ADMIN_ERROR_CODE);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to validate admin authorization:", error);

          try {
            await signOutAdmin();
          } catch (signOutError) {
            console.error("Failed to sign out unauthorized admin session:", signOutError);
          }

          if (!isMounted) {
            return;
          }

          setUser(null);
          setAuthErrorCode(UNAUTHORIZED_ADMIN_ERROR_CODE);
          setIsLoading(false);
        }
      })();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isLoading,
      authErrorCode,
      signIn: async (email: string, password: string) => {
        setAuthErrorCode(null);
        await signInAdmin(email, password);
      },
      signOut: async () => {
        setAuthErrorCode(null);
        await signOutAdmin();
      },
    }),
    [authErrorCode, isLoading, user]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
