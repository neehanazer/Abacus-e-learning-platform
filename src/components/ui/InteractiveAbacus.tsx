"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles, Volume2, VolumeX, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface ColumnState {
  upper: boolean; // true = down (value +5)
  lowerCount: number; // 0 to 4 (value +lowerCount)
}

const PLACE_VALUES = [
  { label: "10,000s", multiplier: 10000, color: "bg-purple-500" },
  { label: "1,000s", multiplier: 1000, color: "bg-indigo-500" },
  { label: "100s", multiplier: 100, color: "bg-teal-500" },
  { label: "10s", multiplier: 10, color: "bg-amber-500" },
  { label: "1s", multiplier: 1, color: "bg-rose-500" },
];

export default function InteractiveAbacus() {
  const [columns, setColumns] = useState<ColumnState[]>([
    { upper: false, lowerCount: 2 }, // 20,000
    { upper: true, lowerCount: 0 },  // 5,000
    { upper: false, lowerCount: 3 }, // 300
    { upper: true, lowerCount: 1 },  // 60
    { upper: false, lowerCount: 4 }, // 4 -> total 25,364
  ]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [targetGoal, setTargetGoal] = useState<number | null>(null);

  // Play subtle sound if enabled
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440 + Math.random() * 100, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Calculate current total value
  const totalValue = columns.reduce((acc, col, idx) => {
    const val = (col.upper ? 5 : 0) + col.lowerCount;
    return acc + val * PLACE_VALUES[idx].multiplier;
  }, 0);

  const handleUpperClick = (colIdx: number) => {
    playClickSound();
    const newCols = [...columns];
    newCols[colIdx] = {
      ...newCols[colIdx],
      upper: !newCols[colIdx].upper,
    };
    setColumns(newCols);
    checkGoal(newCols);
  };

  const handleLowerClick = (colIdx: number, beadIdx: number) => {
    playClickSound();
    const newCols = [...columns];
    const currentLower = newCols[colIdx].lowerCount;
    // If clicking on or below current active lower count, adjust count
    if (beadIdx + 1 === currentLower) {
      newCols[colIdx].lowerCount = beadIdx;
    } else {
      newCols[colIdx].lowerCount = beadIdx + 1;
    }
    setColumns(newCols);
    checkGoal(newCols);
  };

  const checkGoal = (cols: ColumnState[]) => {
    if (!targetGoal) return;
    const val = cols.reduce((acc, col, idx) => {
      const v = (col.upper ? 5 : 0) + col.lowerCount;
      return acc + v * PLACE_VALUES[idx].multiplier;
    }, 0);

    if (val === targetGoal) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const resetAbacus = () => {
    playClickSound();
    setColumns([
      { upper: false, lowerCount: 0 },
      { upper: false, lowerCount: 0 },
      { upper: false, lowerCount: 0 },
      { upper: false, lowerCount: 0 },
      { upper: false, lowerCount: 0 },
    ]);
  };

  const setRandomChallenge = () => {
    playClickSound();
    const randGoal = Math.floor(Math.random() * 9999) + 1;
    setTargetGoal(randGoal);
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-purple-200/80 relative">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-100 text-purple-600 font-bold text-sm">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "6s" }} />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Interactive Virtual Abacus</h3>
            <p className="text-xs text-slate-500">Click beads to slide & count in real-time!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={resetAbacus}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Target Goal Banner if set */}
      {targetGoal !== null && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Challenge: Set Abacus to {targetGoal.toLocaleString()}</span>
          </div>
          {totalValue === targetGoal ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs animate-bounce">
              Great Job! 🎉
            </span>
          ) : (
            <button
              onClick={() => setTargetGoal(null)}
              className="text-xs text-amber-600 hover:underline"
            >
              Clear Goal
            </button>
          )}
        </div>
      )}

      {/* Numerical Display Badge */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-baseline justify-center gap-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-300/50">
          <span className="text-xs font-medium tracking-wider uppercase opacity-80">Total Value:</span>
          <motion.span
            key={totalValue}
            initial={{ scale: 1.2, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-extrabold tracking-tight font-mono"
          >
            {totalValue.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Main Abacus Outer Frame */}
      <div className="abacus-frame rounded-2xl p-4 border-4 border-amber-800/40 relative shadow-inner bg-amber-50/50">
        {/* Horizontal Beam */}
        <div className="absolute left-0 right-0 top-[38%] h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 z-10 shadow-md flex items-center justify-around px-4">
          {/* Alignment dots on beam */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-amber-200/80 shadow-inner" />
          ))}
        </div>

        {/* Rods Grid */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4 relative z-0 min-h-[260px]">
          {columns.map((col, colIdx) => {
            const colInfo = PLACE_VALUES[colIdx];
            return (
              <div key={colIdx} className="flex flex-col items-center justify-between relative">
                {/* Vertical Metal Rod */}
                <div className="absolute top-0 bottom-0 w-1 bg-slate-300/80 rounded-full z-0 shadow-inner" />

                {/* Upper Deck (1 Bead) */}
                <div className="h-20 w-full flex flex-col items-center justify-start pt-1 z-20">
                  <motion.button
                    onClick={() => handleUpperClick(colIdx)}
                    animate={{ y: col.upper ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className={`w-10 sm:w-12 h-6 sm:h-7 rounded-full ${colInfo.color} abacus-bead cursor-pointer flex items-center justify-center text-[10px] text-white font-bold border border-white/40`}
                  >
                    5
                  </motion.button>
                </div>

                {/* Lower Deck (4 Beads) */}
                <div className="h-32 w-full flex flex-col items-center justify-end pb-1 gap-1.5 z-20">
                  {[0, 1, 2, 3].map((beadIdx) => {
                    const isActive = beadIdx < col.lowerCount;
                    return (
                      <motion.button
                        key={beadIdx}
                        onClick={() => handleLowerClick(colIdx, beadIdx)}
                        animate={{ y: isActive ? -28 : 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                        className={`w-10 sm:w-12 h-6 sm:h-7 rounded-full ${colInfo.color} abacus-bead cursor-pointer flex items-center justify-center text-[10px] text-white font-bold border border-white/40`}
                      >
                        1
                      </motion.button>
                    );
                  })}
                </div>

                {/* Column Label */}
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    {colInfo.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {((col.upper ? 5 : 0) + col.lowerCount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={setRandomChallenge}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Try Random Number Challenge
        </button>
        <span>Level 1 Basic Abacus</span>
      </div>
    </div>
  );
}
