"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Pause, Play, RotateCcw, ArrowRight, ArrowLeft, Lightbulb, Award, Star, Send, Layers, } from "lucide-react";
import { usePractice } from "@/context/PracticeContext";
import AbacusRodDisplay from "./AbacusRodDisplay";
export default function WorksheetPlayer() {
    const { worksheetTitle, questions, currentQuestionIndex, currentQuestion, userAnswers, isSubmitted, timerSeconds, isTimerRunning, toggleTimer, score, totalQuestions, answerQuestion, submitCurrentQuestion, nextQuestion, prevQuestion, goToQuestion, submitWorksheet, backToDashboard, generateNewRandomWorksheet, } = usePractice();
    const [inputVal, setInputVal] = useState("");
    const [showRuleTip, setShowRuleTip] = useState(false);
    // Sync input box when question changes
    useEffect(() => {
        if (currentQuestion) {
            const existing = userAnswers[currentQuestion.id];
            setInputVal(existing !== null && existing !== undefined ? String(existing) : "");
            setShowRuleTip(false);
        }
    }, [currentQuestionIndex, currentQuestion, userAnswers]);
    const handleKeypadPress = React.useCallback((numStr) => {
        if (!currentQuestion || inputVal.length >= 4)
            return;
        const nextVal = inputVal + numStr;
        setInputVal(nextVal);
        const parsed = parseInt(nextVal, 10);
        if (!isNaN(parsed)) {
            answerQuestion(currentQuestion.id, parsed);
        }
    }, [currentQuestion, inputVal, answerQuestion]);
    const handleBackspace = React.useCallback(() => {
        if (!currentQuestion)
            return;
        const nextVal = inputVal.slice(0, -1);
        setInputVal(nextVal);
        if (nextVal === "") {
            answerQuestion(currentQuestion.id, null);
        }
        else {
            const parsed = parseInt(nextVal, 10);
            if (!isNaN(parsed)) {
                answerQuestion(currentQuestion.id, parsed);
            }
        }
    }, [currentQuestion, inputVal, answerQuestion]);
    const handleClear = () => {
        if (!currentQuestion)
            return;
        setInputVal("");
        answerQuestion(currentQuestion.id, null);
    };
    const handleSubmitAnswer = React.useCallback(() => {
        if (!currentQuestion)
            return;
        if (inputVal.trim() !== "") {
            const parsed = parseInt(inputVal, 10);
            if (!isNaN(parsed)) {
                answerQuestion(currentQuestion.id, parsed);
                submitCurrentQuestion(currentQuestion.id);
            }
        }
    }, [currentQuestion, inputVal, answerQuestion, submitCurrentQuestion]);
    // Handle keyboard inputs
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key >= "0" && e.key <= "9") {
                handleKeypadPress(e.key);
            }
            else if (e.key === "Backspace") {
                handleBackspace();
            }
            else if (e.key === "Enter") {
                handleSubmitAnswer();
            }
            else if (e.key === "ArrowRight") {
                if (currentQuestionIndex < totalQuestions - 1)
                    nextQuestion();
            }
            else if (e.key === "ArrowLeft") {
                if (currentQuestionIndex > 0)
                    prevQuestion();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeypadPress, handleBackspace, handleSubmitAnswer, currentQuestionIndex, totalQuestions, nextQuestion, prevQuestion]);
    if (!currentQuestion)
        return null;
    const currentAnswer = userAnswers[currentQuestion.id];
    const hasSubmitted = isSubmitted[currentQuestion.id] || (currentAnswer !== null && currentAnswer !== undefined);
    const isCorrect = currentAnswer !== null && currentAnswer !== undefined ? currentAnswer === currentQuestion.targetAnswer : false;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
    // Timer formatting (MM:SS)
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remaining = secs % 60;
        return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
    };
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const handleOptionSelect = (opt) => {
        setInputVal(String(opt));
        answerQuestion(currentQuestion.id, opt);
        submitCurrentQuestion(currentQuestion.id);
    };
    return (<div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & TIMER BAR */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-yellow-200 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Left: Worksheet Info */}
        <div className="flex items-center gap-3">
          <button onClick={backToDashboard} className="w-9 h-9 rounded-2xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-[#1D3557] flex items-center justify-center font-extrabold text-sm transition-transform hover:scale-105" title="Back to practice dashboard">
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div>
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider block">
              Level {currentQuestion.level} Worksheet
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1D3557] font-heading line-clamp-1">
              {worksheetTitle}
            </h2>
          </div>
        </div>

        {/* Middle: Live Timer */}
        <div className="flex items-center gap-2 bg-[#FFFBF0] px-4 py-2 rounded-2xl border border-yellow-200">
          <Clock className="w-4 h-4 text-[#F4A261]"/>
          <span className="font-mono text-base sm:text-lg font-black text-[#1D3557]">
            {formatTime(timerSeconds)}
          </span>
          <button onClick={toggleTimer} className="p-1 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-[#1D3557] transition-colors" title={isTimerRunning ? "Pause Timer" : "Resume Timer"}>
            {isTimerRunning ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5"/>}
          </button>
        </div>

        {/* Right: Score Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500"/>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-900">
              Score: {score}/{totalQuestions}
            </span>
          </div>

          <button onClick={generateNewRandomWorksheet} className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition-all hover:scale-105" title="Load fresh randomized 20 questions">
            <RotateCcw className="w-3.5 h-3.5"/>
            <span className="hidden sm:inline">New Random 20</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROGRESS BAR & QUESTION COUNTER */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-[#1D3557]">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F4A261] to-[#E9C46A] text-white flex items-center justify-center text-xs font-black shadow-sm">
              {currentQuestionIndex + 1}
            </span>
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </span>
          <span className="text-orange-600 font-black">{progressPercent}% Completed</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-3 bg-yellow-100 rounded-full overflow-hidden p-0.5 border border-yellow-200 shadow-inner">
          <motion.div className="h-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }}/>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN QUESTION CARD */}
      {/* ============================================================ */}
      <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-4 border-yellow-200 shadow-xl relative overflow-hidden">
        {/* Question Header & Rule Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-200 uppercase tracking-wider">
              {currentQuestion.category}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {currentQuestion.digits}-Digit • {currentQuestion.rowCount} Rows
            </span>
          </div>

          {currentQuestion.ruleHint && (<button onClick={() => setShowRuleTip((prev) => !prev)} className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full border border-orange-200 transition-colors">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400"/>
              <span>{showRuleTip ? "Hide Rule Tip" : "Show Rule Tip 💡"}</span>
            </button>)}
        </div>

        {/* Expandable Rule Tip Banner */}
        <AnimatePresence>
          {showRuleTip && currentQuestion.ruleHint && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 mb-6 flex items-start gap-3">
              <div className="text-xl">🧙‍♂️</div>
              <div>
                <span className="text-xs font-extrabold text-amber-900 block">
                  Sensei's Abacus Rule Secret:
                </span>
                <p className="text-sm font-bold text-amber-800 mt-0.5">
                  {currentQuestion.ruleHint}
                </p>
              </div>
            </motion.div>)}
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
                <AbacusRodDisplay value={currentQuestion.beadValue ?? currentQuestion.targetAnswer} digits={currentQuestion.digits} size="lg"/>
              </div>) : currentQuestion.questionType === "multiplication" || currentQuestion.questionType === "division" ? (
        /* Multiplication / Division Card */
        <div className="bg-[#FFFBF0] rounded-3xl p-6 sm:p-8 border-4 border-yellow-200 shadow-inner min-w-[260px] text-center space-y-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                  {currentQuestion.questionType === "multiplication" ? "Abacus Multiplication" : "Abacus Division"}
                </span>

                <div className="flex items-center justify-center gap-3 font-mono font-black text-3xl sm:text-5xl text-[#1D3557]">
                  {currentQuestion.questionType === "multiplication" ? (<>
                      <span>{currentQuestion.factorA ?? currentQuestion.numbers[0]}</span>
                      <span className="text-orange-500 font-sans">×</span>
                      <span>{currentQuestion.factorB ?? currentQuestion.numbers[1]}</span>
                    </>) : (<>
                      <span>{currentQuestion.dividend ?? currentQuestion.numbers[0]}</span>
                      <span className="text-sky-500 font-sans">÷</span>
                      <span>{currentQuestion.divisor ?? currentQuestion.numbers[1]}</span>
                    </>)}
                  <span className="text-slate-400">=</span>
                </div>

                <div className="pt-2 flex justify-center">
                  <div className="min-w-[120px] h-14 bg-white rounded-2xl border-2 border-yellow-300 shadow-sm px-4 flex items-center justify-center font-mono text-3xl font-black text-[#1D3557]">
                    {inputVal ? (inputVal) : (<span className="text-slate-300 animate-pulse">?</span>)}
                  </div>
                </div>
              </div>) : (
        /* Traditional Vertical Abacus Math Column (3 to 30 rows) */
        <div className="bg-[#FFFBF0] rounded-3xl p-6 sm:p-8 border-4 border-yellow-200 shadow-inner min-w-[220px] max-w-[280px] max-h-[380px] overflow-y-auto">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block text-center mb-3">
                  Soroban Column ({currentQuestion.rowCount} Rows)
                </span>

                {/* Vertical Math Numbers */}
                <div className="space-y-1.5 text-right font-mono font-black text-2xl sm:text-3xl text-[#1D3557] pr-4">
                  {currentQuestion.numbers.map((num, idx) => {
                const isFirst = idx === 0;
                const isNeg = num < 0;
                const displayNum = Math.abs(num);
                return (<div key={idx} className="flex items-center justify-between border-b border-yellow-200/50 pb-0.5">
                        <span className="text-xl font-sans text-orange-500 select-none">
                          {isFirst ? "" : isNeg ? "−" : "+"}
                        </span>
                        <span className={isNeg ? "text-rose-600" : "text-[#1D3557]"}>
                          {displayNum}
                        </span>
                      </div>);
            })}
                </div>

                {/* Reckoning Underline Bar */}
                <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-full my-3"/>

                {/* Input Answer Display Box in column */}
                <div className="text-right pr-4">
                  <div className="inline-block min-w-[90px] h-12 sm:h-14 bg-white rounded-2xl border-2 border-yellow-300 shadow-sm px-3 flex items-center justify-end font-mono text-2xl sm:text-3xl font-black text-[#1D3557]">
                    {inputVal ? (inputVal) : (<span className="text-slate-300 animate-pulse">?</span>)}
                  </div>
                </div>
              </div>)}
          </div>

          {/* Right: Input Keypad or Multiple Choice Options (6 cols) */}
          <div className="md:col-span-6 space-y-5">
            {currentQuestion.questionType === "multiple-choice" ||
            currentQuestion.questionType === "bead-representation" ? (
        /* Multiple Choice Option Buttons */
        <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                  Select the correct answer:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(currentQuestion.options || [1, 2, 3, 4]).map((opt) => {
                const isSelected = currentAnswer === opt;
                return (<button key={opt} onClick={() => handleOptionSelect(opt)} className={`p-5 rounded-3xl font-mono text-2xl font-black transition-all duration-200 flex items-center justify-center shadow-md cursor-pointer border-3 ${isSelected
                        ? "bg-gradient-to-tr from-[#F4A261] to-[#E76F51] text-white border-white scale-105 shadow-orange-300"
                        : "bg-[#FFFBF0] text-[#1D3557] border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50"}`}>
                        {opt}
                      </button>);
            })}
                </div>
              </div>) : (
        /* Kid-Friendly Onscreen Keypad */
        <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Enter Answer (Keypad / Keyboard):
                  </span>
                  {inputVal && (<button onClick={handleClear} className="text-xs font-bold text-rose-500 hover:text-rose-700 underline">
                      Clear
                    </button>)}
                </div>

                {/* 3x4 Kid Numpad Grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#FFFBF0] p-3 rounded-3xl border-2 border-yellow-200">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (<button key={num} onClick={() => handleKeypadPress(num)} className="h-12 sm:h-14 rounded-2xl bg-white hover:bg-yellow-50 border-2 border-yellow-200 hover:border-yellow-300 text-xl sm:text-2xl font-mono font-black text-[#1D3557] shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                      {num}
                    </button>))}

                  <button onClick={handleBackspace} className="h-12 sm:h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-700 text-sm font-extrabold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                    ⌫
                  </button>

                  <button onClick={() => handleKeypadPress("0")} className="h-12 sm:h-14 rounded-2xl bg-white hover:bg-yellow-50 border-2 border-yellow-200 hover:border-yellow-300 text-xl sm:text-2xl font-mono font-black text-[#1D3557] shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                    0
                  </button>

                  <button onClick={handleSubmitAnswer} className="h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white text-xs sm:text-sm font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer">
                    <Send className="w-3.5 h-3.5"/>
                    <span>OK</span>
                  </button>
                </div>
              </div>)}

            {/* Instant Feedback Notice */}
            <AnimatePresence>
              {hasSubmitted && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"}`}>
                  <div className="flex items-center gap-2.5">
                    {isCorrect ? (<CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0"/>) : (<XCircle className="w-5 h-5 text-rose-600 flex-shrink-0"/>)}
                    <div>
                      <span className="text-sm font-extrabold block">
                        {isCorrect ? "✓ Correct! Awesome Job!" : "Try Again! Keep Going!"}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {isCorrect
                ? currentQuestion.explanation
                : `Correct answer is ${currentQuestion.targetAnswer}. ${currentQuestion.explanation}`}
                      </span>
                    </div>
                  </div>

                  {isCorrect && (<span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0">
                      +10 ⭐
                    </span>)}
                </motion.div>)}
            </AnimatePresence>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. QUESTION NAVIGATION BUTTONS */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-yellow-100">
          <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${currentQuestionIndex === 0
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-yellow-50 hover:bg-yellow-100 text-[#1D3557] border border-yellow-200"}`}>
            <ArrowLeft className="w-4 h-4"/>
            <span>Previous</span>
          </button>

          {isLastQuestion ? (<button onClick={submitWorksheet} className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              <Award className="w-5 h-5"/>
              <span>Finish & View Results</span>
            </button>) : (<button onClick={nextQuestion} className="flex items-center gap-1.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4"/>
            </button>)}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 5. QUESTION JUMPER GRID (1 to 20) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 border-2 border-yellow-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F4A261]"/>
            <span>20-Question Worksheet Grid:</span>
          </span>
          <span className="text-xs font-bold text-slate-500">
            {Object.keys(userAnswers).length} of {totalQuestions} answered
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const ans = userAnswers[q.id];
            const isAns = ans !== null && ans !== undefined;
            const isAnsCorrect = isAns && ans === q.targetAnswer;
            return (<button key={q.id} onClick={() => goToQuestion(idx)} className={`h-10 rounded-2xl text-xs font-black transition-all flex items-center justify-center cursor-pointer border-2 ${isCurrent
                    ? "bg-[#1D3557] text-white border-yellow-400 scale-110 shadow-md ring-2 ring-yellow-300"
                    : isAns
                        ? isAnsCorrect
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-rose-100 text-rose-900 border-rose-300"
                        : "bg-[#FFFBF0] text-slate-600 border-yellow-200 hover:border-yellow-400"}`}>
                {idx + 1}
              </button>);
        })}
        </div>
      </div>
    </div>);
}
