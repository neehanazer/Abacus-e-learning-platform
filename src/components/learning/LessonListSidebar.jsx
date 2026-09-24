"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Play, Lock, Clock, ChevronRight, } from "lucide-react";
import { useLearning } from "@/context/LearningContext";
export default function LessonListSidebar({ currentLessonId, onSelectLesson, }) {
    const { lessons, completedCount, totalLessons, overallProgress } = useLearning();
    return (<div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-yellow-200 shadow-xl space-y-5">
      {/* Header with Level Progress */}
      <div className="space-y-3 pb-3 border-b border-yellow-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              🧮
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-[#1D3557] text-base sm:text-lg">
                Level 1 Curriculum
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Basic Numbers & Operations
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-yellow-100 text-amber-800 border border-yellow-200">
            {completedCount}/{totalLessons} Done
          </span>
        </div>

        {/* Visual Progress Bar (Level Progress ███████░░░ 70%) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-slate-600">Level Progress</span>
            <span className="text-[#F4A261]">{overallProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-yellow-200">
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#2A9D8F] rounded-full"/>
          </div>
        </div>
      </div>

      {/* Lesson List Items */}
      <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1 no-scrollbar">
        {lessons.map((lesson) => {
            const isSelected = lesson.id === currentLessonId;
            const isCompleted = lesson.completed;
            const isLocked = lesson.isLocked;
            return (<button key={lesson.id} onClick={() => onSelectLesson(lesson.id)} className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 group relative overflow-hidden ${isSelected
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-400 shadow-md scale-[1.02]"
                    : isCompleted
                        ? "bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300"
                        : isLocked
                            ? "bg-slate-50 border-slate-200 opacity-70 hover:opacity-90"
                            : "bg-white border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/40"}`}>
              {/* Left: Status Icon & Details */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Visual Status Indicator Icon */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${isCompleted
                    ? "bg-emerald-500 text-white"
                    : isSelected
                        ? "bg-[#F4A261] text-white animate-pulse"
                        : isLocked
                            ? "bg-slate-200 text-slate-500"
                            : "bg-amber-100 text-amber-700"}`}>
                  {isCompleted ? (<CheckCircle2 className="w-4 h-4"/>) : isSelected ? (<Play className="w-3.5 h-3.5 fill-white ml-0.5"/>) : isLocked ? (<Lock className="w-3.5 h-3.5"/>) : (<span>{lesson.lessonNumber}</span>)}
                </div>

                {/* Lesson Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Lesson {lesson.lessonNumber}
                    </span>
                    {isCompleted && (<span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                        ✓ Completed
                      </span>)}
                    {isSelected && !isCompleted && (<span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"/>
                        Now Playing
                      </span>)}
                  </div>
                  <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight mt-0.5 ${isSelected
                    ? "text-orange-950 font-extrabold"
                    : "text-[#1D3557]"}`}>
                    {lesson.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400"/>
                      {lesson.duration}
                    </span>
                    <span>•</span>
                    <span className="truncate">{lesson.topic}</span>
                  </div>
                </div>
              </div>

              {/* Right: Chevron or Lock */}
              <div className="flex-shrink-0 text-slate-400 group-hover:text-[#F4A261] group-hover:translate-x-0.5 transition-all">
                {isLocked ? (<Lock className="w-4 h-4 text-slate-400"/>) : (<ChevronRight className="w-4 h-4"/>)}
              </div>
            </button>);
        })}
      </div>
    </div>);
}
