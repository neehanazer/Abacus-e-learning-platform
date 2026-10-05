"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, RotateCcw, Clock, Sparkles, Star, Award, 
  HelpCircle, Eye, Zap, Volume2, VolumeX, CheckCircle2 
} from "lucide-react";
import { playSound } from "./soundEffects";

interface CardItem {
  id: string;
  pairId: number;
  content: string;
  subText?: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: "emoji" | "text" | "math" | "abacus";
}

type Difficulty = "easy" | "medium" | "hard";
type Category = "animals" | "fruits" | "space" | "abacus" | "math";

interface PairDefinition {
  pairId: number;
  itemA: { content: string; subText?: string; type: "emoji" | "text" | "math" | "abacus" };
  itemB: { content: string; subText?: string; type: "emoji" | "text" | "math" | "abacus" };
}

const PAIR_PRESETS: Record<Category, PairDefinition[]> = {
  animals: [
    { pairId: 1, itemA: { content: "🦁 Lion", subText: "King of Jungle", type: "emoji" }, itemB: { content: "🦁 Lion", subText: "Matched!", type: "emoji" } },
    { pairId: 2, itemA: { content: "🐘 Elephant", subText: "Gentle Giant", type: "emoji" }, itemB: { content: "🐘 Elephant", subText: "Matched!", type: "emoji" } },
    { pairId: 3, itemA: { content: "🐬 Dolphin", subText: "Ocean Swimmer", type: "emoji" }, itemB: { content: "🐬 Dolphin", subText: "Matched!", type: "emoji" } },
    { pairId: 4, itemA: { content: "🐼 Panda", subText: "Bamboo Lover", type: "emoji" }, itemB: { content: "🐼 Panda", subText: "Matched!", type: "emoji" } },
    { pairId: 5, itemA: { content: "🦊 Red Fox", subText: "Clever Fox", type: "emoji" }, itemB: { content: "🦊 Red Fox", subText: "Matched!", type: "emoji" } },
    { pairId: 6, itemA: { content: "🦉 Wise Owl", subText: "Night Watcher", type: "emoji" }, itemB: { content: "🦉 Wise Owl", subText: "Matched!", type: "emoji" } },
    { pairId: 7, itemA: { content: "🦒 Giraffe", subText: "Tall Savanna", type: "emoji" }, itemB: { content: "🦒 Giraffe", subText: "Matched!", type: "emoji" } },
    { pairId: 8, itemA: { content: "🐯 Tiger", subText: "Striped Hunter", type: "emoji" }, itemB: { content: "🐯 Tiger", subText: "Matched!", type: "emoji" } },
    { pairId: 9, itemA: { content: "🦘 Kangaroo", subText: "Big Jumper", type: "emoji" }, itemB: { content: "🦘 Kangaroo", subText: "Matched!", type: "emoji" } },
    { pairId: 10, itemA: { content: "🐧 Penguin", subText: "Antarctic Diver", type: "emoji" }, itemB: { content: "🐧 Penguin", subText: "Matched!", type: "emoji" } },
    { pairId: 11, itemA: { content: "🐵 Monkey", subText: "Playful Climber", type: "emoji" }, itemB: { content: "🐵 Monkey", subText: "Matched!", type: "emoji" } },
    { pairId: 12, itemA: { content: "🦓 Zebra", subText: "Black & White", type: "emoji" }, itemB: { content: "🦓 Zebra", subText: "Matched!", type: "emoji" } },
  ],
  fruits: [
    { pairId: 1, itemA: { content: "🍎 Apple", subText: "Crisp & Red", type: "emoji" }, itemB: { content: "🍎 Apple", subText: "Matched!", type: "emoji" } },
    { pairId: 2, itemA: { content: "🍌 Banana", subText: "Sweet & Yellow", type: "emoji" }, itemB: { content: "🍌 Banana", subText: "Matched!", type: "emoji" } },
    { pairId: 3, itemA: { content: "🍓 Strawberry", subText: "Berry Sweet", type: "emoji" }, itemB: { content: "🍓 Strawberry", subText: "Matched!", type: "emoji" } },
    { pairId: 4, itemA: { content: "🍕 Pizza", subText: "Cheesy Slice", type: "emoji" }, itemB: { content: "🍕 Pizza", subText: "Matched!", type: "emoji" } },
    { pairId: 5, itemA: { content: "🥑 Avocado", subText: "Creamy Green", type: "emoji" }, itemB: { content: "🥑 Avocado", subText: "Matched!", type: "emoji" } },
    { pairId: 6, itemA: { content: "🍔 Burger", subText: "Juicy Patty", type: "emoji" }, itemB: { content: "🍔 Burger", subText: "Matched!", type: "emoji" } },
    { pairId: 7, itemA: { content: "🍇 Grapes", subText: "Purple Bunch", type: "emoji" }, itemB: { content: "🍇 Grapes", subText: "Matched!", type: "emoji" } },
    { pairId: 8, itemA: { content: "🍉 Watermelon", subText: "Summer Splash", type: "emoji" }, itemB: { content: "🍉 Watermelon", subText: "Matched!", type: "emoji" } },
    { pairId: 9, itemA: { content: "🍩 Donut", subText: "Glazed Rings", type: "emoji" }, itemB: { content: "🍩 Donut", subText: "Matched!", type: "emoji" } },
    { pairId: 10, itemA: { content: "🥕 Carrot", subText: "Crunchy Orange", type: "emoji" }, itemB: { content: "🥕 Carrot", subText: "Matched!", type: "emoji" } },
    { pairId: 11, itemA: { content: "🍦 Ice Cream", subText: "Cold Treat", type: "emoji" }, itemB: { content: "🍦 Ice Cream", subText: "Matched!", type: "emoji" } },
    { pairId: 12, itemA: { content: "🌮 Taco", subText: "Crunchy Fiesta", type: "emoji" }, itemB: { content: "🌮 Taco", subText: "Matched!", type: "emoji" } },
  ],
  space: [
    { pairId: 1, itemA: { content: "🪐 Saturn", subText: "Ringed Giant", type: "emoji" }, itemB: { content: "🪐 Saturn", subText: "Matched!", type: "emoji" } },
    { pairId: 2, itemA: { content: "☀️ Sun", subText: "Bright Star", type: "emoji" }, itemB: { content: "☀️ Sun", subText: "Matched!", type: "emoji" } },
    { pairId: 3, itemA: { content: "🚀 Rocket", subText: "Blast Off!", type: "emoji" }, itemB: { content: "🚀 Rocket", subText: "Matched!", type: "emoji" } },
    { pairId: 4, itemA: { content: "👽 Alien", subText: "Cosmic Friend", type: "emoji" }, itemB: { content: "👽 Alien", subText: "Matched!", type: "emoji" } },
    { pairId: 5, itemA: { content: "🌍 Earth", subText: "Home Planet", type: "emoji" }, itemB: { content: "🌍 Earth", subText: "Matched!", type: "emoji" } },
    { pairId: 6, itemA: { content: "🌕 Moon", subText: "Night Glow", type: "emoji" }, itemB: { content: "🌕 Moon", subText: "Matched!", type: "emoji" } },
    { pairId: 7, itemA: { content: "☄️ Comet", subText: "Shooting Ice", type: "emoji" }, itemB: { content: "☄️ Comet", subText: "Matched!", type: "emoji" } },
    { pairId: 8, itemA: { content: "🛸 UFO", subText: "Flying Saucer", type: "emoji" }, itemB: { content: "🛸 UFO", subText: "Matched!", type: "emoji" } },
    { pairId: 9, itemA: { content: "🔭 Telescope", subText: "Stargazer", type: "emoji" }, itemB: { content: "🔭 Telescope", subText: "Matched!", type: "emoji" } },
    { pairId: 10, itemA: { content: "⭐ Star", subText: "Cosmic Spark", type: "emoji" }, itemB: { content: "⭐ Star", subText: "Matched!", type: "emoji" } },
    { pairId: 11, itemA: { content: "🛰️ Satellite", subText: "Orbit Station", type: "emoji" }, itemB: { content: "🛰️ Satellite", subText: "Matched!", type: "emoji" } },
    { pairId: 12, itemA: { content: "🌌 Galaxy", subText: "Milky Way", type: "emoji" }, itemB: { content: "🌌 Galaxy", subText: "Matched!", type: "emoji" } },
  ],
  abacus: [
    { pairId: 1, itemA: { content: "🧮 5", subText: "Upper Bead", type: "abacus" }, itemB: { content: "5", subText: "Five", type: "math" } },
    { pairId: 2, itemA: { content: "🧮 10", subText: "Tens Rod", type: "abacus" }, itemB: { content: "10", subText: "Ten", type: "math" } },
    { pairId: 3, itemA: { content: "🧮 7", subText: "5 + 2 beads", type: "abacus" }, itemB: { content: "7", subText: "Seven", type: "math" } },
    { pairId: 4, itemA: { content: "🧮 3", subText: "3 Lower Beads", type: "abacus" }, itemB: { content: "3", subText: "Three", type: "math" } },
    { pairId: 5, itemA: { content: "🧮 9", subText: "5 + 4 beads", type: "abacus" }, itemB: { content: "9", subText: "Nine", type: "math" } },
    { pairId: 6, itemA: { content: "🧮 15", subText: "1 Ten + 5 Units", type: "abacus" }, itemB: { content: "15", subText: "Fifteen", type: "math" } },
    { pairId: 7, itemA: { content: "🧮 20", subText: "2 Tens Rod", type: "abacus" }, itemB: { content: "20", subText: "Twenty", type: "math" } },
    { pairId: 8, itemA: { content: "🧮 50", subText: "Upper Bead on 10s", type: "abacus" }, itemB: { content: "50", subText: "Fifty", type: "math" } },
    { pairId: 9, itemA: { content: "🧮 8", subText: "5 + 3 beads", type: "abacus" }, itemB: { content: "8", subText: "Eight", type: "math" } },
    { pairId: 10, itemA: { content: "🧮 100", subText: "Hundreds Rod", type: "abacus" }, itemB: { content: "100", subText: "Hundred", type: "math" } },
  ],
  math: [
    { pairId: 1, itemA: { content: "4 + 3", subText: "Sum", type: "math" }, itemB: { content: "7", subText: "Answer", type: "math" } },
    { pairId: 2, itemA: { content: "9 - 4", subText: "Diff", type: "math" }, itemB: { content: "5", subText: "Answer", type: "math" } },
    { pairId: 3, itemA: { content: "6 × 2", subText: "Multiply", type: "math" }, itemB: { content: "12", subText: "Answer", type: "math" } },
    { pairId: 4, itemA: { content: "8 + 8", subText: "Double", type: "math" }, itemB: { content: "16", subText: "Answer", type: "math" } },
    { pairId: 5, itemA: { content: "20 ÷ 4", subText: "Divide", type: "math" }, itemB: { content: "5", subText: "Answer", type: "math" } },
    { pairId: 6, itemA: { content: "15 + 6", subText: "Addition", type: "math" }, itemB: { content: "21", subText: "Answer", type: "math" } },
    { pairId: 7, itemA: { content: "7 × 3", subText: "Multiply", type: "math" }, itemB: { content: "21", subText: "Answer", type: "math" } },
    { pairId: 8, itemA: { content: "50 - 15", subText: "Mental Math", type: "math" }, itemB: { content: "35", subText: "Answer", type: "math" } },
    { pairId: 9, itemA: { content: "9 × 9", subText: "Square", type: "math" }, itemB: { content: "81", subText: "Answer", type: "math" } },
    { pairId: 10, itemA: { content: "100 ÷ 5", subText: "Divide", type: "math" }, itemB: { content: "20", subText: "Answer", type: "math" } },
  ]
};

