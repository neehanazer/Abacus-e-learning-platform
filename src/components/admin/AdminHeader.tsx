"use client";

import React from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  onToggleMobileMenu,
  title,
  subtitle,
}: AdminHeaderProps) {
  const { admin } = useAdminAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {title || "Admin Management"}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Live Session</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="p-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-300 hidden md:inline-block">
            {admin?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
