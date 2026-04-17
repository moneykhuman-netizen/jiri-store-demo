"use client";

import type { User } from "firebase/auth";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

export const UNAUTHORIZED_ADMIN_ERROR_CODE = "auth/unauthorized-admin";

let persistencePromise: Promise<void> | null = null;

const ensureAuthPersistence = () => {
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
      persistencePromise = null;
      throw error;
    });
  }

  return persistencePromise;
};

export const subscribeToAdminAuth = (callback: (user: User | null) => void) => {
  void ensureAuthPersistence().catch((error) => {
    console.error("Failed to initialize Firebase Auth persistence:", error);
  });

  return onAuthStateChanged(auth, callback);
};

export const isAuthorizedAdminUser = async (uid: string) => {
  const adminDocRef = doc(db, "admins", uid);
  const adminSnapshot = await getDoc(adminDocRef);

  if (!adminSnapshot.exists()) {
    return false;
  }

  const adminData = adminSnapshot.data();
  return adminData.active === true;
};

export const signInAdmin = async (email: string, password: string) => {
  await ensureAuthPersistence();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const isAuthorized = await isAuthorizedAdminUser(credential.user.uid);

  if (!isAuthorized) {
    await signOut(auth);
    const unauthorizedError = new Error("Unauthorized admin access");
    (unauthorizedError as Error & { code: string }).code = UNAUTHORIZED_ADMIN_ERROR_CODE;
    throw unauthorizedError;
  }

  return credential;
};

export const signOutAdmin = async () => {
  await signOut(auth);
};
