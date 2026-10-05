"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  ArrowRight,
  History,
  Trash2,
  Zap,
  CheckCircle2,
  Search,
  ArrowLeft,
  Filter,
  BookOpen,
  Layers,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePractice } from "@/context/PracticeContext";
import { UNTIMED_WORKSHEET_OPTIONS, UntimedWorksheetOption } from "@/data/untimedWorksheetsData";
import WorksheetPlayer from "./WorksheetPlayer";
import PracticeResultView from "./PracticeResultView";

export const LEVELS_LIST = [
  { level: 1, name: "Level 1", desc: "Foundations & Friends", count: 31, icon: "🌱" },
  { level: 2, name: "Level 2", desc: "10-15 Rows & 2-Digit", count: 6, icon: "🚀" },
  { level: 3, name: "Level 3", desc: "20-25 Rows & 3-Digit", count: 6, icon: "⚡" },
  { level: 4, name: "Level 4", desc: "30 Rows & 4-Digit", count: 7, icon: "🔥" },
  { level: 5, name: "Level 5", desc: "Multiplication (2D×1D)", count: 5, icon: "✖️" },
  { level: 6, name: "Level 6", desc: "Advanced Mult & Div", count: 10, icon: "💎" },
  { level: 7, name: "Level 7", desc: "Grandmaster Operations", count: 7, icon: "👑" },
  { level: 8, name: "Level 8", desc: "Mental Calculations", count: 3, icon: "🧠" },
];

export const SYLLABUS_LEVEL_INFO: Record<
  number,
  {
    title: string;
    subtitle: string;
    topics: { title: string; desc: string; icon: string }[];
  }
