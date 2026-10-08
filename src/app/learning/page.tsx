"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Award,
  Star,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLearning } from "@/context/LearningContext";
import VideoPlayer from "@/components/learning/VideoPlayer";
import ContinueLearningCard from "@/components/learning/ContinueLearningCard";
import LessonListSidebar from "@/components/learning/LessonListSidebar";
import LessonInfoSection from "@/components/learning/LessonInfoSection";

export default function LearningDashboardPage() {
  const { user } = useAuth();
  const {
    lessons,
    currentLessonId,
    currentLesson,
    activeLevel,
    setActiveLevel,
    setCurrentLessonId,
    recentLesson,
    completedCount,
    totalLessons,
    overallProgress,
    bonusStars,
    resetProgress,
  } = useLearning();

  const studioRef = useRef<HTMLDivElement>(null);

  const studentName = user?.fullName?.split(" ")[0] || "Arjun";
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      setCurrentLessonId(lessons[currentIndex - 1].id);
      studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setCurrentLessonId(lessons[currentIndex + 1].id);
      studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleContinueLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden pb-16">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8 relative z-10">
        {/* ============================================================ */}
        {/* 1. WELCOME & LEVEL PROGRESS HERO */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-yellow-200 shadow-xl shadow-yellow-100/50 relative overflow-hidden">
          {/* Decorative Abacus Bead motif in background */}
          <div className="absolute -right-6 -bottom-6 text-yellow-100 opacity-60 text-9xl font-black pointer-events-none select-none">
            🧮
          </div>

          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Interactive Video Learning Hub
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-heading tracking-tight">
              Welcome to Abacus Lessons,{" "}
              <span className="text-[#F4A261]">{studentName}!</span> 👋
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Watch fun video tutorials, learn Soroban bead secrets, and practice mental math at your own pace!
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Current Level Card / Switcher */}
            <div className="bg-yellow-50/80 border-2 border-yellow-200 rounded-2xl px-4 py-2.5 min-w-[145px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">
                  Active Level
                </span>
                <span className="text-sm font-extrabold text-[#1D3557] flex items-center gap-1 mt-0.5">
                  <span className="text-base">{activeLevel === 2 ? "🧭" : "🌱"}</span> Level {activeLevel}
                </span>
                <span className="text-[10px] font-bold text-orange-700 block">
                  {activeLevel === 2 ? "Multi-Row & 2-Digit" : "Basic Numbers"}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 pt-1 border-t border-yellow-200/80">
                <button
                  onClick={() => setActiveLevel(1)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeLevel === 1
                      ? "bg-[#F4A261] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-yellow-100 border border-yellow-200/50"
                  }`}
                >
                  Lvl 1
                </button>
                <button
                  onClick={() => setActiveLevel(2)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeLevel === 2
                      ? "bg-[#3B82F6] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-yellow-100 border border-yellow-200/50"
                  }`}
                >
                  Lvl 2
                </button>
              </div>
            </div>

            {/* Completed Lessons */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 min-w-[130px]">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                Lessons Done
              </span>
              <span className="text-sm font-extrabold text-emerald-900 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {completedCount} of {totalLessons}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                {overallProgress}% Level Progress
              </span>
            </div>

            {/* Star Rewards */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 min-w-[120px]">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                Total Stars
              </span>
              <span className="text-sm font-extrabold text-amber-900 flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {120 + bonusStars} ⭐
              </span>
              <span className="text-[10px] font-bold text-amber-700 block mt-0.5">
                +50 per lesson
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CONTINUE LEARNING HERO BANNER */}
        {/* ============================================================ */}
        {recentLesson && (
          <ContinueLearningCard
            lesson={recentLesson}
            onContinue={handleContinueLesson}
          />
        )}

        {/* ============================================================ */}
        {/* 3. DEDICATED VIDEO LESSON STUDIO & SIDEBAR */}
        {/* ============================================================ */}
        <div ref={studioRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* Main Video Player & Lesson Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive Video Player */}
            <VideoPlayer
              lesson={currentLesson}
              onNextLesson={hasNext ? handleNextLesson : undefined}
            />

            {/* Lesson Detailed Information & Objectives */}
            <LessonInfoSection
              lesson={currentLesson}
              onPreviousLesson={handlePreviousLesson}
              onNextLesson={handleNextLesson}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />
          </div>

          {/* Lesson List Sidebar & Navigation (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <LessonListSidebar
              currentLessonId={currentLessonId}
              onSelectLesson={(id) => {
                setCurrentLessonId(id);
                studioRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />

            {/* Reset Demo State Button (Helper for reviewing) */}
            <div className="text-center pt-2">
              <button
                onClick={resetProgress}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 underline font-medium transition-colors"
                title="Reset mock learning state to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Learning Progress</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
