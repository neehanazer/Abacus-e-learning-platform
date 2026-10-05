"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  GraduationCap,
  Award,
  LogOut,
  Shield,
  X,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      activePattern: /^\/admin\/dashboard/,
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: Users,
      activePattern: /^\/admin\/students/,
    },
    {
      name: "Homework",
      href: "/admin/homework",
      icon: BookOpenCheck,
      activePattern: /^\/admin\/homework/,
    },
    {
      name: "Exams",
      href: "/admin/exams",
      icon: GraduationCap,
      activePattern: /^\/admin\/exams/,
    },
    {
      name: "Certificates",
      href: "/admin/certificates",
      icon: Award,
      activePattern: /^\/admin\/certificates/,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
          <NextLink href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">
                Mind Beads
              </div>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          </NextLink>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            System Administration
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePattern.test(pathname);

            return (
              <NextLink
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
              </NextLink>
            );
          })}
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs shadow-inner">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {admin?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {admin?.email || "admin@abacus.com"}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