const DIFFICULTY_CONFIG: Record<Difficulty, { pairsCount: number; gridCols: string; label: string }> = {
  easy: { pairsCount: 6, gridCols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6", label: "Easy (6 Pairs)" },
  medium: { pairsCount: 8, gridCols: "grid-cols-4 sm:grid-cols-4 md:grid-cols-8", label: "Medium (8 Pairs)" },
  hard: { pairsCount: 12, gridCols: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8", label: "Master (12 Pairs)" }
};

export default function MemoryMatchGame() {
  const [category, setCategory] = useState<Category>("animals");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hintsLeft, setHintsLeft] = useState<number>(2);
  const [isHinting, setIsHinting] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const pool = PAIR_PRESETS[category];
    const selectedPairs = [...pool].sort(() => Math.random() - 0.5).slice(0, config.pairsCount);

    const generatedCards: CardItem[] = [];
    selectedPairs.forEach((pair) => {
      generatedCards.push({
        id: `${pair.pairId}-A`,
        pairId: pair.pairId,
        content: pair.itemA.content,
        subText: pair.itemA.subText,
        isFlipped: false,
        isMatched: false,
        type: pair.itemA.type
      });
      generatedCards.push({
        id: `${pair.pairId}-B`,
        pairId: pair.pairId,
        content: pair.itemB.content,
        subText: pair.itemB.subText,
        isFlipped: false,
        isMatched: false,
        type: pair.itemB.type
      });
    });

    // Shuffle cards
    const shuffled = generatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setStreak(0);
    setSeconds(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setIsLocked(false);
    setHintsLeft(2);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [category, difficulty]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (isLocked || isHinting) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    if (soundEnabled) playSound("flip");

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          if (soundEnabled) playSound("success");
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedCards([]);
          setMatches((m) => {
            const nextMatch = m + 1;
            if (nextMatch === DIFFICULTY_CONFIG[difficulty].pairsCount) {
              handleGameWin();
            }
            return nextMatch;
          });
          setStreak((s) => s + 1);
          setIsLocked(false);
        }, 450);
      } else {
        // Not matched
        setTimeout(() => {
          if (soundEnabled) playSound("wrong");
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
          setStreak(0);
          setIsLocked(false);
        }, 850);
      }
    }
  };

  const handleGameWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOver(true);
    setIsPlaying(false);
    if (soundEnabled) playSound("win");
  };

  const useHint = () => {
    if (hintsLeft <= 0 || isLocked || isHinting || isGameOver) return;
    setHintsLeft((h) => h - 1);
    setIsHinting(true);
    if (soundEnabled) playSound("sparkle");

    const peekCards = cards.map((c) => ({
      ...c,
      isFlipped: true
    }));
    setCards(peekCards);

    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          isFlipped: c.isMatched
        }))
      );
      setFlippedCards([]);
      setIsHinting(false);
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const totalPairs = DIFFICULTY_CONFIG[difficulty].pairsCount;
  const starsEarned = moves <= totalPairs + 2 ? 3 : moves <= totalPairs + 6 ? 2 : 1;

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto">
      {/* Category Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategory("animals")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              category === "animals"
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🦁</span> Wild Animals
          </button>
          <button
            onClick={() => setCategory("fruits")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              category === "fruits"
                ? "bg-rose-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🍎</span> Fruits & Food
          </button>
          <button
            onClick={() => setCategory("space")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              category === "space"
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🪐</span> Space & Planets
          </button>
          <button
            onClick={() => setCategory("abacus")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              category === "abacus"
                ? "bg-amber-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🧮</span> Abacus Beads
          </button>
          <button
            onClick={() => setCategory("math")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              category === "math"
                ? "bg-purple-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>➕</span> Math Facts
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                difficulty === d
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || isLocked || isHinting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
              hintsLeft > 0
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
            title="Peek all cards for 1.2s"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hint ({hintsLeft})</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Pairs Found</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">
            {matches} <span className="text-xs sm:text-sm font-normal text-indigo-600">/ {totalPairs}</span>
          </span>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-purple-500 tracking-wider">Moves</span>
          <span className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{moves}</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Time</span>
          <div className="flex items-center gap-1 text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{formatTime(seconds)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Streak</span>
          <div className="flex items-center gap-1 text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
            <Zap className={`w-4 h-4 ${streak > 1 ? "text-amber-500 animate-bounce" : "text-gray-400"}`} />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Game Card Grid - Big, Spacious Screen Fit */}
      <div className={`grid ${DIFFICULTY_CONFIG[difficulty].gridCols} gap-3 sm:gap-4 w-full min-h-[340px] p-1`}>
        {cards.map((card, index) => {
          const isFlipped = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id + "-" + index}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || isLocked || isHinting}
              className={`relative h-28 sm:h-32 md:h-36 rounded-3xl font-bold transition-all duration-300 transform perspective-1000 ${
                card.isMatched
                  ? "bg-emerald-50 border-2 border-emerald-300 scale-95 opacity-90 cursor-default shadow-sm"
                  : isFlipped
                  ? "bg-white border-3 border-indigo-500 shadow-xl scale-100"
                  : "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border border-indigo-400 shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 text-white cursor-pointer"
              }`}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center justify-center p-2.5 h-full text-center animate-in fade-in zoom-in-95 duration-200">
                  {card.isMatched && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <span className="text-2xl sm:text-3xl filter drop-shadow-sm mb-1">
                    {card.content.split(" ")[0]}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-indigo-950 line-clamp-1">
                    {card.content.split(" ").slice(1).join(" ") || card.content}
                  </span>
                  {card.subText && (
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                      {card.subText}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 border border-white/20">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80 mt-2 uppercase tracking-widest">
                    Flip
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Modal */}
      {isGameOver && (
        <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
            <Trophy className="w-10 h-10 text-yellow-300 animate-bounce" />
          </div>

          <h3 className="text-3xl font-black mb-1">Phenomenal Memory!</h3>
          <p className="text-white/80 text-sm max-w-sm mb-5">
            You matched all {totalPairs} pairs in <span className="font-bold text-white">{moves} moves</span> and <span className="font-bold text-white">{formatTime(seconds)}</span>!
          </p>

          <div className="flex items-center gap-2 mb-6 bg-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-sm">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${
                  star <= starsEarned
                    ? "text-yellow-300 fill-yellow-300 drop-shadow-[0_2px_8px_rgba(253,224,71,0.5)]"
                    : "text-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={initGame}
              className="px-6 py-3 bg-white text-indigo-700 hover:bg-white/90 rounded-2xl font-black text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => {
                setDifficulty(difficulty === "easy" ? "medium" : "hard");
                initGame();
              }}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-black text-sm backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              Level Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
