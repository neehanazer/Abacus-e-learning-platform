"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Filter, History, Trash2, } from "lucide-react";
import { usePractice } from "@/context/PracticeContext";
import { PRACTICE_CATEGORIES, } from "@/data/practiceData";
import WorksheetPlayer from "./WorksheetPlayer";
import PracticeResultView from "./PracticeResultView";
export default function PracticeDashboard() {
    const { viewMode, selectedLevel, setSelectedLevel, studentMaxLevel, setStudentMaxLevel, isLevelUnlocked, activeCategory, startCategoryWorksheet, attemptHistory, getCategoryBestScore, getCategoryLastScore, getCategoryAttemptsCount, clearAttemptHistory, } = usePractice();
    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [lockedLevelNotice, setLockedLevelNotice] = useState(null);
    // All 8 Standardized Syllabus Levels
    const levels = [
        {
            id: 1,
            name: "Level 1 — Foundations",
            badge: "🌱 Seedling",
            desc: "Simple 1D/2D, Small Friends, Big Friends, 3/5/7 Rows",
        },
        {
            id: 2,
            name: "Level 2 — Explorer",
            badge: "🧭 Explorer",
            desc: "1D 10/12/15 Rows, 2D 3/5/8 Rows",
        },
        {
            id: 3,
            name: "Level 3 — Adventurer",
            badge: "🚀 Adventurer",
            desc: "1D 20/25 Rows, 2D 10/12 Rows, 3D 3/5 Rows",
        },
        {
            id: 4,
            name: "Level 4 — Magician",
            badge: "🧙‍♂️ Magician",
            desc: "1D 30 Rows, 2D 15/20 Rows, 3D 7/10 Rows, 4D 3/5 Rows",
        },
        {
            id: 5,
            name: "Level 5 — Ninja",
            badge: "🥷 Ninja",
            desc: "2D 25 Rows, 3D 12/15 Rows, 4D 7 Rows, Multiplication (2D × 1D)",
        },
        {
            id: 6,
            name: "Level 6 — Master",
            badge: "🥋 Master",
            desc: "5-Digit Rows, Multiplication (3D/4D/2D), Division (2D ÷ 1D)",
        },
        {
            id: 7,
            name: "Level 7 — Grandmaster",
            badge: "🏆 Grandmaster",
            desc: "3D 25 Rows, 4D 15 Rows, 5D 10 Rows, Mult 3D×2D/3D×3D, Div 3D÷1D/2D",
        },
        {
            id: 8,
            name: "Level 8 — Legend",
            badge: "🌟 Legend",
            desc: "Flash Anzan, Mental Multi-Row, Speed Championship",
        },
    ];
    // Get syllabus categories specifically for the selected level
    const categoriesForLevel = PRACTICE_CATEGORIES.filter((c) => c.level === selectedLevel);
    const handleLevelClick = (lvlId) => {
        if (isLevelUnlocked(lvlId)) {
            setSelectedLevel(lvlId);
            setLockedLevelNotice(null);
        }
        else {
            setLockedLevelNotice(lvlId);
        }
    };
    const handleSelectCategory = (cat) => {
        startCategoryWorksheet(cat);
    };
    const bestScore = activeCategory ? getCategoryBestScore(activeCategory.id) : null;
    const lastScore = activeCategory ? getCategoryLastScore(activeCategory.id) : null;
    const attemptsCount = activeCategory ? getCategoryAttemptsCount(activeCategory.id) : 0;
    return (<div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & LEVEL SELECTOR */}
      {/* ============================================================ */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 border-2 border-yellow-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600"/>
            <span>Interactive Abacus Practice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-heading">
            Syllabus Practice Worksheets 🎯
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Select your syllabus topic below to instantly load the 20-question practice worksheet.
          </p>
        </div>

        {/* Student Level Indicator & Quick Belt Switcher */}
        <div className="flex items-center gap-3 bg-[#FFFBF0] border-2 border-yellow-200 rounded-2xl p-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Student Level Access
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-[#1D3557]">
                Level {studentMaxLevel}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                {studentMaxLevel === 1 ? "Level 1 Unlocked" : `Levels 1 to ${studentMaxLevel} Unlocked`}
              </span>
            </div>
          </div>

          <div className="border-l border-yellow-200 pl-3">
            <span className="text-[9px] text-slate-400 font-bold block">Change Belt:</span>
            <select value={studentMaxLevel} onChange={(e) => {
            const newLvl = Number(e.target.value);
            setStudentMaxLevel(newLvl);
            setSelectedLevel(newLvl);
            setLockedLevelNotice(null);
        }} className="text-xs font-extrabold bg-white border border-yellow-300 rounded-lg px-2 py-1 text-[#1D3557] focus:outline-none cursor-pointer mt-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((l) => (<option key={l} value={l}>
                  Level {l}
                </option>))}
            </select>
          </div>

          {attemptHistory.length > 0 && (<button onClick={() => setShowHistoryDrawer(true)} className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 transition" title="View past attempts history">
              <History className="w-4 h-4"/>
            </button>)}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. LEVEL TABS (Levels 1 to 8) */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#1D3557]">
          <span className="flex items-center gap-1.5">
            <span>🥋</span>
            <span>Choose Abacus Level:</span>
          </span>
          <span className="text-slate-500">
            Active: <strong>Level {selectedLevel}</strong>
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {levels.map((lvl) => {
            const isSelected = lvl.id === selectedLevel;
            const isUnlocked = isLevelUnlocked(lvl.id);
            return (<button key={lvl.id} onClick={() => handleLevelClick(lvl.id)} className={`p-2.5 rounded-2xl text-left border-2 transition-all duration-200 cursor-pointer ${isSelected
                    ? "bg-gradient-to-tr from-[#1D3557] to-[#2B4C7E] text-white border-yellow-300 shadow-md scale-105"
                    : isUnlocked
                        ? "bg-white hover:bg-yellow-50 text-[#1D3557] border-yellow-200 shadow-sm"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded-full ${isSelected
                    ? "bg-white/20 text-yellow-300"
                    : isUnlocked
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"}`}>
                    {isUnlocked ? "✓" : "🔒"}
                  </span>
                  <span className="text-xs">{lvl.badge.split(" ")[1]}</span>
                </div>
                <div className="mt-1 text-xs font-black font-heading truncate">
                  Level {lvl.id}
                </div>
              </button>);
        })}
        </div>

        {/* Locked Notice Banner */}
        <AnimatePresence>
          {lockedLevelNotice && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <span className="font-extrabold text-[#1D3557]">
                    Level {lockedLevelNotice} is locked for your current level (Level {studentMaxLevel})!
                  </span>
                  <span className="text-slate-600 ml-1">
                    Advance your student level with the switcher above to unlock.
                  </span>
                </div>
              </div>

              <button onClick={() => {
                setStudentMaxLevel(lockedLevelNotice);
                setSelectedLevel(lockedLevelNotice);
                setLockedLevelNotice(null);
            }} className="px-3 py-1 rounded-full bg-[#1D3557] text-white font-bold hover:bg-slate-800 flex-shrink-0">
                Unlock Level {lockedLevelNotice}
              </button>
            </motion.div>)}
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/* 3. EXACT SYLLABUS TOPIC / RULE PILLS (Directly triggers worksheet below) */}
      {/* ============================================================ */}
      <div className="bg-[#FFFBF0] rounded-[2rem] p-4 sm:p-5 border-2 border-yellow-300 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-xs font-black text-[#1D3557] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#F4A261]"/>
            <span>CHOOSE PRACTICE TOPIC / RULE:</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Click any topic to immediately practice its 20-question worksheet below
          </span>
        </div>

        {/* The Exact Syllabus Options (NO "All Worksheets") */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categoriesForLevel.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            return (<button key={cat.id} onClick={() => handleSelectCategory(cat)} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer border-2 ${isActive
                    ? "bg-[#E63946] text-white border-white shadow-md shadow-rose-200 scale-105 ring-2 ring-rose-400"
                    : "bg-white text-slate-700 hover:text-[#1D3557] border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 shadow-sm"}`}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {isActive && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">20 Qs</span>}
              </button>);
        })}
        </div>

        {/* Active Category Meta Bar */}
        {activeCategory && (<div className="pt-2 border-t border-yellow-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#1D3557]">
                Active Worksheet: {activeCategory.name}
              </span>
              <span className="text-slate-400">•</span>
              <span>{activeCategory.description}</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>
                Attempts: <strong>{attemptsCount}</strong>
              </span>
              {bestScore && (<span>
                  Best: <strong className="text-emerald-700">{bestScore.score}/20</strong>
                </span>)}
              {lastScore && (<span>
                  Last: <strong className="text-blue-700">{lastScore.score}/20</strong>
                </span>)}
            </div>
          </div>)}
      </div>

      {/* ============================================================ */}
      {/* 4. THE 20-QUESTION WORKSHEET (Appears directly BELOW!) */}
      {/* ============================================================ */}
      <div className="pt-2">
        {viewMode === "result" ? <PracticeResultView /> : <WorksheetPlayer />}
      </div>

      {/* ============================================================ */}
      {/* 5. ATTEMPT HISTORY MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showHistoryDrawer && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#FFFBF0] rounded-[2rem] p-6 sm:p-8 max-w-2xl w-full border-4 border-yellow-200 shadow-2xl relative max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-yellow-200">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#F4A261]"/>
                  <h3 className="text-xl font-extrabold text-[#1D3557] font-heading">
                    Past Practice Attempts Log
                  </h3>
                </div>
                <button onClick={() => setShowHistoryDrawer(false)} className="w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                  ✕
                </button>
              </div>

              {/* Attempts list */}
              <div className="overflow-y-auto py-4 space-y-3 flex-grow pr-1">
                {attemptHistory.map((att, idx) => (<div key={att.id} className="p-4 rounded-2xl bg-white border-2 border-yellow-200 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          #{attemptHistory.length - idx}
                        </span>
                        <strong className="text-sm font-extrabold text-[#1D3557]">
                          {att.categoryTitle}
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-bold">
                          Level {att.level}
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
                  </div>))}
              </div>

              {/* Bottom Drawer Actions */}
              <div className="pt-4 border-t border-yellow-200 flex items-center justify-between">
                <button onClick={clearAttemptHistory} className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5"/>
                  <span>Clear All History</span>
                </button>

                <button onClick={() => setShowHistoryDrawer(false)} className="px-5 py-2.5 rounded-full bg-[#1D3557] text-white text-xs font-extrabold hover:bg-slate-800 cursor-pointer">
                  Close
                </button>
              </div>
            </motion.div>
          </div>)}
      </AnimatePresence>
    </div>);
}
