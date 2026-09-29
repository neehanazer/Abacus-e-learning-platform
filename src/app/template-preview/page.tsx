"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";

// Exact color palette extracted from the provided aesthetic baby & brain development link
const PALETTE_SWATCHES = [
  {
    name: "Soft Butter Yellow",
    hex: "#FEE388",
    role: "Warm focus, star rewards, highlights",
    textColor: "#785900",
  },
  {
    name: "Pastel Coral Pink",
    hex: "#FFAAA6",
    role: "Playful accents, friendly buttons, primary badge",
    textColor: "#8A2A25",
  },
  {
    name: "Chiffon Cream",
    hex: "#FFEDB3",
    role: "Soft card surfaces, subtle hover states",
    textColor: "#7A5A0A",
  },
  {
    name: "Pastel Meadow Green",
    hex: "#A8E67E",
    role: "Success indicators, correct answers, fresh energy",
    textColor: "#2E690B",
  },
  {
    name: "Powder Sky Blue",
    hex: "#B2D8E8",
    role: "Calming borders, cool balance, secondary cards",
    textColor: "#1D526A",
  },
  {
    name: "Cerulean Sky Blue",
    hex: "#4FB5E8",
    role: "Primary action buttons, active navigation, links",
    textColor: "#FFFFFF",
  },
  {
    name: "Soft Periwinkle Lilac",
    hex: "#D9D5F4",
    role: "Brain development tone, badges, header glow",
    textColor: "#463A75",
  },
  {
    name: "Whisper Rose Blush",
    hex: "#F7E9E9",
    role: "Warm canvas background, soft container fills",
    textColor: "#5A3840",
  },
];

export default function AestheticTemplatePreviewPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"interactive" | "swatches">("interactive");
  const [counterValue, setCounterValue] = useState(7);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-24 font-sans selection:bg-[#FEE388]"
      style={{
        background: "linear-gradient(180deg, #FBF9F5 0%, #F5F0EB 50%, #FAF6F0 100%)",
      }}
    >
      {/* Background Soft Blobs */}
      <div
        className="absolute top-0 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: "#D9D5F4" }}
      />
      <div
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: "#B2D8E8" }}
      />
      <div
        className="absolute bottom-10 right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: "#FFAAA6" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10">
        {/* Top Notification Bar */}
        <div
          className="rounded-2xl px-5 py-3 border shadow-sm flex flex-wrap items-center justify-between gap-3"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#B2D8E8",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#1D526A]">
                Color Palette Preview Template (Dashboard Untouched)
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Extracted from Aesthetic Baby & Brain Development Palette • Potyambiental / Freepik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("interactive")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              style={{
                backgroundColor: activeTab === "interactive" ? "#4FB5E8" : "#F5F0EB",
                color: activeTab === "interactive" ? "#FFFFFF" : "#5A3840",
              }}
            >
              Interactive UI Template
            </button>
            <button
              onClick={() => setActiveTab("swatches")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              style={{
                backgroundColor: activeTab === "swatches" ? "#4FB5E8" : "#F5F0EB",
                color: activeTab === "swatches" ? "#FFFFFF" : "#5A3840",
              }}
            >
              Palette Tokens & Hex Codes
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: INTERACTIVE UI TEMPLATE SHOWCASE */}
        {/* ============================================================ */}
        {activeTab === "interactive" && (
          <div className="space-y-8">
            {/* Hero Card in Pastel Tones */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] p-6 sm:p-10 border-2 shadow-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 60%, #F7E9E9 100%)",
                borderColor: "#FFEDB3",
              }}
            >
              {/* Decorative Pill Badge */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
                    style={{
                      backgroundColor: "#D9D5F4",
                      color: "#463A75",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Cognitive Brain Development Theme
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-slate-800">
                    Gentle, Aesthetic{" "}
                    <span style={{ color: "#4FB5E8" }}>Abacus Learning</span> ✨
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                    Designed with soothing pastel baby colors to promote visual focus, reduce cognitive fatigue, and make mental arithmetic feel light, calming, and joyful!
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      className="px-6 py-3.5 rounded-2xl text-white font-black text-sm shadow-md transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                      style={{ backgroundColor: "#4FB5E8" }}
                    >
                      <span>Explore Lesson 1</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      className="px-6 py-3.5 rounded-2xl font-black text-sm transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border"
                      style={{
                        backgroundColor: "#FFEDB3",
                        color: "#7A5A0A",
                        borderColor: "#FEE388",
                      }}
                    >
                      <Star className="w-4 h-4 fill-[#FEE388] text-[#7A5A0A]" />
                      <span>Practice Math Drills</span>
                    </button>
                  </div>
                </div>

                {/* Right Interactive Abacus Visual Box */}
                <div
                  className="rounded-3xl p-6 border-2 shadow-lg max-w-sm w-full space-y-4 text-center"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#B2D8E8",
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#F7E9E9" }}>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Virtual Soroban Bead
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-black"
                      style={{ backgroundColor: "#A8E67E", color: "#2E690B" }}
                    >
                      Active Bead: {counterValue}
                    </span>
                  </div>

                  {/* Interactive Abacus Rod Display */}
                  <div
                    className="p-4 rounded-2xl flex items-center justify-center gap-4"
                    style={{ backgroundColor: "#F7E9E9" }}
                  >
                    {/* Bead column 1 */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Upper Bead</span>
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-8 rounded-full shadow-md cursor-pointer flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: "#FFAAA6" }}
                      >
                        5
                      </motion.div>
                      <div className="w-16 h-1 rounded-full bg-slate-300 my-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Lower Beads</span>
                      <div className="flex flex-col gap-1.5">
                        {[1, 2, 3, 4].map((bead) => (
                          <motion.div
                            key={bead}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCounterValue(bead + 5)}
                            className="w-12 h-6 rounded-full shadow-sm cursor-pointer flex items-center justify-center text-slate-700 font-bold text-[10px]"
                            style={{
                              backgroundColor: counterValue === bead + 5 ? "#FEE388" : "#FFFFFF",
                              border: "1.5px solid #FFEDB3",
                            }}
                          >
                            +1
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Tap any bead to animate and experiment with the color scheme!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3-Column Feature Cards in the Palette */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Soft Yellow / Learning */}
              <div
                className="rounded-3xl p-6 border-2 shadow-md space-y-4 hover:-translate-y-1 transition duration-300"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#FEE388",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: "#FFEDB3" }}
                >
                  ⭐
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  Daily Star Milestones
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Earn points and unlocks using warm butter yellow accents designed to encourage daily habit formation.
                </p>
                <div
                  className="p-3 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{ backgroundColor: "#FFFBF0", color: "#785900" }}
                >
                  <span>Completion Rate</span>
                  <span>94% Mastery</span>
                </div>
              </div>

              {/* Card 2: Soft Coral Pink / Practice */}
              <div
                className="rounded-3xl p-6 border-2 shadow-md space-y-4 hover:-translate-y-1 transition duration-300"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#FFAAA6",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: "#F7E9E9" }}
                >
                  💖
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  Calming Practice Mode
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Soft blush and pastel coral buttons create a stress-free environment for kids practicing timed worksheets.
                </p>
                <div
                  className="p-3 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{ backgroundColor: "#F7E9E9", color: "#8A2A25" }}
                >
                  <span>Session State</span>
                  <span>Untimed & Relaxed</span>
                </div>
              </div>

              {/* Card 3: Soft Green / Accuracy */}
              <div
                className="rounded-3xl p-6 border-2 shadow-md space-y-4 hover:-translate-y-1 transition duration-300"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#A8E67E",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: "#E9F8E1" }}
                >
                  🌱
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  Visual Accuracy Feedback
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pastel meadow green indicators validate calculations without harsh neon glares, fostering natural confidence.
                </p>
                <div
                  className="p-3 rounded-xl text-xs font-bold flex items-center justify-between"
                  style={{ backgroundColor: "#E9F8E1", color: "#2E690B" }}
                >
                  <span>Correct Streak</span>
                  <span>10 in a row! 🎯</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: PALETTE TOKENS & SWATCHES */}
        {/* ============================================================ */}
        {activeTab === "swatches" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 font-heading">
                  Color Palette Swatches & Hex Codes
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Click any swatch to copy its HEX value. These colors can be applied across learning components, worksheets, buttons, and badges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {PALETTE_SWATCHES.map((color) => (
                  <div
                    key={color.hex}
                    onClick={() => handleCopy(color.hex)}
                    className="p-4 rounded-2xl border-2 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
                    style={{ borderColor: color.hex, backgroundColor: "#FFFFFF" }}
                  >
                    {/* Color Swatch Block */}
                    <div
                      className="w-full h-20 rounded-xl shadow-inner flex items-center justify-center font-bold text-xs transition group-hover:scale-105"
                      style={{ backgroundColor: color.hex, color: color.textColor }}
                    >
                      {copiedHex === color.hex ? (
                        <span className="flex items-center gap-1 font-black bg-white/80 px-2.5 py-1 rounded-full text-slate-800 shadow">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </span>
                      ) : (
                        <span className="font-mono">{color.hex}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-800">{color.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{color.role}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
                      <span className="font-mono">{color.hex}</span>
                      <span className="flex items-center gap-1 text-slate-600 group-hover:text-blue-600">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
