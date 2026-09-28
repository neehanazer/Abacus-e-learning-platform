"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Info,
  BookOpen,
  Mail,
  User,
  Calculator,
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  LogOut,
  X,
  Layers,
  ChevronRight,
  Sliders,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface RotaryFabItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  danger?: boolean;
  hasBadge?: boolean | number | string;
  badgeColor?: string;
  onClick?: () => void;
  href?: string;
}

export default function RotaryFabNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [dialMode, setDialMode] = useState(false);
  const [dialValue, setDialValue] = useState(70); // Sound / Speed dial
  const [isDraggingDial, setIsDraggingDial] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // Hide on dedicated dashboard and learning portal pages
  if (pathname === "/dashboard" || pathname.startsWith("/learning")) {
    return null;
  }

  // Define concentric orbital action items
  const items: RotaryFabItem[] = [
    // Tier 1 (Inner Concentric Orbit - r: 105px)
    {
      id: "home",
      title: "Home World",
      icon: <Home className="w-5 h-5 text-amber-300" />,
      active: pathname === "/",
      onClick: () => router.push("/"),
    },
    {
      id: "about",
      title: "About Us",
      icon: <Info className="w-5 h-5 text-indigo-300" />,
      active: pathname === "/about",
      onClick: () => router.push("/about"),
    },
    {
      id: "syllabus",
      title: "How It Works & Syllabus",
      icon: <BookOpen className="w-5 h-5 text-emerald-300" />,
      active: pathname === "/how-it-works",
      onClick: () => router.push("/how-it-works"),
    },
    {
      id: "contact",
      title: "Contact & Support",
      icon: <Mail className="w-5 h-5 text-sky-300" />,
      active: pathname === "/contact",
      onClick: () => router.push("/contact"),
    },

    // Tier 2 (Outer Concentric Orbit - r: 175px)
    {
      id: "dial",
      title: `Sound Volume: ${dialValue}%`,
      icon: <Volume2 className="w-5 h-5 text-yellow-300" />,
      onClick: () => setDialMode(true),
    },
    ...(isAuthenticated && user
      ? [
          {
            id: "profile",
            title: `Student: ${(user.fullName || user.name || "Student").split(" ")[0]}`,
            icon: <span className="text-lg">{user.avatar || "🧙‍♂️"}</span>,
            onClick: () => router.push("/profile"),
          },
          {
            id: "logout",
            title: "Log Out",
            icon: <LogOut className="w-5 h-5 text-rose-300" />,
            danger: true,
            onClick: () => {
              logout();
              router.push("/");
            },
          },
        ]
      : [
          {
            id: "login",
            title: "Student Login",
            icon: <User className="w-5 h-5 text-purple-200" />,
            onClick: () => router.push("/login"),
          },
          {
            id: "register",
            title: "Register Free",
            icon: <Sparkles className="w-5 h-5 text-amber-300" />,
            hasBadge: "Free",
            badgeColor: "#E63946",
            onClick: () => router.push("/register"),
          },
        ]),
  ];

  // Distribute items onto 2 Concentric Orbital Arcs (Bottom-Right quadrant: 90° to 180° / 180° to 270°)
  const tier1Items = items.slice(0, 4);
  const tier2Items = items.slice(4);

  const getCoordinates = (index: number, total: number, radius: number) => {
    // Quadrant: bottom-right (sweep from 180° to 270°)
    const startAngle = Math.PI; // 180 deg (left)
    const endAngle = (3 * Math.PI) / 2; // 270 deg (top)
    const angle = startAngle + (index / Math.max(1, total - 1)) * (endAngle - startAngle);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, angleDeg: (angle * 180) / Math.PI };
  };

  // Dial drag scrubbing logic
  const handleDialPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width;
    const centerY = rect.top + rect.height;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const angleRad = Math.atan2(deltaY, deltaX);
    // Map angle from -PI (left) to -PI/2 (top) into 0 to 100%
    const normalized = Math.min(100, Math.max(0, Math.round(((angleRad + Math.PI) / (Math.PI / 2)) * 100)));
    setDialValue(normalized);
  };

  return (
    <>
      {/* Top Floating Minimalist Brand Bar (Phone view only) */}
      <div className="md:hidden fixed top-5 left-6 z-40">
        <Link href="/" className="flex items-center gap-3 group bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full border border-purple-100/80 shadow-lg shadow-purple-900/5 hover:scale-105 transition-all">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-purple-600">
              <Calculator className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-heading font-extrabold text-lg tracking-tight text-slate-800">
            <span>Abacus<span className="text-purple-600">Mind</span></span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              AI
            </span>
          </div>
        </Link>
      </div>

      {/* Main Luxury Concentric Rotary FAB (Phone view only - Bottom-Right) */}
      <div className="md:hidden fixed bottom-7 right-7 z-50 select-none">
        {/* Ambient Backlight Glow */}
        <div
          className={`absolute -inset-10 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            isOpen ? "opacity-60 bg-purple-500/30" : "opacity-0"
          }`}
        />

        {/* Rotary FAB Menu Container */}
        <div className="relative">
          {/* Orbital Guide Arc Lines */}
          {isOpen && !dialMode && (
            <svg
              className="absolute bottom-0 right-0 pointer-events-none overflow-visible"
              width="260"
              height="260"
              style={{ transform: "translate(24px, 24px)" }}
            >
              {/* Inner Orbit Line (Tier 1) */}
              <path
                d="M -105 0 A 105 105 0 0 1 0 -105"
                fill="none"
                stroke="rgba(108, 92, 231, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Outer Orbit Line (Tier 2) */}
              <path
                d="M -175 0 A 175 175 0 0 1 0 -175"
                fill="none"
                stroke="rgba(255, 159, 67, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          )}

          {/* Precision Rotary Dial Scrubber Mode */}
          <AnimatePresence>
            {isOpen && dialMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                ref={dialRef}
                onPointerDown={(e) => {
                  setIsDraggingDial(true);
                  handleDialPointer(e);
                }}
                onPointerMove={(e) => {
                  if (isDraggingDial) handleDialPointer(e);
                }}
                onPointerUp={() => setIsDraggingDial(false)}
                className="absolute bottom-0 right-0 w-64 h-64 pointer-events-auto cursor-grab active:cursor-grabbing"
              >
                {/* Dial Center Chrono Badge */}
                <div className="absolute top-12 left-12 bg-slate-900/95 text-white p-3 rounded-2xl border-2 border-yellow-400/80 shadow-2xl backdrop-blur-xl text-center z-10">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block">
                    Sound Level
                  </span>
                  <span className="text-2xl font-black font-mono">{dialValue}%</span>
                </div>

                {/* Dial Arc Track SVG */}
                <svg className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6C5CE7" />
                      <stop offset="50%" stopColor="#FECA57" />
                      <stop offset="100%" stopColor="#FF6B6B" />
                    </linearGradient>
                  </defs>
                  {/* Outer Bezel Track */}
                  <path
                    d="M 64 256 A 192 192 0 0 1 256 64"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Value Fill Arc */}
                  <path
                    d="M 64 256 A 192 192 0 0 1 256 64"
                    fill="none"
                    stroke="url(#dialGrad)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray="301"
                    strokeDashoffset={301 - (301 * dialValue) / 100}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Items on Concentric Arcs */}
          <AnimatePresence>
            {isOpen &&
              !dialMode &&
              [...tier1Items, ...tier2Items].map((item, idx) => {
                const isTier1 = idx < tier1Items.length;
                const radius = isTier1 ? 105 : 175;
                const indexInTier = isTier1 ? idx : idx - tier1Items.length;
                const totalInTier = isTier1 ? tier1Items.length : tier2Items.length;
                const { x, y } = getCoordinates(indexInTier, totalInTier, radius);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      x: x + 8,
                      y: y + 8,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 22,
                      delay: idx * 0.04,
                    }}
                    className="absolute bottom-0 right-0 group/item"
                  >
                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (item.onClick) item.onClick();
                      }}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl border-2 transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer ${
                        item.active
                          ? "bg-purple-600 text-white border-white shadow-purple-500/50"
                          : item.danger
                          ? "bg-slate-900 text-rose-400 border-rose-500/60 hover:bg-rose-600 hover:text-white"
                          : isTier1
                          ? "bg-slate-900/95 text-white border-purple-400/60 hover:border-purple-300 hover:bg-purple-700"
                          : "bg-slate-900/95 text-white border-amber-400/60 hover:border-amber-300 hover:bg-amber-600"
                      }`}
                    >
                      {item.icon}

                      {/* Notification Badge */}
                      {item.hasBadge && (
                        <span
                          style={{ backgroundColor: item.badgeColor || "#E63946" }}
                          className="absolute -top-1 -right-1 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full shadow-md"
                        >
                          {item.hasBadge}
                        </span>
                      )}
                    </button>

                    {/* Accessible Horology Tooltip */}
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap">
                      {item.title}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* Central Luxury Watchmaker Core FAB Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              if (dialMode) {
                setDialMode(false);
              } else {
                setIsOpen((prev) => !prev);
              }
            }}
            className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-1 shadow-2xl border-2 border-amber-400/80 hover:border-amber-300 transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden z-20 group"
          >
            {/* Inner Rotating Bezel Ring */}
            <div className="absolute inset-1 rounded-full border border-dashed border-white/25 animate-spin pointer-events-none" style={{ animationDuration: "20s" }} />

            {/* Core Icon State */}
            <div className="relative z-10">
              {dialMode ? (
                <Sliders className="w-7 h-7 text-yellow-400 animate-pulse" />
              ) : isOpen ? (
                <X className="w-7 h-7 text-rose-400 transition-transform rotate-0 group-hover:rotate-90" />
              ) : (
                <Compass className="w-7 h-7 text-amber-400 transition-transform group-hover:rotate-45" />
              )}
            </div>
          </motion.button>
        </div>
      </div>
    </>
  );
}
