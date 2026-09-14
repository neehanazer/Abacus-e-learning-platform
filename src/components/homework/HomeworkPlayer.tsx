"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Send,
  HelpCircle,
  Sparkles,
  BookOpen,
  LogOut,
} from "lucide-react";
import { useHomework } from "@/context/HomeworkContext";
import AbacusRodDisplay from "@/components/practice/AbacusRodDisplay";

export const HomeworkPlayer: React.FC = () => {
  const {
    activeHomework,
    activeQuestionIndex,
    userAnswers,
    timerSeconds,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    openSubmitModal,
    backToDashboard,
  } = useHomework();

  const [inputVal, setInputVal] = useState<string>("");
  const [showRuleTip, setShowRuleTip] = useState<boolean>(false);

  const currentQuestion = activeHomework?.questions[activeQuestionIndex];
  const totalQuestions = activeHomework?.questions.length || 10;

  // Sync input value when active question changes
  useEffect(() => {
    if (currentQuestion) {
      const existing = userAnswers[currentQuestion.id];
      setInputVal(existing !== null && existing !== undefined ? String(existing) : "");
      setShowRuleTip(false);
    }
  }, [activeQuestionIndex, currentQuestion, userAnswers]);

  // Keypad Handlers
  const handleKeypadPress = useCallback(
    (numStr: string) => {
      if (!currentQuestion || inputVal.length >= 5) return;
      const nextVal = inputVal + numStr;
      setInputVal(nextVal);
      const parsed = parseInt(nextVal, 10);
      if (!isNaN(parsed)) {
        answerQuestion(currentQuestion.id, parsed);
      }
    },
    [currentQuestion, inputVal, answerQuestion]
  );

  const handleBackspace = useCallback(() => {
    if (!currentQuestion) return;
    const nextVal = inputVal.slice(0, -1);
    setInputVal(nextVal);
    if (nextVal === "") {
      answerQuestion(currentQuestion.id, null);
    } else {
      const parsed = parseInt(nextVal, 10);
      if (!isNaN(parsed)) {
        answerQuestion(currentQuestion.id, parsed);
      }
    }
  }, [currentQuestion, inputVal, answerQuestion]);

  const handleClear = useCallback(() => {
    if (!currentQuestion) return;
    setInputVal("");
    answerQuestion(currentQuestion.id, null);
  }, [currentQuestion, answerQuestion]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeypadPress(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        if (activeQuestionIndex < totalQuestions - 1) {
          nextQuestion();
        } else {
          openSubmitModal();
        }
      } else if (e.key === "ArrowRight") {
        if (activeQuestionIndex < totalQuestions - 1) nextQuestion();
      } else if (e.key === "ArrowLeft") {
        if (activeQuestionIndex > 0) prevQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleKeypadPress,
    handleBackspace,
    activeQuestionIndex,
    totalQuestions,
    nextQuestion,
    prevQuestion,
    openSubmitModal,
  ]);

  if (!activeHomework || !currentQuestion) return null;

  const currentAnswer = userAnswers[currentQuestion.id];
  const progressPercent = Math.round(((activeQuestionIndex + 1) / totalQuestions) * 100);

  // Timer formatting (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const isLastQuestion = activeQuestionIndex === totalQuestions - 1;

  const handleOptionSelect = (opt: number) => {
    setInputVal(String(opt));
    answerQuestion(currentQuestion.id, opt);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & TIMER BAR */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#E9C46A] shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Left: Homework Task Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={backToDashboard}
            className="w-10 h-10 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#1D3557] flex items-center justify-center font-extrabold text-sm transition-transform hover:scale-105"
            title="Save and return to dashboard"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Homework #{activeHomework.homeworkNumber}
              </span>
              <span className="text-[10px] font-bold text-stone-500">
                Level {activeHomework.level}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#1D3557] font-heading line-clamp-1">
              {activeHomework.title}
            </h2>
          </div>
        </div>

        {/* Middle: Live Timer */}
        <div className="flex items-center gap-2 bg-[#FFFBF0] px-4 py-2 rounded-2xl border border-amber-200 shadow-inner">
          <Clock className="w-4 h-4 text-[#F4A261] animate-spin-slow" />
          <span className="font-mono text-base sm:text-lg font-black text-[#1D3557]">
            {formatTime(timerSeconds)}
          </span>
        </div>

        {/* Right: Submit Button Shortcut */}
        <button
          onClick={openSubmitModal}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black shadow-md transition-all hover:scale-105 border-b-2 border-emerald-700"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Homework</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. PROGRESS BAR & QUESTION JUMPER GRID (1 TO 10) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-black text-[#1D3557]">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F4A261] to-[#E9C46A] text-white flex items-center justify-center text-xs font-black shadow-sm">
              {activeQuestionIndex + 1}
            </span>
            <span>
              Question {activeQuestionIndex + 1} of {totalQuestions}
            </span>
          </span>
          <span className="text-orange-600 font-black">{progressPercent}% Done</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 bg-amber-50 rounded-full overflow-hidden p-0.5 border border-amber-200">
          <motion.div
            className="h-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 1 to 10 Question Jumper */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {activeHomework.questions.map((q, idx) => {
            const isCurrent = idx === activeQuestionIndex;
            const isAnswered =
              userAnswers[q.id] !== null && userAnswers[q.id] !== undefined;

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center border-2 ${
                  isCurrent
                    ? "bg-[#1D3557] text-white border-[#1D3557] scale-110 shadow-md"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                    : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                }`}
                title={`Jump to Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN QUESTION CARD */}
      {/* ============================================================ */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-4 border-[#E9C46A] shadow-xl relative overflow-hidden"
      >
        {/* Question Header & Rule Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
              {currentQuestion.category}
            </span>
            <span className="text-xs font-bold text-stone-500">
              {currentQuestion.digits}-Digit • {currentQuestion.rowCount} Rows
            </span>
          </div>

          {currentQuestion.ruleHint && (
            <button
              onClick={() => setShowRuleTip((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3.5 py-1.5 rounded-full border border-orange-200 transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{showRuleTip ? "Hide Rule Tip" : "Show Rule Tip 💡"}</span>
            </button>
          )}
        </div>

        {/* Expandable Rule Tip Banner */}
        <AnimatePresence>
          {showRuleTip && currentQuestion.ruleHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 mb-6 flex items-start gap-3"
            >
              <div className="text-2xl">🧙‍♂️</div>
              <div>
                <span className="text-xs font-black text-amber-900 block">
                  Sensei's Abacus Rule Hint:
                </span>
                <p className="text-sm font-bold text-amber-800 mt-0.5">
                  {currentQuestion.ruleHint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* QUESTION DISPLAY AREA: Vertical Column / Bead Representation */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-2">
          {/* Left / Middle: Problem Column (6 cols) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            {currentQuestion.questionType === "bead-representation" ? (
              /* Bead Recognition Diagram */
              <div className="space-y-4 text-center">
                <span className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider block">
                  What number is represented on this Soroban rod?
                </span>
                <AbacusRodDisplay
                  value={currentQuestion.beadValue ?? currentQuestion.targetAnswer}
                  digits={currentQuestion.digits}
                  size="lg"
                />
              </div>
            ) : currentQuestion.questionType === "multiplication" ||
              currentQuestion.questionType === "division" ? (
              /* Multiplication / Division Card */
              <div className="bg-[#FFFBF0] rounded-3xl p-6 sm:p-8 border-4 border-[#E9C46A] shadow-inner min-w-[260px] text-center space-y-4">
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest block">
                  {currentQuestion.questionType === "multiplication"
                    ? "Abacus Multiplication"
                    : "Abacus Division"}
                </span>

                <div className="flex items-center justify-center gap-3 font-mono font-black text-3xl sm:text-5xl text-[#1D3557]">
                  {currentQuestion.questionType === "multiplication" ? (
                    <>
                      <span>{currentQuestion.factorA ?? currentQuestion.numbers[0]}</span>
                      <span className="text-orange-500 font-sans">×</span>
                      <span>{currentQuestion.factorB ?? currentQuestion.numbers[1]}</span>
                    </>
                  ) : (
                    <>
                      <span>{currentQuestion.dividend ?? currentQuestion.numbers[0]}</span>
                      <span className="text-sky-500 font-sans">÷</span>
                      <span>{currentQuestion.divisor ?? currentQuestion.numbers[1]}</span>
                    </>
                  )}
                  <span className="text-stone-400">=</span>
                </div>

                <div className="pt-2 flex justify-center">
                  <div className="min-w-[120px] h-14 bg-white rounded-2xl border-2 border-amber-300 shadow-sm px-4 flex items-center justify-center font-mono text-3xl font-black text-[#1D3557]">
                    {inputVal ? (
                      inputVal
                    ) : (
                      <span className="text-stone-300 animate-pulse">?</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Traditional Vertical Abacus Math Column (3 to 30 rows) */
              <div className="bg-[#FFFBF0] rounded-3xl p-6 sm:p-8 border-4 border-[#E9C46A] shadow-inner min-w-[220px] max-w-[280px] max-h-[380px] overflow-y-auto">
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest block text-center mb-3">
                  Soroban Column ({currentQuestion.rowCount} Rows)
                </span>

                {/* Vertical Math Numbers */}
                <div className="space-y-1.5 text-right font-mono font-black text-2xl sm:text-3xl text-[#1D3557] pr-4">
                  {currentQuestion.numbers.map((num, idx) => {
                    const isFirst = idx === 0;
                    const isNeg = num < 0;
                    const displayNum = Math.abs(num);

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-b border-amber-200/60 pb-0.5"
                      >
                        <span className="text-xl font-sans text-orange-500 select-none">
                          {isFirst ? "" : isNeg ? "−" : "+"}
                        </span>
                        <span className={isNeg ? "text-rose-600" : "text-[#1D3557]"}>
                          {displayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reckoning Underline Bar */}
                <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-full my-3" />

                {/* Input Answer Display Box in column */}
                <div className="text-right pr-4">
                  <div className="inline-block min-w-[90px] h-12 sm:h-14 bg-white rounded-2xl border-2 border-amber-300 shadow-sm px-3 flex items-center justify-end font-mono text-2xl sm:text-3xl font-black text-[#1D3557]">
                    {inputVal ? (
                      inputVal
                    ) : (
                      <span className="text-stone-300 animate-pulse">?</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Input Keypad or Multiple Choice Options (6 cols) */}
          <div className="md:col-span-6 space-y-5">
            {currentQuestion.questionType === "multiple-choice" ||
            currentQuestion.questionType === "bead-representation" ? (
              /* Multiple Choice Option Buttons */
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider block">
                  Select the correct answer:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(currentQuestion.options || [1, 2, 3, 4]).map((opt) => {
                    const isSelected = currentAnswer === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect(opt)}
                        className={`p-5 rounded-3xl font-mono text-2xl font-black transition-all duration-200 flex items-center justify-center shadow-md cursor-pointer border-3 ${
                          isSelected
                            ? "bg-[#1D3557] text-white border-[#1D3557] shadow-lg scale-105"
                            : "bg-white text-[#1D3557] border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Big Kid-Friendly Numpad */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-1">
                  <span>Enter on Abacus Keypad:</span>
                  <span className="text-[11px] text-stone-400">or use Keyboard digits</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-stone-50 p-3 sm:p-4 rounded-3xl border-2 border-amber-200/70">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                    <motion.button
                      key={digit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeypadPress(digit)}
                      className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-amber-50 text-[#1D3557] border-2 border-stone-200 hover:border-amber-300 font-mono text-2xl font-black shadow-sm flex items-center justify-center transition-all cursor-pointer"
                    >
                      {digit}
                    </motion.button>
                  ))}

                  {/* Bottom row: Clear, 0, Backspace */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="h-13 sm:h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 font-bold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
                    title="Clear input"
                  >
                    Clear
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadPress("0")}
                    className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-amber-50 text-[#1D3557] border-2 border-stone-200 hover:border-amber-300 font-mono text-2xl font-black shadow-sm flex items-center justify-center transition-all cursor-pointer"
                  >
                    0
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackspace}
                    className="h-13 sm:h-14 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-200 font-bold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
                    title="Backspace"
                  >
                    ⌫
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. BOTTOM NAVIGATION BUTTONS */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-amber-100">
          <button
            onClick={prevQuestion}
            disabled={activeQuestionIndex === 0}
            className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${
              activeQuestionIndex === 0
                ? "opacity-40 cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-white hover:bg-amber-50 text-[#1D3557] border-2 border-stone-200 shadow-sm"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {isLastQuestion ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openSubmitModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-lg flex items-center gap-2 border-b-4 border-emerald-700"
            >
              <span>Finish & Submit</span>
              <Send className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={nextQuestion}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black text-base shadow-lg flex items-center gap-2 border-b-4 border-[#C85A3D]"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
