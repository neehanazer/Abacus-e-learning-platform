"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Flame,
  Star,
  Gamepad2,
  Brain,
  Eye,
  Target,
  Image as ImageIcon,
  Zap,
  Globe,
  Grid,
  Grid3x3,
  Grid2x2,
  ChevronLeft,
  Volume2,
  VolumeX,
  Camera,
  Layers,
} from "lucide-react";
import {
  AbacusMasterIcon,
  SpellBytesIcon,
  WizyPuzzleIcon,
  QuizQuestIcon,
} from "@/components/dashboard/games/BrainGymIcons";
import AbacusMasterGame from "@/components/dashboard/games/AbacusMasterGame";
import SpellBytesGame from "@/components/dashboard/games/SpellBytesGame";
import WizyPuzzleGame from "@/components/dashboard/games/WizyPuzzleGame";
import QuizQuestGame from "@/components/dashboard/games/QuizQuestGame";
import FourPicsOneWordGame from "@/components/dashboard/games/FourPicsOneWordGame";
import ScrambledLogoGame from "@/components/dashboard/games/ScrambledLogoGame";
import LandmarkCountryGame from "@/components/dashboard/games/LandmarkCountryGame";
import OddOneOutGame from "@/components/dashboard/games/OddOneOutGame";
import MemoryMatchGame from "@/components/dashboard/games/MemoryMatchGame";
import SpotTheDifferenceGame from "@/components/dashboard/games/SpotTheDifferenceGame";
import MemoryRecallGame from "@/components/dashboard/games/MemoryRecallGame";

type GameId =
  | "abacus"
  | "spell"
  | "puzzle"
  | "quiz"
  | "fourpics"
  | "scrambled"
  | "landmark"
  | "odd"
  | "memory"
  | "spot"
  | "recall";

interface GameOption {
  id: GameId;
  titlePart1: string;
  titlePart2: string;
  colorPart1: string;
  colorPart2: string;
  subtitle: string;
  category: "core" | "arcade" | "memory";
  badge: string;
  unsplashImage: string;
  iconComponent?: React.ReactNode;
  iconFallback?: React.ReactNode;
}

