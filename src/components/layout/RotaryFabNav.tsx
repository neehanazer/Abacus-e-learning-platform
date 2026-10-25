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
  Sparkles,
  LogOut,
  X,
  Layers,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  Award,
  Video,
  Sliders,
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
  const [dialValue, setDialValue] = useState(70);
  const [isDraggingDial, setIsDraggingDial] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setDialMode(false);
  }, [pathname]);

  // Hide only on admin backoffice pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Dynamic Action Items for Authenticated Student vs Public Visitor
  const items: RotaryFabItem[] = isAuthenticated && user
    ? [
        {
          id: "dashboard",
          title: "Dashboard World",
          icon: <Home className="w-4 h-4 text-amber-400" />,
          active: pathname === "/dashboard",
          onClick: () => router.push("/dashboard"),
        },
        {
          id: "virtual-abacus",
          title: "Virtual Soroban Abacus",
          icon: <Calculator className="w-4 h-4 text-orange-400" />,
          active: pathname.startsWith("/learning/virtual-abacus") || pathname === "/virtual-abacus",
          onClick: () => router.push("/learning/virtual-abacus"),
        },
        {
          id: "videos",
          title: "Video Lessons",
          icon: <Video className="w-4 h-4 text-emerald-400" />,
          active: pathname === "/learning",
          onClick: () => router.push("/learning"),
        },
        {
          id: "practice",
          title: "Daily Practice Drills",
          icon: <GraduationCap className="w-4 h-4 text-sky-400" />,
          active: pathname.startsWith("/learning/practice"),
          onClick: () => router.push("/learning/practice"),
        },
        {
          id: "homework",
          title: "Homework Center",
          icon: <CalendarCheck className="w-4 h-4 text-yellow-400" />,
          active: pathname.startsWith("/learning/homework"),
          onClick: () => router.push("/learning/homework"),
        },
        {
          id: "exam",
          title: "Mock & Final Exam",
          icon: <Award className="w-4 h-4 text-rose-400" />,
          active: pathname.startsWith("/learning/exam") || pathname.startsWith("/learning/mock-exam"),
          onClick: () => router.push("/learning/exam"),
        },
        {
          id: "certificate",
          title: "My Certificate",
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          active: pathname.startsWith("/learning/certificate"),
          onClick: () => router.push("/learning/certificate"),
        },
        {
          id: "profile",
          title: `Student: ${(user.fullName || user.name || "Student").split(" ")[0]}`,
          icon: <span className="text-base">{user.avatar || "🧙‍♂️"}</span>,
          active: pathname === "/profile",
          onClick: () => router.push("/profile"),
        },
        {
          id: "dial",
          title: `Sound Volume: ${dialValue}%`,
          icon: <Volume2 className="w-4 h-4 text-yellow-300" />,
          onClick: () => setDialMode(true),
        },
        {
          id: "logout",
          title: "Log Out",
          icon: <LogOut className="w-4 h-4 text-rose-400" />,
          danger: true,
          onClick: () => {
            logout();
            router.push("/");
          },
        },
      ]
    : [
        {
          id: "home",
          title: "Home World",
          icon: <Home className="w-4 h-4 text-amber-300" />,
          active: pathname === "/",
          onClick: () => router.push("/"),
        },
        {
          id: "about",
          title: "About Us",
          icon: <Info className="w-4 h-4 text-indigo-300" />,
          active: pathname === "/about",
          onClick: () => router.push("/about"),
        },
        {
          id: "syllabus",
          title: "How It Works & Syllabus",
          icon: <BookOpen className="w-4 h-4 text-emerald-300" />,
          active: pathname === "/how-it-works",
          onClick: () => router.push("/how-it-works"),
        },
        {
          id: "contact",
          title: "Contact & Support",
          icon: <Mail className="w-4 h-4 text-sky-300" />,
          active: pathname === "/contact",
          onClick: () => router.push("/contact"),
        },
        {
          id: "virtual-abacus-guest",
          title: "Virtual Soroban Abacus",
          icon: <Calculator className="w-4 h-4 text-orange-400" />,
          active: pathname === "/virtual-abacus",
          onClick: () => router.push("/virtual-abacus"),
        },
        {
          id: "dial",
          title: `Sound Volume: ${dialValue}%`,
          icon: <Volume2 className="w-4 h-4 text-yellow-300" />,
          onClick: () => setDialMode(true),
        },
        {
          id: "login",
          title: "Student Login",
          icon: <User className="w-4 h-4 text-purple-200" />,
          onClick: () => router.push("/login"),
        },
        {
          id: "register",
          title: "Register Free",
          icon: <Sparkles className="w-4 h-4 text-amber-300" />,
          hasBadge: "Free",
          badgeColor: "#E63946",
          onClick: () => router.push("/register"),
        },
      ];

  // Dial drag scrubbing logic
  const handleDialPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.right;
    const centerY = rect.top;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const normalized = Math.min(100, Math.max(0, Math.round(((Math.PI - angleRad) / (Math.PI / 2)) * 100)));
    setDialValue(normalized);
  };

  const isPortalPage = pathname?.startsWith("/dashboard") || pathname?.startsWith("/learning");

  return (
    <>
      {/* Dimmed backdrop when Rotary FAB is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setDialMode(false);
            }}
            className="md:hidden fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* Top Floating Minimalist Brand Bar (Phone view only on public marketing pages) */}
      {!isPortalPage && (
        <div className="md:hidden fixed top-3 left-4 z-40">
          <Link
            href="/"
            className="flex items-center gap-2 group bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-full border border-purple-100 shadow-md shadow-purple-900/5 hover:scale-105 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-xs">
              <div className="w-full h-full bg-white rounded-[5px] flex items-center justify-center text-purple-600">
                <Calculator className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex items-center gap-1 font-heading font-extrabold text-sm tracking-tight text-slate-800">
              <span>Mind<span className="text-purple-600">Beads</span></span>
              <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                AI
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Main Luxury Rotary FAB Navigation Bar (Phone view only - Upper-Right) */}
      <div className="md:hidden fixed top-3 right-3 sm:top-4 sm:right-4 z-[99] select-none">
        {/* Ambient Backlight Glow */}
        <div
          className={`absolute -inset-6 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
            isOpen ? "opacity-70 bg-purple-600/40" : "opacity-0"
          }`}
        />

        {/* Rotary FAB Menu Container */}
        <div className="relative">
          {/* Main FAB Trigger Button in Upper-Right */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (dialMode) {
                setDialMode(false);
              } else {
                setIsOpen((prev) => !prev);
              }
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden z-[99] ${
              isOpen
                ? "bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border-rose-400/90 shadow-rose-900/40"
                : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-amber-400/90 shadow-purple-900/40"
            }`}
            aria-label="Toggle Phone Navigation Bar"
          >
            {/* Inner Rotating Ring */}
            <div
              className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin pointer-events-none"
              style={{ animationDuration: "25s" }}
            />

            {/* Core Icon & Text */}
            <div className="relative z-10 flex items-center gap-1.5">
              {dialMode ? (
                <Sliders className="w-4 h-4 text-yellow-400 animate-pulse" />
              ) : isOpen ? (
                <X className="w-4 h-4 text-rose-400 transition-transform rotate-0" />
              ) : (
                <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
              )}
              <span className={`text-[11px] font-black tracking-wider uppercase ${
                isOpen ? "text-rose-200" : "text-amber-300"
              }`}>
                {dialMode ? "Dial" : isOpen ? "Close" : "Menu"}
              </span>
            </div>
          </motion.button>

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
                className="absolute top-12 right-0 w-64 h-64 pointer-events-auto cursor-grab active:cursor-grabbing z-[98]"
              >
                {/* Dial Center Chrono Badge */}
                <div className="absolute bottom-8 left-8 bg-slate-900/95 text-white p-3 rounded-2xl border-2 border-yellow-400/80 shadow-2xl backdrop-blur-xl text-center z-10">
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
                  <path
                    d="M 32 224 A 192 192 0 0 0 224 32"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 32 224 A 192 192 0 0 0 224 32"
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

          {/* Rotary Navigation Action Items with Visible Titles */}
          <AnimatePresence>
            {isOpen && !dialMode && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 right-0 flex flex-col items-end gap-1.5 pt-2 max-h-[80vh] overflow-y-auto no-scrollbar pr-0.5 z-[96]"
              >
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 25, scale: 0.85 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.85 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 26,
                      delay: idx * 0.025,
                    }}
                  >
                    <button
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        if (item.id !== "dial") setIsOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-xl border-2 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
                        item.active
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white shadow-purple-500/50 ring-2 ring-purple-300"
                          : item.danger
                          ? "bg-slate-900/95 text-rose-300 border-rose-500/60 hover:bg-rose-600 hover:text-white"
                          : "bg-slate-900/95 text-white border-purple-400/50 hover:border-amber-300 hover:bg-slate-800"
                      }`}
                    >
                      {/* Icon */}
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>

                      {/* Explicit Title Displayed on Touchscreen */}
                      <span className="text-xs font-bold tracking-tight">
                        {item.title}
                      </span>

                      {/* Optional Badge */}
                      {item.hasBadge && (
                        <span
                          style={{ backgroundColor: item.badgeColor || "#E63946" }}
                          className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full shadow-md ml-1"
                        >
                          {item.hasBadge}
                        </span>
                      )}
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
