"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Lightbulb,
  Clock,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Lesson } from "@/data/lessonsData";
import { useLearning } from "@/context/LearningContext";

interface LessonInfoSectionProps {
  lesson: Lesson;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function LessonInfoSection({
  lesson,
  onPreviousLesson,
  onNextLesson,
  hasPrevious,
  hasNext,
}: LessonInfoSectionProps) {
  const { totalLessons } = useLearning();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-xl space-y-6">
      {/* Top Header: Title, Level & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-yellow-100">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs">
              Lesson {lesson.lessonNumber} of {totalLessons}
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-[#1D3557] font-bold text-xs">
              {lesson.level}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {lesson.duration}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-heading leading-tight">
            {lesson.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Navigation Buttons Row: Previous / Next Lesson */}
      <div className="pt-4 border-t border-yellow-100 flex items-center justify-between gap-3">
        <button
          onClick={onPreviousLesson}
          disabled={!hasPrevious}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs sm:text-sm transition-all ${
            hasPrevious
              ? "bg-yellow-50 hover:bg-yellow-100 text-[#1D3557] border border-yellow-200 hover:scale-105 active:scale-95 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={onNextLesson}
          disabled={!hasNext}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-md transition-all ${
            hasNext
              ? "bg-gradient-to-r from-[#1D3557] to-[#2A9D8F] text-white hover:scale-105 active:scale-95 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
          }`}
        >
          <span>Next Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