> = {
  1: {
    title: "Level 1: Foundations & Friend Formulas",
    subtitle: "Simple 1 & 2 digits, Small Friend rules, Big Friend rules, and 3/5/7-row vertical stacks.",
    topics: [
      { title: "Simple Calculations", desc: "1 & 2 digits direct without rules", icon: "1️⃣" },
      { title: "Small Friend Rules", desc: "+4, +3, +2, +1 & -4, -3, -2, -1 (Base 5)", icon: "🤝" },
      { title: "Big Friend Rules", desc: "+9..+1 and -9..-1 (Base 10)", icon: "🚀" },
      { title: "Multi-Row Stacks", desc: "1 digit across 3, 5, and 7 rows", icon: "⚡" },
    ],
  },
  2: {
    title: "Level 2: Intermediate Multi-Row Speed",
    subtitle: "High-row single-digit concentration and multi-row 2-digit calculations.",
    topics: [
      { title: "1 Digit 10, 12, 15 Rows", desc: "Sustained single-digit vertical endurance", icon: "🔟" },
      { title: "2 Digit 3 Row Calculation", desc: "Tens & units coordination across 3 rows", icon: "🔢" },
      { title: "2 Digit 5 Row Calculation", desc: "5 consecutive 2-digit rows with mixed rules", icon: "🔥" },
      { title: "2 Digit 8 Row Calculation", desc: "Championship 8-row speed arithmetic", icon: "👑" },
    ],
  },
  3: {
    title: "Level 3: Extended Rows & 3-Digit Stacks",
    subtitle: "20-25 row marathons, 10-12 row 2-digit arithmetic, and 3-digit foundations.",
    topics: [
      { title: "1 Digit 20 & 25 Rows", desc: "Ultra-endurance single digit speed runs", icon: "⚡" },
      { title: "2 Digit 10 & 12 Rows", desc: "Extended 2-digit multi-row calculations", icon: "🔢" },
      { title: "3 Digit 3 Row Calculation", desc: "Hundreds rod manipulation across 3 rows", icon: "💎" },
      { title: "3 Digit 5 Row Calculation", desc: "5 consecutive 3-digit rows with full formulas", icon: "🌟" },
    ],
  },
  4: {
    title: "Level 4: Advanced Arithmetic & 4-Digit Stacks",
    subtitle: "30-row marathons, 15-20 row 2-digit, 7-10 row 3-digit, and 4-digit stacks.",
    topics: [
      { title: "1 Digit 30 Row Calculation", desc: "Ultimate 30-row single-digit marathon", icon: "⚡" },
      { title: "2 Digit 15 & 20 Rows", desc: "15 to 20 rows of rapid two-digit calculations", icon: "🔥" },
      { title: "3 Digit 7 & 10 Rows", desc: "7 to 10 rows of triple-digit addition/subtraction", icon: "🔟" },
      { title: "4 Digit 3 & 5 Rows", desc: "Thousands rod manipulation across 3 & 5 rows", icon: "💎" },
    ],
  },
  5: {
    title: "Level 5: 2D 25R, 3D 15R & Abacus Multiplication",
    subtitle: "Multi-digit endurance stacks and introduction to abacus multiplication.",
    topics: [
      { title: "2 Digit 25 Row Calculation", desc: "Quarter-century rows of 2-digit numbers", icon: "🔥" },
      { title: "3 Digit 12 & 15 Rows", desc: "Extended triple-digit vertical stacks", icon: "🔢" },
      { title: "4 Digit 7 Row Calculation", desc: "7 rows of thousands-column arithmetic", icon: "💎" },
      { title: "Multiplication (2D × 1D)", desc: "Soroban rod unit multiplication technique", icon: "✖️" },
    ],
  },
  6: {
    title: "Level 6: Advanced Multiplication & Abacus Division",
    subtitle: "5-digit stacks, 2D×2D & 4D×1D multiplication, and introduction to division.",
    topics: [
      { title: "2D 30R & 3D 20R Calculations", desc: "Peak multi-digit vertical additions", icon: "⚡" },
      { title: "4D 8R/10R & 5D 3R/5R", desc: "Ten-thousands column high-density stacks", icon: "💎" },
      { title: "Multiplication (3D×1D, 4D×1D, 2D×2D)", desc: "Multi-digit cross-product placement", icon: "✖️" },
      { title: "Division (2 Digit ÷ 1 Digit)", desc: "Abacus quotient placement & remainder subtraction", icon: "➗" },
    ],
  },
  7: {
    title: "Level 7: Grandmaster Operations",
    subtitle: "3D 25R, 4D 15R, 5D 10R, 3D×3D multiplication, and multi-digit division.",
    topics: [
      { title: "3D 25R, 4D 15R, 5D 10R", desc: "Master-tier multi-digit continuous calculation", icon: "👑" },
      { title: "Multiplication (3D × 2D)", desc: "Triple-digit by double-digit calculation", icon: "✖️" },
      { title: "Multiplication (3D × 3D)", desc: "Championship 3-digit by 3-digit mastery", icon: "🌟" },
      { title: "Division (3D ÷ 1D & 3D ÷ 2D)", desc: "Advanced dividend-divisor rod manipulation", icon: "➗" },
    ],
  },
  8: {
    title: "Level 8: Mental Calculations (Anzan)",
    subtitle: "Flash Anzan, multi-row mental math, and international competition speed trials.",
    topics: [
      { title: "Flash Anzan Mental Math", desc: "Rapid flashing numbers calculated mentally in seconds", icon: "⚡" },
      { title: "Mental Multi-Row Addition & Subtraction", desc: "10 to 20 rows calculated with zero physical abacus", icon: "🧠" },
      { title: "International Competition Speed", desc: "Championship-standard speed mental arithmetic", icon: "👑" },
    ],
  },
};

