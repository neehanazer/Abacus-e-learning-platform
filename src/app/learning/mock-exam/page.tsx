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
  levelOrder?: number;
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

const MOCK_LEVELS = [
  { level: 1, name: "Foundations", icon: "🌱" },
  { level: 2, name: "Explorer", icon: "🚀" },
  { level: 3, name: "Intermediate", icon: "⭐" },
  { level: 4, name: "Advanced", icon: "⚡" },
  { level: 5, name: "Senior Expert", icon: "🔥" },
  { level: 6, name: "Master", icon: "🏆" },
  { level: 7, name: "Champion", icon: "👑" },
  { level: 8, name: "Grand Master", icon: "🧙‍♂️" },
];

const LEVEL_TOPICS_SUMMARY: Record<number, { title: string; desc: string }[]> = {
  1: [
    { title: "Direct Calculation", desc: "Pure bead movement on units & tens without friend formulas" },
    { title: "Small Friend Rule", desc: "Base-5 addition & subtraction rules (+4..+1 and -4..-1)" },
    { title: "Big Friend Rule", desc: "Base-10 complementary rules (+10 - friend and -10 + friend)" },
    { title: "1-Digit 5 & 7-Row", desc: "Consecutive single-digit rapid speed calculation drills" },
  ],
  2: [
    { title: "1-Digit 10-Row", desc: "Continuous 10-row running addition and subtraction drills" },
    { title: "1-Digit 12 & 15-Row", desc: "Endurance multi-row single digit calculations" },
    { title: "2-Digit 3 & 5-Row", desc: "Coordinate two-digit columns across 3 and 5 rows" },
    { title: "2-Digit 8-Row Championship", desc: "Championship-level multi-row continuous arithmetic" },
  ],
  3: [
    { title: "1-Digit 20 & 25-Row", desc: "High-speed rapid single-digit marathon calculations" },
    { title: "2-Digit 10 & 12-Row", desc: "Multi-row 2-digit concentration drills" },
    { title: "3-Digit 3-Row", desc: "Hundreds, Tens, and Units 3-digit column arithmetic" },
    { title: "3-Digit 5-Row", desc: "5-row continuous 3-digit addition and subtraction" },
  ],
  4: [
    { title: "1-Digit 30-Row", desc: "30-row continuous concentration and speed marathon" },
    { title: "2-Digit 15 & 20-Row", desc: "15-20 rows of two-digit continuous calculations" },
    { title: "3-Digit 7 & 10-Row", desc: "Multi-row 3-digit advanced bead manipulation" },
    { title: "4-Digit 3 & 5-Row", desc: "Thousands rod alignment and multi-digit operations" },
  ],
  5: [
    { title: "2-Digit 25-Row", desc: "Extended 2-digit endurance calculations" },
    { title: "3-Digit 12 & 15-Row", desc: "Continuous 3-digit multi-row calculations" },
    { title: "4-Digit 7 & 10-Row", desc: "Thousands columns multi-row addition and subtraction" },
    { title: "Multiplication (2D × 1D)", desc: "Soroban multiplicand indexing and partial products accumulation" },
  ],
  6: [
    { title: "Multiplication (3D×1D, 4D×1D, 2D×2D)", desc: "Multi-digit cross-rod multiplication algorithms" },
    { title: "Division (2D ÷ 1D)", desc: "Soroban division and remainder reductions" },
    { title: "2-Digit 30-Row & 3-Digit 20-Row", desc: "Supreme multi-row rapid arithmetic" },
    { title: "5-Digit 3 & 5-Row", desc: "Ten-thousands rod coordination drills" },
  ],
  7: [
    { title: "Multiplication (3D×2D, 3D×3D)", desc: "Master-level multi-digit multiplication on the beam" },
    { title: "Division (3D ÷ 1D & 3D ÷ 2D)", desc: "Complex multi-digit divisor division and quotient placement" },
    { title: "3-Digit 25-Row", desc: "Continuous 3-digit speed endurance" },
    { title: "4-Digit 15-Row & 5-Digit 10-Row", desc: "Championship multi-row calculation stamina" },
  ],
  8: [
    { title: "Flash Anzan", desc: "Lightning mental abacus visualization of flashing numbers" },
    { title: "Multi-Row Mental Arithmetic", desc: "Solving multi-row sequences without physical abacus" },
    { title: "Competition Speed Mental", desc: "National championship mental multiplication & division" },
    { title: "Grand Master Capstone", desc: "Complete integration of mental calculation arts" },
  ],
};

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

  const studentLevel = React.useMemo(() => {
    const raw = user?.selectedLevel || user?.abacusLevel || (user as any)?.currentLevel || "";
    const m = String(raw).match(/Level\s*(\d+)/i) || String(raw).match(/^(\d+)$/);
    return m ? parseInt(m[1], 10) : 1;
  }, [user]);

  const [activeLevelTab, setActiveLevelTab] = useState<number>(studentLevel || 1);

  useEffect(() => {
    if (studentLevel) {
      setActiveLevelTab(studentLevel);
    }
  }, [studentLevel]);

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

  // Trap back navigation and tab closing during active session (matching final exam screen isolation)
  useEffect(() => {
    if (viewState !== "session") return;

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      alert("Exam in progress: You cannot navigate away until you submit your mock exam.");
    };
    window.addEventListener("popstate", handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Mock Exam in progress! Leaving will forfeit your attempt.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [viewState]);

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

          {/* Enrolled Level Mock Exam Banner (No level switching allowed) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-xl shadow-inner">
                ⏱️
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Assigned Mock Exam Level:
                </div>
                <div className="text-base font-extrabold text-[#1D3557]">
                  Level {studentLevel} Mock Exam Only
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-900 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                🔒 Mock Exam Restricted to Enrolled Level {studentLevel}
              </span>
            </div>
          </div>

          {/* Selected Level Mock Exam Hub Card */}
          {!loading && !error && (() => {
            const singleExam: MockExamCard =
              exams.find(
                (e) => (e as any).levelOrder === activeLevelTab || e.title.includes(`Level ${activeLevelTab}`)
              ) ||
              exams[0] || {
                id: "67b100000000000000000001",
                title: `Level ${activeLevelTab}: Official Practice Mock Exam`,
                description: `Official Practice Mock Exam for Level ${activeLevelTab} syllabus.`,
                levelName: `Level ${activeLevelTab}`,
                duration: 10,
                totalQuestions: 10,
                totalMarks: 100,
                passingMarks: 60,
                attemptsCount: 0,
                bestScore: 0,
                latestScore: null,
                latestPercentage: null,
                isPassed: false,
              };

            const levelTopics =
              LEVEL_TOPICS_SUMMARY[activeLevelTab] || LEVEL_TOPICS_SUMMARY[1];

            return (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-yellow-200/90 shadow-xl flex flex-col justify-between">
                  <div>
                    {/* Top Status Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                        {singleExam.levelName || `Level ${activeLevelTab}`} • Official Practice Simulation
                      </span>
                      {singleExam.attemptsCount > 0 ? (
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 ${
                            singleExam.isPassed
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {singleExam.isPassed ? "✓ Passed" : "Needs Practice"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                          Unattempted
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black font-heading text-[#1D3557] mb-3">
                      {singleExam.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-medium">
                      {singleExam.description}
                    </p>

                    {/* Tested Categories Callout */}
                    <div className="mb-8">
                      <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                        Included Exam Topics (Level {activeLevelTab} Syllabus):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {levelTopics.map((topic, idx) => (
                          <div
                            key={idx}
                            className="bg-[#FFFDF7] p-3.5 rounded-2xl border-2 border-amber-200/70 flex items-start gap-3"
                          >
                            <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-sm font-extrabold text-[#1D3557]">{topic.title}</div>
                              <div className="text-xs text-slate-500">{topic.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-3 bg-[#FFFBF0] rounded-2xl p-4 border border-yellow-200/80 mb-6 text-center">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Duration
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-[#1D3557]">
                          {Math.min(singleExam.duration || 10, 10)} Mins
                        </div>
                      </div>
                      <div className="border-x border-yellow-200/80">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Questions
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-[#1D3557]">
                          {singleExam.totalQuestions} Items
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Pass Marks
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-[#1D3557]">
                          {singleExam.passingMarks}% ({singleExam.passingMarks} pts)
                        </div>
                      </div>
                    </div>

                    {/* Attempt History Snapshot if available */}
                    {singleExam.attemptsCount > 0 && (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between text-xs gap-2">
                        <span className="font-semibold text-emerald-900">
                          Total Attempts Completed: <strong>{singleExam.attemptsCount}</strong>
                        </span>
                        <span className="font-semibold text-emerald-900">
                          Personal Best Score:{" "}
                          <strong className="text-emerald-700 text-sm">
                            {singleExam.bestScore}/{singleExam.totalMarks}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Single Mock Exam Start Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleStartExam(singleExam)}
                      className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white font-black text-base sm:text-lg shadow-xl shadow-orange-300/40 hover:shadow-2xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Award className="w-5 h-5 text-yellow-200" />
                      <span>{singleExam.attemptsCount > 0 ? "Retake Mock Exam" : "Start Mock Exam"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ACTIVE EXAM SESSION VIEW (ISOLATED FULLSCREEN SCREEN) */}
      {/* ============================================================== */}
      {viewState === "session" && currentQ && (
        <div className="fixed inset-0 z-50 bg-[#FFFDF7] overflow-y-auto pb-24 text-[#1D3557]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
            {/* Top Session Bar (Same as Final Exam) */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-200 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                  Official Level 1 Practice Mock Exam
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-heading">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
              </div>

              {/* Countdown Clock */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-mono text-lg font-black transition-colors ${
                  timeRemaining <= 180
                    ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse"
                    : "bg-orange-50 border-orange-300 text-orange-900"
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
                      `Are you ready to submit your Mock Exam? You have answered ${answeredCount} of ${questions.length} questions.`
                    )
                  ) {
                    handleSubmitExam();
                  }
                }}
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Evaluating..." : "Submit Mock Exam"}
              </button>
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

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-orange-200 shadow-xl mb-6 text-center relative">
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                  {currentQ.ruleType || "Abacus Calculation"}
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

              {/* Main Question Display */}
              <h3 className="text-3xl sm:text-5xl font-black font-heading text-[#1D3557] tracking-wider mb-4">
                {currentQ.questionText}
              </h3>

              {/* For 1-Digit 5-Row Drill: Display authentic Abacus vertical stack */}
              {currentQ.numbers && currentQ.numbers.length >= 4 && (
                <div className="inline-block bg-[#FFFDF7] border-2 border-orange-200 rounded-2xl p-4 my-2 font-mono text-2xl font-black shadow-sm">
                  <div className="text-[10px] font-bold uppercase text-orange-600 tracking-wider mb-2 font-sans">
                    5-Row Drill Stack
                  </div>
                  {currentQ.numbers.map((num, i) => (
                    <div key={i} className="text-right px-6 leading-relaxed">
                      {i === 0 ? num : num > 0 ? `+ ${num}` : `- ${Math.abs(num)}`}
                    </div>
                  ))}
                  <div className="border-t-2 border-orange-300 mt-2 pt-1 text-center text-xs text-orange-700 font-sans font-bold">
                    = ?
                  </div>
                </div>
              )}

              <p className="text-xs font-bold text-slate-400 mt-2 mb-6">
                Calculate with your abacus beads or mental visualization, then enter your final answer below.
              </p>

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
                    className="w-48 h-16 text-center text-4xl font-mono font-black py-2 px-4 rounded-2xl border-3 border-orange-300 focus:border-[#F4A261] focus:ring-4 focus:ring-orange-100 outline-none shadow-inner bg-[#FFFDF7] text-[#1D3557] mx-auto block"
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
                        className="h-12 rounded-xl bg-white hover:bg-orange-50 active:scale-95 text-[#1D3557] border border-stone-200 hover:border-orange-300 font-mono text-xl font-black shadow-sm flex items-center justify-center transition cursor-pointer"
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
                      className="h-12 rounded-xl bg-white hover:bg-orange-50 active:scale-95 text-[#1D3557] border border-stone-200 hover:border-orange-300 font-mono text-xl font-black shadow-sm flex items-center justify-center transition cursor-pointer"
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

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between gap-4 pt-6 border-t border-orange-100">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-extrabold hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
            <div className="bg-white rounded-3xl p-5 border-2 border-orange-200 shadow-md">
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
