"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  ExternalLink,
} from "lucide-react";
import { playSound } from "./soundEffects";

// Logo.dev Publishable API Key
const LOGO_DEV_KEY = "pk_FomPcRrYTCqDoCZOwYlchw";

export interface LogoItem {
  id: string;
  name: string;
  domain: string;
  scrambled: string[];
  clue: string;
  category: string;
  iconBg?: string;
}

// 12 Recognizable Worldwide Brands with Logo.dev domain lookup
export const LOGO_LEVELS: LogoItem[] = [
  {
    id: "l1",
    name: "NIKE",
    domain: "nike.com",
    scrambled: ["E", "K", "I", "N"],
    clue: "Just Do It! Famous athletic swoosh",
    category: "Sportswear",
  },
  {
    id: "l2",
    name: "APPLE",
    domain: "apple.com",
    scrambled: ["P", "P", "E", "L", "A"],
    clue: "Bitten fruit, creators of iPhone, iPad & Mac",
    category: "Technology",
  },
  {
    id: "l3",
    name: "GOOGLE",
    domain: "google.com",
    scrambled: ["L", "O", "G", "E", "G", "O"],
    clue: "World's most popular search engine and Android",
    category: "Internet",
  },
  {
    id: "l4",
    name: "ADIDAS",
    domain: "adidas.com",
    scrambled: ["S", "I", "D", "A", "D", "A"],
    clue: "Three iconic slanted athletic stripes & trefoil",
    category: "Sportswear",
  },
  {
    id: "l5",
    name: "MCDONALDS",
    domain: "mcdonalds.com",
    scrambled: ["D", "S", "L", "A", "N", "O", "C", "D", "M"],
    clue: "Golden arches & happy meals worldwide",
    category: "Fast Food",
  },
  {
    id: "l6",
    name: "NETFLIX",
    domain: "netflix.com",
    scrambled: ["T", "I", "L", "F", "E", "X", "N"],
    clue: "Iconic red ribbon 'N', movies & streaming",
    category: "Entertainment",
  },
  {
    id: "l7",
    name: "PEPSI",
    domain: "pepsi.com",
    scrambled: ["S", "I", "P", "E", "P"],
    clue: "Red, white & blue refreshing cola globe",
    category: "Beverage",
  },
  {
    id: "l8",
    name: "TESLA",
    domain: "tesla.com",
    scrambled: ["S", "A", "T", "E", "L"],
    clue: "Electric autonomous cars, Cybertruck & clean energy",
    category: "Automotive",
  },
  {
    id: "l9",
    name: "LEGO",
    domain: "lego.com",
    scrambled: ["O", "G", "E", "L"],
    clue: "Colorful interlocking plastic building toy bricks",
    category: "Toys & Games",
  },
  {
    id: "l10",
    name: "AMAZON",
    domain: "amazon.com",
    scrambled: ["Z", "O", "N", "A", "M", "A"],
    clue: "Global marketplace shipping everything from A to Z with a smile",
    category: "E-Commerce",
  },
  {
    id: "l11",
    name: "DISNEY",
    domain: "disney.com",
    scrambled: ["Y", "E", "N", "S", "I", "D"],
    clue: "Magical fairy tale castle, Mickey Mouse & theme parks",
    category: "Animation & Entertainment",
  },
  {
    id: "l12",
    name: "SPOTIFY",
    domain: "spotify.com",
    scrambled: ["Y", "F", "I", "T", "O", "P", "S"],
    clue: "Green sound wave circle, streaming music & podcasts",
    category: "Music & Audio",
  },
];

// Helper to construct Logo.dev API URL
export function getLogoDevUrl(domainOrName: string, isDomain = true, size = 256) {
  const path = isDomain ? domainOrName : `name/${encodeURIComponent(domainOrName)}`;
  return `https://img.logo.dev/${path}?token=${LOGO_DEV_KEY}&size=${size}&format=png&retina=true`;
}

// Logo image component with automatic Logo.dev name fallback
export function LogoDevImage({
  name,
  domain,
  className = "w-28 h-28 sm:w-32 sm:h-32",
}: {
  name: string;
  domain: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  // First try domain, if domain fails, fallback to name
  const logoSrc = hasError
    ? getLogoDevUrl(name, false)
    : getLogoDevUrl(domain, true);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src={logoSrc}
        alt={`${name} logo from Logo.dev`}
        width={160}
        height={160}
        unoptimized
        className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
        onError={() => {
          if (!hasError) setHasError(true);
        }}
      />
    </div>
  );
}

