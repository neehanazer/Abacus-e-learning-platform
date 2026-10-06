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

export type FlashOperation = "add-sub" | "multiplication" | "division" | "mixed";

export interface FlashItem {
  id: string;
  displayText: string;
  operator: "+" | "-" | "×" | "÷" | "";
  number: number;
}

export interface FlashChallenge {
  items: FlashItem[];
  expectedAnswer: number;
  formula: string;
  operation: FlashOperation;
}

interface AttemptRecord {
  id: string;
  operation: FlashOperation;
  formula: string;
  expectedAnswer: number;
  userAnswer: number;
  isCorrect: boolean;
  speedMs: number;
  digits: number;
  count: number;
  timeStr: string;
}

export default function FlashAnzanModule({ onBack, defaultDigits = 1 }: FlashAnzanProps) {
  // Configuration State
  const [operation, setOperation] = useState<FlashOperation>("add-sub");
  const [digits, setDigits] = useState<number>(defaultDigits);
  const [count, setCount] = useState<number>(5);
  const [speedMs, setSpeedMs] = useState<number>(1200);
  const [includeNegative, setIncludeNegative] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Gameplay State: 'idle' | 'countdown' | 'flashing' | 'input' | 'evaluated'
  const [gameState, setGameState] = useState<"idle" | "countdown" | "flashing" | "input" | "evaluated">("idle");
  const [countdownVal, setCountdownVal] = useState<number | string>(3);
  const [currentChallenge, setCurrentChallenge] = useState<FlashChallenge | null>(null);
  const [sequence, setSequence] = useState<FlashItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentStep, setCurrentStep] = useState<FlashItem | null>(null);
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

  // Generate Challenge based on selected operation
  const generateChallenge = useCallback((): FlashChallenge => {
    if (operation === "multiplication") {
      let factorA = 0;
      let factorB = 0;
      if (digits === 1) {
        factorA = Math.floor(Math.random() * 8) + 2; // 2 to 9
        factorB = Math.floor(Math.random() * 8) + 2; // 2 to 9
      } else if (digits === 2) {
        factorA = Math.floor(Math.random() * 90) + 10; // 10 to 99
        factorB = Math.floor(Math.random() * 8) + 2;  // 2 to 9
      } else {
        if (Math.random() > 0.5) {
          factorA = Math.floor(Math.random() * 900) + 100; // 100 to 999
          factorB = Math.floor(Math.random() * 8) + 2;   // 2 to 9
        } else {
          factorA = Math.floor(Math.random() * 80) + 12;  // 12 to 92
          factorB = Math.floor(Math.random() * 80) + 12;  // 12 to 92
        }
      }

      const items: FlashItem[] = [
        { id: "1", displayText: String(factorA), operator: "", number: factorA },
        { id: "2", displayText: `× ${factorB}`, operator: "×", number: factorB },
      ];

      // If user chose count >= 3 and 1 digit, add a 3rd factor
      if (count >= 3 && digits === 1) {
        const factorC = Math.floor(Math.random() * 4) + 2; // 2 to 5
        items.push({ id: "3", displayText: `× ${factorC}`, operator: "×", number: factorC });
        const expected = factorA * factorB * factorC;
        return {
          items,
          expectedAnswer: expected,
          formula: `${factorA} × ${factorB} × ${factorC} = ${expected}`,
          operation: "multiplication",
        };
      }

      const expected = factorA * factorB;
      return {
        items,
        expectedAnswer: expected,
        formula: `${factorA} × ${factorB} = ${expected}`,
        operation: "multiplication",
      };
    } else if (operation === "division") {
      let divisor = 0;
      let quotient = 0;

      if (digits === 1) {
        divisor = Math.floor(Math.random() * 8) + 2; // 2 to 9
        quotient = Math.floor(Math.random() * 8) + 2; // 2 to 9
      } else if (digits === 2) {
        divisor = Math.floor(Math.random() * 8) + 2; // 2 to 9
        quotient = Math.floor(Math.random() * 90) + 10; // 10 to 99
      } else {
        divisor = Math.floor(Math.random() * 11) + 2; // 2 to 12
        quotient = Math.floor(Math.random() * 900) + 100; // 100 to 999
      }

      const dividend = divisor * quotient;
      const items: FlashItem[] = [
        { id: "1", displayText: String(dividend), operator: "", number: dividend },
        { id: "2", displayText: `÷ ${divisor}`, operator: "÷", number: divisor },
      ];

      return {
        items,
        expectedAnswer: quotient,
        formula: `${dividend} ÷ ${divisor} = ${quotient}`,
        operation: "division",
      };
    } else if (operation === "mixed") {
      let currentVal = Math.floor(Math.random() * (Math.pow(10, digits) - Math.pow(10, Math.max(1, digits - 1)) + 1)) + Math.pow(10, Math.max(1, digits - 1));
      if (digits === 1) currentVal = Math.max(5, currentVal);

      const items: FlashItem[] = [
        { id: "0", displayText: String(currentVal), operator: "", number: currentVal },
      ];
      let formulaParts = [String(currentVal)];
      const effectiveCount = Math.max(3, count);

      for (let i = 1; i < effectiveCount; i++) {
        const availableOps: ("+" | "-" | "×" | "÷")[] = ["+", "-"];
        if (currentVal <= 40) availableOps.push("×");
        const possibleDivisors = [2, 3, 4, 5].filter((d) => currentVal % d === 0 && currentVal / d >= 2);
        if (possibleDivisors.length > 0) availableOps.push("÷");

        const chosenOp = availableOps[Math.floor(Math.random() * availableOps.length)];

        if (chosenOp === "+") {
          const addVal = Math.floor(Math.random() * Math.pow(10, digits)) + 1;
          currentVal += addVal;
          items.push({ id: String(i), displayText: `+${addVal}`, operator: "+", number: addVal });
          formulaParts.push(`+ ${addVal}`);
        } else if (chosenOp === "-") {
          const maxSub = Math.min(currentVal - 1, Math.pow(10, digits));
          const subVal = maxSub > 1 ? Math.floor(Math.random() * (maxSub - 1)) + 1 : 1;
          currentVal -= subVal;
          items.push({ id: String(i), displayText: `-${subVal}`, operator: "-", number: subVal });
          formulaParts.push(`- ${subVal}`);
        } else if (chosenOp === "×") {
          const factor = Math.floor(Math.random() * 3) + 2; // 2 to 4
          currentVal *= factor;
          items.push({ id: String(i), displayText: `× ${factor}`, operator: "×", number: factor });
          formulaParts.push(`× ${factor}`);
        } else if (chosenOp === "÷") {
          const divList = [2, 3, 4, 5].filter((d) => currentVal % d === 0);
          const div = divList[Math.floor(Math.random() * divList.length)] || 2;
          currentVal = Math.floor(currentVal / div);
          items.push({ id: String(i), displayText: `÷ ${div}`, operator: "÷", number: div });
          formulaParts.push(`÷ ${div}`);
        }
      }

      return {
        items,
        expectedAnswer: currentVal,
        formula: `${formulaParts.join(" ")} = ${currentVal}`,
        operation: "mixed",
      };
    } else {
      // Classic add-sub
      const items: FlashItem[] = [];
      let runningSum = 0;
      const maxVal = Math.pow(10, digits) - 1;
      const minVal = Math.pow(10, digits - 1);

      for (let i = 0; i < count; i++) {
        let n = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

        if (i === 0) {
          items.push({ id: "0", displayText: String(n), operator: "", number: n });
          runningSum += n;
        } else {
          if (includeNegative && i >= 2 && Math.random() > 0.6 && runningSum > n) {
            items.push({ id: String(i), displayText: `-${n}`, operator: "-", number: -n });
            runningSum -= n;
          } else {
            items.push({ id: String(i), displayText: `+${n}`, operator: "+", number: n });
            runningSum += n;
          }
        }
      }

      let formula = "";
      items.forEach((it, idx) => {
        if (idx === 0) formula += it.number;
        else if (it.number >= 0) formula += ` + ${it.number}`;
        else formula += ` - ${Math.abs(it.number)}`;
      });
      formula += ` = ${runningSum}`;

      return {
        items,
        expectedAnswer: runningSum,
        formula,
        operation: "add-sub",
      };
    }
  }, [operation, digits, count, includeNegative]);

  // Start Flash Session
  const handleStartFlash = (customChallenge?: FlashChallenge) => {
    const challengeToPlay = customChallenge || generateChallenge();
    setCurrentChallenge(challengeToPlay);
    setSequence(challengeToPlay.items);
    setUserAnswer("");
    setCurrentStep(null);
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
        startFlashing(challengeToPlay.items);
      }
    }, 700);
  };

  // Run the Flash Sequence
  const startFlashing = (itemsToPlay: FlashItem[]) => {
    setGameState("flashing");
    let idx = 0;

    const flashNext = () => {
      if (idx < itemsToPlay.length) {
        const step = itemsToPlay[idx];
        setCurrentStep(step);
        setCurrentIndex(idx);
        playSound("click");

        idx += 1;
        const displayTime = Math.max(140, speedMs * 0.75);
        const blankTime = Math.max(90, speedMs * 0.25);

        setTimeout(() => {
          setCurrentStep(null);
          setTimeout(() => {
            flashNext();
          }, blankTime);
        }, displayTime);
      } else {
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
    if (userAnswer.trim() === "" || !currentChallenge) return;
    const ansNum = parseInt(userAnswer.trim(), 10);
    if (isNaN(ansNum)) return;

    const isCorrect = ansNum === currentChallenge.expectedAnswer;
    const speedBonus = speedMs <= 500 ? 30 : speedMs <= 800 ? 20 : speedMs <= 1200 ? 10 : 5;
    const digitBonus = digits * 10;
    const opBonus = operation === "multiplication" || operation === "division" ? 15 : 0;
    const earnedPoints = isCorrect ? 20 + speedBonus + digitBonus + opBonus : 0;

    if (isCorrect) {
      playSound("success");
      confetti({
        particleCount: 75,
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
      operation: currentChallenge.operation,
      formula: currentChallenge.formula,
      expectedAnswer: currentChallenge.expectedAnswer,
      userAnswer: ansNum,
      isCorrect,
      speedMs,
      digits,
      count: currentChallenge.items.length,
      timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setLastAttempt(record);
    setAttempts((prev) => [record, ...prev].slice(0, 10));
    setGameState("evaluated");
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#1D3557] border border-amber-200 transition cursor-pointer"
            title="Return to Practice Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                ⚡ Flash Anzan • Mental Soroban
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {operation === "multiplication"
                  ? "Multiplication (×)"
                  : operation === "division"
                  ? "Division (÷)"
                  : operation === "mixed"
                  ? "Mixed Operations"
                  : "Add / Sub"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1D3557] font-heading mt-0.5">
              Flash Anzan Speed Calculator
            </h1>
          </div>
        </div>

        {/* Right Stats & Sound Control */}
        <div className="flex items-center gap-3">
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
                <span>Mental Abacus Visualization • {operation.toUpperCase()}</span>
              </span>
              <span>
                {gameState === "flashing" && (
                  <span className="bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/40 text-amber-200 font-mono">
                    Step {currentIndex + 1} of {sequence.length}
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
                    {operation === "multiplication" ? "✖️" : operation === "division" ? "➗" : "⚡"}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Ready for Flash {operation === "multiplication" ? "Multiplication" : operation === "division" ? "Division" : "Anzan"}?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    {operation === "multiplication"
                      ? "Numbers and multiplication factor will flash rapidly. Mentally visualize the Soroban and compute the product!"
                      : operation === "division"
                      ? "Numbers and divisor will flash rapidly. Mentally visualize the beads and compute the quotient!"
                      : "Numbers will flash rapidly on the screen. Mentally visualize the Soroban beads moving and calculate the answer!"}
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
                  {currentStep !== null ? (
                    <motion.div
                      key={`step-${currentIndex}-${currentStep.displayText}`}
                      initial={{ scale: 0.85, opacity: 0.4 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.1 }}
                      className={`text-6xl sm:text-8xl md:text-9xl font-black font-heading tracking-tight ${
                        currentStep.operator === "-"
                          ? "text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                          : currentStep.operator === "×"
                          ? "text-orange-300 drop-shadow-[0_0_25px_rgba(251,146,60,0.6)]"
                          : currentStep.operator === "÷"
                          ? "text-sky-300 drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]"
                          : "text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]"
                      }`}
                    >
                      {currentStep.displayText}
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
                    {operation === "multiplication"
                      ? "🤔 What is the calculated product?"
                      : operation === "division"
                      ? "🤔 What is the calculated quotient?"
                      : "🤔 What is the calculated total sum?"}
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
                      placeholder="Your calculated answer..."
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
                        <span>Incorrect! Practice makes perfect.</span>
                      </span>
                    )}
                  </div>

                  {/* Calculation Details */}
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-left space-y-2 font-mono">
                    <div className="text-[11px] uppercase tracking-wider text-slate-300 font-sans font-bold flex items-center justify-between">
                      <span>Equation Breakdown:</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black">
                        {lastAttempt.operation.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base text-amber-200 font-bold break-words">
                      {lastAttempt.formula}
                    </div>
                    <div className="text-xs text-slate-300 font-sans pt-1 border-t border-white/10 flex items-center justify-between">
                      <span>Your Answer: <strong className="text-white">{lastAttempt.userAnswer}</strong></span>
                      <span>Correct Answer: <strong className="text-emerald-300">{lastAttempt.expectedAnswer}</strong></span>
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
                    {currentChallenge && (
                      <button
                        onClick={() => handleStartFlash(currentChallenge)}
                        className="py-3.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                        title="Try the exact same question again"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Replay Same Question</span>
                      </button>
                    )}
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

            {/* 1. Operation Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                1. Operation Mode:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { op: "add-sub", label: "Add / Sub", icon: "➕➖" },
                  { op: "multiplication", label: "Multiply (×)", icon: "✖️" },
                  { op: "division", label: "Divide (÷)", icon: "➗" },
                  { op: "mixed", label: "Mixed", icon: "🎲" },
                ].map((item) => (
                  <button
                    key={item.op}
                    type="button"
                    disabled={gameState === "flashing" || gameState === "countdown"}
                    onClick={() => {
                      setOperation(item.op as FlashOperation);
                      setGameState("idle");
                    }}
                    className={`py-2 px-2.5 rounded-xl text-left border transition cursor-pointer flex items-center gap-2 ${
                      operation === item.op
                        ? "bg-[#1D3557] text-white font-extrabold border-[#1D3557] shadow-xs"
                        : "bg-[#FFFBF0] text-stone-700 hover:bg-amber-50 border-amber-200"
                    }`}
                  >
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-xs font-black">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Digits Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                2. Number of Digits:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    d: 1,
                    label: "1 Digit",
                    sub: operation === "multiplication" ? "1D × 1D" : operation === "division" ? "2D ÷ 1D" : "1 - 9",
                  },
                  {
                    d: 2,
                    label: "2 Digits",
                    sub: operation === "multiplication" ? "2D × 1D" : operation === "division" ? "3D ÷ 1D" : "10 - 99",
                  },
                  {
                    d: 3,
                    label: "3 Digits",
                    sub: operation === "multiplication" ? "3D × 1D" : operation === "division" ? "3D ÷ 2D" : "100 - 999",
                  },
                ].map((item) => (
                  <button
                    key={item.d}
                    type="button"
                    disabled={gameState === "flashing" || gameState === "countdown"}
                    onClick={() => {
                      setDigits(item.d);
                      setGameState("idle");
                    }}
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

            {/* 3. Number Count (Shown for add-sub and mixed, or chain) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                3. Quantity of Numbers:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  operation === "multiplication" || operation === "division" ? 2 : 3,
                  operation === "multiplication" || operation === "division" ? 3 : 5,
                  8,
                  10,
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={gameState === "flashing" || gameState === "countdown"}
                    onClick={() => {
                      setCount(c);
                      setGameState("idle");
                    }}
                    className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                      count === c
                        ? "bg-[#1D3557] text-white border-[#1D3557] shadow-xs"
                        : "bg-[#FFFBF0] text-stone-700 hover:bg-amber-50 border-amber-200"
                    }`}
                  >
                    {c} Terms
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Flash Speed */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-600 uppercase tracking-wider">
                4. Speed Interval (per flash):
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

            {/* 5. Subtraction Toggle (only applicable for add-sub) */}
            {operation === "add-sub" && (
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
            )}
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
                        <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-amber-200/60 font-black">
                          {att.operation === "multiplication" ? "×" : att.operation === "division" ? "÷" : att.operation}
                        </span>
                        <span>
                          {att.digits}D ({att.speedMs / 1000}s)
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{att.timeStr} • {att.formula}</div>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <div>Ans: {att.userAnswer}</div>
                      <div className="text-[10px] text-stone-500">Correct: {att.expectedAnswer}</div>
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
