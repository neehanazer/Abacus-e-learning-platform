"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Flame,
  Award,
  CheckCircle2,
  HelpCircle,
  Zap,
  Target,
  Shuffle,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playSound } from "./soundEffects";

interface RodState {
  upper: number; // 0 (inactive/up) or 1 (active/down on beam)
  lower: number; // 0 to 4 beads active (pushed up to beam)
  label: string;
  weight: number;
}

export default function AbacusMasterGame() {
  const [difficulty, setDifficulty] = useState<"beginner" | "junior" | "master">("junior");
  const [gameMode, setGameMode] = useState<"challenge" | "free" | "flash">("challenge");

  // 5 Rod Soroban: Ten-Thousands, Thousands, Hundreds, Tens, Units
  const initialRods: RodState[] = [
    { upper: 0, lower: 0, label: "10,000s", weight: 10000 },
    { upper: 0, lower: 0, label: "1,000s", weight: 1000 },
    { upper: 0, lower: 0, label: "100s", weight: 100 },
    { upper: 0, lower: 0, label: "10s", weight: 10 },
    { upper: 0, lower: 0, label: "1s", weight: 1 },
  ];

  const [rods, setRods] = useState<RodState[]>(initialRods);
  const [targetNumber, setTargetNumber] = useState(38);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("Move upper & lower beads to match the target number!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  // Calculate current value
  const currentValue = rods.reduce(
    (acc, rod) => acc + (rod.upper * 5 + rod.lower) * rod.weight,
    0
  );

  // Generate new target based on difficulty
  const generateTarget = (diff = difficulty) => {
    let newTarget = 25;
    if (diff === "beginner") {
      newTarget = Math.floor(Math.random() * 20) + 1; // 1 to 20
    } else if (diff === "junior") {
      newTarget = Math.floor(Math.random() * 90) + 10; // 10 to 99
    } else {
      newTarget = Math.floor(Math.random() * 900) + 100; // 100 to 999
    }
    setTargetNumber(newTarget);
    setShowHint(false);
  };

  const handleDifficultyChange = (diff: "beginner" | "junior" | "master") => {
    setDifficulty(diff);
    resetBeads();
    generateTarget(diff);
  };

  const resetBeads = () => {
    setRods(initialRods);
    if (soundEnabled) playSound("flip");
  };

  // Toggle upper bead (Value 5)
  const toggleUpper = (rodIdx: number) => {
    if (soundEnabled) playSound("pop");
    setRods((prev) => {
      const next = [...prev];
      const cur = next[rodIdx];
      next[rodIdx] = { ...cur, upper: cur.upper === 1 ? 0 : 1 };
      return next;
    });
  };

  // Click on a lower bead (1-4)
  const handleLowerClick = (rodIdx: number, beadIndex: number) => {
    if (soundEnabled) playSound("pop");
    setRods((prev) => {
      const next = [...prev];
      const cur = next[rodIdx];
      // beadIndex is 1, 2, 3, or 4
      // if already has this count, clicking toggles off that top bead
      const newLower = cur.lower === beadIndex ? beadIndex - 1 : beadIndex;
      next[rodIdx] = { ...cur, lower: Math.max(0, newLower) };
      return next;
    });
  };

  // Speak current number aloud
  const speakNumber = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Current value is ${currentValue}`
      );
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Check Target Answer
  const checkAnswer = () => {
    if (currentValue === targetNumber) {
      if (soundEnabled) playSound("win");
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"],
      });

      const bonus = (streak + 1) * 20;
      setScore((s) => s + bonus);
      setStreak((st) => st + 1);
      setSolvedCount((c) => c + 1);
      setMessage(`🌟 Perfect! Value is ${targetNumber}! +${bonus} Brain Points!`);

      setTimeout(() => {
        resetBeads();
        generateTarget();
        setMessage("Awesome! Try the next challenge!");
      }, 1600);
    } else {
      if (soundEnabled) playSound("wrong");
      setStreak(0);
      if (currentValue < targetNumber) {
        setMessage(`Current value is ${currentValue}. Slide more beads to reach ${targetNumber}!`);
      } else {
        setMessage(`Current value is ${currentValue} (Too high!). Move beads away to reach ${targetNumber}!`);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
        {/* Modes */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setGameMode("challenge")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
              gameMode === "challenge"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Target Match
          </button>
          <button
            onClick={() => setGameMode("free")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
              gameMode === "free"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Free Play Explorer
          </button>
        </div>

        {/* Difficulty for Challenge */}
        {gameMode === "challenge" && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {(["beginner", "junior", "master"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-3 py-1 rounded-xl capitalize transition cursor-pointer ${
                  difficulty === diff
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        )}

        {/* Score & Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-xs font-black text-rose-700">Streak x{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-800">{score} Pts</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Target & Current Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gameMode === "challenge" ? (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-3xl border-2 border-emerald-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
              <Target className="w-4 h-4" /> Target Number
            </span>
            <span className="text-5xl font-black text-emerald-800 font-serif tracking-tight mt-1">
              {targetNumber}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 mt-1">
              Match this on the Abacus
            </span>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-3xl border-2 border-purple-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-black text-purple-700 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Free Explorer
            </span>
            <span className="text-sm font-bold text-slate-600 mt-1">
              Slide any beads to see live math calculations!
            </span>
          </div>
        )}

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center text-center md:col-span-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Abacus Current Value
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-5xl font-black text-slate-900 font-serif tracking-tight">
              {currentValue}
            </span>
            <button
              onClick={speakNumber}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
              title="Pronounce number"
            >
              <Volume2 className="w-5 h-5 text-slate-700" />
            </button>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">{message}</p>
        </div>
      </div>

      {/* Main Interactive Soroban Abacus Frame */}
      <div className="bg-gradient-to-b from-[#8C5320] via-[#A26229] to-[#733F14] p-6 sm:p-8 rounded-[36px] border-4 border-[#5E320E] shadow-2xl relative max-w-2xl mx-auto selection:bg-transparent">
        {/* Frame Outer Bevel & Inner Light Floor */}
        <div className="bg-gradient-to-b from-[#FFFDF7] to-[#F7F3E8] rounded-2xl p-4 sm:p-6 border-2 border-[#5E320E]/50 shadow-inner relative flex justify-around items-stretch min-h-[360px]">
          
          {/* Rods Loop */}
          {rods.map((rod, rIdx) => {
            const rodValue = rod.upper * 5 + rod.lower;
            return (
              <div key={rIdx} className="flex flex-col items-center justify-between relative w-16 sm:w-20 z-10">
                {/* Vertical Metal Bamboo Rod */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-full shadow-sm z-0" />

                {/* Upper Deck (Heaven Bead - Value 5) */}
                <div className="h-20 w-full flex flex-col justify-start items-center relative z-10 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleUpper(rIdx)}
                    className={`w-14 sm:w-16 h-8 rounded-full shadow-lg transition-transform duration-200 flex items-center justify-center font-black text-xs cursor-pointer border ${
                      rod.upper === 1
                        ? "translate-y-9 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 text-white border-slate-600 shadow-slate-900/50"
                        : "translate-y-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-slate-300 border-slate-700 shadow-slate-900/30"
                    }`}
                  >
                    <span className="opacity-90">5</span>
                  </motion.button>
                </div>

                {/* Reckoning Beam (Divider Bar with Unit Pointer Dots) */}
                <div className="w-full h-4 bg-gradient-to-r from-[#5E320E] via-[#8C5320] to-[#5E320E] rounded relative z-20 my-2 shadow-md flex items-center justify-center border-t border-b border-[#3E1F08]">
                  {/* Unit dot on 1s, 100s, 10000s */}
                  {(rIdx === 4 || rIdx === 2 || rIdx === 0) && (
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                  )}
                </div>

                {/* Lower Deck (4 Earth Beads - Value 1 each) */}
                <div className="h-44 w-full flex flex-col justify-end gap-1.5 items-center relative z-10 pb-1">
                  {[1, 2, 3, 4].map((beadNum) => {
                    const isActive = rod.lower >= beadNum;
                    return (
                      <motion.button
                        key={beadNum}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => handleLowerClick(rIdx, beadNum)}
                        className={`w-14 sm:w-16 h-8 rounded-full shadow-lg transition-transform duration-150 flex items-center justify-center font-black text-xs cursor-pointer border ${
                          isActive
                            ? "-translate-y-8 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 text-white border-emerald-300 shadow-emerald-500/40"
                            : "translate-y-0 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 text-emerald-100 border-emerald-800 shadow-emerald-950/30"
                        }`}
                      >
                        <span className="opacity-90">1</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Column Place Value Label & Live Subtotal */}
                <div className="mt-3 text-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl border border-slate-200 shadow-sm w-full">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {rod.label}
                  </div>
                  <div className="text-sm font-black text-slate-800 font-serif">
                    {rodValue}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={resetBeads}
          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-sm border-2 border-slate-200 shadow-sm flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          Reset Beads
        </button>

        {gameMode === "challenge" ? (
          <>
            <button
              onClick={() => generateTarget()}
              className="px-6 py-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-sm border border-amber-300 shadow-sm flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-amber-700" />
              New Target
            </button>

            <button
              onClick={checkAnswer}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              Submit Answer ({currentValue})
            </button>
          </>
        ) : (
          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-3 rounded-2xl">
            💡 Tip: Click upper bead (5) to toggle 5s, click lower beads to activate 1s.
          </div>
        )}
      </div>
    </div>
  );
}
