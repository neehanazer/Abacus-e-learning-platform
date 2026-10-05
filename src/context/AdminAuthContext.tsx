"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface ISafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

interface AdminAuthContextType {
  admin: ISafeAdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<ISafeAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      // Check localStorage for quick hydration or fallback token
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("abacus_admin_token") : null;
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const res = await fetch("/api/admin/auth/me", {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.admin) {
          setAdmin(data.admin);
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Protect all /admin/* routes except /admin/login
  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === "/admin/login";
      if (!admin && !isLoginPage && pathname.startsWith("/admin")) {
        router.replace("/admin/login");
      } else if (admin && isLoginPage) {
        router.replace("/admin/dashboard");
      }
    }
  }, [admin, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success && data.admin) {
        setAdmin(data.admin);
        if (data.token && typeof window !== "undefined") {
          localStorage.setItem("abacus_admin_token", data.token);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAdmin(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("abacus_admin_token");
      }
      router.replace("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
