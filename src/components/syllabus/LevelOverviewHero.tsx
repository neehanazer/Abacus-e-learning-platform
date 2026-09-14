"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Play,
  ArrowRight,
  Star,
  Award,
  Clock,
  Layers,
} from "lucide-react";
import { AbacusLevel } from "@/data/syllabusData";

interface LevelOverviewHeroProps {
  level: AbacusLevel;
  onContinue: (targetLessonId: string) => void;
}

export default function LevelOverviewHero({
  level,
  onContinue,
}: LevelOverviewHeroProps) {
  const isLevelCompleted = level.progress >= 100;
  const isLevelLocked = level.status === "locked";

  let statusBadge = "In Progress 🚀";
  let statusBadgeStyle = "bg-amber-100 text-amber-900 border-amber-300";
  let cheerText = "You're doing great! Keep building that math muscle! 💪";

  if (isLevelCompleted) {
    statusBadge = "Level Completed! 🏆";
    statusBadgeStyle = "bg-emerald-100 text-emerald-900 border-emerald-300";
    cheerText = "Congratulations! You mastered this entire level! 🌟";
  } else if (level.progress >= 70) {
    cheerText = "You're almost there! 🌟 Just a few more lessons to unlock your badge!";
  } else if (isLevelLocked) {
    statusBadge = "Locked 🔒";
    statusBadgeStyle = "bg-slate-100 text-slate-600 border-slate-300";
    cheerText = "Complete the previous level to unlock this awesome chapter!";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-[#FFF8E7] via-[#FFF2D4] to-[#FFE8B8] rounded-[2.5rem] p-6 sm:p-8 md:p-10 border-4 border-yellow-300 shadow-2xl shadow-yellow-100/80"
    >
      {/* Decorative Floating Clouds & Abacus Bead motifs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-6 text-yellow-300/30 text-9xl font-black select-none pointer-events-none">
        {level.icon}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Info Section */}
        <div className="space-y-4 max-w-2xl">
          {/* Level Header Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-extrabold text-xs shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Level {level.levelNumber} Syllabus
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadgeStyle}`}
            >
              {statusBadge}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-yellow-200 text-slate-700 font-bold text-xs">
              {level.ageRecommendation}
            </span>
          </div>

          {/* Level Title & Description */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] font-heading tracking-tight leading-tight">
              {level.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-medium mt-2 leading-relaxed max-w-xl">
              {level.description}
            </p>
          </div>

          {/* Metrics Pill Grid */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="bg-white/90 px-4 py-2 rounded-2xl border border-yellow-200 shadow-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F4A261]" />
              <span className="text-xs font-extrabold text-[#1D3557]">
                {level.totalTopics} Topics
              </span>
            </div>

            <div className="bg-white/90 px-4 py-2 rounded-2xl border border-yellow-200 shadow-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold text-[#1D3557]">
                {level.totalLessons} Lessons
              </span>
            </div>

            <div className="bg-white/90 px-4 py-2 rounded-2xl border border-yellow-200 shadow-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-xs font-extrabold text-[#1D3557]">
                {level.progress}% Completed
              </span>
            </div>
          </div>

          {/* Visual Progress Bar (Level 1 ████████░░ 60%) */}
          <div className="space-y-1.5 pt-2 max-w-lg">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#1D3557]">
              <span>Level Progress</span>
              <span className="text-orange-700 font-black">{level.progress}%</span>
            </div>
            <div className="w-full h-4 bg-white/80 rounded-full overflow-hidden p-0.5 border-2 border-yellow-300">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${level.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#2A9D8F] rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
            <p className="text-xs text-orange-950 font-bold italic pt-0.5">
              "{cheerText}"
            </p>
          </div>
        </div>

        {/* Right Action & Mascot Card */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 bg-white/90 p-6 rounded-3xl border-2 border-yellow-300 shadow-xl max-w-sm w-full">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#F4A261] to-[#E9C46A] text-white flex items-center justify-center mx-auto text-4xl shadow-lg shadow-orange-200 border-2 border-white">
              {level.icon}
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-[#1D3557] text-lg">
                {level.badge}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official Level Curriculum
              </p>
            </div>
          </div>

          <div className="w-full pt-2">
            {isLevelLocked ? (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-full bg-slate-200 text-slate-500 font-extrabold text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Level Locked 🔒</span>
              </button>
            ) : (
              <button
                onClick={() => onContinue("lesson-4")}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] hover:from-[#E9C46A] hover:to-[#F4A261] text-white font-extrabold text-base shadow-lg shadow-orange-300 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Continue Learning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
