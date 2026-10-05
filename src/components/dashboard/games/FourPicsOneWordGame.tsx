"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  Delete,
  Flame,
  Star,
  ArrowRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { playSound } from "./soundEffects";

interface PicClue {
  label: string;
  emoji: string;
  color: string;
  bgGradient: string;
  image?: string;
}

interface FourPicsLevel {
  id: string;
  word: string;
  categoryHint: string;
  pics: [PicClue, PicClue, PicClue, PicClue];
  extraLetters: string[];
}

const LEVELS: FourPicsLevel[] = [
  {
    id: "lvl-1",
    word: "COLD",
    categoryHint: "Weather & Sensation",
    pics: [
      { emoji: "❄️", label: "Snowstorm", color: "#38bdf8", bgGradient: "from-sky-400 to-blue-600", image: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🧊", label: "Ice Cubes", color: "#67e8f9", bgGradient: "from-cyan-300 to-blue-500", image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🥶", label: "Shivering", color: "#60a5fa", bgGradient: "from-blue-400 to-indigo-600", image: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🍧", label: "Ice Cream Pop", color: "#a5f3fc", bgGradient: "from-cyan-200 to-teal-500", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["B", "M", "P", "S", "T", "R", "K", "Y"],
  },
  {
    id: "lvl-2",
    word: "TIME",
    categoryHint: "Measurement & Daily Life",
    pics: [
      { emoji: "⏰", label: "Alarm Clock", color: "#ef4444", bgGradient: "from-red-400 to-amber-500", image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80" },
      { emoji: "⌚", label: "Wrist Watch", color: "#3b82f6", bgGradient: "from-blue-400 to-indigo-600", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80" },
      { emoji: "⏳", label: "Hourglass", color: "#f59e0b", bgGradient: "from-amber-400 to-orange-500", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80" },
      { emoji: "📅", label: "Calendar Dates", color: "#10b981", bgGradient: "from-emerald-400 to-teal-600", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["W", "N", "L", "O", "P", "A", "R", "D"],
  },
  {
    id: "lvl-3",
    word: "PLAY",
    categoryHint: "Fun & Games",
    pics: [
      { emoji: "🎮", label: "Video Game Controller", color: "#8b5cf6", bgGradient: "from-purple-400 to-indigo-600", image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🛝", label: "Park Playground", color: "#f97316", bgGradient: "from-orange-400 to-amber-500", image: "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🎭", label: "Theater Stage Masks", color: "#ec4899", bgGradient: "from-pink-400 to-rose-600", image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80" },
      { emoji: "⚽", label: "Sports Soccer Ball", color: "#10b981", bgGradient: "from-emerald-400 to-teal-600", image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["K", "R", "C", "H", "E", "S", "T", "M"],
  },
  {
    id: "lvl-4",
    word: "SWEET",
    categoryHint: "Taste & Treats",
    pics: [
      { emoji: "🍯", label: "Golden Honey", color: "#f59e0b", bgGradient: "from-amber-400 to-yellow-500", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🍭", label: "Candy Lollipop", color: "#ec4899", bgGradient: "from-pink-400 to-rose-600", image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🧁", label: "Frosted Cupcake", color: "#a855f7", bgGradient: "from-purple-400 to-pink-500", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🍫", label: "Chocolate Bar", color: "#78350f", bgGradient: "from-amber-700 to-stone-800", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["B", "N", "G", "R", "L", "P", "K"],
  },
  {
    id: "lvl-5",
    word: "BRIGHT",
    categoryHint: "Light & Mind",
    pics: [
      { emoji: "💡", label: "Electric Lightbulb", color: "#eab308", bgGradient: "from-yellow-400 to-amber-500", image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=400&q=80" },
      { emoji: "☀️", label: "Morning Sun", color: "#f97316", bgGradient: "from-amber-400 to-orange-600", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80" },
      { emoji: "✨", label: "Sparkles Glow", color: "#a855f7", bgGradient: "from-purple-400 to-indigo-600", image: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🧠", label: "Smart Brilliant Mind", color: "#ec4899", bgGradient: "from-pink-400 to-rose-600", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["O", "S", "M", "N", "P", "F"],
  },
  {
    id: "lvl-6",
    word: "WATER",
    categoryHint: "Nature & Liquid",
    pics: [
      { emoji: "🌊", label: "Ocean Wave", color: "#0284c7", bgGradient: "from-sky-400 to-blue-600", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🥛", label: "Glass of Water", color: "#38bdf8", bgGradient: "from-cyan-300 to-blue-500", image: "https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🌧️", label: "Falling Rain", color: "#64748b", bgGradient: "from-slate-400 to-indigo-600", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=400&q=80" },
      { emoji: "💧", label: "Fresh Droplet", color: "#06b6d4", bgGradient: "from-cyan-400 to-teal-600", image: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["B", "L", "S", "M", "N", "P", "K"],
  },
  {
    id: "lvl-7",
    word: "GREEN",
    categoryHint: "Colors & Nature",
    pics: [
      { emoji: "🍃", label: "Tree Leaves", color: "#16a34a", bgGradient: "from-emerald-400 to-green-600", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🍏", label: "Crisp Green Apple", color: "#22c55e", bgGradient: "from-green-400 to-emerald-600", image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=400&q=80" },
      { emoji: "⛳", label: "Golf Lawn Grass", color: "#15803d", bgGradient: "from-green-500 to-emerald-700", image: "https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&w=400&q=80" },
      { emoji: "💎", label: "Emerald Gem", color: "#10b981", bgGradient: "from-teal-400 to-emerald-600", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["P", "T", "D", "O", "S", "B", "M"],
  },
  {
    id: "lvl-8",
    word: "STAR",
    categoryHint: "Sky & Fame",
    pics: [
      { emoji: "⭐", label: "Golden Star", color: "#facc15", bgGradient: "from-yellow-400 to-amber-500", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🌟", label: "Night Sky", color: "#818cf8", bgGradient: "from-indigo-400 to-purple-600", image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80" },
      { emoji: "✨", label: "Sparkle Fame", color: "#f472b6", bgGradient: "from-pink-400 to-rose-500", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" },
      { emoji: "🏆", label: "Champion Star", color: "#f59e0b", bgGradient: "from-amber-400 to-yellow-500", image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=400&q=80" },
    ],
    extraLetters: ["K", "N", "L", "O", "P", "E", "W", "C"],
  },
];

export default function FourPicsOneWordGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<(string | null)[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<number[]>([]);
  const [letterPool, setLetterPool] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isLevelSolved, setIsLevelSolved] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentLevel = LEVELS[levelIndex];

  // Initialize level
  const initLevel = (index: number) => {
    const lvl = LEVELS[index];
    const letters = [...lvl.word.split(""), ...lvl.extraLetters].sort(() => Math.random() - 0.5);
    setLetterPool(letters);
    setUserLetters(new Array(lvl.word.length).fill(null));
    setUsedLetterIndices([]);
    setIsLevelSolved(false);
  };

  React.useEffect(() => {
    initLevel(levelIndex);
  }, [levelIndex]);

  // Handle letter bank click
  const handleBankClick = (letter: string, poolIndex: number) => {
    if (isLevelSolved || usedLetterIndices.includes(poolIndex)) return;

    // Find first empty slot
    const emptyIndex = userLetters.findIndex((l) => l === null);
    if (emptyIndex === -1) return;

    if (soundEnabled) playSound("pop");

    const newSlots = [...userLetters];
    newSlots[emptyIndex] = letter;
    setUserLetters(newSlots);

    const newUsed = [...usedLetterIndices, poolIndex];
    setUsedLetterIndices(newUsed);

    // Check if word is complete
    if (!newSlots.includes(null)) {
      const spelledWord = newSlots.join("");
      if (spelledWord === currentLevel.word) {
        // Solved!
        setIsLevelSolved(true);
        if (soundEnabled) playSound("success");
        setScore((s) => s + 20 + streak * 5);
        setStreak((st) => st + 1);

        if (levelIndex + 1 === LEVELS.length) {
          setTimeout(() => {
            setIsGameOver(true);
            if (soundEnabled) playSound("win");
          }, 1200);
        }
      } else {
        // Wrong word
        if (soundEnabled) playSound("wrong");
        setStreak(0);
      }
    }
  };

  // Remove a letter from user slots
  const handleSlotClick = (slotIndex: number) => {
    if (isLevelSolved || userLetters[slotIndex] === null) return;

    if (soundEnabled) playSound("pop");

    // Remove from slot
    const removedLetter = userLetters[slotIndex];
    const newSlots = [...userLetters];
    newSlots[slotIndex] = null;
    setUserLetters(newSlots);

    // Free up in usedLetterIndices
    const lastPoolIndex = usedLetterIndices.find(
      (idx) => letterPool[idx] === removedLetter
    );
    if (lastPoolIndex !== undefined) {
      setUsedLetterIndices(usedLetterIndices.filter((idx) => idx !== lastPoolIndex));
    }
  };

  // Clear all entered letters
  const handleClear = () => {
    if (isLevelSolved) return;
    if (soundEnabled) playSound("pop");
    setUserLetters(new Array(currentLevel.word.length).fill(null));
    setUsedLetterIndices([]);
  };

  // Use hint: reveal 1 letter
  const handleHint = () => {
    if (hintsLeft <= 0 || isLevelSolved) return;
    const emptySlotIdx = userLetters.findIndex((l, i) => l !== currentLevel.word[i]);
    if (emptySlotIdx === -1) return;

    const correctLetter = currentLevel.word[emptySlotIdx];
    const poolIdx = letterPool.findIndex(
      (l, idx) => l === correctLetter && !usedLetterIndices.includes(idx)
    );

    if (poolIdx !== -1) {
      if (soundEnabled) playSound("sparkle");
      setHintsLeft((h) => h - 1);

      const newSlots = [...userLetters];
      newSlots[emptySlotIdx] = correctLetter;
      setUserLetters(newSlots);
      setUsedLetterIndices([...usedLetterIndices, poolIdx]);

      if (!newSlots.includes(null) && newSlots.join("") === currentLevel.word) {
        setIsLevelSolved(true);
        if (soundEnabled) playSound("success");
        setScore((s) => s + 15);
        if (levelIndex + 1 === LEVELS.length) {
          setTimeout(() => {
            setIsGameOver(true);
            if (soundEnabled) playSound("win");
          }, 1200);
        }
      }
    }
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 < LEVELS.length) {
      setLevelIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setLevelIndex(0);
    setScore(0);
    setStreak(0);
    setHintsLeft(3);
    setIsGameOver(false);
    initLevel(0);
  };

  if (isGameOver) {
    return (
      <div className="text-center py-10 px-4 space-y-6 max-w-xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 mx-auto bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center text-5xl shadow-xl shadow-amber-200"
        >
          🏆
        </motion.div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full">
            All Levels Completed!
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-800 font-heading mt-3">
            4 Pics 1 Word Master! 🧠
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mt-2">
            You solved all {LEVELS.length} word puzzles with brilliant observation and deductive skills!
          </p>
        </div>

        <div className="inline-flex items-center gap-8 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Total Score</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">{score}</span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Levels Beaten</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-500">
              {LEVELS.length}/{LEVELS.length}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black rounded-2xl shadow-lg shadow-amber-200 transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-rose-900 bg-rose-100 px-3 py-1 rounded-xl">
            Level {levelIndex + 1} of {LEVELS.length}
          </span>
          <span className="text-xs font-extrabold text-slate-500">
            Hint: <span className="text-slate-800 font-black">{currentLevel.categoryHint}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-black animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{streak}x Streak</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs sm:text-sm bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{score} pts</span>
          </div>

          <button
            onClick={handleHint}
            disabled={hintsLeft <= 0 || isLevelSolved}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
              hintsLeft > 0 && !isLevelSolved
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hint ({hintsLeft})</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4 Pictures Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {currentLevel.pics.map((pic, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className={`aspect-square rounded-3xl bg-gradient-to-br ${pic.bgGradient} flex flex-col items-center justify-center text-center shadow-lg border-2 border-white/40 relative overflow-hidden group`}
          >
            {pic.image ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={pic.image}
                  alt={pic.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                  <span className="text-[11px] sm:text-xs font-black text-white drop-shadow-md tracking-wide line-clamp-1">
                    {pic.emoji} {pic.label}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl sm:text-6xl filter drop-shadow-md mb-2 group-hover:scale-110 transition-transform">
                  {pic.emoji}
                </span>
                <span className="text-xs sm:text-sm font-black text-white drop-shadow-sm tracking-wide">
                  {pic.label}
                </span>
              </div>
            )}
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-[10px] font-black z-10">
              {idx + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Word Answer Slots */}
      <div className="py-2 flex flex-col items-center gap-3">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Find the 1 common word ({currentLevel.word.length} Letters)
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          {userLetters.map((letter, idx) => {
            const isCorrect = isLevelSolved;
            const isFilled = letter !== null;

            return (
              <motion.button
                key={idx}
                whileHover={isFilled && !isLevelSolved ? { scale: 1.08 } : {}}
                whileTap={isFilled && !isLevelSolved ? { scale: 0.95 } : {}}
                onClick={() => handleSlotClick(idx)}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-3 font-black text-xl sm:text-2xl flex items-center justify-center transition-all shadow-md ${
                  isCorrect
                    ? "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105"
                    : isFilled
                    ? "bg-slate-900 border-slate-700 text-white cursor-pointer hover:bg-rose-900 hover:border-rose-700"
                    : "bg-white border-dashed border-slate-300 text-slate-400"
                }`}
              >
                {letter || ""}
              </motion.button>
            );
          })}
        </div>

        {/* Clear Button */}
        {!isLevelSolved && usedLetterIndices.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
          >
            <Delete className="w-3.5 h-3.5" />
            <span>Clear Letters</span>
          </button>
        )}
      </div>

      {/* Scrambled Letter Bank or Victory Step */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 max-w-xl mx-auto shadow-inner">
        {isLevelSolved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3 space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xl font-heading">
              <CheckCircle2 className="w-6 h-6" />
              <span>Correct! The word is {currentLevel.word}!</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              All 4 pictures represent <strong className="text-slate-900">&ldquo;{currentLevel.word}&rdquo;</strong>!
            </p>

            <button
              onClick={handleNextLevel}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm"
            >
              <span>{levelIndex + 1 === LEVELS.length ? "Finish Challenge" : "Next Level"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
            {letterPool.map((letter, idx) => {
              const isUsed = usedLetterIndices.includes(idx);
              return (
                <motion.button
                  key={idx}
                  whileHover={!isUsed ? { scale: 1.08, y: -2 } : {}}
                  whileTap={!isUsed ? { scale: 0.92 } : {}}
                  disabled={isUsed}
                  onClick={() => handleBankClick(letter, idx)}
                  className={`h-11 sm:h-12 rounded-xl font-black text-base sm:text-lg transition-all shadow-sm flex items-center justify-center ${
                    isUsed
                      ? "bg-slate-200 text-slate-300 border border-slate-200 cursor-not-allowed opacity-40"
                      : "bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-900 cursor-pointer shadow"
                  }`}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
