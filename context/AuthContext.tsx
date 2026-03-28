"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  session: any;
  loading: boolean;
  role: string;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("user");
  const router = useRouter();

  const syncUserToSupabase = useCallback(async () => {
    if (!clerkUser) return;

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
    const email = clerkUser.primaryEmailAddress?.emailAddress || "";
    const userRole = email.toLowerCase() === adminEmail.toLowerCase() ? "admin" : "user";

    // Try to sync profile to Supabase. If it fails (e.g. RLS or table missing),
    // fall back to Clerk data so the UI still works.
    const fallbackProfile: Profile = {
      id: clerkUser.id,
      email,
      name: clerkUser.fullName || clerkUser.firstName || "User",
      avatar_url: clerkUser.imageUrl || undefined,
      role: userRole,
    };

    try {
      // Use server-side API to sync profile (bypasses RLS)
      const res = await fetch("/api/user/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clerkUser.id,
          email,
          name: clerkUser.fullName || clerkUser.firstName || "User",
          avatar_url: clerkUser.imageUrl || null,
          role: userRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setRole(data.profile.role || "user");
          return;
        }
      }

      // API sync failed — use fallback
      setProfile(fallbackProfile);
      setRole(userRole);
    } catch {
      setProfile(fallbackProfile);
      setRole(userRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser?.id]);

  // Check for OTP-based login stored in localStorage
  const loadOtpUser = useCallback(() => {
    try {
      const stored = localStorage.getItem("otp_user");
      if (stored) {
        const otpUser = JSON.parse(stored);
        setProfile({
          id: otpUser.id || `otp_${otpUser.email?.replace(/[^a-z0-9]/gi, "_")}`,
          email: otpUser.email,
          name: otpUser.name || otpUser.email?.split("@")[0] || "User",
          avatar_url: otpUser.avatar_url,
          role: otpUser.role || "user",
        });
        setRole(otpUser.role || "user");
        return true;
      }
    } catch {
      localStorage.removeItem("otp_user");
    }
    return false;
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        syncUserToSupabase().finally(() => setLoading(false));
      } else {
        // No Clerk session — check for OTP user
        const hasOtpUser = loadOtpUser();
        if (!hasOtpUser) {
          setProfile(null);
          setRole("user");
        }
        setLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, syncUserToSupabase, loadOtpUser]);

  const signOut = async () => {
    // Clear OTP session (localStorage + server cookie)
    localStorage.removeItem("otp_user");
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    if (isSignedIn) {
      await clerkSignOut();
    }
    setProfile(null);
    setRole("user");
    router.push("/");
  };

  const isAuthenticated = !!isSignedIn || !!profile;

  return (
    <AuthContext.Provider
      value={{
        user: clerkUser
          ? {
              id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              name: clerkUser.fullName || clerkUser.firstName,
            }
          : profile
          ? { id: profile.id, email: profile.email, name: profile.name }
          : null,
        profile,
        session: isSignedIn ? { user: clerkUser } : profile ? { user: profile } : null,
        loading,
        role,
        signOut,
        isAuthenticated,
        isAdmin: role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