export default function BrainGymPage() {
  // activeGame: null means we are showing the game selection boxes!
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "core" | "arcade" | "memory">("core");
  const [viewMode, setViewMode] = useState<"photos" | "icons">("photos");
  const [columns, setColumns] = useState<3 | 4>(4);

  // Core 4 Games matching the user's reference image + Unsplash photography:
  const ALL_GAMES: GameOption[] = [
    {
      id: "abacus",
      titlePart1: "Abacus",
      titlePart2: "Master",
      colorPart1: "#5F9E2A", // Olive-green
      colorPart2: "#111827", // Dark slate
      subtitle: "Interactive 5-Rod Soroban Bead Calculation & Target Drills",
      category: "core",
      badge: "Featured Core",
      unsplashImage: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80",
      iconComponent: <AbacusMasterIcon className="w-24 h-24 sm:w-28 sm:h-28" />,
    },
    {
      id: "spell",
      titlePart1: "Spell",
      titlePart2: "Bytes",
      colorPart1: "#D97706", // Amber gold
      colorPart2: "#0F172A", // Dark navy
      subtitle: "3D Letter Blocks & Mental Math Vocabulary Quest",
      category: "core",
      badge: "Featured Core",
      unsplashImage: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?auto=format&fit=crop&w=800&q=80",
      iconComponent: <SpellBytesIcon className="w-24 h-24 sm:w-28 sm:h-28" />,
    },
    {
      id: "puzzle",
      titlePart1: "Wizy",
      titlePart2: "Puzzle",
      colorPart1: "#E11D48", // Crimson red
      colorPart2: "#0F172A", // Dark navy
      subtitle: "3x3 & 4x4 Sliding Tile Matrix with Number Parity",
      category: "core",
      badge: "Featured Core",
      unsplashImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=800&q=80",
      iconComponent: <WizyPuzzleIcon className="w-24 h-24 sm:w-28 sm:h-28" />,
    },
    {
      id: "quiz",
      titlePart1: "Quiz",
      titlePart2: "Quest",
      colorPart1: "#B91C1C", // Dark red
      colorPart2: "#0F172A", // Dark navy
      subtitle: "Speed Arithmetic, Abacus Sight Reading & 50:50 Lifelines",
      category: "core",
      badge: "Featured Core",
      unsplashImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
      iconComponent: <QuizQuestIcon className="w-24 h-24 sm:w-28 sm:h-28" />,
    },
    {
      id: "fourpics",
      titlePart1: "4 Pics",
      titlePart2: "1 Word",
      colorPart1: "#E11D48",
      colorPart2: "#1E293B",
      subtitle: "Deduce the secret connecting concept from 4 visual clues",
      category: "arcade",
      badge: "Visual Riddle",
      unsplashImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      iconFallback: <ImageIcon className="w-18 h-18 text-rose-500" />,
    },
    {
      id: "scrambled",
      titlePart1: "Logo",
      titlePart2: "Quiz",
      colorPart1: "#4F46E5",
      colorPart2: "#1E293B",
      subtitle: "Unscramble tiles to identify famous world logos powered by Logo.dev API",
      category: "arcade",
      badge: "Logo.dev Brands",
      unsplashImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      iconFallback: (
        <img
          src="https://img.logo.dev/apple.com?token=pk_FomPcRrYTCqDoCZOwYlchw&size=120&format=png"
          alt="Logo.dev Brand"
          className="w-14 h-14 object-contain filter drop-shadow-sm"
        />
      ),
    },
    {
      id: "landmark",
      titlePart1: "Landmark",
      titlePart2: "Countries",
      colorPart1: "#059669",
      colorPart2: "#1E293B",
      subtitle: "Match world wonders to their flags and continents",
      category: "arcade",
      badge: "World Quiz",
      unsplashImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      iconFallback: <Globe className="w-18 h-18 text-emerald-500" />,
    },
    {
      id: "memory",
      titlePart1: "Memory",
      titlePart2: "Match",
      colorPart1: "#0284C7",
      colorPart2: "#1E293B",
      subtitle: "Card flip memory matching pairs across abacus beads & emojis",
      category: "memory",
      badge: "Memory Trainer",
      unsplashImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
      iconFallback: <Brain className="w-18 h-18 text-sky-500" />,
    },
    {
      id: "spot",
      titlePart1: "Spot",
      titlePart2: "Difference",
      colorPart1: "#7C3AED",
      colorPart2: "#1E293B",
      subtitle: "Find hidden anomalies between mirrored jungle & space scenes",
      category: "memory",
      badge: "Visual Focus",
      unsplashImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      iconFallback: <Eye className="w-18 h-18 text-purple-500" />,
    },
    {
      id: "odd",
      titlePart1: "Odd",
      titlePart2: "One Out",
      colorPart1: "#D97706",
      colorPart2: "#1E293B",
      subtitle: "Identify the unique outlier tile before time runs out",
      category: "memory",
      badge: "Rapid Logic",
      unsplashImage: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
      iconFallback: <Target className="w-18 h-18 text-amber-500" />,
    },
    {
      id: "recall",
      titlePart1: "Memory",
      titlePart2: "Recall",
      colorPart1: "#E11D48",
      colorPart2: "#1E293B",
      subtitle: "Memorize fruits, vegetables, animals & vehicles, then name them all!",
      category: "memory",
      badge: "Kids Memory Tray",
      unsplashImage: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
      iconFallback: <Sparkles className="w-18 h-18 text-rose-500" />,
    },
  ];

  const displayedGames =
    filterCategory === "all"
      ? ALL_GAMES
      : ALL_GAMES.filter((g) => g.category === filterCategory);

  const currentGame = ALL_GAMES.find((g) => g.id === activeGame);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
      {/* Subtle Node/Network Geometric Background Pattern (Matches reference image) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="networkPattern"
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="3.5" fill="#E2E8F0" />
            <circle cx="180" cy="40" r="2.5" fill="#E2E8F0" />
            <circle cx="100" cy="120" r="4.5" fill="#CBD5E1" opacity="0.6" />
            <circle cx="40" cy="180" r="3" fill="#E2E8F0" />
            <circle cx="160" cy="160" r="2.5" fill="#E2E8F0" />
            <line x1="20" y1="20" x2="100" y2="120" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="180" y1="40" x2="100" y2="120" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="100" y1="120" x2="40" y2="180" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="100" y1="120" x2="160" y2="160" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#networkPattern)" />
      </svg>

      {/* Sleek Kid-Friendly Header (No heavy navbar, just arcade controls) */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        {/* Back Button */}
        {activeGame ? (
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4 text-rose-600" />
            <span>All Game Options</span>
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Dashboard</span>
          </Link>
        )}

        {/* Central Logo & Arcade Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-md shadow-rose-500/20">
            🎮
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black font-serif tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>BrainGym</span>
              <span className="text-rose-600">Games</span>
            </h1>
          </div>
        </div>

        {/* Brain Points Active Badge */}
        <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-black tracking-wider text-amber-800">
            Brain Arcade Active
          </span>
        </div>
      </header>

      {/* VIEW 1: GAME SELECTION SCREEN (BOXES FORMAT WITH UNSPLASH IMAGERY) */}
      {!activeGame ? (
        <main data-tour="braingym-center" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 flex flex-col">
          {/* Header Title & Tagline */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider mb-3 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Choose Your Brain Training Adventure
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900"
            >
              Pick a Game to Play
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm sm:text-base mt-2"
            >
              Select from our 4 featured core games or explore the full visual & memory arcade with real Unsplash photography!
            </motion.p>

            {/* View Mode & Category Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mt-6">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                {[
                  { id: "core", label: "⭐ Featured 4 Core Games" },
                  { id: "arcade", label: "🎮 Word & Visual Arcade" },
                  { id: "memory", label: "🧠 Memory & Focus" },
                  { id: "all", label: "🌟 All Games" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id as typeof filterCategory)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                      filterCategory === tab.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle (Photos vs Pure Icons) */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
                <button
                  onClick={() => setViewMode("photos")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "photos"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Show Unsplash Photo Cards"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Unsplash Photos</span>
                </button>
                <button
                  onClick={() => setViewMode("icons")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "icons"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Show Pure Graphic Icon Boxes"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Graphic Boxes</span>
                </button>
              </div>

              {/* Column Layout Density (3 or 4 per row) */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
                <button
                  onClick={() => setColumns(3)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    columns === 3
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Display 3 boxes per row"
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span>3 Per Row</span>
                </button>
                <button
                  onClick={() => setColumns(4)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    columns === 4
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Display 4 boxes per row"
                >
                  <Grid2x2 className="w-3.5 h-3.5" />
                  <span>4 Per Row</span>
                </button>
              </div>
            </div>
          </div>

          {/* GAME BOXES GRID (Configurable 3 or 4 per row, fully responsive) */}
          <motion.div
            layout
            className={`grid gap-5 sm:gap-6 w-full mx-auto ${
              columns === 4
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl"
            }`}
          >
            {displayedGames.map((game, index) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame(game.id)}
                className="group relative bg-white rounded-[32px] p-5 sm:p-6 border-2 border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-center cursor-pointer overflow-hidden min-h-[340px]"
              >
                {/* Subtle Card Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/80 pointer-events-none" />

                {/* Top Badge & Play Link */}
                <div className="relative z-10 w-full flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {game.badge}
                  </span>
                  <span className="text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Play Now ➔
                  </span>
                </div>

                {/* VISUAL SHOWCASE: Unsplash Photo Banner vs Pure Icon */}
                {viewMode === "photos" ? (
                  <div className="relative z-10 w-full h-40 sm:h-44 rounded-2xl overflow-hidden mb-3.5 shadow-md bg-slate-100 group/img">
                    <img
                      src={game.unsplashImage}
                      alt={`${game.titlePart1}${game.titlePart2}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating 3D Icon Badge on Corner */}
                    <div className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-white/50 flex items-center justify-center">
                      <div className="scale-75 origin-center">
                        {game.iconComponent || game.iconFallback}
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                        📸 Unsplash
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Pure Icon Mode (Reference Image Style) */
                  <div className="relative z-10 py-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="scale-90 origin-center">
                      {game.iconComponent || game.iconFallback}
                    </div>
                  </div>
                )}

                {/* Typography (Matches Dual-Color Serif Style in Reference Image) */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-2xl sm:text-2xl lg:text-3xl font-black font-serif tracking-tight leading-snug">
                    <span style={{ color: game.colorPart1 }}>{game.titlePart1}</span>{" "}
                    <span style={{ color: game.colorPart2 }}>{game.titlePart2}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 max-w-xs mx-auto leading-relaxed">
                    {game.subtitle}
                  </p>
                </div>

                {/* Bottom Action Pill */}
                <div className="relative z-10 mt-4 w-full">
                  <div className="w-full py-2.5 rounded-2xl bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    <span>Launch Game</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>
      ) : (
        /* VIEW 2: ACTIVE GAME PLAY ARENA */
        <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 z-10 flex flex-col justify-start">
          {/* Active Game Quick Switcher Ribbon */}
          <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-2.5 mb-6 border border-slate-200 shadow-sm flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 hidden sm:inline">
                Quick Switch:
              </span>
              {ALL_GAMES.map((g) => {
                const isSelected = activeGame === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveGame(g.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span>
                      {g.titlePart1}
                      {g.titlePart2}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setActiveGame(null)}
              className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer whitespace-nowrap"
            >
              Exit to Boxes ✕
            </button>
          </div>

          {/* Interactive Game Arena Container */}
          <div className="w-full bg-white rounded-[36px] p-5 sm:p-8 md:p-10 shadow-xl text-slate-900 border-2 border-slate-200">
            {/* Active Game Header */}
            {currentGame && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-slate-200">
                    <img
                      src={currentGame.unsplashImage}
                      alt={currentGame.titlePart1}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      {currentGame.badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight mt-1">
                      <span style={{ color: currentGame.colorPart1 }}>
                        {currentGame.titlePart1}
                      </span>
                      <span style={{ color: currentGame.colorPart2 }}>
                        {currentGame.titlePart2}
                      </span>
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      {currentGame.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveGame(null)}
                  className="w-fit text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  ← Choose Different Game
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeGame === "abacus" && <AbacusMasterGame />}
                {activeGame === "spell" && <SpellBytesGame />}
                {activeGame === "puzzle" && <WizyPuzzleGame />}
                {activeGame === "quiz" && <QuizQuestGame />}
                {activeGame === "fourpics" && <FourPicsOneWordGame />}
                {activeGame === "scrambled" && <ScrambledLogoGame />}
                {activeGame === "landmark" && <LandmarkCountryGame />}
                {activeGame === "odd" && <OddOneOutGame />}
                {activeGame === "memory" && <MemoryMatchGame />}
                {activeGame === "spot" && <SpotTheDifferenceGame />}
                {activeGame === "recall" && <MemoryRecallGame onBack={() => setActiveGame(null)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      )}
    </div>
  );
}
