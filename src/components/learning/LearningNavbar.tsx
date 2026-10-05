"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  FileCheck2,
  CalendarCheck,
  Star,
  ArrowLeft,
  X,
  Lock,
  Rocket,
  Compass,
  CheckCircle2,
  Flame,
  Video,
  Play,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLearning } from "@/context/LearningContext";

interface NavOption {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  statusText?: string;
  phaseText?: string;
  description?: string;
}

export default function LearningNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const {
    bonusStars,
    overallProgress,
    completedCount,
    totalLessons,
    lessons,
    currentLessonId,
    setCurrentLessonId,
  } = useLearning();

  const [previewModal, setPreviewModal] = useState<NavOption | null>(null);
  const [videosDropdownOpen, setVideosDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVideosDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSyllabus = pathname.startsWith("/learning/syllabus");
  const isPractice = pathname.startsWith("/learning/practice");
  const isHomework = pathname.startsWith("/learning/homework");
  const isMockExam = pathname.startsWith("/learning/mock-exam");
  const isExam = pathname.startsWith("/learning/exam");
  const isCertificate = pathname.startsWith("/learning/certificate");
  const isLearning =
    !isSyllabus &&
    !isPractice &&
    !isHomework &&
    !isMockExam &&
    !isExam &&
    !isCertificate &&
    pathname.startsWith("/learning");

  const navItems: NavOption[] = [
    {
      id: "syllabus",
      name: "Syllabus",
      href: "/learning/syllabus",
      icon: <Layers className="w-4 h-4" />,
      isActive: isSyllabus,
    },
    {
      id: "learning",
      name: "Videos",
      href: "/learning",
      icon: <Video className="w-4 h-4" />,
      isActive: isLearning,
    },
    {
      id: "practice",
      name: "Practice",
      href: "/learning/practice",
      icon: <GraduationCap className="w-4 h-4" />,
      isActive: isPractice,
    },
    {
      id: "homework",
      name: "Homework",
      href: "/learning/homework",
      icon: <CalendarCheck className="w-4 h-4" />,
      isActive: isHomework,
    },
    {
      id: "mock-exam",
      name: "Mock Exam",
      href: "/learning/mock-exam",
      icon: <FileCheck2 className="w-4 h-4" />,
      isActive: isMockExam,
    },
    {
      id: "exam",
      name: "Exam",
      href: "/learning/exam",
      icon: <Award className="w-4 h-4" />,
      isActive: isExam,
    },
    {
      id: "certificate",
      name: "Certificate",
      href: "/learning/certificate",
      icon: <Sparkles className="w-4 h-4" />,
      isActive: isCertificate,
    },
  ];

  const handleNavClick = (item: NavOption) => {
    if (item.id === "learning") {
      router.push("/learning");
    } else if (item.id === "syllabus") {
      router.push("/learning/syllabus");
    } else if (item.id === "practice") {
      router.push("/learning/practice");
    } else if (item.id === "homework") {
      router.push("/learning/homework");
    } else if (item.id === "mock-exam") {
      router.push("/learning/mock-exam");
    } else if (item.id === "exam") {
      router.push("/learning/exam");
    } else if (item.id === "certificate") {
      router.push("/learning/certificate");
    } else {
      setPreviewModal(item);
    }
  };

  const handleSelectLessonFromNavbar = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setVideosDropdownOpen(false);
    router.push("/learning");
  };

  const studentName = user?.fullName?.split(" ")[0] || "Arjun";
  const userStars = 120 + bonusStars;

  const currentLessonObj = lessons.find((l) => l.id === currentLessonId) || lessons[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-yellow-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Top Bar on Mobile & Desktop */}
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Logo & Back to Dashboard */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-[#1D3557] font-bold text-xs sm:text-sm transition-all hover:scale-105"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4 text-[#F4A261]" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="h-6 w-px bg-yellow-200 hidden sm:block" />

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
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Level 1 — Video Lessons
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#FFF9ED] p-1.5 rounded-full border border-yellow-200 shadow-inner">
              {navItems.map((item) => {
                const isActive = item.isActive;
                const isVideosTab = item.id === "learning";

                if (isVideosTab) {
                  return (
                    <div key={item.id} className="relative" ref={dropdownRef}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleNavClick(item)}
                          className={`flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-l-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-md shadow-orange-200"
                              : "text-slate-600 hover:text-[#1D3557] hover:bg-yellow-100/70"
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </button>
                        <button
                          onClick={() => setVideosDropdownOpen((prev) => !prev)}
                          className={`pr-3 pl-1.5 py-1.5 rounded-r-full text-xs font-extrabold transition-all duration-200 cursor-pointer border-l border-white/20 ${
                            isActive
                              ? "bg-[#E76F51] text-white"
                              : "text-slate-600 hover:text-[#1D3557] hover:bg-yellow-100/70"
                          }`}
                          title="Browse all 8 Animated Video Lessons"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              videosDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Dropdown for All 8 Animated Lesson Videos */}
                      <AnimatePresence>
                        {videosDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl p-4 shadow-2xl border-2 border-yellow-200 z-50 overflow-hidden"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-yellow-100 mb-2">
                              <div>
                                <h4 className="font-heading font-extrabold text-[#1D3557] text-sm flex items-center gap-1.5">
                                  <span>🎬 All 8 Video Lessons</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  Level 1: Basic Numbers & Operations
                                </p>
                              </div>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {completedCount}/{totalLessons} Done
                              </span>
                            </div>

                            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                              {lessons.map((les) => {
                                const isCur = les.id === currentLessonId;
                                return (
                                  <div
                                    key={les.id}
                                    onClick={() => handleSelectLessonFromNavbar(les.id)}
                                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border ${
                                      isCur
                                        ? "bg-orange-50 border-orange-300 text-orange-950 font-bold"
                                        : "bg-slate-50/70 hover:bg-yellow-50 border-transparent hover:border-yellow-200 text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                          isCur
                                            ? "bg-[#F4A261] text-white shadow-sm"
                                            : les.completed
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-200 text-slate-700"
                                        }`}
                                      >
                                        {les.completed ? "✓" : les.lessonNumber}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-extrabold truncate leading-tight">
                                          Lesson {les.lessonNumber}: {les.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {les.duration}
                                          </span>
                                          <span>•</span>
                                          <span className="text-amber-700 font-semibold truncate">
                                            {les.topic}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="shrink-0 pl-2">
                                      {isCur ? (
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800 animate-pulse">
                                          Playing
                                        </span>
                                      ) : (
                                        <Play className="w-3.5 h-3.5 text-slate-400 hover:text-orange-500 transition-colors" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-md shadow-orange-200 scale-105"
                        : "text-slate-600 hover:text-[#1D3557] hover:bg-yellow-100/70"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.statusText && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold uppercase tracking-wider">
                        {item.statusText}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Stats & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Level Progress Indicator Badge */}
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-extrabold text-emerald-800">
                  {completedCount}/{totalLessons} Lessons ({overallProgress}%)
                </span>
              </div>

              {/* Star Points Badge */}
              <div className="flex items-center gap-1.5 bg-yellow-100/90 border border-yellow-300 px-3 py-1.5 rounded-full shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
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
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F4A261] text-white shadow-sm"
                      : "bg-yellow-50/80 text-slate-700 hover:bg-yellow-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Child-Friendly Upcoming Phase Preview Modal */}
      <AnimatePresence>
        {previewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#FFFBF0] rounded-[2rem] p-6 sm:p-8 max-w-md w-full border-4 border-yellow-200 shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-2xl opacity-50 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setPreviewModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-yellow-100 text-slate-600 hover:bg-yellow-200 flex items-center justify-center transition-colors font-bold"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 pt-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#F4A261] to-[#E9C46A] text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-200 text-3xl">
                  {previewModal.icon}
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold uppercase tracking-wider mb-2">
                    <Rocket className="w-3.5 h-3.5" />
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Current Phase Focus:
                  </div>
                  <p className="text-slate-600 pl-6">
                    You are currently in <strong>Phase 1: Video Lessons & Learning Hub</strong>! Complete all lesson videos to unlock upcoming practice & exams!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setPreviewModal(null);
                      router.push("/learning");
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-extrabold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Watch Animated Video Lessons</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
