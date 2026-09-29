"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Award,
  ListOrdered,
} from "lucide-react";
import { usePractice } from "@/context/PracticeContext";

export default function PracticeResultView() {
  const {
    worksheetTitle,
    currentAttempt,
    attemptHistory,
    generateNewRandomWorksheet,
    restartSameWorksheet,
    backToDashboard,
  } = usePractice();

  if (!currentAttempt) return null;

  const { score, totalQuestions, accuracy, timeTakenSeconds, answers, level, categoryTitle } = currentAttempt;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Get past attempts for this category
  const categoryAttempts = attemptHistory
    .filter((a) => a.categoryTitle === categoryTitle)
    .slice(0, 5); // last 5 attempts

  // Dynamic Sensei Feedback
  let feedbackMessage = "Great work! Keep practicing to improve your speed and accuracy.";
  let feedbackEmoji = "🌟";
  if (accuracy === 100) {
    feedbackMessage = "Flawless Performance! You answered every question with 100% accuracy like a true Abacus Grandmaster!";
    feedbackEmoji = "👑";
  } else if (accuracy >= 80) {
    feedbackMessage = "Incredible Job! Your calculation speed and bead coordination are super sharp!";
    feedbackEmoji = "🔥";
  } else if (accuracy >= 60) {
    feedbackMessage = "Good Effort! Review the rules on the questions you missed and try again!";
    feedbackEmoji = "💪";
  } else {
    feedbackMessage = "Keep going! Practice makes perfect. Review the formula tips and try the worksheet again!";
    feedbackEmoji = "🌱";
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      {/* ============================================================ */}
      {/* 1. CELEBRATION HERO CARD */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-4 border-yellow-200 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-200 text-4xl sm:text-5xl">
          {accuracy >= 80 ? "🏆" : "🎉"}
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>
              {currentAttempt.isTimed
                ? `⏱️ Timed Drill (${currentAttempt.targetMinutes || 5} Min Limit)`
                : "🌱 Practice Without Timer (Untimed)"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-heading">
            🎉 Fantastic Work!
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium">
            You completed the <strong>{worksheetTitle}</strong> (Level {level}) in{" "}
            <strong>{currentAttempt.isTimed ? `${currentAttempt.targetMinutes || 5}-Minute Timed Mode` : "Untimed Practice Mode"}</strong>!
          </p>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          {/* Score */}
          <div className="bg-yellow-50/80 rounded-2xl p-4 border-2 border-yellow-200 text-center">
            <span className="text-[11px] font-black text-slate-500 uppercase block">
              Final Score
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#1D3557] block mt-1">
              {score}/{totalQuestions}
            </span>
            <span className="text-[10px] font-bold text-orange-600">
              {score === totalQuestions ? "Perfect Score!" : `${totalQuestions - score} to review`}
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-200 text-center">
            <span className="text-[11px] font-black text-emerald-800 uppercase block">
              Accuracy
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-900 block mt-1">
              {accuracy}%
            </span>
            <span className="text-[10px] font-bold text-emerald-700">
              {accuracy >= 80 ? "Mastery Grade" : "Good Progress"}
            </span>
          </div>

          {/* Time Taken */}
          <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200 text-center">
            <span className="text-[11px] font-black text-blue-800 uppercase block truncate">
              {currentAttempt.isTimed ? `⏱️ Time (${currentAttempt.targetMinutes || 5}m Drill)` : "🌱 Untimed Time"}
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-900 block mt-1">
              {formatTime(timeTakenSeconds)}
            </span>
            <span className="text-[10px] font-bold text-blue-700">
              ~{Math.round(timeTakenSeconds / Math.max(1, totalQuestions))}s / question
            </span>
          </div>

          {/* Stars Earned */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 text-center">
            <span className="text-[11px] font-black text-amber-800 uppercase block">
              Stars Earned
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-900 block mt-1 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              +{score * 5}
            </span>
            <span className="text-[10px] font-bold text-amber-700">
              Reward Points
            </span>
          </div>
        </div>

        {/* Sensei Feedback Note */}
        <div className="bg-[#FFFBF0] rounded-3xl p-5 border-2 border-yellow-200 max-w-xl mx-auto flex items-center gap-4 text-left">
          <div className="text-3xl flex-shrink-0">{feedbackEmoji}</div>
          <div>
            <span className="text-xs font-black text-orange-700 uppercase tracking-wider block">
              Sensei's Feedback
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#1D3557] mt-0.5">
              "{feedbackMessage}"
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={generateNewRandomWorksheet}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again (New 20 Questions)</span>
          </button>

          <button
            onClick={restartSameWorksheet}
            className="px-5 py-3.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-[#1D3557] font-extrabold text-sm transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Same Set</span>
          </button>

          <button
            onClick={backToDashboard}
            className="px-5 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Topics</span>
          </button>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 2. UNLIMITED PRACTICE: ATTEMPT PROGRESSION (Attempt 1, 2, 3...) */}
      {/* ============================================================ */}
      {categoryAttempts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-yellow-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1D3557]">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Unlimited Practice History for this Topic:</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total {categoryAttempts.length} Attempts
            </span>
          </div>

          {/* Attempts Chips Horizontal Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categoryAttempts.map((att, idx) => {
              const attemptNumber = categoryAttempts.length - idx;
              return (
                <div
                  key={att.id}
                  className={`flex-shrink-0 p-3 rounded-2xl border-2 min-w-[150px] ${
                    idx === 0
                      ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-200"
                      : "bg-[#FFFBF0] border-yellow-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Attempt {attemptNumber}</span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[9px] font-black uppercase">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-mono font-black text-[#1D3557] mt-1">
                    {att.score}/{att.totalQuestions} ({att.accuracy}%)
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {att.dateFormatted}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. QUESTION-BY-QUESTION SUMMARY */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-yellow-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
          <div className="flex items-center gap-2.5">
            <ListOrdered className="w-5 h-5 text-[#F4A261]" />
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1D3557] font-heading">
              Questions & Answers Summary ({answers.length} Questions)
            </h3>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {score}/{totalQuestions} Correct
          </span>
        </div>

        {/* Clean, Simple Table Layout */}
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
                const formattedFormula = ans.questionNumbers
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
                      {formattedFormula}
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
}
