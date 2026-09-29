"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  ArrowRight,
  History,
  Trash2,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { usePractice } from "@/context/PracticeContext";
import WorksheetPlayer from "./WorksheetPlayer";
import PracticeResultView from "./PracticeResultView";

export default function PracticeDashboard() {
  const {
    viewMode,
    startPracticeSession,
    attemptHistory,
    clearAttemptHistory,
    targetMinutes,
    setTargetMinutes,
  } = usePractice();

  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);

  // If in active worksheet mode or result mode, render that screen directly
  if (viewMode === "worksheet") {
    return <WorksheetPlayer />;
  }

  if (viewMode === "result") {
    return <PracticeResultView />;
  }

  // ============================================================
  // LANDING DASHBOARD: ONLY 2 PRACTICE OPTIONS
  // 1. Practice Without Timer
  // 2. Practice With Timer
  // (Both containing: Direct calculation, Small friend rule,
  //  Big friend rule, 1-digit 5-row calculation)
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-yellow-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Interactive Abacus Practice Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1D3557] font-heading">
            Choose Your Practice Mode 🎯
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            Select one of the 2 practice options below. Both options contain all core Abacus calculation topics!
          </p>
        </div>

        {attemptHistory.length > 0 && (
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFBF0] hover:bg-yellow-100 border-2 border-yellow-300 text-[#1D3557] text-xs font-extrabold transition shadow-sm self-start md:self-auto cursor-pointer"
            title="View past attempts history"
          >
            <History className="w-4 h-4 text-orange-600" />
            <span>Practice History ({attemptHistory.length})</span>
          </button>
        )}
      </div>

      {/* 2. THE 2 PRACTICE OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* ======================================================== */}
        {/* OPTION 1: PRACTICE WITHOUT TIMER */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-3 border-emerald-300 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-5">
            {/* Header Badge & Icon */}
            <div className="flex items-center justify-between">
              <span className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-sm">
                🌱
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
                Option 1 • Untimed
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1D3557] font-heading mb-1.5">
                Practice Without Timer
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Master your bead movements at your own comfortable pace with zero clock pressure. Focus on precision, bead discipline, and understanding formula rules.
              </p>
            </div>

            {/* Quick Benefits */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/60">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Casual pace
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No time limit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accuracy focus
              </span>
            </div>

            {/* Contents Inside as Specified */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                Contents Inside This Practice:
              </span>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    1
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">Direct Calculation</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Pure bead manipulation on units & tens without friend formulas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    2
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">Small Friend Rule</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Base-5 complementary formulas (+4..+1 and -4..-1 rules)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    3
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">Big Friend Rule</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Base-10 carrying & borrowing formulas (+9..+1 and -9..-1 rules)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    4
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">1-Digit 5-Row Calculation</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Authentic 5 consecutive single-digit vertical stack drills
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-6 mt-6 border-t border-emerald-100">
            <button
              onClick={() => startPracticeSession("untimed")}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-extrabold text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌱 Start Practice Without Timer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OPTION 2: PRACTICE WITH TIMER */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-3 border-orange-300 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-5">
            {/* Header Badge & Icon */}
            <div className="flex items-center justify-between">
              <span className="w-14 h-14 rounded-3xl bg-orange-100 text-orange-800 flex items-center justify-center text-3xl shadow-sm">
                ⏱️
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider border border-orange-200">
                Option 2 • Timed Drill
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1D3557] font-heading mb-1.5">
                Practice With Timer
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Boost your calculation velocity and mental agility against the clock. Set your target duration in minutes and challenge yourself to complete calculations before time runs out!
              </p>
            </div>

            {/* Feature: Set the Timer for How Many Minutes */}
            <div className="p-4 rounded-2xl bg-[#FFFBF0] border-2 border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-black text-[#1D3557] uppercase tracking-wider">
                    Set Practice Timer Duration:
                  </span>
                </div>
                <span className="text-xs font-extrabold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                  {targetMinutes} {targetMinutes === 1 ? "Minute" : "Minutes"}
                </span>
              </div>

              {/* Quick Minute Preset Buttons & Stepper */}
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 5, 10, 15].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMinutes(m)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      targetMinutes === m
                        ? "bg-[#E76F51] text-white shadow-sm font-extrabold scale-105"
                        : "bg-white hover:bg-orange-100 text-slate-700 border border-orange-200"
                    }`}
                  >
                    {m} {m === 1 ? "Min" : "Mins"}
                  </button>
                ))}

                {/* Stepper +/- */}
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-orange-200 shadow-sm ml-auto">
                  <button
                    type="button"
                    onClick={() => setTargetMinutes(targetMinutes - 1)}
                    disabled={targetMinutes <= 1}
                    className="w-6 h-6 rounded-lg bg-orange-100 hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed font-black text-orange-800 flex items-center justify-center text-xs"
                    title="Decrease 1 minute"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-xs text-[#1D3557] px-1 min-w-[28px] text-center">
                    {targetMinutes}m
                  </span>
                  <button
                    type="button"
                    onClick={() => setTargetMinutes(targetMinutes + 1)}
                    disabled={targetMinutes >= 60}
                    className="w-6 h-6 rounded-lg bg-orange-100 hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed font-black text-orange-800 flex items-center justify-center text-xs"
                    title="Increase 1 minute"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Contents Inside as Specified */}
            <div className="space-y-2.5 pt-2 border-t border-orange-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-900 block">
                Contents Inside This Practice:
              </span>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80">
                  <span className="w-7 h-7 rounded-xl bg-[#E76F51] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    1
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">Direct Calculation</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Pure bead manipulation on units & tens without friend formulas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80">
                  <span className="w-7 h-7 rounded-xl bg-[#E76F51] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    2
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">Small Friend Rule</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Base-5 complementary formulas (+4..+1 and -4..-1 rules)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80">
                  <span className="w-7 h-7 rounded-xl bg-[#E76F51] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    3
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">Big Friend Rule</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Base-10 carrying & borrowing formulas (+9..+1 and -9..-1 rules)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80">
                  <span className="w-7 h-7 rounded-xl bg-[#E76F51] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    4
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-[#1D3557] block">1-Digit 5-Row Calculation</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Authentic 5 consecutive single-digit vertical stack drills
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-6 mt-6 border-t border-orange-100">
            <button
              onClick={() => startPracticeSession("timed", targetMinutes)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white font-extrabold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⏱️ Start Timed Practice ({targetMinutes} {targetMinutes === 1 ? "Min" : "Mins"})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ATTEMPT HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#FFFBF0] rounded-[2rem] p-6 sm:p-8 max-w-2xl w-full border-4 border-yellow-200 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-yellow-200">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#F4A261]" />
                  <h3 className="text-xl font-extrabold text-[#1D3557] font-heading">
                    Past Practice Attempts Log
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Attempts list */}
              <div className="overflow-y-auto py-4 space-y-3 flex-grow pr-1">
                {attemptHistory.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl bg-white border-2 border-yellow-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          #{attemptHistory.length - idx}
                        </span>
                        <strong className="text-sm font-extrabold text-[#1D3557]">
                          {att.categoryTitle}
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-bold">
                          {att.isTimed ? `⏱️ ${att.targetMinutes || 5}m Timed` : "🌱 Untimed"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {att.dateFormatted} • {Math.floor(att.timeTakenSeconds / 60)}m{" "}
                        {att.timeTakenSeconds % 60}s
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black font-mono text-emerald-800 block">
                        {att.score}/{att.totalQuestions}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {att.accuracy}% Accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-yellow-200 flex items-center justify-between">
                <button
                  onClick={clearAttemptHistory}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>

                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="px-5 py-2.5 rounded-full bg-[#1D3557] text-white text-xs font-extrabold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
