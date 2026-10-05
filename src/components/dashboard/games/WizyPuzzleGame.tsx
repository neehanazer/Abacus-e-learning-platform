"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle2,
  Timer,
  Hash,
  Grid3X3,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playSound } from "./soundEffects";

export default function WizyPuzzleGame() {
  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const totalTiles = gridSize * gridSize;

  // Tiles array where 0 represents the empty space
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTarget, setShowTarget] = useState(false);

  // Initialize and shuffle
  useEffect(() => {
    startNewGame(gridSize);
  }, [gridSize]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isSolved) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isSolved]);

  // Generates a guaranteed solvable permutation
  const generateSolvableTiles = (size: number): number[] => {
    const total = size * size;
    // Solved state: 1, 2, ..., total-1, 0
    let arr = Array.from({ length: total - 1 }, (_, i) => i + 1);
    arr.push(0);

    // Perform random valid slides to ensure solvability
    let emptyIdx = total - 1;
    for (let i = 0; i < 120 * size; i++) {
      const validNeighbors: number[] = [];
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;

      if (row > 0) validNeighbors.push(emptyIdx - size); // UP
      if (row < size - 1) validNeighbors.push(emptyIdx + size); // DOWN
      if (col > 0) validNeighbors.push(emptyIdx - 1); // LEFT
      if (col < size - 1) validNeighbors.push(emptyIdx + 1); // RIGHT

      const chosen = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      // Swap
      arr[emptyIdx] = arr[chosen];
      arr[chosen] = 0;
      emptyIdx = chosen;
    }

    // Verify it's not already solved
    const isAlreadySolved = arr.slice(0, total - 1).every((val, i) => val === i + 1);
    if (isAlreadySolved) {
      // Just swap two neighbors
      return generateSolvableTiles(size);
    }

    return arr;
  };

  const startNewGame = (size: number) => {
    const newTiles = generateSolvableTiles(size);
    setTiles(newTiles);
    setMoves(0);
    setSeconds(0);
    setIsSolved(false);
    setIsPlaying(true);
    if (soundEnabled) playSound("flip");
  };

  const moveTile = (index: number) => {
    if (isSolved || !isPlaying) return;

    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    // Check if Manhattan distance is 1 (adjacent)
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      if (soundEnabled) playSound("flip");
      const newTiles = [...tiles];
      newTiles[emptyIndex] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);
      setMoves((m) => m + 1);

      // Check if solved
      const solved = newTiles.slice(0, totalTiles - 1).every((t, i) => t === i + 1);
      if (solved) {
        setIsSolved(true);
        setIsPlaying(false);
        if (soundEnabled) playSound("win");
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#e11d48", "#22c55e", "#f59e0b", "#3b82f6"],
        });
      }
    } else {
      if (soundEnabled) playSound("wrong");
    }
  };

  // Color theme per tile position matching the WizyPuzzle 4-color palette
  const getTileColor = (val: number) => {
    if (val === 0) return "";
    const mod = val % 4;
    if (mod === 1) return "from-slate-800 to-slate-900 text-white border-slate-700 shadow-slate-900/30"; // Black piece
    if (mod === 2) return "from-emerald-600 to-emerald-700 text-white border-emerald-500 shadow-emerald-500/25"; // Green piece
    if (mod === 3) return "from-amber-400 to-amber-500 text-amber-950 border-amber-300 shadow-amber-500/25"; // Yellow piece
    return "from-rose-500 to-rose-600 text-white border-rose-400 shadow-rose-500/25"; // Red piece
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-center">
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
        {/* Grid Size Toggle */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setGridSize(3)}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              gridSize === 3
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            3x3 (Easy)
          </button>
          <button
            onClick={() => setGridSize(4)}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              gridSize === 4
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            4x4 (Master)
          </button>
        </div>

        {/* Moves & Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-2xl text-xs font-black text-slate-700">
            <Timer className="w-4 h-4 text-slate-500" />
            <span>{formatTime(seconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl text-xs font-black text-rose-700">
            <Award className="w-4 h-4 text-rose-500" />
            <span>Moves: {moves}</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Target Goal Hint Banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl border border-rose-200 text-xs font-bold text-rose-900">
        <span>🎯 Slide tiles into consecutive order 1 to {totalTiles - 1}!</span>
        <button
          onClick={() => setShowTarget(!showTarget)}
          className="underline hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          {showTarget ? "Hide Target" : "View Target"}
        </button>
      </div>

      {showTarget && (
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xs mx-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Target Goal Order
          </span>
          <div
            className={`grid gap-1.5 ${
              gridSize === 3 ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            {Array.from({ length: totalTiles - 1 }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className="py-1 rounded-lg bg-slate-100 text-slate-700 font-black text-xs"
              >
                {n}
              </div>
            ))}
            <div className="py-1 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-slate-300 font-bold text-[10px]">
              Empty
            </div>
          </div>
        </div>
      )}

      {/* Main Puzzle Grid */}
      <div className="relative max-w-md mx-auto p-4 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-[36px] shadow-2xl border-4 border-slate-800">
        <div
          className={`grid gap-2.5 sm:gap-3 ${
            gridSize === 3 ? "grid-cols-3" : "grid-cols-4"
          }`}
        >
          {tiles.map((tile, idx) => {
            const isBlank = tile === 0;
            const tileStyle = getTileColor(tile);

            if (isBlank) {
              return (
                <div
                  key={`blank-${idx}`}
                  className={`rounded-2xl border-2 border-dashed border-slate-700/60 flex items-center justify-center ${
                    gridSize === 3 ? "h-22 sm:h-26" : "h-18 sm:h-20"
                  }`}
                />
              );
            }

            return (
              <motion.button
                key={`tile-${tile}`}
                layout
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => moveTile(idx)}
                className={`rounded-2xl font-black flex flex-col items-center justify-center cursor-pointer shadow-lg border-t border-b-4 transition-all relative overflow-hidden bg-gradient-to-b ${tileStyle} ${
                  gridSize === 3
                    ? "h-22 sm:h-26 text-3xl sm:text-4xl"
                    : "h-18 sm:h-20 text-2xl sm:text-3xl"
                }`}
              >
                {/* Top specular shine */}
                <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/25 rounded-full pointer-events-none" />
                <span className="drop-shadow-md font-serif">{tile}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Victory Celebration Banner */}
      <AnimatePresence>
        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 bg-gradient-to-r from-rose-600 to-orange-500 rounded-3xl text-white text-center shadow-xl space-y-3 max-w-md mx-auto"
          >
            <div className="text-4xl">🏆</div>
            <h4 className="text-2xl font-black font-serif">
              WizyPuzzle Solved!
            </h4>
            <p className="text-sm text-rose-100">
              Completed in <strong className="text-white">{moves} moves</strong> and{" "}
              <strong className="text-white">{formatTime(seconds)}</strong>!
            </p>
            <button
              onClick={() => startNewGame(gridSize)}
              className="mt-2 px-8 py-3 bg-white text-rose-700 font-black rounded-2xl shadow-lg hover:bg-rose-50 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              Play Again / Scramble
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Actions */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => startNewGame(gridSize)}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-sm border-2 border-slate-200 shadow-sm flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          Scramble / Shuffle
        </button>
      </div>
    </div>
  );
}
