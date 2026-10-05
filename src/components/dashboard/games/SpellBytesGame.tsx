"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  Delete,
  Flame,
  Volume2,
  VolumeX,
  ArrowRight,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playSound } from "./soundEffects";

interface SpellWord {
  id: string;
  word: string;
  category: string;
  clue: string;
  emoji: string;
  fact: string;
}

const WORDS: SpellWord[] = [
  {
    id: "w1",
    word: "BEAD",
    category: "Abacus Parts",
    clue: "The small sliding counter on each rod of an abacus",
    emoji: "🟢",
    fact: "Earth beads count as 1 and Heaven beads count as 5!",
  },
  {
    id: "w2",
    word: "SOROBAN",
    category: "Abacus History",
    clue: "The famous Japanese style 1:4 abacus tool",
    emoji: "🇯🇵",
    fact: "The modern Soroban was perfected in Japan in the 1930s.",
  },
  {
    id: "w3",
    word: "HEAVEN",
    category: "Abacus Decks",
    clue: "The upper deck bead worth 5 points",
    emoji: "☁️",
    fact: "In ancient Chinese suanpan, there were two heaven beads.",
  },
  {
    id: "w4",
    word: "EARTH",
    category: "Abacus Decks",
    clue: "The lower deck beads worth 1 point each",
    emoji: "🌍",
    fact: "4 earth beads can represent values from 1 to 4 on each rod.",
  },
  {
    id: "w5",
    word: "FRAME",
    category: "Abacus Parts",
    clue: "The wooden or plastic border holding all rods together",
    emoji: "🖼️",
    fact: "Traditional abacus frames are crafted from sturdy hardwood.",
  },
  {
    id: "w6",
    word: "MENTAL",
    category: "Brain Skill",
    clue: "Calculating math rapidly inside your head without pencil or paper",
    emoji: "🧠",
    fact: "Anzan is the art of visualizing the abacus in your imagination!",
  },
  {
    id: "w7",
    word: "TWELVE",
    category: "Number Words",
    clue: "The number 12 spelled in English",
    emoji: "🔢",
    fact: "Formed on the abacus with 1 bead on the 10s rod and 2 on the 1s rod.",
  },
  {
    id: "w8",
    word: "DIGIT",
    category: "Math Concept",
    clue: "Any numeral from 0 to 9",
    emoji: "✋",
    fact: "The word digit comes from the Latin word for finger!",
  },
  {
    id: "w9",
    word: "ROD",
    category: "Abacus Parts",
    clue: "The vertical wire or bamboo beam holding the beads",
    emoji: "🎋",
    fact: "Each rod represents a specific place value (1s, 10s, 100s).",
  },
  {
    id: "w10",
    word: "ADDITION",
    category: "Arithmetic",
    clue: "Summing numbers together with your beads",
    emoji: "➕",
    fact: "Abacus master students can add 10 numbers in under 3 seconds!",
  },
];

