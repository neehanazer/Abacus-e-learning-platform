"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Timer,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Clock,
  FastForward,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playSound } from "./soundEffects";

interface QuizQuestion {
  id: string;
  category: "Mental Math" | "Abacus Vision" | "Brain Logic";
  question: string;
  options: (string | number)[];
  answer: string | number;
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    category: "Abacus Vision",
    question: "On an Abacus rod, what is the value of 1 Heaven bead pushed down to the beam?",
    options: ["1", "5", "10", "15"],
    answer: "5",
    explanation: "Upper deck beads represent 5 on a standard Soroban!",
  },
  {
    id: "q2",
    category: "Mental Math",
    question: "Rapid addition: 24 + 35 + 11 = ?",
    options: [68, 70, 72, 65],
    answer: 70,
    explanation: "24 + 35 = 59; 59 + 11 = 70!",
  },
  {
    id: "q3",
    category: "Brain Logic",
    question: "Which number comes next in the sequence: 4, 8, 16, 32, ... ?",
    options: [48, 54, 64, 60],
    answer: 64,
    explanation: "Each number doubles (× 2): 32 × 2 = 64!",
  },
  {
    id: "q4",
    category: "Abacus Vision",
    question: "If a rod has the Heaven bead (5) down and 3 Earth beads (1) up, what digit is formed?",
    options: ["7", "8", "9", "6"],
    answer: "8",
    explanation: "5 + 3 = 8 on that place value rod!",
  },
  {
    id: "q5",
    category: "Mental Math",
    question: "Speed subtraction: 100 - 37 = ?",
    options: [63, 73, 53, 67],
    answer: 63,
    explanation: "100 - 30 = 70; 70 - 7 = 63!",
  },
  {
    id: "q6",
    category: "Brain Logic",
    question: "How many rods are needed to represent the number 1,250?",
    options: ["2 Rods", "3 Rods", "4 Rods", "5 Rods"],
    answer: "4 Rods",
    explanation: "1,250 has 4 digits: 1000s, 100s, 10s, and 1s!",
  },
  {
    id: "q7",
    category: "Mental Math",
    question: "Flash multiplication: 9 × 8 = ?",
    options: [72, 81, 64, 76],
    answer: 72,
    explanation: "9 × 8 = 72!",
  },
  {
    id: "q8",
    category: "Abacus Vision",
    question: "What is the Japanese name for the traditional math abacus?",
    options: ["Suanpan", "Soroban", "Schoty", "Kipus"],
    answer: "Soroban",
    explanation: "The Soroban is Japan's modern 1:4 abacus!",
  },
  {
    id: "q9",
    category: "Mental Math",
    question: "Speed arithmetic: 50 + 25 - 15 = ?",
    options: [55, 60, 65, 70],
    answer: 60,
    explanation: "50 + 25 = 75; 75 - 15 = 60!",
  },
  {
    id: "q10",
    category: "Brain Logic",
    question: "What is half of 250?",
    options: [120, 125, 130, 115],
    answer: 125,
    explanation: "250 ÷ 2 = 125!",
  },
];

