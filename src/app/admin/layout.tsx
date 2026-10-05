"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, loading } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render clean auth wrapper without admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state while verifying admin credentials
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide text-slate-300">
          Verifying Administrator Session...
        </p>
      </div>
    );
  }

  // If unauthenticated, redirect is handled inside AdminAuthContext
  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Executive Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