export default function ScrambledLogoGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<(string | null)[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<number[]>([]);
  const [scrambledPool, setScrambledPool] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isLevelSolved, setIsLevelSolved] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentLevel = LOGO_LEVELS[levelIndex];

  const initLevel = (index: number) => {
    const lvl = LOGO_LEVELS[index];
    // Shuffle the scrambled letters
    const shuffled = [...lvl.scrambled].sort(() => Math.random() - 0.5);
    setScrambledPool(shuffled);
    setUserLetters(new Array(lvl.name.length).fill(null));
    setUsedLetterIndices([]);
    setIsLevelSolved(false);
  };

  React.useEffect(() => {
    initLevel(levelIndex);
  }, [levelIndex]);

  const handleBankClick = (letter: string, poolIndex: number) => {
    if (isLevelSolved || usedLetterIndices.includes(poolIndex)) return;

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
      if (spelledWord === currentLevel.name) {
        setIsLevelSolved(true);
        if (soundEnabled) playSound("success");
        setScore((s) => s + 25 + streak * 5);
        setStreak((st) => st + 1);

        if (levelIndex + 1 === LOGO_LEVELS.length) {
          setTimeout(() => {
            setIsGameOver(true);
            if (soundEnabled) playSound("win");
          }, 1200);
        }
      } else {
        if (soundEnabled) playSound("wrong");
        setStreak(0);
      }
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (isLevelSolved || userLetters[slotIndex] === null) return;

    if (soundEnabled) playSound("pop");

    const removedLetter = userLetters[slotIndex];
    const newSlots = [...userLetters];
    newSlots[slotIndex] = null;
    setUserLetters(newSlots);

    // Free up in usedLetterIndices
    const lastPoolIndex = usedLetterIndices.find(
      (idx) => scrambledPool[idx] === removedLetter
    );
    if (lastPoolIndex !== undefined) {
      setUsedLetterIndices((prev) => prev.filter((i) => i !== lastPoolIndex));
    }
  };

  const handleClear = () => {
    if (isLevelSolved) return;
    if (soundEnabled) playSound("flip");
    setUserLetters(new Array(currentLevel.name.length).fill(null));
    setUsedLetterIndices([]);
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || isLevelSolved) return;

    // Find first empty slot and reveal correct letter
    const emptyIndex = userLetters.findIndex((l) => l === null);
    if (emptyIndex === -1) return;

    const correctLetter = currentLevel.name[emptyIndex];
    const availablePoolIndex = scrambledPool.findIndex(
      (l, idx) => l === correctLetter && !usedLetterIndices.includes(idx)
    );

    if (availablePoolIndex !== -1) {
      if (soundEnabled) playSound("pop");
      const newSlots = [...userLetters];
      newSlots[emptyIndex] = correctLetter;
      setUserLetters(newSlots);
      setUsedLetterIndices([...usedLetterIndices, availablePoolIndex]);
      setHintsLeft((h) => h - 1);

      // Check if this filled the word
      if (!newSlots.includes(null) && newSlots.join("") === currentLevel.name) {
        setIsLevelSolved(true);
        if (soundEnabled) playSound("success");
        setScore((s) => s + 25 + streak * 5);
        setStreak((st) => st + 1);

        if (levelIndex + 1 === LOGO_LEVELS.length) {
          setTimeout(() => {
            setIsGameOver(true);
            if (soundEnabled) playSound("win");
          }, 1200);
        }
      }
    }
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 < LOGO_LEVELS.length) {
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
      <div className="text-center py-10 px-4 space-y-6 max-w-lg mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-xl">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto text-amber-500 shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-4 py-1.5 rounded-full">
            All Logos Unscrambled!
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-800 font-heading mt-3">
            Brand Trivia Master! 🌟
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mt-2">
            You successfully unscrambled all {LOGO_LEVELS.length} famous world logos powered by the live Logo.dev API!
          </p>
        </div>

        <div className="inline-flex items-center gap-8 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Total Points</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">{score}</span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Solved</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-500">
              {LOGO_LEVELS.length}/{LOGO_LEVELS.length}
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
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-xl">
            Logo {levelIndex + 1} of {LOGO_LEVELS.length}
          </span>
          <span className="text-xs font-extrabold text-slate-500">
            Category: <span className="text-slate-800 font-black">{currentLevel.category}</span>
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
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Logo Showcase Card (Powered by Logo.dev API) */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-md text-center max-w-xl mx-auto">
        {/* Crisp Logo Frame */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-slate-50 border-2 border-slate-200/80 flex items-center justify-center p-5 shadow-inner mb-4 overflow-hidden group">
          <LogoDevImage
            name={currentLevel.name}
            domain={currentLevel.domain}
            className="w-28 h-28 sm:w-32 sm:h-32"
          />
        </div>

        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200 mb-1">
          Unscramble This Brand
        </span>

        <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-sm">
          💡 {currentLevel.clue}
        </p>
      </div>

      {/* Answer Slots */}
      <div className="py-1 flex flex-col items-center gap-3">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {currentLevel.name.length} Letters
        </span>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
          {userLetters.map((letter, idx) => {
            const isCorrect = isLevelSolved;
            const isFilled = letter !== null;

            return (
              <motion.button
                key={idx}
                whileHover={isFilled && !isLevelSolved ? { scale: 1.08 } : {}}
                whileTap={isFilled && !isLevelSolved ? { scale: 0.95 } : {}}
                onClick={() => handleSlotClick(idx)}
                className={`w-11 h-13 sm:w-13 sm:h-15 rounded-2xl border-3 font-black text-lg sm:text-xl flex items-center justify-center transition-all shadow-md ${
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

      {/* Scrambled Letter Bank */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 max-w-lg mx-auto shadow-inner">
        {isLevelSolved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3 space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xl font-heading">
              <CheckCircle2 className="w-6 h-6" />
              <span>Brilliant! The Brand is {currentLevel.name}!</span>
            </div>

            <button
              onClick={handleNextLevel}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm"
            >
              <span>{levelIndex + 1 === LOGO_LEVELS.length ? "Finish Challenge" : "Next Logo"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {scrambledPool.map((letter, idx) => {
              const isUsed = usedLetterIndices.includes(idx);
              return (
                <motion.button
                  key={idx}
                  whileHover={!isUsed ? { scale: 1.08, y: -2 } : {}}
                  whileTap={!isUsed ? { scale: 0.92 } : {}}
                  disabled={isUsed}
                  onClick={() => handleBankClick(letter, idx)}
                  className={`w-12 h-12 rounded-xl font-black text-lg transition-all shadow-sm flex items-center justify-center ${
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

      {/* Attribution Footer */}
      <div className="text-center pt-2">
        <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
          <span>Logos dynamically fetched via</span>
          <a
            href="https://www.logo.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline font-extrabold inline-flex items-center gap-0.5"
          >
            <span>Logo.dev</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </span>
      </div>
    </div>
  );
}
