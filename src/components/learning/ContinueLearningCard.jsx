"use client";
import React from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, Clock, ArrowRight } from "lucide-react";
export default function ContinueLearningCard({ lesson, onContinue, }) {
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };
    const progressPercent = Math.min(100, Math.round((lesson.watchedSeconds / lesson.durationSeconds) * 100));
    return (<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-gradient-to-r from-[#FFF4DB] via-[#FFE8B8] to-[#FFD88A] rounded-[2rem] p-6 sm:p-8 border-2 border-yellow-300 shadow-xl shadow-yellow-100/70">
      {/* Decorative Cloud & Glow background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-2 left-10 text-yellow-500/20 text-7xl font-extrabold select-none pointer-events-none">
        🧮
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Section: Information */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white font-extrabold text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5"/>
              Continue Learning
            </span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-yellow-200 text-[#1D3557] font-bold text-xs">
              {lesson.level}
            </span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-heading leading-tight">
              Lesson {lesson.lessonNumber}: {lesson.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {lesson.description}
            </p>
          </div>

          {/* Video Watched Time & Mini Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#1D3557]">
              <span className="flex items-center gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-orange-600"/>
                Watched: {formatTime(lesson.watchedSeconds)} / {lesson.duration}
              </span>
              <span className="text-orange-700 font-extrabold">
                {progressPercent}% Complete
              </span>
            </div>

            <div className="w-full h-3 bg-white/70 rounded-full overflow-hidden p-0.5 border border-yellow-300">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] rounded-full"/>
            </div>
          </div>
        </div>

        {/* Right Section: Action Button */}
        <div className="w-full md:w-auto flex-shrink-0 flex items-center justify-end">
          <button onClick={() => onContinue(lesson.id)} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] hover:from-[#E9C46A] hover:to-[#F4A261] text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-full shadow-lg shadow-orange-300 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-4 h-4 fill-white ml-0.5"/>
            </div>
            <span>Continue Learning</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>
      </div>
    </motion.div>);
}
