"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { ABACUS_LEVELS_DATA, AbacusLevel } from "@/data/syllabusData";

export default function SyllabusPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterLevel, setActiveFilterLevel] = useState<string>("all");


  const scrollToLevel = (levelId: string) => {
    const el = document.getElementById(levelId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filter levels based on search query
  const filteredLevels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ABACUS_LEVELS_DATA.filter((lvl) => {
      if (activeFilterLevel !== "all" && lvl.id !== activeFilterLevel) {
        return false;
      }
      if (!query) return true;

      const titleMatch = lvl.title.toLowerCase().includes(query);
      const descMatch = lvl.description.toLowerCase().includes(query);
      const objMatch = lvl.learningObjectives.some((obj) =>
        obj.toLowerCase().includes(query)
      );

      return titleMatch || descMatch || objMatch;
    });
  }, [searchQuery, activeFilterLevel]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden pb-24 font-sans selection:bg-yellow-200">
      {/* Decorative Soft Background Ambience */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 relative z-10">
        {/* ============================================================ */}
        {/* 1. HERO HEADER */}
        {/* ============================================================ */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-2 border-yellow-200 shadow-xl shadow-yellow-100/50 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Comprehensive Curriculum Roadmap
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1D3557] font-heading tracking-tight">
                Complete Abacus Learning Syllabus 🧮
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                Explore the complete 8-level curriculum from basic single-digit bead movement to international Flash Anzan mental arithmetic. Every level&apos;s full syllabus is visible below.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center min-w-[110px]">
                <span className="text-[10px] font-black uppercase text-amber-800 block">
                  Total Levels
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#1D3557] mt-1 block">
                  8
                </span>
                <span className="text-[10px] font-bold text-amber-700 mt-0.5 block">
                  Standardized
                </span>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center min-w-[110px]">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">
                  Syllabus Modules
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1 block">
                  50+
                </span>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">
                  Core Skills
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 text-center min-w-[110px]">
                <span className="text-[10px] font-black uppercase text-indigo-800 block">
                  Graduation
                </span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1 block">
                  Anzan
                </span>
                <span className="text-[10px] font-bold text-indigo-700 mt-0.5 block">
                  Mental Math
                </span>
              </div>
            </div>
          </div>

          {/* Search & Jump-To Level Bar */}
          <div className="mt-8 pt-6 border-t border-yellow-100 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-black uppercase text-[#1D3557] tracking-wider flex items-center gap-1.5 self-start sm:self-auto">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Quick Jump to Level:</span>
              </span>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rules, formulas, rows..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Quick Level Jump Pill Buttons (All 8 Levels) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => {
                  setActiveFilterLevel("all");
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  activeFilterLevel === "all"
                    ? "bg-[#1D3557] text-white shadow-md"
                    : "bg-yellow-50 text-slate-700 hover:bg-yellow-100 border border-yellow-200"
                }`}
              >
                All 8 Levels
              </button>

              {ABACUS_LEVELS_DATA.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    scrollToLevel(lvl.id);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer bg-white hover:bg-yellow-50 text-[#1D3557] border border-yellow-200 hover:border-yellow-300 shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span>{lvl.icon}</span>
                  <span>Level {lvl.levelNumber}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. EVERY LEVEL'S SYLLABUS CARDS (ALL 8 LEVELS VISIBLE) */}
        {/* ============================================================ */}
        <div className="space-y-8">
          {filteredLevels.map((lvl: AbacusLevel) => {
            return (
              <section
                key={lvl.id}
                id={lvl.id}
                className="scroll-mt-24 bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 border-2 border-yellow-200/90 shadow-xl shadow-yellow-100/40 relative overflow-hidden transition hover:shadow-2xl hover:border-yellow-300"
              >
                {/* Background Level Motif */}
                <div className="absolute top-4 right-6 text-7xl sm:text-8xl opacity-10 select-none pointer-events-none">
                  {lvl.icon}
                </div>

                {/* Level Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-yellow-100 pb-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                        <span>{lvl.icon}</span>
                        <span>Level {lvl.levelNumber}</span>
                      </span>

                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-amber-900 border border-yellow-200 text-xs font-bold">
                        {lvl.badge}
                      </span>

                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        {lvl.ageRecommendation}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#1D3557] font-heading">
                      {lvl.title}
                    </h2>

                    <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
                      {lvl.description}
                    </p>
                  </div>
                </div>

                {/* Level Syllabus Curriculum Grid */}
                <div className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black text-[#1D3557] uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>Syllabus & Calculation Modules:</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      {lvl.learningObjectives.length} Core Modules
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lvl.learningObjectives.map((objective, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFFDF9] border border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-yellow-100 text-amber-800 font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug block">
                            {objective}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}

          {filteredLevels.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-yellow-300 space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-xl font-bold text-[#1D3557]">
                No syllabus modules found matching &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs text-slate-500">
                Try searching for keywords like &ldquo;Small Friend&rdquo;, &ldquo;Multiplication&rdquo;, &ldquo;Division&rdquo;, or &ldquo;Anzan&rdquo;.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-5 py-2 rounded-full bg-[#1D3557] text-white text-xs font-bold shadow"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
