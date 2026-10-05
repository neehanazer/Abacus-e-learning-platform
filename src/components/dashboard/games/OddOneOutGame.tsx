"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import { playSound } from "./soundEffects";

type TopicCategory = "all" | "animals" | "fruits" | "space" | "math";

interface OddQuestion {
  id: string;
  topic: "animals" | "fruits" | "space" | "math";
  categoryLabel: string;
  topicIcon: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    sublabel?: string;
    emoji?: string;
    visualBeads?: { upper: number; lower: number };
    isOdd: boolean;
  }[];
  explanation: string;
}

const ALL_ODD_QUESTIONS: OddQuestion[] = [
  // --- ANIMALS TOPIC ---
  {
    id: "a1",
    topic: "animals",
    categoryLabel: "Animal Kingdom",
    topicIcon: "🦁",
    prompt: "Which animal cannot fly in the air?",
    options: [
      { id: "1", emoji: "🦅", label: "Golden Eagle", sublabel: "Can fly", isOdd: false },
      { id: "2", emoji: "🦇", label: "Fruit Bat", sublabel: "Can fly", isOdd: false },
      { id: "3", emoji: "🐧", label: "Emperor Penguin", sublabel: "Swims, cannot fly", isOdd: true },
      { id: "4", emoji: "🦜", label: "Macaw Parrot", sublabel: "Can fly", isOdd: false },
    ],
    explanation: "Penguins have flippers adapted for underwater swimming and cannot fly in the air, unlike eagles, bats, and parrots!",
  },
  {
    id: "a2",
    topic: "animals",
    categoryLabel: "Animal Classification",
    topicIcon: "🦁",
    prompt: "Which creature is a REPTILE, not a mammal?",
    options: [
      { id: "1", emoji: "🦁", label: "African Lion", sublabel: "Mammal", isOdd: false },
      { id: "2", emoji: "🐬", label: "Bottlenose Dolphin", sublabel: "Marine Mammal", isOdd: false },
      { id: "3", emoji: "🐊", label: "Saltwater Crocodile", sublabel: "Reptile (Cold-blooded)", isOdd: true },
      { id: "4", emoji: "🐘", label: "Wild Elephant", sublabel: "Mammal", isOdd: false },
    ],
    explanation: "Crocodiles are cold-blooded reptiles with scales, while lions, dolphins, and elephants are warm-blooded mammals!",
  },
  {
    id: "a3",
    topic: "animals",
    categoryLabel: "Animal Habitats",
    topicIcon: "🦁",
    prompt: "Which animal lives on LAND and cannot swim in the deep ocean?",
    options: [
      { id: "1", emoji: "🦈", label: "Great White Shark", sublabel: "Ocean", isOdd: false },
      { id: "2", emoji: "🦒", label: "Tall Giraffe", sublabel: "African Savanna", isOdd: true },
      { id: "3", emoji: "🐙", label: "Giant Octopus", sublabel: "Ocean", isOdd: false },
      { id: "4", emoji: "🐋", label: "Blue Whale", sublabel: "Ocean", isOdd: false },
    ],
    explanation: "Giraffes roam the dry savannas of Africa on land, while sharks, octopuses, and blue whales are ocean creatures!",
  },
  {
    id: "a4",
    topic: "animals",
    categoryLabel: "Animal Traits",
    topicIcon: "🦁",
    prompt: "Which animal does NOT have legs?",
    options: [
      { id: "1", emoji: "🦘", label: "Kangaroo", sublabel: "2 Hind legs", isOdd: false },
      { id: "2", emoji: "🐸", label: "Tree Frog", sublabel: "4 legs", isOdd: false },
      { id: "3", emoji: "🐍", label: "Garden Snake", sublabel: "Legless reptile", isOdd: true },
      { id: "4", emoji: "🐇", label: "Wild Rabbit", sublabel: "4 legs", isOdd: false },
    ],
    explanation: "Snakes are legless reptiles that slither using their flexible belly scales and muscular ribs!",
  },
  {
    id: "a5",
    topic: "animals",
    categoryLabel: "Bugs vs Birds",
    topicIcon: "🦁",
    prompt: "Which creature is a BIRD, not an insect?",
    options: [
      { id: "1", emoji: "🐝", label: "Honeybee", sublabel: "6-legged insect", isOdd: false },
      { id: "2", emoji: "🦋", label: "Monarch Butterfly", sublabel: "Insect", isOdd: false },
      { id: "3", emoji: "🦉", label: "Barn Owl", sublabel: "Feathered Bird", isOdd: true },
      { id: "4", emoji: "🐜", label: "Leafcutter Ant", sublabel: "Insect", isOdd: false },
    ],
    explanation: "The Barn Owl is a feathered bird of prey, while bees, butterflies, and ants are all 6-legged insects!",
  },

  // --- FRUITS & FOOD TOPIC ---
  {
    id: "f1",
    topic: "fruits",
    categoryLabel: "Fruits vs Vegetables",
    topicIcon: "🍎",
    prompt: "Which item is a VEGETABLE, not a sweet fruit?",
    options: [
      { id: "1", emoji: "🍎", label: "Crisp Apple", sublabel: "Tree Fruit", isOdd: false },
      { id: "2", emoji: "🥦", label: "Green Broccoli", sublabel: "Cruciferous Veggie", isOdd: true },
      { id: "3", emoji: "🍌", label: "Ripe Banana", sublabel: "Tropical Fruit", isOdd: false },
      { id: "4", emoji: "🍊", label: "Juicy Orange", sublabel: "Citrus Fruit", isOdd: false },
    ],
    explanation: "Broccoli is an edible green vegetable flower head, whereas apples, bananas, and oranges are sweet fruits that grow from flowers!",
  },
  {
    id: "f2",
    topic: "fruits",
    categoryLabel: "Sweet vs Savory",
    topicIcon: "🍎",
    prompt: "Which food is a SAVORY meal, not a sweet dessert?",
    options: [
      { id: "1", emoji: "🍦", label: "Vanilla Ice Cream", sublabel: "Sweet Dessert", isOdd: false },
      { id: "2", emoji: "🍫", label: "Chocolate Bar", sublabel: "Sweet Candy", isOdd: false },
      { id: "3", emoji: "🍕", label: "Cheese Pizza", sublabel: "Savory Meal", isOdd: true },
      { id: "4", emoji: "🧁", label: "Berry Cupcake", sublabel: "Sweet Bakery", isOdd: false },
    ],
    explanation: "Pizza is a hot savory main course made with dough, sauce, and cheese, while ice cream, chocolate, and cupcakes are sugary sweets!",
  },
  {
    id: "f3",
    topic: "fruits",
    categoryLabel: "Fruit Seeds",
    topicIcon: "🍎",
    prompt: "Which fruit has ONE large stone seed (pit) in the middle?",
    options: [
      { id: "1", emoji: "🥭", label: "Golden Mango", sublabel: "Single Big Pit", isOdd: true },
      { id: "2", emoji: "🍓", label: "Strawberry", sublabel: "Tiny exterior seeds", isOdd: false },
      { id: "3", emoji: "🍉", label: "Watermelon", sublabel: "Dozens of seeds", isOdd: false },
      { id: "4", emoji: "🥝", label: "Kiwi Fruit", sublabel: "Many small seeds", isOdd: false },
    ],
    explanation: "A mango is a stone fruit (drupe) with one huge central seed, while strawberries, watermelons, and kiwis contain dozens of tiny seeds!",
  },
  {
    id: "f4",
    topic: "fruits",
    categoryLabel: "Dairy & Produce",
    topicIcon: "🍎",
    prompt: "Which item does NOT come from milk (is NOT dairy)?",
    options: [
      { id: "1", emoji: "🧀", label: "Cheddar Cheese", sublabel: "Dairy food", isOdd: false },
      { id: "2", emoji: "🥔", label: "Baked Potato", sublabel: "Root Vegetable", isOdd: true },
      { id: "3", emoji: "🥛", label: "Fresh Milk", sublabel: "Dairy drink", isOdd: false },
      { id: "4", emoji: "🧈", label: "Cream Butter", sublabel: "Dairy fat", isOdd: false },
    ],
    explanation: "Potatoes grow underground from soil as root vegetables, while cheese, milk, and butter all come from cows or goats as dairy!",
  },

  // --- PLANETS & SPACE TOPIC ---
  {
    id: "s1",
    topic: "space",
    categoryLabel: "Stars & Planets",
    topicIcon: "🪐",
    prompt: "Which celestial object is a glowing STAR, not a planet?",
    options: [
      { id: "1", emoji: "🪐", label: "Saturn", sublabel: "Ringed Planet", isOdd: false },
      { id: "2", emoji: "☀️", label: "The Sun", sublabel: "Massive Star", isOdd: true },
      { id: "3", emoji: "🔴", label: "Mars", sublabel: "Red Planet", isOdd: false },
      { id: "4", emoji: "🌍", label: "Earth", sublabel: "Blue Planet", isOdd: false },
    ],
    explanation: "The Sun is a colossal star that generates its own light and heat through nuclear fusion, while Saturn, Mars, and Earth are planets orbiting it!",
  },
  {
    id: "s2",
    topic: "space",
    categoryLabel: "Gas Giants vs Rocky",
    topicIcon: "🪐",
    prompt: "Which is a giant GAS planet, not a solid rocky planet?",
    options: [
      { id: "1", emoji: "🪨", label: "Mercury", sublabel: "Rocky planet", isOdd: false },
      { id: "2", emoji: "🪐", label: "Jupiter", sublabel: "Gas Giant Planet", isOdd: true },
      { id: "3", emoji: "🌍", label: "Earth", sublabel: "Rocky planet", isOdd: false },
      { id: "4", emoji: "🌋", label: "Venus", sublabel: "Rocky planet", isOdd: false },
    ],
    explanation: "Jupiter is the largest planet in our solar system made primarily of hydrogen and helium gas, with no solid surface like Earth or Mercury!",
  },
  {
    id: "s3",
    topic: "space",
    categoryLabel: "Moons & Spacecraft",
    topicIcon: "🪐",
    prompt: "Which item is MAN-MADE, not a natural moon in space?",
    options: [
      { id: "1", emoji: "🌕", label: "Earth's Moon", sublabel: "Natural Satellite", isOdd: false },
      { id: "2", emoji: "🌑", label: "Titan (Saturn's Moon)", sublabel: "Natural Satellite", isOdd: false },
      { id: "3", emoji: "🚀", label: "Apollo Rocket", sublabel: "Man-made Vehicle", isOdd: true },
      { id: "4", emoji: "🌕", label: "Europa (Jupiter's Moon)", sublabel: "Natural Satellite", isOdd: false },
    ],
    explanation: "Rockets are engineered by human scientists to travel into space, while our Moon, Titan, and Europa are ancient natural satellites!",
  },
  {
    id: "s4",
    topic: "space",
    categoryLabel: "Solar System Secrets",
    topicIcon: "🪐",
    prompt: "Which planet is famous for having glorious visible ice rings?",
    options: [
      { id: "1", emoji: "🪐", label: "Saturn", sublabel: "Glorious Rings", isOdd: true },
      { id: "2", emoji: "🔴", label: "Mars", sublabel: "Dusty & Red", isOdd: false },
      { id: "3", emoji: "🌍", label: "Earth", sublabel: "Oceans & Land", isOdd: false },
      { id: "4", emoji: "🪨", label: "Mercury", sublabel: "Cratered surface", isOdd: false },
    ],
    explanation: "Saturn is the iconic jewel of the solar system, surrounded by thousands of spectacular concentric rings made of ice, rock, and dust!",
  },

  // --- MATH & ABACUS TOPIC ---
  {
    id: "m1",
    topic: "math",
    categoryLabel: "Addition Sums",
    topicIcon: "🧮",
    prompt: "Find the math equation that does NOT equal 10:",
    options: [
      { id: "1", label: "7 + 3", sublabel: "= 10", isOdd: false },
      { id: "2", label: "4 + 6", sublabel: "= 10", isOdd: false },
      { id: "3", label: "5 + 6", sublabel: "= 11", isOdd: true },
      { id: "4", label: "8 + 2", sublabel: "= 10", isOdd: false },
    ],
    explanation: "7+3, 4+6, and 8+2 all total 10. But 5+6 equals 11, making it the Odd One Out!",
  },
  {
    id: "m2",
    topic: "math",
    categoryLabel: "Abacus Beads",
    topicIcon: "🧮",
    prompt: "Which Abacus rod does NOT show the number 6?",
    options: [
      { id: "1", label: "Upper 1 + Lower 1", visualBeads: { upper: 1, lower: 1 }, sublabel: "Value: 6", isOdd: false },
      { id: "2", label: "Upper 0 + Lower 4", visualBeads: { upper: 0, lower: 4 }, sublabel: "Value: 4", isOdd: true },
      { id: "3", label: "Heaven 5 + Earth 1", visualBeads: { upper: 1, lower: 1 }, sublabel: "Value: 6", isOdd: false },
      { id: "4", label: "5 + 1", visualBeads: { upper: 1, lower: 1 }, sublabel: "Value: 6", isOdd: false },
    ],
    explanation: "On a Soroban abacus, 6 is formed by 1 Heaven bead (5) plus 1 Earth bead (1). Option B only shows 4 Earth beads!",
  },
  {
    id: "m3",
    topic: "math",
    categoryLabel: "Multiplication",
    topicIcon: "🧮",
    prompt: "Which multiplication problem does NOT equal 24?",
    options: [
      { id: "1", label: "6 × 4", sublabel: "= 24", isOdd: false },
      { id: "2", label: "8 × 3", sublabel: "= 24", isOdd: false },
      { id: "3", label: "12 × 2", sublabel: "= 24", isOdd: false },
      { id: "4", label: "7 × 4", sublabel: "= 28", isOdd: true },
    ],
    explanation: "6×4, 8×3, and 12×2 all equal 24. However, 7×4 equals 28!",
  },
  {
    id: "m4",
    topic: "math",
    categoryLabel: "Even vs Odd",
    topicIcon: "🧮",
    prompt: "Find the ODD number among these even numbers:",
    options: [
      { id: "1", label: "14", sublabel: "Even (divisible by 2)", isOdd: false },
      { id: "2", label: "22", sublabel: "Even (divisible by 2)", isOdd: false },
      { id: "3", label: "37", sublabel: "Odd number", isOdd: true },
      { id: "4", label: "48", sublabel: "Even (divisible by 2)", isOdd: false },
    ],
    explanation: "14, 22, and 48 are all even numbers ending in 2, 4, 8. 37 ends in 7 and cannot be divided evenly by 2!",
  },
];

