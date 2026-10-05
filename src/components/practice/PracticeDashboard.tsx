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

  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>(activeUntimedCategory || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const handleOpenUntimedDirectory = (cat: string = "all") => {
    setShowUntimedDirectory(true);
    setCategoryFilter(cat);
    setActiveUntimedCategory(cat);
    if (cat !== "all") {
      router.push(`/learning/practice?mode=untimed&category=${cat}`);
    } else {
      router.push("/learning/practice?mode=untimed");
    }
  };

  const handleBackFromDirectory = () => {
    if (categoryFilter !== "all") {
      setCategoryFilter("all");
      setActiveUntimedCategory("all");
      router.push("/learning/practice?mode=untimed");
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
      router.push(`/learning/practice?mode=untimed&category=${catId}`);
    } else {
      router.push("/learning/practice?mode=untimed");
    }
  };

  const handleStartUntimedWorksheet = (opt: UntimedWorksheetOption) => {
    router.push(`/learning/practice?mode=untimed&category=${opt.category}&sheet=${opt.id}`);
    startUntimedWorksheet(opt.id, opt.questionCount || 30);
  };

  // If in active worksheet mode or result mode, render that screen directly
  if (viewMode === "worksheet") {
    return <WorksheetPlayer />;
  }

  if (viewMode === "result") {
    return <PracticeResultView />;
  }

  // Filtered untimed worksheets based on category and search query
  const filteredWorksheets = UNTIMED_WORKSHEET_OPTIONS.filter((opt) => {
    const matchesCategory = categoryFilter === "all" || opt.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.ruleFormula && opt.ruleFormula.toLowerCase().includes(searchQuery.toLowerCase())) ||
      opt.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ============================================================
  // UNTIMED 31-WORKSHEET DIRECTORY VIEW
  // Triggered when user clicks "Practice Without Timer"
  // ============================================================
  if (showUntimedDirectory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                {categoryFilter !== "all" ? "Back to All Worksheets" : "Back to Practice Modes"}
              </span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-heading">
                {categoryFilter !== "all"
                  ? `${categoryFilter === "simple" ? "Simple Calculation" : "Practice"} Worksheets (${filteredWorksheets.length})`
                  : "Practice Without Timer (31 Worksheets)"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl">
              {categoryFilter === "simple"
                ? "Direct 1-digit and 2-digit calculation worksheets with zero formula pressure. Perfect for pure bead discipline!"
                : "Select any of the 31 specialized worksheets below. Zero timer pressure—practice each exact rule, formula, or row count with proper bead discipline!"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => startPracticeSession("untimed")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Mixed Practice (20 Qs)</span>
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
                placeholder="Search rule or worksheet (e.g. +4, -3, 5 row, big friend, simple)..."
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
              Showing <span className="text-emerald-700 font-black">{filteredWorksheets.length}</span> of {UNTIMED_WORKSHEET_OPTIONS.length} worksheets
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {[
              { id: "all", label: "All (31)", count: 31 },
              { id: "small-friend-add", label: "🔥 Small Friend (+) (4)", count: 4 },
              { id: "small-friend-sub", label: "🔥 Small Friend (-) (4)", count: 4 },
              { id: "big-friend-add", label: "🔥 Big Friend (+) (9)", count: 9 },
              { id: "big-friend-sub", label: "🔥 Big Friend (-) (9)", count: 9 },
              { id: "multi-row", label: "🔥 Multi-Row (3)", count: 3 },
              { id: "simple", label: selectedLevel >= 2 ? "Level 1 Review (2)" : "Simple Calculation (2)", count: 2 },
            ].map((tab) => {
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
                  <span>{tab.label}</span>
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

      {/* 2. THE 2 PRACTICE OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* ======================================================== */}
        {/* OPTION 1: PRACTICE WITHOUT TIMER */}
        {/* ======================================================== */}
        <div
          onClick={() => setShowUntimedDirectory(true)}
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
                {selectedLevel >= 2 ? "Option 1 • 31 Worksheets (Level 2 Active)" : "Option 1 • 31 Worksheets"}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1D3557] font-heading mb-1.5 group-hover:text-emerald-700 transition-colors">
                Practice Without Timer
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Click here to choose from 31 dedicated worksheets across Simple calculations, Small friend rules (+/-), Big friend rules (+/-), and Multi-row drills without clock pressure.
              </p>
            </div>

            {/* Quick Benefits */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/60">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 31 Target Worksheets
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No time limit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Focus on rules
              </span>
            </div>

            {/* 31 Worksheet Categories Overview */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                Worksheet Categories Available (31 Options):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUntimedDirectory("simple");
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 cursor-pointer transition-all"
                >
                  <span className="font-extrabold text-[#1D3557] block">1️⃣ Simple Calculation</span>
                  <span className="text-slate-500 font-medium text-[11px] block mt-0.5">
                    1 Digit & 2 Digits direct
                  </span>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUntimedDirectory("small-friend-add");
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 cursor-pointer transition-all"
                >
                  <span className="font-extrabold text-[#1D3557] block">🤝 Small Friend Rules</span>
                  <span className="text-slate-500 font-medium text-[11px] block mt-0.5">
                    +4, +3, +2, +1 & -4, -3, -2, -1
                  </span>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUntimedDirectory("big-friend-add");
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 cursor-pointer transition-all"
                >
                  <span className="font-extrabold text-[#1D3557] block">🚀 Big Friend Rules</span>
                  <span className="text-slate-500 font-medium text-[11px] block mt-0.5">
                    +9 to +1 and -9 to -1
                  </span>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUntimedDirectory("multi-row");
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 cursor-pointer transition-all"
                >
                  <span className="font-extrabold text-[#1D3557] block">⚡ Multi-Row Drills</span>
                  <span className="text-slate-500 font-medium text-[11px] block mt-0.5">
                    1 Digit 3, 5, and 7 rows
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Start Buttons */}
          <div className="pt-6 mt-6 border-t border-emerald-100 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenUntimedDirectory("all");
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-extrabold text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌱 Choose from 31 Worksheets</span>
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
                {selectedLevel >= 2 ? "Option 2 • Level 2 Timed Drill" : "Option 2 • Timed Drill"}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1D3557] font-heading mb-1.5">
                {selectedLevel >= 2 ? "Level 2 Practice With Timer" : "Practice With Timer"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {selectedLevel >= 2
                  ? "Boost your 2-digit calculation velocity and Small/Big Friend rules under timed pressure. Challenge yourself to complete calculations before time runs out!"
                  : "Boost your calculation velocity and mental agility against the clock. Set your target duration in minutes and challenge yourself to complete calculations before time runs out!"}
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
