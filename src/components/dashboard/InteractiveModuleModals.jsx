"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, RotateCcw, Zap, Award, ChevronRight, Flame, Star, Gamepad2, Calculator, } from "lucide-react";
import Button from "@/components/ui/Button";
// 1. ABACUS MASTER INTERACTIVE COMPONENT
function AbacusMasterGame() {
    const [rods, setRods] = useState([
        { upper: 0, lower: 0, weight: 1000 },
        { upper: 0, lower: 0, weight: 100 },
        { upper: 0, lower: 0, weight: 10 },
        { upper: 0, lower: 0, weight: 1 },
    ]);
    const [targetNumber, setTargetNumber] = useState(25);
    const [message, setMessage] = useState("Slide the upper & lower beads to match the target number!");
    const [score, setScore] = useState(0);
    const calculateTotal = () => {
        return rods.reduce((acc, rod) => acc + (rod.upper * 5 + rod.lower) * rod.weight, 0);
    };
    const currentTotal = calculateTotal();
    const toggleUpper = (index) => {
        setRods((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], upper: next[index].upper === 1 ? 0 : 1 };
            return next;
        });
    };
    const setLowerCount = (index, count) => {
        setRods((prev) => {
            const next = [...prev];
            const newCount = next[index].lower === count ? count - 1 : count;
            next[index] = { ...next[index], lower: Math.max(0, newCount) };
            return next;
        });
    };
    const resetAbacus = () => {
        setRods([
            { upper: 0, lower: 0, weight: 1000 },
            { upper: 0, lower: 0, weight: 100 },
            { upper: 0, lower: 0, weight: 10 },
            { upper: 0, lower: 0, weight: 1 },
        ]);
    };
    const checkAnswer = () => {
        if (currentTotal === targetNumber) {
            setMessage(`🎉 Correct! You formed ${targetNumber} on the Abacus! +10 Beads Earned!`);
            setScore((s) => s + 10);
            setTimeout(() => {
                setTargetNumber(Math.floor(Math.random() * 85) + 12);
                resetAbacus();
                setMessage("Awesome job! Try this new target number!");
            }, 1500);
        }
        else {
            setMessage(`Current value is ${currentTotal}. Try again to reach ${targetNumber}!`);
        }
    };
    return (<div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Target Goal Number
          </span>
          <span className="text-3xl font-black text-emerald-700 font-heading">
            {targetNumber}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Current Value
          </span>
          <span className="text-3xl font-black text-slate-800 font-heading">
            {currentTotal}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200">
          <Award className="w-5 h-5 text-amber-500"/>
          <span className="text-sm font-extrabold text-slate-800">{score} Pts</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-slate-600 text-center bg-purple-50 p-2.5 rounded-xl border border-purple-200">
        {message}
      </p>

      {/* Interactive 4-Rod Abacus Frame */}
      <div className="bg-gradient-to-b from-amber-100 to-amber-200 p-5 rounded-3xl border-4 border-amber-800 shadow-2xl relative max-w-md mx-auto">
        <div className="bg-white/95 rounded-2xl p-4 border-2 border-amber-700 flex justify-around relative">
          {rods.map((rod, rIndex) => (<div key={rIndex} className="flex flex-col items-center relative w-16">
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-slate-300 rounded-full"/>

              {/* Upper Deck (Value = 5) */}
              <div className="h-16 flex flex-col justify-center items-center relative z-10">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => toggleUpper(rIndex)} className={`w-12 h-7 rounded-full shadow-md transition-transform duration-200 flex items-center justify-center font-bold text-xs ${rod.upper === 1
                ? "translate-y-3.5 bg-emerald-600 text-white shadow-emerald-400/50"
                : "-translate-y-2 bg-slate-800 text-slate-200"}`}>
                  5
                </motion.button>
              </div>

              {/* Middle Beam */}
              <div className="w-full h-2 bg-amber-800 rounded relative z-20 my-1 shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"/>
              </div>

              {/* Lower Deck (4 Beads of Value 1) */}
              <div className="h-32 flex flex-col justify-end gap-1 items-center relative z-10 py-1">
                {[1, 2, 3, 4].map((beadNum) => {
                const isActive = rod.lower >= beadNum;
                return (<motion.button key={beadNum} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setLowerCount(rIndex, beadNum)} className={`w-12 h-6 rounded-full shadow-sm transition-transform duration-150 flex items-center justify-center font-bold text-[11px] ${isActive
                        ? "-translate-y-2 bg-emerald-500 text-white shadow-emerald-300"
                        : "translate-y-1 bg-slate-700 text-slate-300"}`}>
                      1
                    </motion.button>);
            })}
              </div>

              <div className="mt-2 text-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  {rod.weight === 1000 ? "1000s" : rod.weight === 100 ? "100s" : rod.weight === 10 ? "10s" : "1s"}
                </span>
              </div>
            </div>))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={resetAbacus} icon={<RotateCcw className="w-4 h-4"/>}>
          Reset Beads
        </Button>
        <Button variant="primary" size="sm" fullWidth onClick={checkAnswer} icon={<CheckCircle2 className="w-4 h-4"/>}>
          Submit Answer ({currentTotal})
        </Button>
      </div>
    </div>);
}
// 2. SPELLBYTES INTERACTIVE COMPONENT
function SpellBytesGame() {
    const words = [
        { target: "FIVE", prompt: "Spell the number for 5 beads in upper deck", clue: "Number 5" },
        { target: "ABACUS", prompt: "Spell the ancient calculating tool", clue: "Math Frame" },
        { target: "SEVEN", prompt: "Spell the sum of 5 + 2", clue: "5 + 2 = ?" },
        { target: "TWELVE", prompt: "Spell the sum of 10 + 2", clue: "10 + 2 = ?" },
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [typedLetters, setTypedLetters] = useState([]);
    const [score, setScore] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const currentWord = words[currentIndex];
    const handleAddLetter = (letter) => {
        if (typedLetters.length < currentWord.target.length) {
            const next = [...typedLetters, letter];
            setTypedLetters(next);
            if (next.join("") === currentWord.target) {
                setIsSuccess(true);
                setScore((s) => s + 20);
            }
        }
    };
    const handleBackspace = () => {
        setTypedLetters((prev) => prev.slice(0, -1));
        setIsSuccess(false);
    };
    const handleNextWord = () => {
        setIsSuccess(false);
        setTypedLetters([]);
        setCurrentIndex((i) => (i + 1) % words.length);
    };
    return (<div className="space-y-6 text-center">
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
        <div className="text-left">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">
            Question {currentIndex + 1} of {words.length}
          </span>
          <h4 className="text-base font-extrabold text-slate-800 font-heading">
            {currentWord.prompt}
          </h4>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-amber-200 font-black text-amber-700 text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500"/>
          <span>{score} Pts</span>
        </div>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 py-4">
        {currentWord.target.split("").map((_, i) => {
            const letter = typedLetters[i] || "";
            return (<motion.div key={i} whileHover={{ scale: 1.05 }} className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-md transition-all ${letter
                    ? "bg-amber-500 text-white border-amber-600 shadow-amber-200"
                    : "bg-slate-50 text-slate-400 border-dashed border-slate-300"}`}>
              {letter}
            </motion.div>);
        })}
      </div>

      {isSuccess ? (<motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-emerald-100 rounded-2xl border border-emerald-300 text-emerald-800 font-bold text-sm space-y-2">
          <p>🌟 Brilliant Spelling! You got it right! +20 Points!</p>
          <Button variant="primary" size="sm" onClick={handleNextWord} icon={<ChevronRight className="w-4 h-4"/>}>
            Next SpellByte Challenge
          </Button>
        </motion.div>) : (<div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500">Tap letter cubes to build word:</span>
            <button onClick={handleBackspace} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">
              Delete Letter ⌫
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
            {"A,B,C,D,E,F,G,I,L,M,N,O,R,S,T,U,V,W,Y".split(",").map((char) => (<motion.button key={char} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => handleAddLetter(char)} className="w-8 h-9 sm:w-9 sm:h-10 rounded-xl bg-gradient-to-b from-white to-slate-100 border border-slate-300 font-black text-slate-800 shadow-sm hover:border-amber-400 hover:bg-amber-50 text-sm transition cursor-pointer">
                {char}
              </motion.button>))}
          </div>
        </div>)}
    </div>);
}
// 3. WIZYPUZZLE INTERACTIVE COMPONENT
function WizyPuzzleGame() {
    const [grid, setGrid] = useState([
        { id: 1, val: "🔴", color: "bg-rose-100" },
        { id: 2, val: "🟢", color: "bg-emerald-100" },
        { id: 3, val: "🟡", color: "bg-amber-100" },
        { id: 4, val: "🟣", color: "bg-purple-100" },
        { id: 5, val: "⭐", color: "bg-yellow-200" },
        { id: 6, val: "🟢", color: "bg-emerald-100" },
        { id: 7, val: "🟣", color: "bg-purple-100" },
        { id: 8, val: "🔴", color: "bg-rose-100" },
        { id: 9, val: "🧮", color: "bg-indigo-100" },
    ]);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [moves, setMoves] = useState(0);
    const [solved, setSolved] = useState(false);
    const swapTiles = (index) => {
        if (selectedIdx === null) {
            setSelectedIdx(index);
        }
        else {
            const nextGrid = [...grid];
            const temp = nextGrid[selectedIdx];
            nextGrid[selectedIdx] = nextGrid[index];
            nextGrid[index] = temp;
            setGrid(nextGrid);
            setSelectedIdx(null);
            setMoves((m) => m + 1);
            if (nextGrid[4].val === "⭐") {
                setSolved(true);
            }
        }
    };
    const shuffleGrid = () => {
        const shuffled = [...grid].sort(() => Math.random() - 0.5);
        setGrid(shuffled);
        setMoves(0);
        setSolved(false);
        setSelectedIdx(null);
    };
    return (<div className="space-y-6 text-center">
      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest block">
            Objective
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800">
            Swap puzzle tiles to place the Golden Star ⭐ in the Center!
          </p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-xl border border-rose-200 font-bold text-xs text-rose-700">
          Moves: {moves}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto p-4 bg-slate-900 rounded-3xl border-4 border-rose-400 shadow-2xl">
        {grid.map((tile, idx) => (<motion.button key={tile.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => swapTiles(idx)} className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-md transition-all cursor-pointer ${tile.color} ${selectedIdx === idx ? "ring-4 ring-rose-500 scale-105" : ""}`}>
            {tile.val}
          </motion.button>))}
      </div>

      {solved ? (<div className="p-4 bg-emerald-100 rounded-2xl border border-emerald-300 text-emerald-800 font-bold text-sm">
          🏆 WizyPuzzle Mastered in {moves} moves! You won 50 BrainGym Gems!
        </div>) : (<div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={shuffleGrid} icon={<RotateCcw className="w-4 h-4"/>}>
            Shuffle Puzzle
          </Button>
        </div>)}
    </div>);
}
// 4. QUIZQUEST INTERACTIVE COMPONENT
function QuizQuestGame() {
    const questions = [
        { q: "4 + 5 - 2 = ?", options: [7, 8, 9, 6], ans: 7 },
        { q: "12 + 15 = ?", options: [25, 27, 28, 26], ans: 27 },
        { q: "50 - 15 + 5 = ?", options: [35, 45, 40, 30], ans: 40 },
        { q: "9 + 9 + 9 = ?", options: [27, 26, 28, 29], ans: 27 },
    ];
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isGameOver, setIsGameOver] = useState(false);
    useEffect(() => {
        if (timeLeft > 0 && !isGameOver) {
            const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
            return () => clearInterval(timer);
        }
        else if (timeLeft === 0) {
            setIsGameOver(true);
        }
    }, [timeLeft, isGameOver]);
    const handleAnswer = (val) => {
        const current = questions[qIndex];
        if (val === current.ans) {
            setScore((s) => s + 25 * (streak + 1));
            setStreak((st) => st + 1);
            setFeedback("🔥 Correct! Speed bonus added!");
        }
        else {
            setStreak(0);
            setFeedback(`❌ Oops! The correct answer was ${current.ans}`);
        }
        setTimeout(() => {
            setFeedback(null);
            if (qIndex < questions.length - 1) {
                setQIndex((i) => i + 1);
            }
            else {
                setIsGameOver(true);
            }
        }, 800);
    };
    const restartQuiz = () => {
        setQIndex(0);
        setScore(0);
        setStreak(0);
        setTimeLeft(30);
        setIsGameOver(false);
        setFeedback(null);
    };
    return (<div className="space-y-6 text-center">
      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500 fill-rose-500"/>
          <span className="text-xs font-black text-purple-900">
            Streak x{streak + 1}
          </span>
        </div>

        <div className="font-extrabold text-base text-purple-700 font-heading">
          ⏱️ {timeLeft}s
        </div>

        <div className="bg-white px-3 py-1 rounded-xl border border-purple-200 font-black text-purple-900 text-xs">
          Score: {score}
        </div>
      </div>

      {isGameOver ? (<div className="p-6 bg-slate-900 text-white rounded-3xl border-4 border-purple-400 space-y-4">
          <div className="text-4xl">🏆</div>
          <h4 className="text-2xl font-black font-heading text-amber-300">
            QuizQuest Round Complete!
          </h4>
          <p className="text-sm text-slate-300">
            You scored <strong className="text-white text-lg">{score} Points</strong> with a peak streak of {streak}!
          </p>
          <Button variant="secondary" size="md" onClick={restartQuiz} icon={<RotateCcw className="w-4 h-4"/>}>
            Play Again
          </Button>
        </div>) : (<div className="space-y-6">
          <div className="py-6 px-4 bg-white rounded-3xl border-2 border-slate-200 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Question {qIndex + 1} of {questions.length}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-800 font-heading">
              {questions[qIndex].q}
            </h3>
          </div>

          {feedback && (<p className="text-xs font-bold text-purple-700 animate-bounce">
              {feedback}
            </p>)}

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {questions[qIndex].options.map((opt) => (<motion.button key={opt} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(opt)} className="py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-600 hover:bg-purple-600 hover:text-white text-slate-800 font-black text-xl shadow-md transition-all cursor-pointer font-heading">
                {opt}
              </motion.button>))}
          </div>
        </div>)}
    </div>);
}
export default function InteractiveModuleModal({ isOpen, onClose, type }) {
    const [learningTab, setLearningTab] = useState("abacus");
    const [brainTab, setBrainTab] = useState("quiz");
    if (!isOpen || !type)
        return null;
    const isLearning = type === "learning";
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-2xl bg-white rounded-[36px] p-6 sm:p-8 border-4 border-slate-200 shadow-2xl relative my-8">
          {/* Close button */}
          <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer z-20">
            <X className="w-5 h-5"/>
          </button>

          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{isLearning ? "📚" : "🎮"}</span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-slate-800">
                  {isLearning ? (<>
                      <span style={{ color: "#D4A017" }}>Learning</span>
                      <span style={{ color: "#111827" }}>Hub</span>
                    </>) : (<>
                      <span style={{ color: "#9B2335" }}>BrainGym</span>
                      <span style={{ color: "#111827" }}>Games</span>
                    </>)}
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {isLearning ? "Interactive Abacus Lessons & Spelling Bytes" : "Speed Drills, Puzzles & Timed Battles"}
                </span>
              </div>
            </div>

            {/* Inner Sub-Navigation Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
              {isLearning ? (<>
                  <button onClick={() => setLearningTab("abacus")} className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${learningTab === "abacus"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"}`}>
                    <Calculator className="w-3.5 h-3.5"/>
                    Abacus Master
                  </button>
                  <button onClick={() => setLearningTab("spell")} className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${learningTab === "spell"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"}`}>
                    <Star className="w-3.5 h-3.5"/>
                    SpellBytes
                  </button>
                </>) : (<>
                  <button onClick={() => setBrainTab("quiz")} className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${brainTab === "quiz"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"}`}>
                    <Zap className="w-3.5 h-3.5"/>
                    QuizQuest
                  </button>
                  <button onClick={() => setBrainTab("puzzle")} className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${brainTab === "puzzle"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"}`}>
                    <Gamepad2 className="w-3.5 h-3.5"/>
                    WizyPuzzle
                  </button>
                </>)}
            </div>
          </div>

          {/* Modal Interactive Content */}
          <div className="py-2">
            {isLearning && (<>
                {learningTab === "abacus" && <AbacusMasterGame />}
                {learningTab === "spell" && <SpellBytesGame />}
              </>)}

            {!isLearning && (<>
                {brainTab === "quiz" && <QuizQuestGame />}
                {brainTab === "puzzle" && <WizyPuzzleGame />}
              </>)}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);
}
