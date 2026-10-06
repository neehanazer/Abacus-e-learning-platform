"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronDown, 
  Star, 
  BookOpen, 
  Gamepad2, 
  ArrowRight, 
  ArrowLeft,
  Rocket,
  UserCheck
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import InteractiveModuleModal from "@/components/dashboard/InteractiveModuleModals";
import { isDueDateToday } from "@/data/homeworkData";

export default function AbacusWorldDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeModal, setActiveModal] = useState<"learning" | "braingym" | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [dueTodayHomework, setDueTodayHomework] = useState<{ id: string; title: string }[]>([]);

  React.useEffect(() => {
    try {
      if (!user) return;
      const studentKey =
        user?.id || user?.email
          ? String(user.id || user.email).replace(/[^a-zA-Z0-9_-]/g, "_")
          : "guest";
      const savedTasks = localStorage.getItem(`abacus_homework_state_v3_${studentKey}`);
      let tasks: any[] = [];
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) tasks = parsed;
      }
      if (tasks.length === 0) {
        const { INITIAL_HOMEWORK_LIST } = require("@/data/homeworkData");
        tasks = INITIAL_HOMEWORK_LIST;
      }

      const raw = user?.selectedLevel || user?.abacusLevel || (user as any)?.currentLevel || "";
      const m = String(raw).match(/Level\s*(\d+)/i) || String(raw).match(/^(\d+)$/);
      const studentLvl = m ? parseInt(m[1], 10) : 1;

      const pendingCurrentLevel = tasks.filter(
        (t: any) =>
          t.level === studentLvl &&
          t.status !== "completed" &&
          t.status !== "submitted" &&
          t.status !== "evaluated" &&
          isDueDateToday(t.dueDate)
      );

      setDueTodayHomework(pendingCurrentLevel.map((t: any) => ({ id: t.id, title: t.title })));
    } catch {}
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 animate-spin flex items-center justify-center text-white font-bold text-2xl">
          🧮
        </div>
        <p className="text-sm font-bold text-amber-700 animate-pulse font-heading">
          Loading Your Abacus World...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const studentName = user?.fullName?.split(" ")[0] || "Arjun";
  const rawLevel = user?.selectedLevel || user?.abacusLevel || "Level 1";
  const studentLevel = rawLevel.includes(":") ? rawLevel.split(":")[0] : rawLevel.split(" - ")[0] || rawLevel;
  const userStars = 120 + (user?.earnedBadges?.length || 0) * 15;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden font-sans selection:bg-yellow-200">

      {/* Background Nature Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-100 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-10 w-16 h-16 bg-green-200 rounded-full opacity-40 blur-xl pointer-events-none" />
      <div className="absolute bottom-4 right-20 w-12 h-12 bg-green-200 rounded-full opacity-30 blur-lg pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Left Section: Back Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white hover:bg-yellow-50 text-[#1D3557] border border-yellow-200 flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#F4A261]" />
          </button>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 relative group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm">
              <rect x="4" y="8" width="32" height="24" rx="4" fill="#F4A261" />
              <rect x="6" y="10" width="28" height="20" rx="2" fill="#E9C46A" />
              <line x1="10" y1="10" x2="10" y2="30" stroke="#8B4513" strokeWidth="2" />
              <line x1="20" y1="10" x2="20" y2="30" stroke="#8B4513" strokeWidth="2" />
              <line x1="30" y1="10" x2="30" y2="30" stroke="#8B4513" strokeWidth="2" />
              <circle cx="10" cy="16" r="2.5" fill="#E63946" />
              <circle cx="10" cy="24" r="2.5" fill="#2A9D8F" />
              <circle cx="20" cy="16" r="2.5" fill="#E9C46A" />
              <circle cx="20" cy="24" r="2.5" fill="#E63946" />
              <circle cx="30" cy="16" r="2.5" fill="#2A9D8F" />
              <circle cx="30" cy="24" r="2.5" fill="#E9C46A" />
            </svg>
          </div>
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-[#E63946]">Abacus</span>
            <span className="text-[#1D3557] ml-1">World</span>
          </div>
        </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 relative">
          {/* Points */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-yellow-100">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-[#1D3557]">{userStars}</span>
          </div>

          {/* Profile Pill with Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow select-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {studentName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[#1D3557] leading-tight">{studentName}</p>
                <p className="text-xs text-gray-500 leading-tight">{studentLevel}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-[#1D3557] truncate">{user?.fullName || studentName}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-amber-700 transition"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <span>👤 My Profile</span>
                </Link>
                <Link
                  href="/dashboard/certificate"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-amber-700 transition"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <span>🎓 My Certificate</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-amber-700 transition"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <span>🏠 Back to Website</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition cursor-pointer border-t border-gray-100 mt-1"
                >
                  <span>🚪 Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20">
        {/* URGENT NOTIFICATION BANNER: Homework Due Date Today */}
        {dueTodayHomework.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-500/60 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md text-xl">
                🔔
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                    ⚠️ Urgent: Homework Due Today!
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {dueTodayHomework.length} assignment{dueTodayHomework.length > 1 ? "s" : ""} pending
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#1D3557]">
                  Today is the official due date for your homework!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                  {dueTodayHomework.map((t) => `"${t.title}"`).join(", ")} — 70% homework completion is strictly compulsory to attend the Official Certification Exam. Complete and submit today!
                </p>
              </div>
            </div>
            <Link
              href="/learning/homework"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
            >
              <span>Submit Homework Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center mb-12 relative">
          {/* Decorative Characters */}
          <div className="absolute left-0 top-0 -translate-y-4 hidden lg:block">
            <AbacusCharacter />
          </div>
          <div className="absolute right-0 top-0 -translate-y-4 hidden lg:block">
            <BrainCharacter />
          </div>

          {/* Sparkles */}
          <div className="absolute left-1/4 top-0 text-yellow-400 text-xl animate-pulse">✨</div>
          <div className="absolute right-1/3 -top-2 text-yellow-400 text-lg animate-pulse delay-75">⭐</div>
          <div className="absolute left-1/3 top-8 text-orange-300 text-sm animate-pulse delay-150">💫</div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3">
            <span className="text-[#1D3557]">Hello, </span>
            <span className="text-[#E63946]">{studentName}!</span>
            <span className="inline-block ml-2 animate-bounce">👋</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium">
            Let&apos;s learn, practice and have fun!
          </p>
        </section>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Learning Hub Card */}
          <div 
            onClick={() => router.push("/learning/syllabus")}
            className="group relative bg-gradient-to-b from-[#FFF8E7] to-[#FFF3D6] rounded-[2rem] p-8 border-2 border-yellow-200/50 shadow-xl shadow-yellow-100/50 hover:shadow-2xl hover:shadow-yellow-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* Cloud Decorations */}
            <div className="absolute top-6 left-6 w-16 h-8 bg-white/60 rounded-full blur-sm" />
            <div className="absolute top-10 right-12 w-12 h-6 bg-white/40 rounded-full blur-sm" />
            
            {/* Illustration */}
            <div className="relative h-48 mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <ABCBlocks />
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-2">
                <span className="text-[#F4A261]">Learning</span>{' '}
                <span className="text-[#1D3557]">Hub</span>
              </h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
                Explore abacus syllabus, curriculum levels, practice exercises and improve your skills.
              </p>
              
              <Link 
                href="/learning/syllabus"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F4A261] to-[#E9C46A] hover:from-[#E9C46A] hover:to-[#F4A261] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-orange-200 group-hover:shadow-xl group-hover:shadow-orange-300/50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-5 h-5" />
                <span>Start Learning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Braingym Games Card */}
          <div 
            onClick={() => router.push("/dashboard/braingym")}
            className="group relative bg-gradient-to-b from-[#E8F4FD] to-[#D6EBFA] rounded-[2rem] p-8 border-2 border-blue-200/50 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* Cloud Decorations */}
            <div className="absolute top-8 right-8 w-16 h-8 bg-white/60 rounded-full blur-sm" />
            <div className="absolute top-12 left-10 w-12 h-6 bg-white/40 rounded-full blur-sm" />
            
            {/* Stars */}
            <div className="absolute top-6 left-1/2 text-yellow-400 text-xl">⭐</div>
            <div className="absolute top-16 right-16 text-blue-400 text-sm">✦</div>
            <div className="absolute bottom-32 left-8 text-yellow-400 text-xs">⭐</div>

            {/* Illustration */}
            <div className="relative h-48 mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <ChatIllustration />
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-2">
                <span className="text-[#E63946]">Braingym</span>{' '}
                <span className="text-[#1D3557]">Games</span>
              </h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
                Play 4 Pics 1 Word, Logo Quiz, Landmark Countries, Memory & more!
              </p>
              
              <Link 
                href="/dashboard/braingym"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#1976D2] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#1976D2] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:shadow-blue-300/50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Play Games</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-yellow-100">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-[#1D3557] font-bold">Keep learning. Keep growing!</span>
            <Rocket className="w-5 h-5 text-[#E63946]" />
          </div>
        </div>
      </main>

      {/* Interactive Playable Modals */}
      <InteractiveModuleModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        type={activeModal}
      />
    </div>
  );
}

