"use client";

import React from "react";
import { motion } from "framer-motion";
import { useHomework } from "@/context/HomeworkContext";
import {
  BookOpen,
  Clock,
  HelpCircle,
  Play,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Video,
  Award,
  Layers,
} from "lucide-react";
import Link from "next/link";

export const HomeworkIntroModal: React.FC = () => {
  const { activeHomework, startHomework, backToDashboard } = useHomework();

  if (!activeHomework) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Back Button */}
      <button
        onClick={backToDashboard}
        className="flex items-center gap-2 text-[#1D3557]/70 hover:text-[#1D3557] font-bold text-sm mb-6 transition-colors bg-white/80 hover:bg-white px-4 py-2 rounded-xl border-2 border-stone-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Homework List
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-4 border-[#E9C46A] shadow-xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <span className="px-3.5 py-1 bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Homework Task #{activeHomework.homeworkNumber}
          </span>
          <span className="px-3.5 py-1 bg-blue-100 text-blue-900 border-2 border-blue-300 rounded-full text-xs font-black">
            Level {activeHomework.level}
          </span>
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-900 border-2 border-emerald-300 rounded-full text-xs font-black flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Due: {activeHomework.dueDate}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#1D3557] mb-3 relative z-10">
          {activeHomework.title}
        </h1>
        <p className="text-stone-600 text-base font-medium mb-6 relative z-10 leading-relaxed">
          {activeHomework.instructions}
        </p>

        {/* Learning Connection Card (Flow: Lesson -> Practice -> Homework) */}
        <div className="bg-[#FFFBF0] rounded-2xl p-4 sm:p-5 border-2 border-[#E9C46A]/60 mb-6 relative z-10">
          <div className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" />
            Connected Learning Path
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-400">Related Video Lesson</div>
                <div className="text-sm font-black text-[#1D3557]">
                  {activeHomework.relatedLessonTitle}
                </div>
              </div>
            </div>
            <Link
              href="/learning"
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 transition-colors"
            >
              Review Lesson
            </Link>
          </div>
        </div>

        {/* Homework Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 relative z-10">
          <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-3.5 text-center">
            <HelpCircle className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-xl font-black text-[#1D3557]">
              {activeHomework.questionCount || activeHomework.questions.length}
            </div>
            <div className="text-xs font-bold text-stone-500">Questions</div>
          </div>

          <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-3.5 text-center">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-xl font-black text-[#1D3557]">
              ~{activeHomework.recommendedMinutes} min
            </div>
            <div className="text-xs font-bold text-stone-500">Est. Time</div>
          </div>

          <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-3.5 text-center">
            <Award className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-xl font-black text-[#1D3557]">
              {activeHomework.score !== undefined ? `${activeHomework.score}/10` : "—"}
            </div>
            <div className="text-xs font-bold text-stone-500">Best Score</div>
          </div>

          <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-3.5 text-center">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-xl font-black text-[#1D3557]">
              {activeHomework.attemptsCount || 0}
            </div>
            <div className="text-xs font-bold text-stone-500">Attempts</div>
          </div>
        </div>

        {/* Quick Instructions & Rules */}
        <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 mb-8 relative z-10">
          <h3 className="text-sm font-black text-blue-950 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Tips for Success:
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-blue-900 font-medium list-disc list-inside">
            <li>Visualize the bead movement on your abacus rod or use a real abacus.</li>
            <li>Take your time—speed develops naturally with correct bead technique.</li>
            <li>You can navigate between questions and review answers before final submit.</li>
            <li>After submitting, you'll receive instant feedback and detailed solutions!</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
          {activeHomework.status === "evaluated" || activeHomework.status === "submitted" ? (
            <div className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-100 text-emerald-900 border-2 border-emerald-300 font-black text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Homework Already Completed (Done)</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startHomework(activeHomework)}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-black text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 border-b-4 border-[#C85A3D]"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Homework Now
            </motion.button>
          )}

          <button
            onClick={backToDashboard}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-base transition-colors border-2 border-stone-200"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};
