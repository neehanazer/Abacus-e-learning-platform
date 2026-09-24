"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, Sparkles, Award, Layers, FileCheck2, CalendarCheck, Star, ArrowLeft, X, Rocket, CheckCircle2, } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLearning } from "@/context/LearningContext";
export default function LearningNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { bonusStars, overallProgress, completedCount, totalLessons } = useLearning();
    const [previewModal, setPreviewModal] = useState(null);
    const isSyllabus = pathname.startsWith("/learning/syllabus");
    const isPractice = pathname.startsWith("/learning/practice");
    const isHomework = pathname.startsWith("/learning/homework");
    const isLearning = !isSyllabus && !isPractice && !isHomework && pathname.startsWith("/learning");
    const navItems = [
        {
            id: "syllabus",
            name: "Syllabus",
            href: "/learning/syllabus",
            icon: <Layers className="w-4 h-4"/>,
            isActive: isSyllabus,
        },
        {
            id: "learning",
            name: "Learning",
            href: "/learning",
            icon: <BookOpen className="w-4 h-4"/>,
            isActive: isLearning,
        },
        {
            id: "practice",
            name: "Practice",
            href: "/learning/practice",
            icon: <GraduationCap className="w-4 h-4"/>,
            isActive: isPractice,
        },
        {
            id: "homework",
            name: "Homework",
            href: "/learning/homework",
            icon: <CalendarCheck className="w-4 h-4"/>,
            isActive: isHomework,
        },
        {
            id: "mock-exam",
            name: "Mock Exam",
            href: "#mock-exam",
            icon: <FileCheck2 className="w-4 h-4"/>,
            statusText: "Phase 5",
            phaseText: "Timed Practice Trials",
            description: "Simulate international competition standards with countdown timers, speed flash cards, and instant detailed scorecards.",
        },
        {
            id: "exam",
            name: "Exam",
            href: "#exam",
            icon: <Award className="w-4 h-4"/>,
            statusText: "Phase 6",
            phaseText: "Official Level Evaluation",
            description: "Comprehensive level proficiency tests with secure timed sessions, grading rubrics, and performance analytics.",
        },
        {
            id: "certificate",
            name: "Certificate",
            href: "#certificate",
            icon: <Sparkles className="w-4 h-4"/>,
            statusText: "Phase 7",
            phaseText: "Mastery Certification",
            description: "Verified digital AbacusMaster certificate with QR authenticity, shareable badges, and honors for your portfolio!",
        },
    ];
    const handleNavClick = (item) => {
        if (item.id === "learning") {
            router.push("/learning");
        }
        else if (item.id === "syllabus") {
            router.push("/learning/syllabus");
        }
        else if (item.id === "practice") {
            router.push("/learning/practice");
        }
        else if (item.id === "homework") {
            router.push("/learning/homework");
        }
        else {
            setPreviewModal(item);
        }
    };
    const studentName = user?.fullName?.split(" ")[0] || "Arjun";
    const userStars = 120 + bonusStars;
    return (<>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-yellow-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Top Bar on Mobile & Desktop */}
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Logo & Back to Dashboard */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard" className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-[#1D3557] font-bold text-xs sm:text-sm transition-all hover:scale-105" title="Back to Dashboard">
                <ArrowLeft className="w-4 h-4 text-[#F4A261]"/>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="h-6 w-px bg-yellow-200 hidden sm:block"/>

              <Link href="/learning" className="flex items-center gap-2 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#F4A261] to-[#E9C46A] p-0.5 shadow-md shadow-orange-100 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <span className="text-xl">🧮</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#1D3557] flex items-center gap-1">
                    <span>Abacus</span>
                    <span className="text-[#F4A261]">Learning</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 -mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    Level 1 — Video Lessons
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#FFF9ED] p-1.5 rounded-full border border-yellow-200 shadow-inner">
              {navItems.map((item) => {
            const isActive = item.isActive;
            return (<button key={item.id} onClick={() => handleNavClick(item)} className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-md shadow-orange-200 scale-105"
                    : "text-slate-600 hover:text-[#1D3557] hover:bg-yellow-100/70"}`}>
                    {item.icon}
                    <span>{item.name}</span>
                    {item.statusText && (<span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold uppercase tracking-wider">
                        {item.statusText}
                      </span>)}
                  </button>);
        })}
            </nav>

            {/* Right Side Stats & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Level Progress Indicator Badge */}
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500"/>
                <span className="text-xs font-extrabold text-emerald-800">
                  {completedCount}/{totalLessons} Lessons ({overallProgress}%)
                </span>
              </div>

              {/* Star Points Badge */}
              <div className="flex items-center gap-1.5 bg-yellow-100/90 border border-yellow-300 px-3 py-1.5 rounded-full shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse"/>
                <span className="text-xs sm:text-sm font-extrabold text-[#1D3557]">
                  {userStars}
                </span>
              </div>

              {/* Student Avatar */}
              <div className="flex items-center gap-2 bg-white px-2 sm:px-3 py-1 rounded-full border border-yellow-200 shadow-sm">
                <span className="text-lg">🧙‍♂️</span>
                <span className="hidden sm:inline text-xs font-bold text-[#1D3557]">
                  {studentName}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Mobile Nav Tabs */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-yellow-100 no-scrollbar">
            {navItems.map((item) => {
            const isActive = item.isActive;
            return (<button key={item.id} onClick={() => handleNavClick(item)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${isActive
                    ? "bg-[#F4A261] text-white shadow-sm"
                    : "bg-yellow-50/80 text-slate-700 hover:bg-yellow-100"}`}>
                  {item.icon}
                  <span>{item.name}</span>
                </button>);
        })}
          </div>
        </div>
      </header>

      {/* Child-Friendly Upcoming Phase Preview Modal */}
      <AnimatePresence>
        {previewModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#FFFBF0] rounded-[2rem] p-6 sm:p-8 max-w-md w-full border-4 border-yellow-200 shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-2xl opacity-50 pointer-events-none"/>

              {/* Close Button */}
              <button onClick={() => setPreviewModal(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-yellow-100 text-slate-600 hover:bg-yellow-200 flex items-center justify-center transition-colors font-bold">
                <X className="w-5 h-5"/>
              </button>

              <div className="text-center space-y-4 pt-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#F4A261] to-[#E9C46A] text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-200 text-3xl">
                  {previewModal.icon}
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold uppercase tracking-wider mb-2">
                    <Rocket className="w-3.5 h-3.5"/>
                    {previewModal.statusText} • {previewModal.phaseText}
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1D3557] font-heading">
                    {previewModal.name} Module
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {previewModal.description}
                </p>

                <div className="bg-white rounded-2xl p-4 border-2 border-yellow-200/80 text-left space-y-2 text-xs text-slate-700">
                  <div className="font-bold text-[#1D3557] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                    Current Phase Focus:
                  </div>
                  <p className="text-slate-600 pl-6">
                    You are currently in <strong>Phase 1: Video Lessons & Learning Hub</strong>! Complete all lesson videos to unlock upcoming practice & exams!
                  </p>
                </div>

                <div className="pt-2">
                  <button onClick={() => {
                setPreviewModal(null);
                router.push("/learning");
            }} className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-extrabold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4"/>
                    <span>Continue Phase 1 Video Lessons</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>)}
      </AnimatePresence>
    </>);
}
