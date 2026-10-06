"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Zap,
  Award,
  Trophy,
  Flame,
  HelpCircle,
  Settings,
  ChevronRight,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";

interface FlashAnzanProps {
  onBack: () => void;
  defaultDigits?: number;
}

interface AttemptRecord {
  id: string;
  numbers: number[];
  sum: number;
  userAnswer: number;
  isCorrect: boolean;
  speedMs: number;
  digits: number;
  count: number;
  timeStr: string;
}

export default function FlashAnzanModule({ onBack, defaultDigits = 1 }: FlashAnzanProps) {
  // Configuration State
  const [digits, setDigits] = useState<number>(defaultDigits);
  const [count, setCount] = useState<number>(5);
  const [speedMs, setSpeedMs] = useState<number>(1200);
  const [includeNegative, setIncludeNegative] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Gameplay State: 'idle' | 'countdown' | 'flashing' | 'input' | 'evaluated'
  const [gameState, setGameState] = useState<"idle" | "countdown" | "flashing" | "input" | "evaluated">("idle");
  const [countdownVal, setCountdownVal] = useState<number | string>(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [lastAttempt, setLastAttempt] = useState<AttemptRecord | null>(null);

  // Performance & Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Synth for authentic Flash Anzan beeps and sounds
  const playSound = useCallback(
    (type: "click" | "ready" | "success" | "error" | "start") => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "click") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(850, now + 0.05);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === "ready") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === "start") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === "success") {
          // Cheerful major chord arpeggio
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = "sine";
            o.frequency.setValueAtTime(freq, now + idx * 0.08);
            g.gain.setValueAtTime(0.2, now + idx * 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
            o.start(now + idx * 0.08);
            o.stop(now + idx * 0.08 + 0.2);
          });
        } else if (type === "error") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(160, now + 0.25);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch (e) {
        // Audio policy ignore
      }
    },
    [soundEnabled]
  );

  // Generate sequence of numbers ensuring running sum stays non-negative
  const generateSequence = useCallback(() => {
    const list: number[] = [];
    let runningSum = 0;
    const maxVal = Math.pow(10, digits) - 1;
    const minVal = Math.pow(10, digits - 1);

    for (let i = 0; i < count; i++) {
      let n = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

      // Decide if this should be subtraction:
      // Subtraction only allowed after first 2 positive numbers, and runningSum must remain positive
      if (includeNegative && i >= 2 && Math.random() > 0.6 && runningSum > n) {
        n = -n;
      }

      list.push(n);
      runningSum += n;
    }

    return list;
  }, [digits, count, includeNegative]);

  // Start Flash Session
  const handleStartFlash = (customList?: number[]) => {
    const numbersToPlay = customList || generateSequence();
    setSequence(numbersToPlay);
    setUserAnswer("");
    setCurrentNumber(null);
    setCurrentIndex(-1);
    setGameState("countdown");
    setCountdownVal(3);
    playSound("ready");

    let countRem = 3;
    const interval = setInterval(() => {
      countRem -= 1;
      if (countRem > 0) {
        setCountdownVal(countRem);
        playSound("ready");
      } else if (countRem === 0) {
        setCountdownVal("GO!");
        playSound("start");
      } else {
        clearInterval(interval);
        startFlashing(numbersToPlay);
      }
    }, 700);
  };

  // Run the Flash Sequence
  const startFlashing = (numbersToPlay: number[]) => {
    setGameState("flashing");
    let idx = 0;

    const flashNext = () => {
      if (idx < numbersToPlay.length) {
        const num = numbersToPlay[idx];
        setCurrentNumber(num);
        setCurrentIndex(idx);
        playSound("click");

        idx += 1;
        // On screen for 75% of speed interval, 25% blank pulse
        const displayTime = Math.max(120, speedMs * 0.75);
        const blankTime = Math.max(80, speedMs * 0.25);

        setTimeout(() => {
          setCurrentNumber(null);
          setTimeout(() => {
            flashNext();
          }, blankTime);
        }, displayTime);
      } else {
        // Sequence completed -> prompt for sum
        setGameState("input");
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    };

    flashNext();
  };

  // Submit Answer
  const handleCheckAnswer = () => {
    if (userAnswer.trim() === "" || sequence.length === 0) return;
    const ansNum = parseInt(userAnswer.trim(), 10);
    if (isNaN(ansNum)) return;

    const expectedSum = sequence.reduce((acc, curr) => acc + curr, 0);
    const isCorrect = ansNum === expectedSum;

    // Calculate score points: base 20 pts + speed multiplier + digit multiplier
    const speedBonus = speedMs <= 500 ? 30 : speedMs <= 800 ? 20 : speedMs <= 1200 ? 10 : 5;
    const digitBonus = digits * 10;
    const earnedPoints = isCorrect ? 20 + speedBonus + digitBonus : 0;

    if (isCorrect) {
      playSound("success");
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      setScore((s) => s + earnedPoints);
      setStreak((st) => {
        const next = st + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      playSound("error");
      setStreak(0);
    }

    const record: AttemptRecord = {
      id: Date.now().toString(),
      numbers: sequence,
      sum: expectedSum,
      userAnswer: ansNum,
      isCorrect,
      speedMs,
      digits,
      count,
      timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setLastAttempt(record);
    setAttempts((prev) => [record, ...prev].slice(0, 10));
    setGameState("evaluated");
  };

  // Formula string helper: 24 + 18 - 5 = 37
  const getFormulaString = (nums: number[]) => {
    let str = "";
    nums.forEach((n, i) => {
      if (i === 0) str += `${n}`;
      else if (n >= 0) str += ` + ${n}`;
      else str += ` - ${Math.abs(n)}`;
    });
    return str;
  };

  const expectedSum = sequence.reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#1D3557] border border-amber-200 transition cursor-pointer"
            title="Back to Practice Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
              <span>Soroban Mental Calculation Arena</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1D3557] font-heading flex items-center gap-2">
              <span>Flash Anzan Mental Math</span>
              <span className="text-xl">⚡</span>
            </h1>
          </div>
        </div>

        {/* Stats Pill Hub */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FFFBF0] px-3.5 py-1.5 rounded-2xl border border-amber-200 shadow-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-500">Score:</span>
            <span className="text-sm font-black text-[#1D3557]">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFFBF0] px-3.5 py-1.5 rounded-2xl border border-amber-200 shadow-xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
            <span className="text-xs font-bold text-slate-500">Streak:</span>
            <span className="text-sm font-black text-orange-600">{streak}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition cursor-pointer ${
              soundEnabled
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Arena Screen (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1D3557] rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-2xl relative overflow-hidden min-h-[380px] sm:min-h-[440px] flex flex-col justify-between items-center text-center">
            {/* Top Indicator bar inside screen */}
            <div className="w-full flex items-center justify-between text-xs font-bold text-amber-300/80 px-2">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Mental Abacus Visualization</span>
              </span>
              <span>
                {gameState === "flashing" && (
                  <span className="bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/40 text-amber-200 font-mono">
                    Number {currentIndex + 1} of {sequence.length}
                  </span>
                )}
                {gameState === "input" && (
                  <span className="bg-emerald-400/20 px-2.5 py-1 rounded-full border border-emerald-400/40 text-emerald-200 font-mono">
                    Flash Complete!
                  </span>
                )}
              </span>
            </div>

            {/* Center Visual Stage Content */}
            <div className="my-auto py-8 w-full flex flex-col items-center justify-center">
              {/* STATE: IDLE */}
              {gameState === "idle" && (
                <div className="space-y-4 max-w-md">
                  <div className="w-20 h-20 rounded-3xl bg-amber-400/10 border-2 border-amber-300/30 flex items-center justify-center mx-auto text-4xl shadow-inner">
                    ⚡
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Ready for Flash Anzan?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Numbers will flash rapidly on the screen. Mentally visualize the Soroban beads moving
                    and calculate the total sum in your head!
                  </p>
                  <button
                    onClick={() => handleStartFlash()}
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Flash Test</span>
                  </button>
                </div>
              )}

              {/* STATE: COUNTDOWN */}
              {gameState === "countdown" && (
                <motion.div
                  key={String(countdownVal)}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="text-7xl sm:text-9xl font-black text-amber-400 font-heading tracking-tight drop-shadow-md">
                    {countdownVal}
                  </div>
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
                    Get Ready To Calculate...
                  </div>
                </motion.div>
              )}

              {/* STATE: FLASHING */}
              {gameState === "flashing" && (
                <div className="w-full flex flex-col items-center justify-center min-h-[160px]">
                  {currentNumber !== null ? (
                    <motion.div
                      key={`num-${currentIndex}-${currentNumber}`}
                      initial={{ scale: 0.85, opacity: 0.4 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.1 }}
                      className={`text-6xl sm:text-8xl md:text-9xl font-black font-heading tracking-tight ${
                        currentNumber < 0
                          ? "text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                          : "text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]"
                      }`}
                    >
                      {currentNumber > 0 && currentIndex > 0 ? `+${currentNumber}` : currentNumber}
                    </motion.div>
                  ) : (
                    <div className="w-16 h-1 bg-amber-400/20 rounded-full animate-pulse" />
                  )}
                </div>
              )}

              {/* STATE: INPUT */}
              {gameState === "input" && (
                <div className="space-y-5 max-w-sm w-full">
                  <div className="text-base sm:text-lg font-black text-amber-300">
                    🤔 What is the calculated total sum?
                  </div>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCheckAnswer();
                      }}
                      placeholder="Your calculated sum..."
                      className="w-full px-5 py-4 rounded-2xl bg-white/10 border-2 border-amber-300 focus:border-amber-400 focus:bg-white/20 text-white font-mono text-2xl font-black text-center focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base shadow-lg transition-all cursor-pointer"
                  >
                    Submit Answer 🚀
                  </button>
                </div>
              )}

              {/* STATE: EVALUATED */}
              {gameState === "evaluated" && lastAttempt && (
                <div className="space-y-4 max-w-lg w-full">
                  <div className="flex items-center justify-center gap-2">
                    {lastAttempt.isCorrect ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 text-sm font-black">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>EXCELLENT! CORRECT ANSWER! 🎉</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-300 text-sm font-black">
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span>Incorrect Sum! Practice makes perfect.</span>
                      </span>
                    )}
                  </div>

                  {/* Calculation Details */}
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-left space-y-2 font-mono">
                    <div className="text-[11px] uppercase tracking-wider text-slate-300 font-sans font-bold">
                      Sequence Calculation Breakdown:
                    </div>
                    <div className="text-sm sm:text-base text-amber-200 font-bold break-words">
                      {getFormulaString(lastAttempt.numbers)} ={" "}
                      <span className="text-emerald-400 font-black text-lg underline">
                        {lastAttempt.sum}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-sans pt-1 border-t border-white/10 flex items-center justify-between">
                      <span>Your Answer: <strong className="text-white">{lastAttempt.userAnswer}</strong></span>
                      <span>Correct Sum: <strong className="text-emerald-300">{lastAttempt.sum}</strong></span>
                    </div>
                  </div>

                  {/* Next Round CTA */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => handleStartFlash()}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Next Flash Challenge</span>
                    </button>
                    <button
                      onClick={() => handleStartFlash(lastAttempt.numbers)}
                      className="py-3.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      title="Try the exact same sequence again"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Replay Same Numbers</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Progress Bead Dots */}
            <div className="w-full flex items-center justify-center gap-1.5 pt-3 border-t border-white/10">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    currentIndex === i
                      ? "bg-amber-400 scale-125 ring-2 ring-amber-300/50"
                      : i < currentIndex
                      ? "bg-emerald-400"
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Settings className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-[#1D3557] uppercase tracking-wider">
                Flash Settings & Speed
              </h3>
            </div>

            {/* 1. Digits Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                1. Number of Digits:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { d: 1, label: "1 Digit", sub: "1 - 9" },
                  { d: 2, label: "2 Digits", sub: "10 - 99" },
                  { d: 3, label: "3 Digits", sub: "100 - 999" },
                ].map((item) => (
                  <button
                    key={item.d}
                    type="button"
                    disabled={gameState === "flashing" || gameState === "countdown"}
                    onClick={() => setDigits(item.d)}
                    className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                      digits === item.d
                        ? "bg-amber-500 text-white font-extrabold border-amber-600 shadow-xs"
                        : "bg-[#FFFBF0] text-stone-700 hover:bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className="text-[10px] opacity-80">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Number Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                2. Quantity of Numbers:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 5, 8, 10].map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={gameState === "flashing" || gameState === "countdown"}
                    onClick={() => setCount(c)}
                    className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                      count === c
                        ? "bg-[#1D3557] text-white border-[#1D3557] shadow-xs"
                        : "bg-[#FFFBF0] text-stone-700 hover:bg-amber-50 border-amber-200"
                    }`}
                  >
                    {c} Nos
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Flash Speed */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                3. Speed Interval (per number):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { ms: 2000, label: "🐢 Slow (2.0s)" },
                  { ms: 1200, label: "🚶 Medium (1.2s)" },
                  { ms: 800, label: "⚡ Fast (0.8s)" },
                  { ms: 500, label: "🔥 Master (0.5s)" },
                ].map((s) => (
                  <button
                    key={s.ms}
                    type="button"
                    disabled={gameState === "flashing" || gameState === "countdown"}
                    onClick={() => setSpeedMs(s.ms)}
                    className={`py-2 px-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer ${
                      speedMs === s.ms
                        ? "bg-[#E76F51] text-white font-extrabold border-[#E76F51] shadow-xs"
                        : "bg-[#FFFBF0] text-stone-700 hover:bg-amber-50 border-amber-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Subtraction Toggle */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#1D3557] block">Include Subtraction (-)</span>
                <span className="text-[10px] text-stone-400">Occasional negative numbers</span>
              </div>
              <input
                type="checkbox"
                checked={includeNegative}
                disabled={gameState === "flashing" || gameState === "countdown"}
                onChange={(e) => setIncludeNegative(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Recent Attempts Log */}
          {attempts.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border-2 border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-black text-stone-500 uppercase tracking-wider">
                  Session History ({attempts.length})
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Best Streak: {bestStreak}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {attempts.map((att) => (
                  <div
                    key={att.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      att.isCorrect
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/70 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{att.isCorrect ? "✓" : "✗"}</span>
                        <span>
                          {att.digits}D • {att.count} Nos ({att.speedMs / 1000}s)
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{att.timeStr}</div>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <div>Ans: {att.userAnswer}</div>
                      <div className="text-[10px] text-stone-500">Sum: {att.sum}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
