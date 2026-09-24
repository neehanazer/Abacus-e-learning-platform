"use client";
import React from "react";
import { CheckCircle2, ArrowLeft, ArrowRight, Clock, } from "lucide-react";
import { useLearning } from "@/context/LearningContext";
export default function LessonInfoSection({ lesson, onPreviousLesson, onNextLesson, hasPrevious, hasNext, }) {
    const { markLessonCompleted } = useLearning();
    return (<div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-xl space-y-6">
      {/* Top Header: Title, Level & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-yellow-100">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs">
              Lesson {lesson.lessonNumber} of 8
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-[#1D3557] font-bold text-xs">
              {lesson.level}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500"/>
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

        {/* Mark as Completed Button */}
        <div className="flex-shrink-0 flex items-center">
          <button onClick={() => markLessonCompleted(lesson.id)} className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-extrabold text-sm sm:text-base shadow-lg transition-all duration-200 cursor-pointer ${lesson.completed
            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 hover:scale-105"
            : "bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] hover:from-[#E9C46A] hover:to-[#F4A261] text-white shadow-orange-200 hover:scale-105 active:scale-95"}`}>
            <CheckCircle2 className="w-5 h-5"/>
            <span>
              {lesson.completed ? "Lesson Completed! 🎉" : "Mark as Completed"}
            </span>
          </button>
        </div>
      </div>

      {/* Learning Objectives ("What you will learn") */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-100 text-[#F4A261] flex items-center justify-center font-bold text-sm">
            🎯
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1D3557] font-heading">
              What You Will Learn
            </h3>
            <p className="text-xs text-slate-500">
              By the end of this lesson, you will be able to:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lesson.learningObjectives.map((objective, idx) => (<div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFBF0] border border-yellow-200 text-slate-800 text-xs sm:text-sm font-medium hover:border-yellow-300 transition-colors">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                ✓
              </div>
              <span className="leading-snug">{objective}</span>
            </div>))}
        </div>
      </div>

      {/* Teacher Key Takeaways & Formula Tip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5">💡</div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-amber-950 font-heading">
              Key Abacus Takeaway:
            </h4>
            <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
              {lesson.keyTakeaways[0]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-orange-200 text-xs font-bold text-orange-800 flex-shrink-0">
          <span>{lesson.instructor.avatar}</span>
          <span>{lesson.instructor.name}</span>
        </div>
      </div>

      {/* Navigation Buttons Row: Previous / Next Lesson */}
      <div className="pt-4 border-t border-yellow-100 flex items-center justify-between gap-3">
        <button onClick={onPreviousLesson} disabled={!hasPrevious} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs sm:text-sm transition-all ${hasPrevious
            ? "bg-yellow-50 hover:bg-yellow-100 text-[#1D3557] border border-yellow-200 hover:scale-105 active:scale-95 cursor-pointer"
            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"}`}>
          <ArrowLeft className="w-4 h-4"/>
          <span>Previous Lesson</span>
        </button>

        <button onClick={onNextLesson} disabled={!hasNext} className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-md transition-all ${hasNext
            ? "bg-gradient-to-r from-[#1D3557] to-[#2A9D8F] text-white hover:scale-105 active:scale-95 cursor-pointer"
            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"}`}>
          <span>Next Lesson</span>
          <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </div>);
}