/* SVG Illustration Components */

function AbacusCharacter() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-xl">
      {/* Abacus Frame */}
      <rect x="20" y="20" width="100" height="100" rx="12" fill="#F4A261" stroke="#E9C46A" strokeWidth="3" />
      <rect x="28" y="28" width="84" height="84" rx="8" fill="#FFF8E7" />
      
      {/* Rods */}
      <line x1="45" y1="35" x2="45" y2="105" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="35" x2="70" y2="105" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
      <line x1="95" y1="35" x2="95" y2="105" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
      
      {/* Beads */}
      <circle cx="45" cy="50" r="7" fill="#E63946" />
      <circle cx="45" cy="68" r="7" fill="#2A9D8F" />
      <circle cx="45" cy="86" r="7" fill="#E9C46A" />
      <circle cx="70" cy="50" r="7" fill="#2A9D8F" />
      <circle cx="70" cy="68" r="7" fill="#E63946" />
      <circle cx="70" cy="86" r="7" fill="#E9C46A" />
      <circle cx="95" cy="50" r="7" fill="#E9C46A" />
      <circle cx="95" cy="68" r="7" fill="#2A9D8F" />
      <circle cx="95" cy="86" r="7" fill="#E63946" />
      
      {/* Eyes */}
      <ellipse cx="55" cy="115" rx="5" ry="7" fill="#1D3557" />
      <ellipse cx="85" cy="115" rx="5" ry="7" fill="#1D3557" />
      <circle cx="56" cy="113" r="2" fill="white" />
      <circle cx="86" cy="113" r="2" fill="white" />
      
      {/* Smile */}
      <path d="M 60 125 Q 70 132 80 125" stroke="#1D3557" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Arms */}
      <path d="M 15 70 Q 5 60 10 50" stroke="#F4A261" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="48" r="5" fill="white" stroke="#F4A261" strokeWidth="2" />
      <path d="M 125 70 Q 135 60 130 50" stroke="#F4A261" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="130" cy="48" r="5" fill="white" stroke="#F4A261" strokeWidth="2" />
    </svg>
  );
}

