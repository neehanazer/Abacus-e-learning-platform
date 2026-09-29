"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Palette,
  Heart,
  Star,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Calculator,
  Award,
  Layers,
  GraduationCap,
  Play,
  Volume2,
} from "lucide-react";

// The 5 exact colors requested by the user
const USER_PALETTE = [
  {
    name: "Eggshell Cream",
    hex: "#f4f1de",
    role: "Page Canvas & Soft Surface Background",
    darkText: true,
    description: "Gentle warm neutral foundation, eliminates eye fatigue compared to pure white.",
  },
  {
    name: "Terracotta Coral",
    hex: "#e07a5f",
    role: "Primary Action, Upper Beads & Active Badges",
    darkText: false,
    description: "Vibrant warm accent for primary buttons, active bead fusions, and focus indicators.",
  },
  {
    name: "Honey Sand",
    hex: "#f2cc8f",
    role: "Star Points, Warm Borders & Secondary Cards",
    darkText: true,
    description: "Friendly golden wheat tone for badges, card borders, and star milestones.",
  },
  {
    name: "Sage Green",
    hex: "#81b29a",
    role: "Success Feedback, Accuracy & Lower Beads",
    darkText: false,
    description: "Harmonious calming green for correct answers, progress bars, and positive mastery.",
  },
  {
    name: "Deep Slate Navy",
    hex: "#3d405b",
    role: "Headings, High-Contrast Typography & Frame Structure",
    darkText: false,
    description: "Grounding contrast anchor for sharp typography, abacus frames, and dark card variants.",
  },
];

export default function PaletteTemplatePreviewPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"template" | "tokens" | "css">("template");
  
  // Interactive Abacus state
  const [upperBeadActive, setUpperBeadActive] = useState<boolean>(true);
  const [activeLowerBeads, setActiveLowerBeads] = useState<number>(3);
  
  // Interactive Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  const calculatedValue = (upperBeadActive ? 5 : 0) + activeLowerBeads;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const cssVariablesSnippet = `:root {
  --bg-eggshell: #f4f1de;
  --accent-terracotta: #e07a5f;
  --warm-honey-sand: #f2cc8f;
  --success-sage-green: #81b29a;
  --deep-slate-navy: #3d405b;
}`;

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-28 font-sans selection:bg-[#f2cc8f] selection:text-[#3d405b]"
      style={{ backgroundColor: "#f4f1de", color: "#3d405b" }}
    >
      {/* Background Subtle Geometric Blobs */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: "#f2cc8f" }}
      />
      <div
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: "#81b29a" }}
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: "#e07a5f" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10">
        {/* ============================================================ */}
        {/* PALETTE BANNER & CONTROLS */}
        {/* ============================================================ */}
        <header
          className="rounded-[2rem] p-6 sm:p-8 border-2 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderColor: "#f2cc8f",
          }}
        >
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                style={{ backgroundColor: "#3d405b", color: "#f4f1de" }}
              >
                5-Color System Applied
              </span>
              <span className="text-xs font-bold" style={{ color: "#e07a5f" }}>
                Dashboard Untouched 🔒
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: "#3d405b" }}>
              Abacus E-Learning Template Preview
            </h1>

            <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: "#3d405b", opacity: 0.85 }}>
              Rendered with your exact palette: <code className="font-bold text-[#e07a5f]">#f4f1de</code>, <code className="font-bold text-[#e07a5f]">#e07a5f</code>, <code className="font-bold text-[#e07a5f]">#f2cc8f</code>, <code className="font-bold text-[#e07a5f]">#81b29a</code>, and <code className="font-bold text-[#e07a5f]">#3d405b</code>.
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex items-center p-1.5 rounded-2xl border self-start md:self-auto shadow-inner"
            style={{ backgroundColor: "#f4f1de", borderColor: "#f2cc8f" }}
          >
            <button
              onClick={() => setActiveTab("template")}
              className="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              style={{
                backgroundColor: activeTab === "template" ? "#3d405b" : "transparent",
                color: activeTab === "template" ? "#f4f1de" : "#3d405b",
              }}
            >
              Interactive Template
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              style={{
                backgroundColor: activeTab === "tokens" ? "#3d405b" : "transparent",
                color: activeTab === "tokens" ? "#f4f1de" : "#3d405b",
              }}
            >
              Color Swatches ({USER_PALETTE.length})
            </button>
            <button
              onClick={() => setActiveTab("css")}
              className="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              style={{
                backgroundColor: activeTab === "css" ? "#3d405b" : "transparent",
                color: activeTab === "css" ? "#f4f1de" : "#3d405b",
              }}
            >
              CSS Variables
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* VIEW 1: COMPLETE INTERACTIVE TEMPLATE SHOWCASE */}
        {/* ============================================================ */}
        {activeTab === "template" && (
          <div className="space-y-8">
            {/* HERO SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] p-6 sm:p-10 border-3 shadow-xl relative overflow-hidden"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#f2cc8f",
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4 max-w-xl">
                  {/* Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                    style={{ backgroundColor: "#81b29a", color: "#FFFFFF" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Level 1: Small Friends & Big Friends
                  </div>

                  {/* Main Title */}
                  <h2
                    className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight"
                    style={{ color: "#3d405b" }}
                  >
                    Master Soroban Math with{" "}
                    <span style={{ color: "#e07a5f" }}>Harmonious Speed</span>
                  </h2>

                  <p className="text-sm sm:text-base leading-relaxed font-medium" style={{ color: "#3d405b", opacity: 0.85 }}>
                    Practice interactive bead manipulation, solve rapid multi-row worksheets, and build mental math accuracy on a soothing, high-contrast canvas.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      className="px-7 py-4 rounded-2xl text-white font-black text-sm shadow-md transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                      style={{
                        backgroundColor: "#e07a5f",
                        boxShadow: "0 10px 20px -5px rgba(224, 122, 95, 0.4)",
                      }}
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Video Lesson</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      className="px-6 py-4 rounded-2xl font-black text-sm transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border-2"
                      style={{
                        backgroundColor: "#f2cc8f",
                        borderColor: "#e07a5f",
                        color: "#3d405b",
                      }}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Practice Drills</span>
                    </button>

                    <div
                      className="px-4 py-3 rounded-2xl border flex items-center gap-2 text-xs font-bold"
                      style={{
                        backgroundColor: "#f4f1de",
                        borderColor: "#f2cc8f",
                        color: "#3d405b",
                      }}
                    >
                      <Star className="w-4 h-4 fill-[#f2cc8f] text-[#e07a5f]" />
                      <span>120 Stars Earned</span>
                    </div>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* INTERACTIVE ABACUS DEMO (Styled with User Palette) */}
                {/* ==================================================== */}
                <div
                  className="rounded-3xl p-6 border-3 shadow-xl max-w-sm w-full space-y-4 text-center"
                  style={{
                    backgroundColor: "#f4f1de",
                    borderColor: "#3d405b",
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#f2cc8f" }}>
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#3d405b" }}>
                      Interactive Soroban Rod
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black"
                      style={{ backgroundColor: "#81b29a", color: "#FFFFFF" }}
                    >
                      Value: {calculatedValue}
                    </span>
                  </div>

                  {/* Abacus Physical Frame */}
                  <div
                    className="p-5 rounded-2xl border-4 relative"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#3d405b",
                    }}
                  >
                    {/* Upper Heaven Bead Section */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#3d405b" }}>
                        Upper Bead (+5)
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setUpperBeadActive(!upperBeadActive)}
                        className="w-16 h-8 rounded-full shadow-md flex items-center justify-center font-black text-xs cursor-pointer transition border-2"
                        style={{
                          backgroundColor: upperBeadActive ? "#e07a5f" : "#f4f1de",
                          color: upperBeadActive ? "#FFFFFF" : "#3d405b",
                          borderColor: "#3d405b",
                        }}
                      >
                        {upperBeadActive ? "5 (Active)" : "5"}
                      </motion.button>
                    </div>

                    {/* Beam separator */}
                    <div
                      className="w-full h-2.5 rounded-full my-3 shadow-inner"
                      style={{ backgroundColor: "#3d405b" }}
                    />

                    {/* Lower Earth Beads Section (+1 each) */}
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#3d405b" }}>
                        Lower Beads (+1 each)
                      </span>
                      <div className="flex flex-col gap-1.5 w-full items-center">
                        {[1, 2, 3, 4].map((bead) => {
                          const isBeadActive = bead <= activeLowerBeads;
                          return (
                            <motion.button
                              key={bead}
                              whileHover={{ scale: 1.06 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => {
                                if (activeLowerBeads === bead) {
                                  setActiveLowerBeads(bead - 1);
                                } else {
                                  setActiveLowerBeads(bead);
                                }
                              }}
                              className="w-16 h-7 rounded-full shadow-sm flex items-center justify-center font-bold text-xs cursor-pointer transition border"
                              style={{
                                backgroundColor: isBeadActive ? "#81b29a" : "#f4f1de",
                                color: isBeadActive ? "#FFFFFF" : "#3d405b",
                                borderColor: "#3d405b",
                              }}
                            >
                              +1
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium" style={{ color: "#3d405b", opacity: 0.75 }}>
                    Click upper bead (Terracotta <code>#e07a5f</code>) or lower beads (Sage <code>#81b29a</code>) to see calculations live!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ==================================================== */}
            {/* 3-CARD LEARNING MODULE SHOWCASE */}
            {/* ==================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Video Lessons (Terracotta Accent) */}
              <div
                className="rounded-3xl p-6 border-2 shadow-md space-y-4 hover:-translate-y-1 transition duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#e07a5f",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm text-white"
                  style={{ backgroundColor: "#e07a5f" }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black" style={{ color: "#3d405b" }}>
                  1. Video Lessons
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#3d405b", opacity: 0.8 }}>
                  Interactive animated bead tutorials covering Small Friends (+4..+1) and Big Friends (+9..+1).
                </p>
                <div
                  className="p-3 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{ backgroundColor: "#f4f1de", color: "#3d405b" }}
                >
                  <span>Level 1 Progress</span>
                  <span className="font-black" style={{ color: "#e07a5f" }}>7 of 7 Lessons</span>
                </div>
              </div>

              {/* Card 2: Timed Practice (Honey Sand Accent) */}
              <div
                className="rounded-3xl p-6 border-2 shadow-md space-y-4 hover:-translate-y-1 transition duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#f2cc8f",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm font-black"
                  style={{ backgroundColor: "#f2cc8f", color: "#3d405b" }}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black" style={{ color: "#3d405b" }}>
                  2. Speed & Accuracy Drills
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#3d405b", opacity: 0.8 }}>
                  Dual modes: Practice without timer for deep understanding, or with customizable countdown timer.
                </p>
                <div
                  className="p-3 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{ backgroundColor: "#f4f1de", color: "#3d405b" }}
                >
                  <span>Worksheet Target</span>
                  <span className="font-black" style={{ color: "#3d405b" }}>20 Questions</span>
                </div>
              </div>

              {/* Card 3: Final Certification (Sage Green Accent) */}
              <div
                className="rounded-3xl p-6 border-2 shadow-md space-y-4 hover:-translate-y-1 transition duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#81b29a",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm text-white"
                  style={{ backgroundColor: "#81b29a" }}
                >
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black" style={{ color: "#3d405b" }}>
                  3. Accredited Diploma
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#3d405b", opacity: 0.8 }}>
                  AI-proctored examination with verified QR credentials, honors badges, and 24h cooldown security.
                </p>
                <div
                  className="p-3 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{ backgroundColor: "#f4f1de", color: "#3d405b" }}
                >
                  <span>Passing Standard</span>
                  <span className="font-black" style={{ color: "#81b29a" }}>70% Required</span>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* INTERACTIVE MENTAL MATH DRILL SAMPLE */}
            {/* ==================================================== */}
            <div
              className="rounded-3xl p-6 sm:p-8 border-3 shadow-lg space-y-5"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#3d405b",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "#f2cc8f" }}>
                <div className="space-y-1">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider"
                    style={{ backgroundColor: "#f2cc8f", color: "#3d405b" }}
                  >
                    Live Drill Component
                  </span>
                  <h3 className="text-xl font-black" style={{ color: "#3d405b" }}>
                    Quick Soroban Calculation Challenge
                  </h3>
                </div>
                <span className="text-xs font-bold" style={{ color: "#e07a5f" }}>
                  Question 1 of 5
                </span>
              </div>

              {/* Problem Equation */}
              <div
                className="p-6 rounded-2xl text-center space-y-2 border-2"
                style={{
                  backgroundColor: "#f4f1de",
                  borderColor: "#f2cc8f",
                }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3d405b", opacity: 0.7 }}>
                  Use Small Friend Rule (+4 = +5 - 1)
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-wider" style={{ color: "#3d405b" }}>
                  2 + 4 + 3 = ?
                </div>
              </div>

              {/* Answer Option Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[7, 8, 9, 10].map((option) => {
                  const isSelected = selectedQuizAnswer === option;
                  const isCorrect = option === 9;
                  const hasAnswered = selectedQuizAnswer !== null;

                  let btnBg = "#FFFFFF";
                  let btnColor = "#3d405b";
                  let btnBorder = "#f2cc8f";

                  if (hasAnswered && option === 9) {
                    btnBg = "#81b29a";
                    btnColor = "#FFFFFF";
                    btnBorder = "#81b29a";
                  } else if (isSelected && !isCorrect) {
                    btnBg = "#e07a5f";
                    btnColor = "#FFFFFF";
                    btnBorder = "#e07a5f";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedQuizAnswer(option)}
                      className="py-4 rounded-2xl font-black text-lg shadow-sm border-2 transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: btnBg,
                        color: btnColor,
                        borderColor: btnBorder,
                      }}
                    >
                      <span>{option}</span>
                      {hasAnswered && option === 9 && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswer !== null && (
                <div
                  className="p-4 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{
                    backgroundColor: selectedQuizAnswer === 9 ? "#f4f1de" : "#f4f1de",
                    color: selectedQuizAnswer === 9 ? "#81b29a" : "#e07a5f",
                    border: `1.5px solid ${selectedQuizAnswer === 9 ? "#81b29a" : "#e07a5f"}`,
                  }}
                >
                  <span>
                    {selectedQuizAnswer === 9
                      ? "🌟 Correct! Bead manipulation: 2, push 5 down and flick 1 down (+4), then add 3 = 9!"
                      : "Incorrect! Recall: to add 4 when you only have 2, apply small friend: +5 - 1 = 9."}
                  </span>
                  <button
                    onClick={() => setSelectedQuizAnswer(null)}
                    className="underline cursor-pointer font-black"
                  >
                    Reset Drill
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: COLOR SWATCHES & ROLES */}
        {/* ============================================================ */}
        {activeTab === "tokens" && (
          <div className="space-y-6">
            <div
              className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-4"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#f2cc8f",
              }}
            >
              <div>
                <h3 className="text-2xl font-black" style={{ color: "#3d405b" }}>
                  5-Color Palette Tokens & Roles
                </h3>
                <p className="text-xs mt-1" style={{ color: "#3d405b", opacity: 0.8 }}>
                  Click on any swatch card to copy its exact HEX code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                {USER_PALETTE.map((color) => (
                  <div
                    key={color.hex}
                    onClick={() => handleCopy(color.hex)}
                    className="p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
                    style={{
                      backgroundColor: "#f4f1de",
                      borderColor: color.hex,
                    }}
                  >
                    {/* Swatch color preview box */}
                    <div
                      className="w-full h-24 rounded-xl shadow-inner flex items-center justify-center font-bold text-sm transition group-hover:scale-105 border-2 border-black/10"
                      style={{
                        backgroundColor: color.hex,
                        color: color.darkText ? "#3d405b" : "#FFFFFF",
                      }}
                    >
                      {copiedHex === color.hex ? (
                        <span className="flex items-center gap-1 font-black bg-white/90 px-3 py-1 rounded-full text-[#3d405b] shadow">
                          <Check className="w-4 h-4 text-emerald-600" /> Copied!
                        </span>
                      ) : (
                        <span className="font-mono font-black">{color.hex}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-black" style={{ color: "#3d405b" }}>
                        {color.name}
                      </h4>
                      <p className="text-xs font-bold mt-0.5" style={{ color: "#e07a5f" }}>
                        {color.role}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: "#3d405b", opacity: 0.75 }}>
                        {color.description}
                      </p>
                    </div>

                    <div
                      className="flex items-center justify-between text-[11px] font-bold pt-2 border-t"
                      style={{ borderColor: "#f2cc8f" }}
                    >
                      <span className="font-mono">{color.hex}</span>
                      <span className="flex items-center gap-1 text-[#3d405b] group-hover:text-[#e07a5f]">
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: CSS VARIABLES / TAILWIND TOKENS */}
        {/* ============================================================ */}
        {activeTab === "css" && (
          <div className="space-y-6">
            <div
              className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-4"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#f2cc8f",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black" style={{ color: "#3d405b" }}>
                    CSS Variables & Integration Snippet
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "#3d405b", opacity: 0.8 }}>
                    Copy this snippet to use these variables across any CSS or Tailwind config.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(cssVariablesSnippet)}
                  className="px-4 py-2 rounded-xl text-xs font-black shadow transition hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer text-white"
                  style={{ backgroundColor: "#3d405b" }}
                >
                  {copiedHex === cssVariablesSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied CSS!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className="p-5 rounded-2xl font-mono text-xs overflow-x-auto border-2 leading-relaxed"
                style={{
                  backgroundColor: "#3d405b",
                  color: "#f4f1de",
                  borderColor: "#f2cc8f",
                }}
              >
                {cssVariablesSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
