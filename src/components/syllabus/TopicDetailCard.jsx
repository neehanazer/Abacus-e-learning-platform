"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Play, Lock, Clock, ChevronDown, ChevronUp, BookOpen, ArrowRight, } from "lucide-react";
export default function TopicDetailCard({ topic, onSelectLesson, }) {
    const [isExpanded, setIsExpanded] = useState(topic.status === "in-progress" || topic.status === "completed");
    const isCompleted = topic.status === "completed";
    const isInProgress = topic.status === "in-progress";
    const isLocked = topic.status === "locked";
    let statusBadgeText = "Not Started ○";
    let statusBadgeStyle = "bg-blue-50 text-blue-800 border-blue-200";
    if (isCompleted) {
        statusBadgeText = "Completed ✓";
        statusBadgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    else if (isInProgress) {
        statusBadgeText = "In Progress ▶";
        statusBadgeStyle = "bg-orange-100 text-orange-800 border-orange-300 animate-pulse";
    }
    else if (isLocked) {
        statusBadgeText = "Locked 🔒";
        statusBadgeStyle = "bg-slate-100 text-slate-500 border-slate-200";
    }
    return (<div className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 shadow-lg ${isInProgress
            ? "border-orange-400 shadow-orange-100"
            : isCompleted
                ? "border-emerald-200 shadow-emerald-50"
                : "border-yellow-200 shadow-yellow-50"}`}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF9ED] border-2 border-yellow-200 text-2xl flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
            {topic.icon}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Topic {topic.topicNumber}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadgeStyle}`}>
                {statusBadgeText}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-[#1D3557] font-heading leading-tight">
              {topic.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-0.5">
              {topic.description}
            </p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full bg-yellow-50 hover:bg-yellow-100 text-slate-600 transition-colors flex-shrink-0" title={isExpanded ? "Collapse Topic" : "Expand Topic Details"}>
          {isExpanded ? (<ChevronUp className="w-4 h-4"/>) : (<ChevronDown className="w-4 h-4"/>)}
        </button>
      </div>

      {/* Expandable Section */}
      <AnimatePresence>
        {isExpanded && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-5 space-y-5 overflow-hidden border-t border-yellow-100 mt-4">
            {/* Learning Objectives ("What you will learn") */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wide flex items-center gap-1.5">
                <span>🎯</span>
                <span>What you will learn in this topic:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topic.learningObjectives.map((obj, i) => (<div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFFBF0] border border-yellow-200 text-xs text-slate-700 font-medium">
                    <span className="text-emerald-500 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    <span>{obj}</span>
                  </div>))}
              </div>
            </div>

            {/* Sub-Lessons List inside this topic */}
            {topic.lessons.length > 0 && (<div className="space-y-2">
                <span className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#F4A261]"/>
                  <span>Topic Lessons ({topic.lessons.length}):</span>
                </span>

                <div className="space-y-2">
                  {topic.lessons.map((lesson) => {
                    const isLessonDone = lesson.status === "completed";
                    const isLessonCur = lesson.status === "in-progress";
                    const isLessonLock = lesson.status === "locked";
                    return (<div key={lesson.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isLessonCur
                            ? "bg-orange-50/80 border-orange-300 shadow-sm"
                            : isLessonDone
                                ? "bg-emerald-50/50 border-emerald-200"
                                : "bg-slate-50/60 border-slate-200"}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isLessonDone
                            ? "bg-emerald-500 text-white"
                            : isLessonCur
                                ? "bg-orange-500 text-white"
                                : "bg-slate-200 text-slate-500"}`}>
                            {isLessonDone ? (<CheckCircle2 className="w-3.5 h-3.5"/>) : isLessonCur ? (<Play className="w-2.5 h-2.5 fill-white ml-0.5"/>) : (<span>{lesson.lessonNumber}</span>)}
                          </div>

                          <span className="text-xs font-bold text-[#1D3557] truncate">
                            Lesson {lesson.lessonNumber}: {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3"/>
                            {lesson.duration}
                          </span>

                          {!isLessonLock && (<button onClick={() => onSelectLesson(lesson.targetLessonId)} className="px-3 py-1 rounded-full bg-white hover:bg-yellow-100 border border-yellow-300 text-xs font-bold text-[#1D3557] transition-all hover:scale-105">
                              Watch
                            </button>)}
                        </div>
                      </div>);
                })}
                </div>
              </div>)}
          </motion.div>)}
      </AnimatePresence>

      {/* Footer Action Row */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-yellow-100 gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="bg-yellow-100 text-amber-900 px-2.5 py-0.5 rounded-full">
            {topic.completedLessons}/{topic.totalLessons} Lessons Done
          </span>
        </div>

        {isLocked ? (<button disabled className="px-4 py-2 rounded-full bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5"/>
            <span>Locked</span>
          </button>) : (<button onClick={() => onSelectLesson(topic.targetLessonId)} className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${isInProgress
                ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-orange-200"
                : isCompleted
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : "bg-[#1D3557] text-white shadow-blue-200"}`}>
            {isInProgress ? (<>
                <Play className="w-3.5 h-3.5 fill-white"/>
                <span>Continue Topic</span>
              </>) : isCompleted ? (<>
                <CheckCircle2 className="w-3.5 h-3.5"/>
                <span>Review Topic</span>
              </>) : (<>
                <Play className="w-3.5 h-3.5 fill-white"/>
                <span>Start Topic</span>
              </>)}
            <ArrowRight className="w-3.5 h-3.5"/>
          </button>)}
      </div>
    </div>);
}