function BrainCharacter() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-xl">
      {/* Brain Body */}
      <path 
        d="M 60 25 C 40 25 25 40 25 60 C 25 80 40 95 60 95 C 80 95 95 80 95 60 C 95 40 80 25 60 25 Z" 
        fill="#FFB6C1" 
        stroke="#FF69B4" 
        strokeWidth="2"
      />
      
      {/* Brain Details */}
      <path d="M 40 50 Q 50 45 60 50" stroke="#FF69B4" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 60 50 Q 70 45 80 50" stroke="#FF69B4" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 45 65 Q 60 60 75 65" stroke="#FF69B4" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Headband */}
      <path d="M 30 45 Q 60 35 90 45" stroke="#9C27B0" strokeWidth="5" fill="none" strokeLinecap="round" />
      
      {/* Eyes */}
      <ellipse cx="48" cy="58" rx="4" ry="5" fill="#1D3557" />
      <ellipse cx="72" cy="58" rx="4" ry="5" fill="#1D3557" />
      <circle cx="49" cy="57" r="1.5" fill="white" />
      <circle cx="73" cy="57" r="1.5" fill="white" />
      
      {/* Smile */}
      <path d="M 52 68 Q 60 74 68 68" stroke="#1D3557" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Dumbbell Left */}
      <rect x="5" y="55" width="20" height="4" rx="2" fill="#666" />
      <rect x="5" y="48" width="6" height="18" rx="3" fill="#4A90E2" />
      <rect x="19" y="48" width="6" height="18" rx="3" fill="#4A90E2" />
      
      {/* Arms */}
      <path d="M 25 60 Q 15 58 10 57" stroke="#FFB6C1" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Dumbbell Right */}
      <rect x="95" y="55" width="20" height="4" rx="2" fill="#666" />
      <rect x="95" y="48" width="6" height="18" rx="3" fill="#4A90E2" />
      <rect x="109" y="48" width="6" height="18" rx="3" fill="#4A90E2" />
      
      {/* Arms */}
      <path d="M 95 60 Q 105 58 110 57" stroke="#FFB6C1" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Legs */}
      <line x1="50" y1="95" x2="48" y2="110" stroke="#FFB6C1" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="95" x2="72" y2="110" stroke="#FFB6C1" strokeWidth="3" strokeLinecap="round" />
      
      {/* Shoes */}
      <ellipse cx="46" cy="112" rx="6" ry="3" fill="#9C27B0" />
      <ellipse cx="74" cy="112" rx="6" ry="3" fill="#9C27B0" />
    </svg>
  );
}

