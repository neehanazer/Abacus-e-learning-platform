"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flame,
  Star,
  ArrowRight,
  Globe,
  MapPin,
  Volume2,
  VolumeX,
} from "lucide-react";
import { playSound } from "./soundEffects";

interface LandmarkQuestion {
  id: number;
  landmarkName: string;
  city: string;
  options: string[];
  correctCountry: string;
  flag: string;
  funFact: string;
  imageUrl?: string;
  renderLandmark: () => React.ReactNode;
}

const LANDMARKS: LandmarkQuestion[] = [
  {
    id: 1,
    landmarkName: "Taj Mahal",
    city: "Agra",
    options: ["INDIA", "THAILAND", "ROME"],
    correctCountry: "INDIA",
    flag: "🇮🇳",
    funFact: "A breathtaking white ivory-marble mausoleum built by Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal.",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        {/* Sky */}
        <rect width="200" height="150" fill="#fef3c7" />
        {/* Ground & Reflecting Pool */}
        <rect x="0" y="120" width="200" height="30" fill="#a7f3d0" />
        <rect x="70" y="120" width="60" height="30" fill="#38bdf8" />
        {/* Main Base */}
        <rect x="50" y="70" width="100" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        {/* Main Central Arch */}
        <path d="M 85 120 L 85 85 Q 100 70 115 85 L 115 120 Z" fill="#475569" />
        {/* Side Arches */}
        <path d="M 60 110 L 60 90 Q 68 80 76 90 L 76 110 Z" fill="#64748b" />
        <path d="M 124 110 L 124 90 Q 132 80 140 90 L 140 110 Z" fill="#64748b" />
        {/* Central Dome */}
        <path d="M 80 70 C 75 40 125 40 120 70 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="100" y1="40" x2="100" y2="28" stroke="#f59e0b" strokeWidth="3" />
        {/* Side Minarets */}
        <rect x="25" y="45" width="8" height="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="23" y="40" width="12" height="6" fill="#f8fafc" />
        <rect x="167" y="45" width="8" height="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="165" y="40" width="12" height="6" fill="#f8fafc" />
      </svg>
    ),
  },
  {
    id: 2,
    landmarkName: "Christ the Redeemer",
    city: "Rio de Janeiro",
    options: ["UK", "BRAZIL", "ITALY"],
    correctCountry: "BRAZIL",
    flag: "🇧🇷",
    funFact: "A colossal 98-foot Art Deco statue of Jesus Christ overlooking Rio from the summit of Mount Corcovado.",
    imageUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#bae6fd" />
        {/* Mountain */}
        <polygon points="40,150 100,60 160,150" fill="#15803d" />
        <polygon points="70,150 100,75 130,150" fill="#166534" />
        {/* Statue Pedestal */}
        <rect x="94" y="60" width="12" height="15" fill="#94a3b8" />
        {/* Statue Robe */}
        <polygon points="95,75 92,105 108,105 105,75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        {/* Open Arms */}
        <line x1="65" y1="80" x2="135" y2="80" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
        {/* Head */}
        <circle cx="100" cy="74" r="5" fill="#f8fafc" />
      </svg>
    ),
  },
  {
    id: 3,
    landmarkName: "Great Wall of China",
    city: "Beijing Region",
    options: ["USA", "RUSSIA", "CHINA"],
    correctCountry: "CHINA",
    flag: "🇨🇳",
    funFact: "Spanning more than 13,000 miles across northern mountains, it is the longest man-made structure in history!",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#e0f2fe" />
        {/* Rolling Hills */}
        <circle cx="50" cy="130" r="80" fill="#86efac" />
        <circle cx="150" cy="140" r="85" fill="#4ade80" />
        {/* Great Wall stone path winding */}
        <path d="M 0 100 Q 50 60 100 85 T 200 50 L 200 80 Q 150 115 100 110 T 0 130 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
        {/* Watchtowers */}
        <rect x="40" y="60" width="22" height="24" rx="2" fill="#64748b" />
        <rect x="43" y="55" width="16" height="5" fill="#475569" />
        <rect x="135" y="70" width="22" height="24" rx="2" fill="#64748b" />
        <rect x="138" y="65" width="16" height="5" fill="#475569" />
      </svg>
    ),
  },
  {
    id: 4,
    landmarkName: "Sydney Opera House",
    city: "Sydney Harbour",
    options: ["GERMANY", "AUSTRALIA", "PERU"],
    correctCountry: "AUSTRALIA",
    flag: "🇦🇺",
    funFact: "Famous for its sail-shaped roofs designed by Jørn Utzon, standing dramatically at Bennelong Point on Sydney Harbour.",
    imageUrl: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#fed7aa" />
        <rect x="0" y="115" width="200" height="35" fill="#0284c7" />
        <rect x="25" y="105" width="150" height="12" fill="#475569" />
        {/* Iconic White Shells */}
        <path d="M 40 105 Q 60 50 85 105 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 65 105 Q 90 40 120 105 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 100 105 Q 125 55 155 105 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 5,
    landmarkName: "Great Pyramids of Giza",
    city: "Cairo / Giza",
    options: ["EGYPT", "UAE", "ICELAND"],
    correctCountry: "EGYPT",
    flag: "🇪🇬",
    funFact: "Built over 4,500 years ago as tombs for Pharaohs, the Great Pyramid is the oldest of the Seven Wonders of the Ancient World!",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#fef08a" />
        {/* Desert Dunes */}
        <rect x="0" y="110" width="200" height="40" fill="#d97706" />
        <polygon points="10,110 70,40 120,110" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <polygon points="70,40 120,110 100,110" fill="#d97706" />
        {/* Second Pyramid */}
        <polygon points="90,110 145,55 190,110" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <polygon points="145,55 190,110 170,110" fill="#b45309" />
      </svg>
    ),
  },
  {
    id: 6,
    landmarkName: "Leaning Tower of Pisa",
    city: "Pisa, Tuscany",
    options: ["SPAIN", "ITALY", "PORTUGAL"],
    correctCountry: "ITALY",
    flag: "🇮🇹",
    funFact: "A world-famous freestanding bell tower known worldwide for its nearly 4-degree tilt caused by unstable soft foundation soil.",
    imageUrl: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#bbf7d0" />
        <rect x="0" y="125" width="200" height="25" fill="#15803d" />
        {/* Tilted Tower Group */}
        <g transform="rotate(7 100 120)">
          <rect x="88" y="25" width="24" height="100" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {[35, 50, 65, 80, 95, 110].map((y, i) => (
            <line key={i} x1="88" y1={y} x2="112" y2={y} stroke="#94a3b8" strokeWidth="2" />
          ))}
          <rect x="91" y="15" width="18" height="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      </svg>
    ),
  },
  {
    id: 7,
    landmarkName: "Eiffel Tower",
    city: "Paris",
    options: ["GEORGIA", "JAPAN", "FRANCE"],
    correctCountry: "FRANCE",
    flag: "🇫🇷",
    funFact: "Constructed for the 1889 World's Fair by Gustave Eiffel, it stands 1,083 feet tall as the global symbol of Paris.",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#e0e7ff" />
        <rect x="0" y="130" width="200" height="20" fill="#15803d" />
        {/* Eiffel Tower Iron Framework */}
        <polygon points="98,15 102,15 118,130 82,130" fill="none" stroke="#78350f" strokeWidth="3" />
        {/* Arch Base */}
        <path d="M 86 130 Q 100 100 114 130" fill="#e0e7ff" stroke="#78350f" strokeWidth="3" />
        {/* Platforms */}
        <rect x="88" y="95" width="24" height="4" fill="#b45309" />
        <rect x="92" y="65" width="16" height="4" fill="#b45309" />
        <line x1="100" y1="15" x2="100" y2="8" stroke="#78350f" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 8,
    landmarkName: "Statue of Liberty",
    city: "New York Harbour",
    options: ["USA", "UK", "UAE"],
    correctCountry: "USA",
    flag: "🇺🇸",
    funFact: "A gift of friendship from the people of France in 1886, holding a torch representing enlightenment and a tablet of law.",
    imageUrl: "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#bae6fd" />
        <rect x="0" y="125" width="200" height="25" fill="#0284c7" />
        {/* Pedestal */}
        <polygon points="80,125 85,90 115,90 120,125" fill="#94a3b8" />
        {/* Copper Statue */}
        <path d="M 92 90 L 90 45 L 110 45 L 108 90 Z" fill="#6ee7b7" />
        {/* Head with 7-ray Crown */}
        <circle cx="100" cy="40" r="7" fill="#6ee7b7" />
        <polygon points="95,34 100,28 105,34" fill="#6ee7b7" />
        {/* Right Arm with Torch */}
        <line x1="90" y1="55" x2="78" y2="30" stroke="#6ee7b7" strokeWidth="4" />
        <circle cx="78" cy="27" r="4" fill="#f59e0b" />
      </svg>
    ),
  },
  {
    id: 9,
    landmarkName: "Burj Khalifa",
    city: "Dubai",
    options: ["BAHRAIN", "UAE", "QATAR"],
    correctCountry: "UAE",
    flag: "🇦🇪",
    funFact: "Standing an astonishing 2,717 feet tall with 163 floors, it has been the world's tallest skyscraper since 2009!",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#fde68a" />
        <rect x="0" y="130" width="200" height="20" fill="#d97706" />
        {/* Sleek Stepped Spire */}
        <polygon points="99,10 101,10 108,130 92,130" fill="#94a3b8" />
        <polygon points="98,25 102,25 106,130 94,130" fill="#e2e8f0" />
        <line x1="100" y1="10" x2="100" y2="3" stroke="#64748b" strokeWidth="2" />
        {/* Surrounding city outlines */}
        <rect x="60" y="90" width="16" height="40" fill="#cbd5e1" />
        <rect x="125" y="80" width="20" height="50" fill="#cbd5e1" />
      </svg>
    ),
  },
  {
    id: 10,
    landmarkName: "The Colosseum",
    city: "Rome",
    options: ["ROME", "ITALY", "AUSTRIA"],
    correctCountry: "ITALY",
    flag: "🇮🇹",
    funFact: "An ancient Roman amphitheater built under the Flavian emperors capable of holding over 50,000 spectators for gladiatorial games.",
    renderLandmark: () => (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect width="200" height="150" fill="#fef08a" />
        <rect x="0" y="125" width="200" height="25" fill="#b45309" />
        {/* Colosseum Oval Structure */}
        <ellipse cx="100" cy="95" rx="70" ry="32" fill="#d97706" stroke="#92400e" strokeWidth="2" />
        <ellipse cx="100" cy="92" rx="65" ry="28" fill="#fef3c7" />
        {/* Arches Layer */}
        {[50, 70, 90, 110, 130, 150].map((x, i) => (
          <path key={i} d={`M ${x - 6} 95 L ${x - 6} 80 Q ${x} 72 ${x + 6} 80 L ${x + 6} 95 Z`} fill="#92400e" />
        ))}
      </svg>
    ),
  },
];