export default function QuizQuestGame() {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Lifelines: 50:50, +15s, Skip
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineFreezeUsed, setLifelineFreezeUsed] = useState(false);
  const [lifelineSkipUsed, setLifelineSkipUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<(string | number)[]>([]);

  const currentQ = QUESTIONS[qIndex];

  // Timer Countdown
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && selectedAnswer === null) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleTimeout();
    }
  }, [timeLeft, isGameOver, selectedAnswer]);

  const handleTimeout = () => {
    if (soundEnabled) playSound("wrong");
    setSelectedAnswer("TIMEOUT");
    setIsCorrect(false);
    setStreak(0);
    setTimeout(() => {
      advanceQuestion();
    }, 1800);
  };

  const handleAnswer = (option: string | number) => {
    if (selectedAnswer !== null || isGameOver) return;

    setSelectedAnswer(option);
    const correct = String(option) === String(currentQ.answer);
    setIsCorrect(correct);

    if (correct) {
      if (soundEnabled) playSound("success");
      const speedBonus = Math.floor(timeLeft * 2);
      const streakBonus = (streak + 1) * 20;
      setScore((s) => s + 50 + speedBonus + streakBonus);
      setStreak((st) => st + 1);
    } else {
      if (soundEnabled) playSound("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      advanceQuestion();
    }, 1600);
  };

  const advanceQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setHiddenOptions([]);
    setTimeLeft(25);

    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setIsGameOver(true);
      if (soundEnabled) playSound("win");
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ["#991b1b", "#ef4444", "#f59e0b", "#10b981"],
      });
    }
  };

  // Lifeline 1: 50-50
  const useLifeline5050 = () => {
    if (lifeline5050Used || selectedAnswer !== null) return;
    setLifeline5050Used(true);
    if (soundEnabled) playSound("sparkle");

    const incorrect = currentQ.options.filter(
      (opt) => String(opt) !== String(currentQ.answer)
    );
    // Hide 2 incorrect options
    const toHide = incorrect.slice(0, 2);
    setHiddenOptions(toHide);
  };

  // Lifeline 2: +15s Time Freeze
  const useLifelineFreeze = () => {
    if (lifelineFreezeUsed || selectedAnswer !== null) return;
    setLifelineFreezeUsed(true);
    if (soundEnabled) playSound("sparkle");
    setTimeLeft((t) => t + 15);
  };

  // Lifeline 3: Skip Question
  const useLifelineSkip = () => {
    if (lifelineSkipUsed || selectedAnswer !== null) return;
    setLifelineSkipUsed(true);
    if (soundEnabled) playSound("flip");
    advanceQuestion();
  };

  const restartQuest = () => {
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(25);
    setIsGameOver(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setHiddenOptions([]);
    setLifeline5050Used(false);
    setLifelineFreezeUsed(false);
    setLifelineSkipUsed(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-rose-800 bg-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {currentQ.category}
          </span>
          <span className="text-xs font-bold text-slate-500">
            Question {qIndex + 1} of {QUESTIONS.length}
          </span>
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
            {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {isGameOver ? (
        /* Quiz Complete Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl border-4 border-rose-500/50 shadow-2xl text-center space-y-5"
        >
          <div className="text-6xl">🏆</div>
          <h3 className="text-3xl font-black font-serif text-amber-300">
            QuizQuest Champion!
          </h3>
          <p className="text-slate-300 text-sm max-w-sm mx-auto">
            You completed the arithmetic quest with a final score of{" "}
            <strong className="text-white text-lg">{score} Points</strong>!
          </p>
          <div className="flex justify-center gap-4 py-2">
            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Peak Streak
              </span>
              <span className="text-xl font-black text-amber-400">x{streak + 1}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Questions Solved
              </span>
              <span className="text-xl font-black text-emerald-400">
                {QUESTIONS.length} / {QUESTIONS.length}
              </span>
            </div>
          </div>
          <button
            onClick={restartQuest}
            className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-base rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play QuizQuest Again</span>
          </button>
        </motion.div>
      ) : (
        <>
          {/* Timer Progress Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full transition-all duration-1000 ${
                timeLeft > 12
                  ? "bg-emerald-500"
                  : timeLeft > 6
                  ? "bg-amber-500"
                  : "bg-rose-500 animate-pulse"
              }`}
              style={{ width: `${(timeLeft / 25) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-500">
            <span className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-slate-400" /> Time Remaining
            </span>
            <span
              className={`font-black font-serif text-sm ${
                timeLeft <= 6 ? "text-rose-600 animate-bounce" : "text-slate-800"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* 3D Speech Bubble Question Display (Matches Reference Image) */}
          <div className="relative bg-white rounded-[32px] p-6 sm:p-8 border-4 border-slate-900 shadow-xl">
            {/* Upper Right 3D Question Badge */}
            <div className="absolute -top-6 -right-3 sm:-right-4 w-14 h-14 rounded-full bg-gradient-to-b from-red-600 to-red-800 border-4 border-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              ?
            </div>

            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
              Brain Prompt
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-serif leading-snug">
              {currentQ.question}
            </h3>

            {/* Pointer tail shape */}
            <div className="absolute -bottom-4 left-10 w-6 h-6 bg-white border-r-4 border-b-4 border-slate-900 transform rotate-45" />
          </div>

          {/* Lifelines */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={useLifeline5050}
              disabled={lifeline5050Used || selectedAnswer !== null}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                lifeline5050Used
                  ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-sm"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              50:50 Lifeline
            </button>

            <button
              onClick={useLifelineFreeze}
              disabled={lifelineFreezeUsed || selectedAnswer !== null}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                lifelineFreezeUsed
                  ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                  : "bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 shadow-sm"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-700" />
              +15s Freeze
            </button>

            <button
              onClick={useLifelineSkip}
              disabled={lifelineSkipUsed || selectedAnswer !== null}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                lifelineSkipUsed
                  ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 shadow-sm"
              }`}
            >
              <FastForward className="w-3.5 h-3.5 text-purple-700" />
              Skip Question
            </button>
          </div>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isHidden = hiddenOptions.includes(option);
              if (isHidden) {
                return (
                  <div
                    key={idx}
                    className="py-4 px-5 rounded-2xl border-2 border-dashed border-slate-200 opacity-20 bg-slate-50"
                  />
                );
              }

              let btnStyle =
                "bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-md";

              if (selectedAnswer !== null) {
                if (String(option) === String(currentQ.answer)) {
                  btnStyle =
                    "bg-emerald-600 text-white border-2 border-emerald-700 shadow-emerald-400/40";
                } else if (String(option) === String(selectedAnswer)) {
                  btnStyle =
                    "bg-rose-600 text-white border-2 border-rose-700 shadow-rose-400/40";
                } else {
                  btnStyle = "bg-slate-100 text-slate-400 border-slate-200 opacity-40";
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={selectedAnswer === null ? { scale: 1.03, y: -2 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`py-4 px-5 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-between transition-all cursor-pointer font-serif ${btnStyle}`}
                >
                  <span>{option}</span>
                  {selectedAnswer !== null &&
                    String(option) === String(currentQ.answer) && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    )}
                  {selectedAnswer !== null &&
                    String(option) === String(selectedAnswer) &&
                    String(option) !== String(currentQ.answer) && (
                      <XCircle className="w-5 h-5 text-rose-200" />
                    )}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl text-center text-xs font-bold ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-rose-100 text-rose-900 border border-rose-300"
              }`}
            >
              {isCorrect ? "✨ Brilliant!" : "❌ Not quite!"} {currentQ.explanation}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
