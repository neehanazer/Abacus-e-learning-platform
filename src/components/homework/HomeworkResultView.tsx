"use client";

import React from "react";
import { motion } from "framer-motion";
import { useHomework } from "@/context/HomeworkContext";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Star,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const HomeworkResultView: React.FC = () => {
  const {
    activeHomework,
    latestAttempt,
    retryHomework,
    backToDashboard,
  } = useHomework();

  if (!activeHomework || !latestAttempt) return null;

  const { score, totalQuestions, accuracy, timeTakenSeconds, answers } = latestAttempt;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining}s`;
    return `${mins}m ${remaining}s`;
  };

  const isExcellent = accuracy >= 80;
  const isGood = accuracy >= 60 && accuracy < 80;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP RESULT CARD */}
      {/* ============================================================ */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] border-4 border-[#E9C46A] shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-100 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-100 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* Celebration Header */}
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-[#E9C46A] to-[#F4A261] p-1 shadow-lg">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-4xl sm:text-5xl">
              {accuracy === 100 ? "🏆" : isExcellent ? "🌟" : isGood ? "👏" : "💪"}
            </div>
          </div>

          <span className="px-4 py-1.5 bg-emerald-100 text-emerald-900 border-2 border-emerald-300 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Evaluation Complete • Homework Submitted
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-[#1D3557] font-heading mt-2 mb-2">
            {accuracy === 100
              ? "Flawless Performance!"
              : isExcellent
              ? "Outstanding Work!"
              : isGood
              ? "Well Done, Keep Practicing!"
              : "Good Effort! Let's Master It!"}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            {activeHomework.title}
          </p>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
            <div className="bg-[#FFFBF0] border-2 border-amber-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-stone-500 uppercase">Score</div>
              <div className="text-2xl sm:text-3xl font-black text-[#1D3557]">
                {score}/{totalQuestions}
              </div>
            </div>

            <div className="bg-[#FFFBF0] border-2 border-amber-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-stone-500 uppercase">Accuracy</div>
              <div
                className={`text-2xl sm:text-3xl font-black ${
                  accuracy >= 80
                    ? "text-emerald-600"
                    : accuracy >= 60
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {accuracy}%
              </div>
            </div>

            <div className="bg-[#FFFBF0] border-2 border-amber-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-stone-500 uppercase">Time Spent</div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600">
                {formatTime(timeTakenSeconds)}
              </div>
            </div>

            <div className="bg-[#FFFBF0] border-2 border-amber-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-stone-500 uppercase">Stars Earned</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
                <span>+{score * 5}</span>
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
          </div>

          {/* Teacher / Sensei Evaluation Feedback */}
          {activeHomework.evaluatedFeedback && (
            <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 text-left mb-6 flex items-start gap-3.5">
              <div className="text-3xl flex-shrink-0">🧙‍♂️</div>
              <div>
                <div className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Sensei's Evaluation Feedback
                </div>
                <p className="text-sm font-bold text-amber-950 mt-1 leading-relaxed">
                  {activeHomework.evaluatedFeedback}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={backToDashboard}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 border-b-4 border-[#C85A3D]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Homework Dashboard</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 2. SIMPLE QUESTION-BY-QUESTION SUMMARY */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg font-black text-[#1D3557] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Questions & Answers Summary
          </h2>
          <span className="text-xs font-bold text-stone-500">
            {score}/{totalQuestions} Correct
          </span>
        </div>

        {/* Clean, Simple Table/List Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-100 text-[11px] font-black uppercase text-stone-400">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Entered Answer</th>
                <th className="py-2.5 px-3">Expected Answer</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {answers.map((ans, idx) => {
                const questionText = ans.questionNumbers
                  .map((n, nIdx) => (nIdx === 0 ? `${n}` : n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`))
                  .join(" ");

                return (
                  <tr
                    key={ans.questionId}
                    className={`hover:bg-amber-50/40 transition-colors ${
                      ans.isCorrect ? "bg-emerald-50/20" : "bg-rose-50/30"
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-stone-400 text-xs">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-base text-[#1D3557]">
                      {questionText}
                    </td>
                    <td className="py-3 px-3 font-mono font-black">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-sm ${
                          ans.isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ans.userAnswer !== null ? ans.userAnswer : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-600 text-base">
                      {ans.correctAnswer}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ans.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
