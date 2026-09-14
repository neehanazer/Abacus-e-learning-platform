"use client";

import React from "react";
import { motion } from "framer-motion";
import { useHomework } from "@/context/HomeworkContext";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
  Send,
  X,
} from "lucide-react";

export const HomeworkSubmitModal: React.FC = () => {
  const {
    activeHomework,
    userAnswers,
    timerSeconds,
    closeSubmitModal,
    submitHomework,
    goToQuestion,
  } = useHomework();

  if (!activeHomework) return null;

  const totalQuestions = activeHomework.questions.length;
  let answeredCount = 0;
  let firstUnansweredIndex = -1;

  activeHomework.questions.forEach((q, idx) => {
    const ans = userAnswers[q.id];
    if (ans !== undefined && ans !== null) {
      answeredCount++;
    } else if (firstUnansweredIndex === -1) {
      firstUnansweredIndex = idx;
    }
  });

  const unansweredCount = totalQuestions - answeredCount;
  const isAllAnswered = unansweredCount === 0;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl border-4 border-[#E9C46A] shadow-2xl p-6 sm:p-8 max-w-lg w-full relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={closeSubmitModal}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center border-2 ${
              isAllAnswered
                ? "bg-emerald-100 text-emerald-600 border-emerald-300"
                : "bg-amber-100 text-amber-600 border-amber-300"
            }`}
          >
            {isAllAnswered ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-black text-[#1D3557]">
            {isAllAnswered ? "Ready to Submit?" : "Review Unanswered Questions"}
          </h2>
          <p className="text-stone-600 text-sm font-medium mt-1">
            {isAllAnswered
              ? "You answered all 10 questions! Your work will be evaluated immediately."
              : `You still have ${unansweredCount} unanswered ${
                  unansweredCount === 1 ? "question" : "questions"
                }.`}
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[#FFFBF0] border-2 border-amber-200 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <div className="text-xs font-bold text-stone-400 uppercase">Answered</div>
              <div className="text-xl font-black text-emerald-600">{answeredCount}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <div className="text-xs font-bold text-stone-400 uppercase">Unanswered</div>
              <div className="text-xl font-black text-amber-600">{unansweredCount}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <div className="text-xs font-bold text-stone-400 uppercase">Time</div>
              <div className="text-xl font-black text-indigo-600">
                {formatTimer(timerSeconds)}
              </div>
            </div>
          </div>

          {!isAllAnswered && firstUnansweredIndex !== -1 && (
            <button
              onClick={() => {
                closeSubmitModal();
                goToQuestion(firstUnansweredIndex);
              }}
              className="mt-3 w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-amber-300"
            >
              Jump to Question #{firstUnansweredIndex + 1}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={closeSubmitModal}
            className="flex-1 py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-sm transition-colors border-2 border-stone-200"
          >
            Keep Working
          </button>
          <button
            onClick={submitHomework}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 border-b-4 border-emerald-700"
          >
            <Send className="w-4 h-4" />
            Submit for Grading
          </button>
        </div>
      </motion.div>
    </div>
  );
};
