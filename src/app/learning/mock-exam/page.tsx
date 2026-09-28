"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Flag,
  Award,
  BookOpen,
  Sparkles,
  HelpCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MockExamCard {
  id: string;
  title: string;
  description: string;
  levelName: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  attemptsCount: number;
  bestScore: number;
  latestScore: number | null;
  latestPercentage: number | null;
  isPassed: boolean;
}

interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  numbers?: number[];
  operations?: string[];
  options?: (string | number)[];
  marks: number;
  ruleType?: string;
}

interface ExamEvaluationResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  passingMarks: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  timeTaken: number;
  isPassed: boolean;
  proctoringSummary?: {
    totalEvents: number;
    integrityScore: number;
    status: "verified" | "needs_review" | "suspicious";
    events: any[];
  };
  answers: {
    questionId: string;
    questionText: string;
    userAnswer: string | number | null;
    correctAnswer: string | number;
    isCorrect: boolean;
    marksAwarded: number;
    marksPossible: number;
    explanation?: string;
    ruleType?: string;
  }[];
}

export default function MockExamPage() {
  const router = useRouter();
  const { user } = useAuth();

  // View state: "catalog" | "session" | "result"
  const [viewState, setViewState] = useState<"catalog" | "session" | "result">("catalog");
  const [exams, setExams] = useState<MockExamCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active exam session state
  const [activeExam, setActiveExam] = useState<MockExamCard | null>(null);
  const [attemptId, setAttemptId] = useState<string>("");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Proctoring simulation / listener state
  const [proctoringWarnings, setProctoringWarnings] = useState<string[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  // Result state
  const [evalResult, setEvalResult] = useState<ExamEvaluationResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch available mock exams
  const fetchMockExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/exams/mock");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setExams(data.data);
      } else {
        throw new Error(data.error || "Failed to load mock exams");
      }
    } catch (err: any) {
      console.error("Error loading mock exams:", err);
      setError(err.message || "Failed to load mock exams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMockExams();
  }, [fetchMockExams]);

  // Log proctoring anomaly event
  const logProctoringEvent = useCallback(
    async (eventType: string, description: string, severity: "low" | "medium" | "high" = "low") => {
      if (!attemptId) return;

      try {
        await fetch("/api/proctoring/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examAttemptId: attemptId,
            eventType,
            timestamp: new Date().toISOString(),
            confidence: 0.95,
            severity,
            description,
          }),
        });
      } catch (err) {
        console.warn("Failed logging proctoring event:", err);
      }
    },
    [attemptId]
  );

  // AI Proctoring event listeners (detect tab switches or window blur)
  useEffect(() => {
    if (viewState !== "session" || !attemptId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          const warningMsg = `⚠️ Notice: Tab switch detected (${next}). Please remain on the exam screen.`;
          setProctoringWarnings((w) => [...w, warningMsg]);
          logProctoringEvent("tab_change", `Browser tab switched or window hidden (incident #${next})`, "medium");
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [viewState, attemptId, logProctoringEvent]);

  // Start exam session
  const handleStartExam = async (exam: MockExamCard) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/exams/${exam.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to start mock exam");
      }

      setActiveExam(exam);
      setAttemptId(data.data.attemptId);
      setQuestions(data.data.questions || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setFlaggedQuestions({});
      setTimeRemaining(Math.min((exam.duration || 10), 10) * 60);
      setSessionStartTime(Date.now());
      setProctoringWarnings([]);
      setTabSwitchCount(0);
      setViewState("session");
    } catch (err: any) {
      setError(err.message || "Could not start exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit exam
  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting || !activeExam) return;

    try {
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeTakenSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));

      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] !== undefined ? answers[q.id] : null,
        timeSpent: Math.round(timeTakenSeconds / (questions.length || 1)),
      }));

      const res = await fetch(`/api/exams/${activeExam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          timeTaken: timeTakenSeconds,
          answers: payloadAnswers,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed submitting exam");
      }

      setEvalResult(data.data);
      setViewState("result");
      fetchMockExams(); // refresh catalog scores
    } catch (err: any) {
      alert("Submission error: " + (err.message || "Failed to submit exam"));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, activeExam, sessionStartTime, questions, answers, attemptId, fetchMockExams]);

  // Exam countdown timer
  useEffect(() => {
    if (viewState !== "session") return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, handleSubmitExam]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Answer handler
  const handleSelectAnswer = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Toggle flag
  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Current question helper
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1D3557] pb-24">
      {/* ============================================================== */}
      {/* 1. CATALOG VIEW: MOCK EXAMS LIST */}
      {/* ============================================================== */}
      {viewState === "catalog" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] p-6 sm:p-10 text-white shadow-xl shadow-orange-200/50 mb-10">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider mb-4 border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 5 • Timed Challenge Mode
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-3">
                Mock Examination Hub
              </h1>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                Simulate real competition standards with timed countdown drills, instantaneous automated scorecards,
                and live AI proctoring foundation monitoring.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/95">
                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Timer className="w-4 h-4 text-yellow-200" />
                  <span>Timed Simulation (Max 10 Mins)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Award className="w-4 h-4 text-emerald-300" />
                  <span>No Camera Required (Practice Mode)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Instant Scorecard</span>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-8 -bottom-10 opacity-20 text-[180px] pointer-events-none select-none">
              ⏱️
            </div>
          </div>

          {/* Loading and Error states */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-500">Loading mock exam challenges...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 p-4 rounded-2xl mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
              <button
                onClick={fetchMockExams}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Exam Cards Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#F4A261]"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                        {exam.levelName}
                      </span>
                      {exam.attemptsCount > 0 ? (
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 ${
                            exam.isPassed
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {exam.isPassed ? "✓ Passed" : "Needs Practice"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                          Unattempted
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#1D3557] mb-2 group-hover:text-[#E76F51] transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                      {exam.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-3 bg-[#FFFBF0] rounded-2xl p-3.5 border border-yellow-200/70 mb-6 text-center">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Duration
                        </div>
                        <div className="text-base font-extrabold text-[#1D3557]">{Math.min(exam.duration, 10)} Mins</div>
                      </div>
                      <div className="border-x border-yellow-200/70">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Questions
                        </div>
                        <div className="text-base font-extrabold text-[#1D3557]">
                          {exam.totalQuestions} Items
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Pass Marks
                        </div>
                        <div className="text-base font-extrabold text-[#1D3557]">
                          {exam.passingMarks}% ({exam.passingMarks} pts)
                        </div>
                      </div>
                    </div>

                    {/* Attempt History Snapshot if available */}
                    {exam.attemptsCount > 0 && (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 mb-6 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-900">
                          Attempts: <strong>{exam.attemptsCount}</strong>
                        </span>
                        <span className="font-semibold text-emerald-900">
                          Best Score:{" "}
                          <strong className="text-emerald-700 text-sm">
                            {exam.bestScore}/{exam.totalMarks}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartExam(exam)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-extrabold text-sm shadow-md shadow-orange-200 hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{exam.attemptsCount > 0 ? "Retake Mock Exam" : "Start Mock Exam"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ACTIVE EXAM SESSION VIEW */}
      {/* ============================================================== */}
      {viewState === "session" && currentQ && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          {/* Top Session Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-yellow-200 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {activeExam?.title}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-heading">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
            </div>

            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-mono text-lg font-black transition-colors ${
                timeRemaining <= 120
                  ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse"
                  : "bg-yellow-50 border-yellow-300 text-[#1D3557]"
              }`}
            >
              <Timer className="w-5 h-5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Finish & Submit Button */}
            <button
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to finish the exam? You have answered ${answeredCount} of ${questions.length} questions.`
                  )
                ) {
                  handleSubmitExam();
                }
              }}
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Evaluating..." : "Submit Exam"}
            </button>
          </div>

          {/* Mock Exam Practice Mode Bar (No Camera Required) */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-6 shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-extrabold tracking-wide text-white">
                MOCK EXAM PRACTICE • NO CAMERA REQUIRED
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span>Standard Competition Timer</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  tabSwitchCount === 0 ? "bg-slate-800 text-slate-300" : "bg-amber-950 text-amber-300"
                }`}
              >
                Tab Changes: {tabSwitchCount}
              </span>
            </div>
          </div>

          {/* Warnings Banner if any */}
          {proctoringWarnings.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 p-3 rounded-2xl mb-6 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{proctoringWarnings[proctoringWarnings.length - 1]}</span>
              </div>
              <span className="font-bold text-[10px] uppercase bg-amber-200 px-2 py-0.5 rounded-full">
                Recorded
              </span>
            </div>
          )}

          {/* Question Card & Answer Interface */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-yellow-200 shadow-xl mb-6 relative">
            {/* Top Question Row */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                {currentQ.ruleType || "Direct Abacus Calculation"}
              </span>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  flaggedQuestions[currentQ.id]
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span>{flaggedQuestions[currentQ.id] ? "Flagged" : "Flag"}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-center py-6 sm:py-10">
              <h3 className="text-3xl sm:text-5xl font-black font-heading text-[#1D3557] tracking-wider mb-4">
                {currentQ.questionText}
              </h3>
              <p className="text-xs font-bold text-slate-400">
                Move your virtual or physical abacus beads, then select or type your final answer.
              </p>
            </div>

            {/* Direct Answer Entry - No Options Given */}
            <div className="max-w-sm mx-auto mb-8 space-y-4">
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Direct Calculated Answer (No Options Given):
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="?"
                  autoFocus
                  value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : ""}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9-]/g, "");
                    handleSelectAnswer(currentQ.id, clean);
                  }}
                  className="w-48 h-16 text-center text-4xl font-mono font-black py-2 px-4 rounded-2xl border-3 border-yellow-300 focus:border-[#F4A261] focus:ring-4 focus:ring-amber-100 outline-none shadow-inner bg-[#FFFDF7] text-[#1D3557] mx-auto block"
                />
              </div>

              {/* Kid-Friendly Abacus Keypad */}
              <div className="bg-stone-50 p-3 sm:p-4 rounded-3xl border-2 border-stone-200 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 mb-2">
                  <span>Numeric Keypad:</span>
                  <span>or use physical keyboard</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => {
                        const cur = String(answers[currentQ.id] !== undefined ? answers[currentQ.id] : "");
                        if (cur.length < 7) {
                          handleSelectAnswer(currentQ.id, cur + digit);
                        }
                      }}
                      className="h-12 rounded-xl bg-white hover:bg-amber-50 active:scale-95 text-[#1D3557] border border-stone-200 hover:border-amber-300 font-mono text-xl font-black shadow-sm flex items-center justify-center transition cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setAnswers((prev) => {
                        const next = { ...prev };
                        delete next[currentQ.id];
                        return next;
                      });
                    }}
                    className="h-12 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = String(answers[currentQ.id] !== undefined ? answers[currentQ.id] : "");
                      if (cur.length < 7) {
                        handleSelectAnswer(currentQ.id, cur + "0");
                      }
                    }}
                    className="h-12 rounded-xl bg-white hover:bg-amber-50 active:scale-95 text-[#1D3557] border border-stone-200 hover:border-amber-300 font-mono text-xl font-black shadow-sm flex items-center justify-center transition cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = String(answers[currentQ.id] !== undefined ? answers[currentQ.id] : "");
                      handleSelectAnswer(currentQ.id, cur.slice(0, -1));
                    }}
                    className="h-12 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            </div>

            {/* Question Navigation Controls */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-yellow-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200 text-xs font-extrabold hover:bg-yellow-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-500">
                {currentQuestionIndex + 1} / {questions.length}
              </span>

              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4A261] text-white text-xs font-extrabold hover:bg-[#E76F51] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Palette Drawer Grid */}
          <div className="bg-white rounded-3xl p-5 border-2 border-yellow-200 shadow-md">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
              <span>Question Quick Navigation:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Flagged
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Unanswered
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
                const isFlagged = flaggedQuestions[q.id];
                const isCurrent = idx === currentQuestionIndex;

                let btnBg = "bg-slate-100 text-slate-700 border-slate-200";
                if (isCurrent) {
                  btnBg = "ring-2 ring-orange-500 bg-orange-100 text-orange-900 border-orange-400 font-black";
                } else if (isFlagged) {
                  btnBg = "bg-amber-100 text-amber-900 border-amber-300 font-bold";
                } else if (isAnswered) {
                  btnBg = "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`py-2 rounded-xl text-xs border transition-all ${btnBg} cursor-pointer hover:scale-105`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. EVALUATION RESULTS VIEW */}
      {/* ============================================================== */}
      {viewState === "result" && evalResult && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          {/* Hero Celebration Score Card */}
          <div
            className={`rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl mb-8 relative overflow-hidden ${
              evalResult.isPassed
                ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600"
                : "bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-rose-500"
            }`}
          >
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
                {evalResult.isPassed ? "🎉 Mock Exam Passed" : "💪 Practice Makes Perfect"}
              </span>

              <h2 className="text-3xl sm:text-5xl font-black font-heading mb-2">
                Score: {evalResult.score} / {evalResult.totalMarks}
              </h2>
              <p className="text-white/90 text-sm font-medium mb-6">
                {evalResult.isPassed
                  ? `Congratulations! You scored ${evalResult.percentage}%, well above the ${evalResult.passingMarks}% pass requirement.`
                  : `You scored ${evalResult.percentage}%. Target ${evalResult.passingMarks}% to master this level.`}
              </p>

              {/* Performance Stats Pills */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-black/15 rounded-2xl p-3 backdrop-blur-sm text-center text-xs font-bold">
                <div>
                  <div className="text-white/70 text-[10px] uppercase">Accuracy</div>
                  <div className="text-base text-white">{evalResult.percentage}%</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-white/70 text-[10px] uppercase">Correct</div>
                  <div className="text-base text-white">
                    {evalResult.correctAnswers} / {evalResult.totalQuestions}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 text-[10px] uppercase">Time Taken</div>
                  <div className="text-base text-white">
                    {Math.floor(evalResult.timeTaken / 60)}m {evalResult.timeTaken % 60}s
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 -bottom-8 opacity-20 text-[150px] pointer-events-none">
              {evalResult.isPassed ? "🏆" : "🎯"}
            </div>
          </div>

          {/* AI Proctoring Integrity Assessment Card */}
          {evalResult.proctoringSummary && (
            <div className="bg-white rounded-3xl p-6 border-2 border-yellow-200 shadow-md mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-base font-extrabold text-[#1D3557]">
                    AI Proctoring Integrity Assessment
                  </h4>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    evalResult.proctoringSummary.status === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Status: {evalResult.proctoringSummary.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs mb-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Integrity Score</div>
                  <div className="text-lg font-black text-emerald-600">
                    {evalResult.proctoringSummary.integrityScore}/100
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Total Incidents</div>
                  <div className="text-lg font-black text-[#1D3557]">
                    {evalResult.proctoringSummary.totalEvents}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Camera Checks</div>
                  <div className="text-lg font-black text-emerald-600">Pass</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Session Verifier</div>
                  <div className="text-lg font-black text-[#1D3557]">Rule-Based v1</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Note: Mock exam proctoring events are saved for assessment and help familiarize you with final certification exam rules.
              </p>
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-md mb-8">
            <h4 className="text-xl font-extrabold text-[#1D3557] font-heading mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Question-by-Question Review</span>
            </h4>

            <div className="space-y-4">
              {evalResult.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    ans.isCorrect
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-rose-50/50 border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500">
                      Question {idx + 1} • {ans.ruleType || "Calculation"}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        ans.isCorrect
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {ans.isCorrect ? `+${ans.marksAwarded} Pts` : "0 Pts"}
                    </span>
                  </div>

                  <h5 className="text-lg font-bold text-[#1D3557] mb-2">{ans.questionText}</h5>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold mb-2">
                    <div>
                      <span className="text-slate-400">Your Answer: </span>
                      <strong className={ans.isCorrect ? "text-emerald-700" : "text-rose-700"}>
                        {ans.userAnswer !== null && ans.userAnswer !== undefined
                          ? String(ans.userAnswer)
                          : "(No answer provided)"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Correct Answer: </span>
                      <strong className="text-emerald-700">{String(ans.correctAnswer)}</strong>
                    </div>
                  </div>

                  {ans.explanation && (
                    <div className="text-xs bg-white p-2.5 rounded-xl border border-yellow-200 text-slate-600 mt-2">
                      <strong>Abacus Tip:</strong> {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setViewState("catalog");
                setEvalResult(null);
              }}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Mock Exam</span>
            </button>

            <Link
              href="/learning/exam"
              className="py-3 px-6 rounded-2xl bg-slate-800 text-white font-extrabold text-sm hover:bg-slate-900 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Check Final Exam Readiness</span>
            </Link>

            <Link
              href="/learning"
              className="py-3 px-6 rounded-2xl bg-yellow-100 text-[#1D3557] font-extrabold text-sm hover:bg-yellow-200 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Back to Lessons</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