export default function PracticeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    viewMode,
    startPracticeSession,
    startUntimedWorksheet,
    attemptHistory,
    clearAttemptHistory,
    targetMinutes,
    setTargetMinutes,
    showUntimedDirectory,
    setShowUntimedDirectory,
    activeUntimedCategory,
    setActiveUntimedCategory,
    activeUntimedOptionId,
    backToDashboard,
    backToUntimedDirectory,
    selectedLevel,
  } = usePractice();

  const [activeLevelTab, setActiveLevelTab] = useState<number>(selectedLevel || 1);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>(activeUntimedCategory || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync activeLevelTab when student's enrolled level changes
  useEffect(() => {
    if (selectedLevel) {
      setActiveLevelTab(selectedLevel);
    }
  }, [selectedLevel]);

  // Sync categoryFilter with activeUntimedCategory
  useEffect(() => {
    if (activeUntimedCategory) {
      setCategoryFilter(activeUntimedCategory);
    }
  }, [activeUntimedCategory]);

  // Synchronize URL search parameters with practice navigation state
  useEffect(() => {
    const mode = searchParams.get("mode");
    const category = searchParams.get("category");
    const sheet = searchParams.get("sheet");
    const levelParam = searchParams.get("level");

    if (levelParam) {
      const parsed = parseInt(levelParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) {
        const maxLevel = selectedLevel || 1;
        setActiveLevelTab(Math.min(parsed, maxLevel));
      }
    }

    if (sheet) {
      if (viewMode !== "worksheet" || activeUntimedOptionId !== sheet) {
        startUntimedWorksheet(sheet);
      }
    } else if (viewMode === "worksheet") {
      backToUntimedDirectory(category || activeUntimedCategory || "simple");
    }

    if (mode === "untimed") {
      setShowUntimedDirectory(true);
      if (category) {
        setCategoryFilter(category);
        setActiveUntimedCategory(category);
      } else {
        setCategoryFilter("all");
        setActiveUntimedCategory("all");
      }
    } else if (!sheet && viewMode !== "worksheet") {
      if (!mode) {
        setShowUntimedDirectory(false);
      }
    }
  }, [searchParams]);

  const handleOpenUntimedDirectory = (cat: string = "all", level?: number) => {
    const rawTargetLvl = level !== undefined ? level : activeLevelTab;
    const targetLvl = Math.min(rawTargetLvl, selectedLevel || 1);
    setActiveLevelTab(targetLvl);
    setShowUntimedDirectory(true);
    setCategoryFilter(cat);
    setActiveUntimedCategory(cat);
    if (cat !== "all") {
      router.push(`/learning/practice?mode=untimed&level=${targetLvl}&category=${cat}`);
    } else {
      router.push(`/learning/practice?mode=untimed&level=${targetLvl}`);
    }
  };

  const handleBackFromDirectory = () => {
    if (categoryFilter !== "all") {
      setCategoryFilter("all");
      setActiveUntimedCategory("all");
      router.push(`/learning/practice?mode=untimed&level=${activeLevelTab}`);
    } else {
      setShowUntimedDirectory(false);
      backToDashboard();
      router.push("/learning/practice");
    }
  };

  const handleSelectCategoryTab = (catId: string) => {
    setCategoryFilter(catId);
    setActiveUntimedCategory(catId);
    if (catId !== "all") {
      router.push(`/learning/practice?mode=untimed&level=${activeLevelTab}&category=${catId}`);
    } else {
      router.push(`/learning/practice?mode=untimed&level=${activeLevelTab}`);
    }
  };

  const handleStartUntimedWorksheet = (opt: UntimedWorksheetOption) => {
    router.push(`/learning/practice?mode=untimed&level=${opt.level || 1}&category=${opt.category}&sheet=${opt.id}`);
    startUntimedWorksheet(opt.id, opt.questionCount || 30);
  };

  // If in active worksheet mode or result mode, render that screen directly
  if (viewMode === "worksheet") {
    return <WorksheetPlayer />;
  }

  if (viewMode === "result") {
    return <PracticeResultView />;
  }

  // Worksheets for the currently selected level tab
  const levelWorksheets = UNTIMED_WORKSHEET_OPTIONS.filter(
    (opt) => (opt.level || 1) === activeLevelTab
  );

  // Filtered untimed worksheets based on category and search query
  const filteredWorksheets = levelWorksheets.filter((opt) => {
    const matchesCategory = categoryFilter === "all" || opt.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.ruleFormula && opt.ruleFormula.toLowerCase().includes(searchQuery.toLowerCase())) ||
      opt.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamic categories available for the active level
  const availableCategoryTabs = Array.from(
    levelWorksheets.reduce((acc, opt) => {
      const key = opt.category;
      const groupName = opt.categoryGroup || opt.category;
      if (!acc.has(key)) {
        acc.set(key, { id: key, label: groupName, count: 0 });
      }
      acc.get(key)!.count += 1;
      return acc;
    }, new Map<string, { id: string; label: string; count: number }>([
      ["all", { id: "all", label: `All (${levelWorksheets.length})`, count: levelWorksheets.length }]
    ])).values()
  ).map((tab) => ({
    ...tab,
    displayLabel: tab.id === "all" ? tab.label : `${tab.label} (${tab.count})`,
  }));

  const currentLevelInfo = SYLLABUS_LEVEL_INFO[activeLevelTab] || SYLLABUS_LEVEL_INFO[1];

  // Reusable Level Ribbon
  const renderLevelRibbon = () => (
    <div className="bg-white rounded-3xl p-3 sm:p-4 border-2 border-emerald-200/80 shadow-sm space-y-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>📚</span> Syllabus Level Navigator:
        </span>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
          Your Enrolled Level: <strong className="font-black">Level {selectedLevel}</strong>
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {LEVELS_LIST.map((lvl) => {
          const isActive = activeLevelTab === lvl.level;
          const isUserLevel = selectedLevel === lvl.level;
          const isLocked = lvl.level > (selectedLevel || 1);
          const isCompleted = lvl.level < (selectedLevel || 1);

          return (
            <button
              key={lvl.level}
              type="button"
              disabled={isLocked}
              onClick={() => {
                if (isLocked) return;
                setActiveLevelTab(lvl.level);
                setCategoryFilter("all");
                setActiveUntimedCategory("all");
              }}
              className={`p-2.5 rounded-2xl text-left transition-all duration-200 relative border ${
                isLocked
                  ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-55"
                  : isActive
                  ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-md scale-[1.02] cursor-pointer"
                  : "bg-[#FFFBF0] hover:bg-emerald-50 text-slate-700 border-emerald-200/70 cursor-pointer"
              }`}
            >
              {isUserLevel ? (
                <span
                  className={`absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                    isActive ? "bg-amber-400 text-slate-900" : "bg-emerald-600 text-white"
                  }`}
                >
                  Current
                </span>
              ) : isCompleted ? (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ Done
                </span>
              ) : isLocked ? (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter bg-slate-200 text-slate-600">
                  🔒 Locked
                </span>
              ) : null}
              <div className="flex items-center gap-1.5">
                <span className="text-base">{isLocked ? "🔒" : lvl.icon}</span>
                <span className={`text-xs font-black ${isLocked ? "text-slate-400" : isActive ? "text-white" : "text-[#1D3557]"}`}>
                  Level {lvl.level}
                </span>
              </div>
              <div
                className={`text-[10px] font-bold truncate mt-0.5 ${
                  isLocked ? "text-slate-400" : isActive ? "text-emerald-100" : "text-slate-500"
                }`}
              >
                {isLocked ? "Locked" : `${lvl.count} Worksheets`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ============================================================
  // UNTIMED 31-WORKSHEET DIRECTORY VIEW
  // Triggered when user clicks "Practice Without Timer"
  // ============================================================
  if (showUntimedDirectory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Level Ribbon */}
        {renderLevelRibbon()}

        {/* Top Header */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleBackFromDirectory}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider transition border border-emerald-200 cursor-pointer mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {categoryFilter !== "all" ? "Back to All Level Worksheets" : "Back to Practice Modes"}
              </span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-heading">
                {categoryFilter !== "all"
                  ? `Level ${activeLevelTab} Worksheets (${filteredWorksheets.length})`
                  : `Level ${activeLevelTab} Practice Without Timer (${levelWorksheets.length} Worksheets)`}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl">
              {currentLevelInfo.subtitle} Zero timer pressure—practice with complete abacus accuracy!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => startPracticeSession("untimed", undefined, activeLevelTab)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Mixed Level {activeLevelTab} Practice (20 Qs)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search Level ${activeLevelTab} worksheets...`}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#FFFBF0] border border-emerald-200 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="text-xs font-bold text-slate-500 self-end md:self-auto">
              Showing <span className="text-emerald-700 font-black">{filteredWorksheets.length}</span> of {levelWorksheets.length} Level {activeLevelTab} worksheets
            </div>
          </div>

          {/* Dynamic Category Filter Tabs for active level */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {availableCategoryTabs.map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectCategoryTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm scale-105"
                      : "bg-[#FFFBF0] text-slate-600 hover:bg-emerald-50 border border-emerald-200/60"
                  }`}
                >
                  <span>{tab.displayLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 31 Worksheet Cards Grid */}
        {filteredWorksheets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <span className="text-4xl block mb-2">🔍</span>
            <h3 className="text-lg font-bold text-slate-700">No worksheets matched &ldquo;{searchQuery}&rdquo;</h3>
            <p className="text-xs text-slate-400 mt-1">Try searching for &quot;+4&quot;, &quot;big friend&quot;, or &quot;5 row&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWorksheets.map((opt) => (
              <motion.div
                key={opt.id}
                whileHover={{ y: -4 }}
                onClick={() => handleStartUntimedWorksheet(opt)}
                className={`bg-white rounded-3xl p-5 border-2 ${
                  opt.isPdfWorksheet
                    ? "border-emerald-300 ring-2 ring-emerald-200/50 hover:border-emerald-500"
                    : "border-slate-200 hover:border-emerald-400"
                } hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xl shadow-xs">
                      {opt.icon}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      opt.category === "simple" && selectedLevel >= 2
                        ? "bg-slate-100 text-slate-700 border-slate-300 font-extrabold"
                        : opt.isPdfWorksheet
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      {opt.category === "simple" && selectedLevel >= 2 ? "Level 1 ✓" : opt.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#1D3557] group-hover:text-emerald-700 transition-colors leading-snug">
                      {opt.name}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                      {opt.categoryGroup}
                    </span>
                  </div>

                  {/* Formula Pill if applicable */}
                  {opt.ruleFormula && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-black flex items-center gap-1.5">
                      <span className="text-[10px] text-amber-700 uppercase font-sans font-bold">Rule:</span>
                      <span>{opt.ruleFormula}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">
                    {opt.description}
                  </p>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {opt.isPdfWorksheet ? "30 PDF Questions • Untimed" : "30 Questions • Untimed"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // LANDING DASHBOARD: ONLY 2 PRACTICE OPTIONS
  // 1. Practice Without Timer (Clicking reveals the 31 worksheets)
  // 2. Practice With Timer
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-yellow-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Interactive Abacus Practice Portal {selectedLevel >= 2 ? "• Level 2 Active 🚀" : "• Level 1"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1D3557] font-heading">
            {selectedLevel >= 2 ? "Level 2 Practice Portal 🎯" : "Choose Your Practice Mode 🎯"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            {selectedLevel >= 2
              ? "Congratulations on your Level 1 Certification! Your practice worksheets, 2-digit operations, and timed challenges are now upgraded to Level 2."
              : "Select one of the 2 practice options below. Practice Without Timer provides 31 targeted worksheets, while Practice With Timer tests your speed!"}
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

      {/* Level Ribbon on Landing */}
      {renderLevelRibbon()}

      {/* 2. THE 2 PRACTICE OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* ======================================================== */}
        {/* OPTION 1: PRACTICE WITHOUT TIMER */}
        {/* ======================================================== */}
        <div
          onClick={() => handleOpenUntimedDirectory("all", activeLevelTab)}
          className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-3 border-emerald-300 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-5">
            {/* Header Badge & Icon */}
            <div className="flex items-center justify-between">
              <span className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-sm">
                🌱
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
                Option 1 • Level {activeLevelTab} ({levelWorksheets.length} Worksheets)
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1D3557] font-heading mb-1.5 group-hover:text-emerald-700 transition-colors">
                Level {activeLevelTab} Worksheets (Untimed)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {currentLevelInfo.subtitle} Zero timer pressure—master each formula and row count with proper bead discipline.
              </p>
            </div>

            {/* Quick Benefits */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/60">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {levelWorksheets.length} Syllabus Worksheets
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No time limit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Bead Accuracy
              </span>
            </div>

            {/* Level Syllabus Topics Overview */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                Level {activeLevelTab} Syllabus Worksheets ({levelWorksheets.length} Available):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentLevelInfo.topics.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUntimedDirectory("all", activeLevelTab);
                    }}
                    className="p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 cursor-pointer transition-all"
                  >
                    <span className="font-extrabold text-[#1D3557] block flex items-center gap-1.5">
                      <span>{t.icon}</span>
                      <span>{t.title}</span>
                    </span>
                    <span className="text-slate-500 font-medium text-[11px] block mt-0.5">
                      {t.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Buttons */}
          <div className="pt-6 mt-6 border-t border-emerald-100 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenUntimedDirectory("all", activeLevelTab);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-extrabold text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌱 Choose from {levelWorksheets.length} Level {activeLevelTab} Worksheets</span>
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
                Option 2 • Level {activeLevelTab} Timed Drill
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1D3557] font-heading mb-1.5">
                Level {activeLevelTab} Practice With Timer
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Boost your Level {activeLevelTab} calculation velocity and endurance against the clock. Set your target duration in minutes and challenge yourself to complete calculations before time runs out!
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
                Contents Inside Level {activeLevelTab} Practice:
              </span>

              <div className="space-y-2">
                {currentLevelInfo.topics.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80">
                    <span className="w-7 h-7 rounded-xl bg-[#E76F51] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="text-xs">
                      <span className="font-extrabold text-[#1D3557] block">{t.title}</span>
                      <span className="text-slate-500 font-medium text-[11px]">{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-6 mt-6 border-t border-orange-100">
            <button
              onClick={() => startPracticeSession("timed", targetMinutes, activeLevelTab)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white font-extrabold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⏱️ Start Level {activeLevelTab} Timed Practice ({targetMinutes} {targetMinutes === 1 ? "Min" : "Mins"})</span>
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