export default function LandmarkCountryGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentQ = LANDMARKS[currentIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctCountry) {
      if (soundEnabled) playSound("success");
      setScore((s) => s + 10 + streak * 2);
      setStreak((st) => st + 1);
    } else {
      if (soundEnabled) playSound("wrong");
      setStreak(0);
    }
  };

  const handleNext = () => {
    playSound("pop");
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex + 1 < LANDMARKS.length) {
      setCurrentIndex((c) => c + 1);
    } else {
      setIsGameOver(true);
      if (soundEnabled) playSound("win");
    }
  };

  const handleRestart = () => {
    playSound("sparkle");
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <div className="text-center py-10 px-4 space-y-6 max-w-xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 mx-auto bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl shadow-amber-200"
        >
          🌍
        </motion.div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full">
            World Tour Complete!
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-800 font-heading mt-3">
            Global Landmark Explorer! 🏛️
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mt-2">
            You successfully traveled the globe and matched all {LANDMARKS.length} famous landmarks to their countries!
          </p>
        </div>

        <div className="inline-flex items-center gap-8 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Total Points</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">{score}</span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Landmarks</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-500">
              {LANDMARKS.length}/{LANDMARKS.length}
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
          <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
            Landmark {currentIndex + 1} of {LANDMARKS.length}
          </span>
          <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{currentQ.city}</span>
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
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Landmark Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-lg items-center">
        {/* Left Side: Landmark Illustration & Banner */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center relative">
            {currentQ.imageUrl ? (
              <img
                src={currentQ.imageUrl}
                alt={currentQ.landmarkName}
                className="w-full h-full object-cover"
              />
            ) : (
              currentQ.renderLandmark()
            )}
          </div>

          <span className="text-lg sm:text-xl font-black text-slate-800 font-heading mt-3">
            {currentQ.landmarkName}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {currentQ.city}
          </span>

          {/* Correct Country Banner Revealed on Answer (From Canva Slide Style) */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-3 px-6 py-2 rounded-2xl bg-amber-400 border-2 border-amber-500 text-amber-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-md"
              >
                <span>{currentQ.flag}</span>
                <span>Country: {currentQ.correctCountry}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Question & 3 Multiple Choice Options */}
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200 inline-block mb-1">
              Geography Quiz
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-heading">
              Name this country:
            </h3>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.correctCountry;

              let btnStyle = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800";

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-200 font-black";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-500 border-rose-600 text-white font-black";
                } else {
                  btnStyle = "bg-slate-100/50 border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <motion.button
                  key={option}
                  whileHover={!isAnswered ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`w-full py-4 px-6 rounded-2xl border-2 font-black text-lg flex items-center justify-between transition-all cursor-pointer shadow-sm ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                </motion.button>
              );
            })}
          </div>

          {/* Educational Fun Fact & Next Button */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">💡</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                    {currentQ.funFact}
                  </p>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl shadow transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentIndex + 1 === LANDMARKS.length ? "Finish Tour" : "Next Landmark"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