export function OddOneOutGame() {
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>("all");
  const [filteredQuestions, setFilteredQuestions] = useState<OddQuestion[]>(ALL_ODD_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Update questions when topic changes
  useEffect(() => {
    let pool = ALL_ODD_QUESTIONS;
    if (selectedTopic !== "all") {
      pool = ALL_ODD_QUESTIONS.filter((q) => q.topic === selectedTopic);
    }
    // Shuffle the questions for variety
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setFilteredQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setStreak(0);
    setIsComplete(false);
  }, [selectedTopic]);

  const question = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelect = (optionId: string, isOdd: boolean) => {
    if (isAnswered) return;
    setSelectedId(optionId);
    setIsAnswered(true);

    if (isOdd) {
      setIsCorrect(true);
      playSound("success");
      setScore((s) => s + 10 + streak * 2);
      setStreak((st) => st + 1);
    } else {
      setIsCorrect(false);
      playSound("wrong");
      setStreak(0);
    }
  };

  const handleNext = () => {
    playSound("pop");
    setSelectedId(null);
    setIsAnswered(false);
    setIsCorrect(false);

    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((c) => c + 1);
    } else {
      setIsComplete(true);
      playSound("win");
    }
  };

  const handleRestart = () => {
    playSound("sparkle");
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setFilteredQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setStreak(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="text-center py-10 px-4 space-y-6 max-w-2xl mx-auto">
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
            Game Complete!
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-800 font-heading mt-3">
            Eagle Eye Master! 🦅
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mt-2">
            You investigated patterns across {selectedTopic === "all" ? "animals, fruits, planets & math" : selectedTopic} and spotted all the odd ones!
          </p>
        </div>

        <div className="inline-flex items-center gap-6 sm:gap-10 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Total Points</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">{score}</span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Rounds Solved</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-500">
              {filteredQuestions.length}/{filteredQuestions.length}
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
      {/* Topic Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pick Topic:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              selectedTopic === "all"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🌟</span> All Topics
          </button>
          <button
            onClick={() => setSelectedTopic("animals")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              selectedTopic === "animals"
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🦁</span> Animals
          </button>
          <button
            onClick={() => setSelectedTopic("fruits")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              selectedTopic === "fruits"
                ? "bg-rose-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🍎</span> Fruits & Food
          </button>
          <button
            onClick={() => setSelectedTopic("space")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              selectedTopic === "space"
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🪐</span> Space & Planets
          </button>
          <button
            onClick={() => setSelectedTopic("math")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              selectedTopic === "math"
                ? "bg-amber-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🧮</span> Math & Abacus
          </button>
        </div>
      </div>

      {/* Top Game Bar: Round, Streak, Score */}
      <div className="flex items-center justify-between gap-3 bg-amber-50/90 p-3 sm:p-4 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-3 py-1 rounded-xl">
            Round {currentIndex + 1} of {filteredQuestions.length}
          </span>
          <span className="text-xs font-extrabold text-amber-800 hidden sm:inline flex items-center gap-1">
            <span>{question.topicIcon}</span> {question.categoryLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{streak}x Streak!</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm bg-white px-3.5 py-1 rounded-xl border border-amber-200 shadow-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="text-center space-y-2 py-1">
        <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200 inline-block shadow-sm">
          Spot The Odd One Out
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-heading">
          {question.prompt}
        </h3>
      </div>

      {/* 4 Cards Grid - Large, Spacious, and Child-Friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {question.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          let cardStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:shadow-lg";

          if (isAnswered) {
            if (opt.isOdd) {
              cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-4 ring-emerald-400/50 shadow-md";
            } else if (isSelected && !opt.isOdd) {
              cardStyle = "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-300";
            } else {
              cardStyle = "bg-slate-50/60 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <motion.button
              key={opt.id}
              whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(opt.id, opt.isOdd)}
              disabled={isAnswered}
              className={`p-5 sm:p-6 rounded-3xl border-3 shadow-md flex items-center justify-between min-h-[110px] transition-all cursor-pointer relative overflow-hidden text-left ${cardStyle}`}
            >
              <div className="flex items-center gap-4">
                {opt.emoji && (
                  <span className="text-3xl sm:text-4xl filter drop-shadow-sm flex-shrink-0">
                    {opt.emoji}
                  </span>
                )}

                {opt.visualBeads && (
                  <div className="bg-amber-950/90 p-2 rounded-xl border border-amber-700/60 flex items-center justify-center gap-1.5 shadow-inner flex-shrink-0">
                    <span className={`w-4 h-4 rounded-full ${opt.visualBeads.upper ? "bg-amber-400 shadow-sm" : "bg-stone-700"}`} />
                    <span className="w-px h-6 bg-amber-600/50" />
                    <span className={`w-4 h-4 rounded-full ${opt.visualBeads.lower >= 1 ? "bg-emerald-400 shadow-sm" : "bg-stone-700"}`} />
                  </div>
                )}

                <div>
                  <span className="text-lg sm:text-xl font-black font-heading tracking-wide block">
                    {opt.label}
                  </span>

                  {isAnswered && opt.sublabel && (
                    <span className="text-xs font-bold mt-0.5 text-slate-500 block">
                      {opt.sublabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Icons */}
              {isAnswered && opt.isOdd && (
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                </div>
              )}
              {isAnswered && isSelected && !opt.isOdd && (
                <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <XCircle className="w-5 h-5 stroke-[3]" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation & Next Step Banner */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto shadow-md ${
              isCorrect ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{isCorrect ? "🎯" : "💡"}</span>
              <div>
                <span className={`text-xs font-black uppercase tracking-wider block ${isCorrect ? "text-emerald-800" : "text-amber-900"}`}>
                  {isCorrect ? "Spot On! +10 Points" : "Good Try! Did you know?"}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed mt-1">
                  {question.explanation}
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <span>{currentIndex + 1 === filteredQuestions.length ? "Finish Game" : "Next Round"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OddOneOutGame;