function ABCBlocks() {
  return (
    <div className="relative w-40 h-40">
      {/* Block A */}
      <motion.div
        animate={{
          y: [0, -16, 0],
          rotate: [-6, -2, -6],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.1, rotate: 0 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#D62828] rounded-xl shadow-lg flex items-center justify-center border-b-4 border-[#B91C1C] cursor-pointer z-10"
      >
        <span className="text-3xl font-black text-white drop-shadow-md">A</span>
      </motion.div>
      
      {/* Block B */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 2.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.35,
        }}
        whileHover={{ scale: 1.1, rotate: 0 }}
        className="absolute bottom-4 left-2 w-16 h-16 bg-gradient-to-br from-[#F4A261] to-[#E9C46A] rounded-xl shadow-lg flex items-center justify-center border-b-4 border-[#D97706] cursor-pointer"
      >
        <span className="text-3xl font-black text-white drop-shadow-md">B</span>
      </motion.div>
      
      {/* Block C */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [6, 10, 6],
        }}
        transition={{
          duration: 1.9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7,
        }}
        whileHover={{ scale: 1.1, rotate: 0 }}
        className="absolute bottom-4 right-2 w-16 h-16 bg-gradient-to-br from-[#1D3557] to-[#14213D] rounded-xl shadow-lg flex items-center justify-center border-b-4 border-[#0B132B] cursor-pointer"
      >
        <span className="text-3xl font-black text-white drop-shadow-md">C</span>
      </motion.div>
    </div>
  );
}

function ChatIllustration() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Main Chat Bubble */}
      <div className="relative w-28 h-20 bg-gradient-to-br from-[#1976D2] to-[#42A5F5] rounded-2xl shadow-xl flex items-center justify-center border-b-4 border-[#1565C0]">
        <div className="flex flex-col gap-2 w-16">
          <div className="h-2 bg-white/40 rounded-full" />
          <div className="h-2 bg-white/40 rounded-full w-3/4" />
          <div className="h-2 bg-white/40 rounded-full w-1/2" />
        </div>
        {/* Chat Bubble Tail */}
        <div className="absolute -bottom-3 left-6 w-6 h-6 bg-[#1976D2] rotate-45 rounded-sm" />
      </div>
      
      {/* Question Mark Bubble */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#D62828] rounded-full shadow-xl flex items-center justify-center border-b-4 border-[#B91C1C] animate-bounce">
        <span className="text-3xl font-black text-white">?</span>
      </div>
    </div>
  );
}