export default function SpellBytesGame() {
  const [wordIndex, setWordIndex] = useState(0);
  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<
    { id: string; letter: string; used: boolean; color: "red" | "yellow" | "black" }[]
  >([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);

  const current = WORDS[wordIndex];

  // Initialize blocks for current word
  useEffect(() => {
    loadWord(wordIndex);
  }, [wordIndex]);

  const loadWord = (idx: number) => {
    const target = WORDS[idx];
    setPlacedLetters(new Array(target.word.length).fill(null));
    setIsSolved(false);

    // Create block letters with extra decoys
    const letters = target.word.split("");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const extraCount = Math.max(3, 8 - letters.length);
    for (let i = 0; i < extraCount; i++) {
      letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

    // Shuffle letters
    const shuffled = letters.sort(() => Math.random() - 0.5);

    // Color cycle matching 3D blocks (Red, Yellow, Black)
    const colorCycle: ("red" | "yellow" | "black")[] = ["red", "yellow", "black"];

    setAvailableBlocks(
      shuffled.map((letter, i) => ({
        id: `block-${idx}-${i}-${letter}`,
        letter,
        used: false,
        color: colorCycle[i % 3],
      }))
    );
  };

  // Place a block letter into first empty slot
  const handleSelectBlock = (blockId: string, letter: string) => {
    if (isSolved) return;
    const emptyIndex = placedLetters.indexOf(null);
    if (emptyIndex === -1) return;

    if (soundEnabled) playSound("pop");

    const newPlaced = [...placedLetters];
    newPlaced[emptyIndex] = letter;
    setPlacedLetters(newPlaced);

    setAvailableBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, used: true } : b))
    );

    // Check if full
    if (!newPlaced.includes(null)) {
      const spelled = newPlaced.join("");
      if (spelled === current.word) {
        handleSuccess();
      } else {
        if (soundEnabled) playSound("wrong");
      }
    }
  };

  // Remove letter from placed slots
  const handleRemovePlaced = (slotIdx: number) => {
    if (isSolved) return;
    const letter = placedLetters[slotIdx];
    if (!letter) return;

    if (soundEnabled) playSound("flip");

    const newPlaced = [...placedLetters];
    newPlaced[slotIdx] = null;
    setPlacedLetters(newPlaced);

    // Mark one matching used block as unused
    setAvailableBlocks((prev) => {
      let released = false;
      return prev.map((b) => {
        if (!released && b.used && b.letter === letter) {
          released = true;
          return { ...b, used: false };
        }
        return b;
      });
    });
  };

  const handleSuccess = () => {
    setIsSolved(true);
    if (soundEnabled) playSound("win");
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#ef4444", "#10b981", "#3b82f6"],
    });

    const bonus = (streak + 1) * 25;
    setScore((s) => s + bonus);
    setStreak((st) => st + 1);
  };

  const handleNextWord = () => {
    const nextIdx = (wordIndex + 1) % WORDS.length;
    setWordIndex(nextIdx);
  };

  const handleUseHint = () => {
    if (isSolved) return;
    // Find first empty or incorrect slot
    const targetLetters = current.word.split("");
    let targetSlot = -1;
    for (let i = 0; i < targetLetters.length; i++) {
      if (placedLetters[i] !== targetLetters[i]) {
        targetSlot = i;
        break;
      }
    }

    if (targetSlot === -1) return;

    const neededLetter = targetLetters[targetSlot];

    // If something was in this slot, remove it first
    if (placedLetters[targetSlot]) {
      handleRemovePlaced(targetSlot);
    }

    // Find an unused block with needed letter
    const block = availableBlocks.find(
      (b) => !b.used && b.letter === neededLetter
    );
    if (block) {
      handleSelectBlock(block.id, block.letter);
      setHintsUsed((h) => h + 1);
      if (soundEnabled) playSound("sparkle");
    }
  };

  const handleResetCurrent = () => {
    loadWord(wordIndex);
    if (soundEnabled) playSound("flip");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{current.emoji}</span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {current.category}
            </span>
            <span className="text-xs font-bold text-slate-500 block">
              Word {wordIndex + 1} of {WORDS.length}
            </span>
          </div>
        </div>

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
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Clue Box */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-6 rounded-3xl border-2 border-amber-200 text-center shadow-sm space-y-2">
        <span className="text-xs font-black text-amber-800 uppercase tracking-widest block">
          🔍 Clue / Definition
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-serif">
          &ldquo;{current.clue}&rdquo;
        </h3>
      </div>

      {/* Target Word Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4">
        {placedLetters.map((letter, idx) => (
          <motion.button
            key={idx}
            whileHover={letter ? { scale: 1.08, y: -2 } : {}}
            whileTap={letter ? { scale: 0.95 } : {}}
            onClick={() => handleRemovePlaced(idx)}
            className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl flex flex-col items-center justify-center font-black text-2xl sm:text-3xl transition-all shadow-md relative ${
              letter
                ? "bg-slate-900 text-white border-2 border-amber-400 shadow-amber-400/20 cursor-pointer"
                : "bg-white border-2 border-dashed border-slate-300 text-transparent"
            }`}
          >
            {letter || ""}
            {letter && (
              <span className="text-[8px] uppercase font-bold text-amber-400 -mt-1 opacity-80">
                tap to clear
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white text-center shadow-xl space-y-3"
          >
            <div className="text-4xl">🎉</div>
            <h4 className="text-2xl font-black font-serif">
              SpellBytes Completed: {current.word}!
            </h4>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
              💡 {current.fact}
            </p>
            <button
              onClick={handleNextWord}
              className="mt-2 px-8 py-3 bg-white text-emerald-800 font-black rounded-2xl shadow-lg hover:bg-emerald-50 transition hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Next Spell Word</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Toy Letter Blocks Tray */}
      {!isSolved && (
        <div className="bg-slate-100/80 p-6 rounded-3xl border border-slate-200 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Tap Letter Blocks to Spell
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUseHint}
                className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Hint
              </button>
              <button
                onClick={handleResetCurrent}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {availableBlocks.map((block) => {
              if (block.used) {
                return (
                  <div
                    key={block.id}
                    className="w-13 h-15 sm:w-16 sm:h-18 rounded-2xl bg-slate-200/50 border-2 border-dashed border-slate-300 opacity-30"
                  />
                );
              }

              // Color styles matching reference image (Red, Yellow, Black)
              const colorStyles =
                block.color === "red"
                  ? "bg-gradient-to-b from-red-500 to-red-600 text-white border-b-4 border-red-800 shadow-red-500/30"
                  : block.color === "yellow"
                  ? "bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 border-b-4 border-amber-700 shadow-amber-500/30"
                  : "bg-gradient-to-b from-slate-800 to-slate-900 text-white border-b-4 border-black shadow-slate-900/40";

              return (
                <motion.button
                  key={block.id}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSelectBlock(block.id, block.letter)}
                  className={`w-13 h-15 sm:w-16 sm:h-18 rounded-2xl font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg transition-transform cursor-pointer relative ${colorStyles}`}
                >
                  <span className="drop-shadow-md">{block.letter}</span>
                  {/* Glossy top bevel reflection */}
                  <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/25 rounded-full pointer-events-none" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
