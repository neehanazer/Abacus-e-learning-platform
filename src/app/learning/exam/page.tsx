"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Eye,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ExamProctoringMedia } from "@/components/exam/ExamProctoringMedia";

interface ReadinessCriterion {
  name: string;
  target: string;
  current: string;
  passed: boolean;
  weight: number;
}

interface ReadinessData {
  readinessScore: number;
  readinessStatus: "ready" | "almost_ready" | "needs_more_practice" | "not_started";
  currentLevel: string;
  criteria: ReadinessCriterion[];
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

export default function FinalExamPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State: "overview" | "session" | "result"
  const [viewState, setViewState] = useState<"overview" | "session" | "result">("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Readiness data
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [examData, setExamData] = useState<any>(null);

  // Active exam session state
  const [attemptId, setAttemptId] = useState<string>("");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Proctoring listeners
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [proctoringWarnings, setProctoringWarnings] = useState<string[]>([]);

  // Results
  const [evalResult, setEvalResult] = useState<ExamEvaluationResult | null>(null);

  // Fullscreen lockdown & shutdown states
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [isShutOff, setIsShutOff] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalExamId = "67b100000000000000000003";

  // Fetch Readiness & Final Exam Info
  const fetchExamOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Readiness
      const readinessRes = await fetch("/api/performance/readiness");
      const readinessJson = await readinessRes.json();
      if (readinessJson.success) {
        setReadiness(readinessJson.data);
      }

      // 2. Fetch Final Exam Details
      const examRes = await fetch(`/api/exams/${finalExamId}`);
      const examJson = await examRes.json();
      if (examJson.success) {
        setExamData(examJson.data);
      } else {
        // Fallback default structure
        setExamData({
          id: finalExamId,
          title: "Level 1: Official Level Certification Final Exam",
          description:
            "Formal Level 1 Certification Exam (10 min max). Requires meeting readiness criteria before unlocking. Monitored with live camera & microphone AI proctoring.",
          levelName: "Level 1",
          duration: 10,
          totalQuestions: 10,
          totalMarks: 100,
          passingMarks: 70,
          isLocked: readinessJson.data?.readinessScore < 70,
        });
      }
    } catch (err: any) {
      console.error("Error loading final exam:", err);
      setError(err.message || "Failed to load exam information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamOverview();
  }, [fetchExamOverview]);

  // Log proctoring anomaly event
  const logProctoringEvent = useCallback(
    async (eventType: string, description: string, severity: "low" | "medium" | "high" = "medium") => {
      if (!attemptId) return;

      try {
        await fetch("/api/proctoring/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examAttemptId: attemptId,
            eventType,
            timestamp: new Date().toISOString(),
            confidence: 0.96,
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

  // Tab switch listener during exam
  useEffect(() => {
    if (viewState !== "session" || !attemptId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          const warningMsg = `⚠️ Official Exam Warning: Tab switch incident #${next} recorded by AI proctoring.`;
          setProctoringWarnings((w) => [...w, warningMsg]);
          logProctoringEvent("tab_change", `Student switched browser tab (incident #${next})`, "high");
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [viewState, attemptId, logProctoringEvent]);

  // Start Final Exam
  const handleStartFinalExam = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/exams/${finalExamId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Readiness requirements not met for this final exam.");
      }

      setAttemptId(data.data.attemptId);
      setQuestions(data.data.questions || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeRemaining(Math.min((examData?.duration || 10), 10) * 60);
      setSessionStartTime(Date.now());
      setProctoringWarnings([]);
      setTabSwitchCount(0);
      setIsShutOff(false);
      setViewState("session");

      // Enter full screen mode automatically
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (fsErr) {
        console.warn("Fullscreen request error:", fsErr);
      }
    } catch (err: any) {
      setError(err.message || "Could not start final exam.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Final Exam
  const handleSubmitFinalExam = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeTakenSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));

      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] !== undefined ? answers[q.id] : null,
        timeSpent: Math.round(timeTakenSeconds / (questions.length || 1)),
      }));

      const res = await fetch(`/api/exams/${finalExamId}/submit`, {
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
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setViewState("result");
    } catch (err: any) {
      alert("Submission error: " + (err.message || "Failed to submit exam"));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, sessionStartTime, questions, answers, attemptId]);

  // Handle Proctoring Screen Shut-Off (3 strikes detected)
  const handleShutOff = useCallback(
    (recordedViolations: any[]) => {
      setTimeout(() => {
        setIsShutOff(true);
        if (timerRef.current) clearInterval(timerRef.current);
        if (typeof document !== "undefined" && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        logProctoringEvent(
          "exam_terminated_shutoff",
          `Screen shut off after 3 proctoring violations: ${recordedViolations.map((v) => v.reason).join("; ")}`,
          "high"
        );
      }, 0);
    },
    [logProctoringEvent]
  );

  // Fullscreen lockdown monitor
  useEffect(() => {
    if (viewState !== "session" || isShutOff) return;

    const handleFullscreenChange = () => {
      const inFull = !!document.fullscreenElement;
      setIsFullscreen(inFull);
      if (!inFull) {
        logProctoringEvent("fullscreen_exit", "Student left full screen mode during final exam", "high");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [viewState, isShutOff, logProctoringEvent]);

  // Trap back navigation and tab closing during active session
  useEffect(() => {
    if (viewState !== "session" || isShutOff) return;

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      alert("Navigation locked: You cannot leave the exam until it is completed or submitted.");
    };
    window.addEventListener("popstate", handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Exam in progress! Leaving will forfeit your attempt.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [viewState, isShutOff]);

  // Exam timer
  useEffect(() => {
    if (viewState !== "session") return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitFinalExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, handleSubmitFinalExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLocked = examData?.isLocked ?? (readiness ? readiness.readinessScore < 70 : false);
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1D3557] pb-24">
      {/* ============================================================== */}
      {/* 1. OVERVIEW & READINESS GUARD VIEW */}
      {/* ============================================================== */}
      {viewState === "overview" && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-purple-900 to-[#1D3557] p-6 sm:p-10 text-white shadow-2xl mb-8">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-4 border border-amber-300/30">
                <Award className="w-3.5 h-3.5" />
                Phase 6 • Official Level Certification
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-3">
                Official Certification Exam
              </h1>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                Comprehensive level evaluation. Monitored with live AI proctoring foundation and requiring
                verified curriculum readiness to unlock.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Timer className="w-4 h-4 text-amber-300" />
                  <span>10 Minutes Max Duration</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Award className="w-4 h-4 text-emerald-300" />
                  <span>70% Passing Threshold</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-sky-300" />
                  <span>Camera & Mic AI Monitored</span>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 -bottom-8 opacity-20 text-[180px] pointer-events-none select-none">
              🎓
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 p-4 rounded-2xl mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
              <button
                onClick={fetchExamOverview}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Camera & Microphone Device Option & Pre-Check */}
          <ExamProctoringMedia mode="precheck" onIncident={logProctoringEvent} />

          {/* READINESS ASSESSMENT CARD */}
          {readiness && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-lg mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Advancement Readiness Check
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-heading flex items-center gap-2">
                    {isLocked ? (
                      <>
                        <Lock className="w-6 h-6 text-amber-500" />
                        <span>Exam Currently Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-6 h-6 text-emerald-500" />
                        <span>Exam Unlocked & Ready!</span>
                      </>
                    )}
                  </h3>
                </div>

                {/* Score Dial / Badge */}
                <div className="flex items-center gap-3 bg-[#FFFBF0] px-4 py-2 rounded-2xl border border-yellow-200">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Readiness Score</div>
                    <div
                      className={`text-2xl font-black ${
                        readiness.readinessScore >= 70 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {readiness.readinessScore}%
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-500 border-l border-yellow-200 pl-3">
                    Target: <strong>70%+</strong>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3.5 mb-6 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    readiness.readinessScore >= 70
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-[#F4A261] to-[#E76F51]"
                  }`}
                  style={{ width: `${Math.min(100, readiness.readinessScore)}%` }}
                />
              </div>

              {/* Readiness Criteria Checklist */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Prerequisites Checklist:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {readiness.criteria.map((crit, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs ${
                        crit.passed
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : "bg-amber-50/70 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {crit.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-bold">{crit.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Current: <strong>{crit.current}</strong> (Goal: {crit.target})
                          </div>
                        </div>
                      </div>
                      <span className="font-extrabold text-[10px] uppercase">
                        {crit.passed ? "Done" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Actions if locked */}
              {isLocked ? (
                <div className="bg-[#FFFBF0] rounded-2xl p-4 border border-yellow-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-600 font-medium">
                    Complete your daily practice drills and homework assignments to unlock this official examination.
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/learning/practice"
                      className="px-4 py-2 rounded-xl bg-orange-100 text-orange-800 text-xs font-extrabold hover:bg-orange-200 transition"
                    >
                      Practice Worksheets
                    </Link>
                    <Link
                      href="/learning/homework"
                      className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold hover:bg-emerald-200 transition"
                    >
                      Homework Hub
                    </Link>
                    <Link
                      href="/learning/mock-exam"
                      className="px-4 py-2 rounded-xl bg-sky-100 text-sky-800 text-xs font-extrabold hover:bg-sky-200 transition"
                    >
                      Take Mock Exam
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleStartFinalExam}
                    className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-98 transition cursor-pointer flex items-center gap-3"
                  >
                    <Award className="w-5 h-5 text-amber-300" />
                    <span>Begin Official Final Exam</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ACTIVE FINAL EXAM SESSION VIEW */}
      {/* ============================================================== */}
      {viewState === "session" && currentQ && (
        <div className="fixed inset-0 z-50 bg-[#FFFDF7] overflow-y-auto pb-24 text-[#1D3557]">
          {/* Full Screen Required Blocking Modal if student exits full screen */}
          {!isFullscreen && !isShutOff && (
            <div className="fixed inset-0 z-[99998] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-3xl mb-4 animate-bounce">
                🛡️
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading mb-2">
                FULL SCREEN LOCKDOWN REQUIRED
              </h2>
              <p className="max-w-md text-slate-300 text-sm mb-6 leading-relaxed font-medium">
                Official certification rules mandate remaining in full screen. Opening other applications, tabs, or leaving full screen is strictly prohibited.
              </p>
              <button
                onClick={() => {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base shadow-xl hover:scale-105 transition cursor-pointer"
              >
                Return to Full Screen Exam
              </button>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
            {/* Top Session Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-indigo-200 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
                  Official Level 1 Certification Exam
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
                    : "bg-indigo-50 border-indigo-300 text-indigo-900"
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
                      `Are you ready to submit your Official Certification Exam? You have answered ${answeredCount} of ${questions.length} questions.`
                    )
                  ) {
                    handleSubmitFinalExam();
                  }
                }}
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Grading..." : "Submit Official Exam"}
              </button>
            </div>

            {/* AI Proctoring Live Monitor & Camera/Microphone Options with 3-strike shutoff */}
            <ExamProctoringMedia
              mode="session"
              onIncident={logProctoringEvent}
              onShutOff={handleShutOff}
              tabSwitchCount={tabSwitchCount}
            />

          {/* Warnings Banner if any */}
          {proctoringWarnings.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 p-3 rounded-2xl mb-6 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{proctoringWarnings[proctoringWarnings.length - 1]}</span>
              </div>
              <span className="font-bold text-[10px] uppercase bg-rose-200 px-2 py-0.5 rounded-full">
                Review Logged
              </span>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-indigo-200 shadow-xl mb-6 text-center">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 inline-block mb-6">
              {currentQ.ruleType || "Official Level 1 Evaluation Problem"}
            </span>

            <h3 className="text-4xl sm:text-6xl font-black font-heading text-[#1D3557] tracking-wider mb-6">
              {currentQ.questionText}
            </h3>

            {/* Direct Answer Entry (No Options Given) */}
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
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: clean }));
                  }}
                  className="w-48 h-16 text-center text-4xl font-mono font-black py-2 px-4 rounded-2xl border-3 border-indigo-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none shadow-inner bg-[#FFFDF7] text-[#1D3557] mx-auto block"
                />
              </div>

              {/* Kid-Friendly Abacus Keypad */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
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
                          setAnswers((prev) => ({ ...prev, [currentQ.id]: cur + digit }));
                        }
                      }}
                      className="h-12 rounded-xl bg-white hover:bg-indigo-50 active:scale-95 text-[#1D3557] border border-slate-200 hover:border-indigo-300 font-mono text-xl font-black shadow-sm flex items-center justify-center transition cursor-pointer"
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
                        setAnswers((prev) => ({ ...prev, [currentQ.id]: cur + "0" }));
                      }
                    }}
                    className="h-12 rounded-xl bg-white hover:bg-indigo-50 active:scale-95 text-[#1D3557] border border-slate-200 hover:border-indigo-300 font-mono text-xl font-black shadow-sm flex items-center justify-center transition cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = String(answers[currentQ.id] !== undefined ? answers[currentQ.id] : "");
                      setAnswers((prev) => ({ ...prev, [currentQ.id]: cur.slice(0, -1) }));
                    }}
                    className="h-12 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-extrabold hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* 3. EVALUATED FINAL EXAM RESULT VIEW */}
      {/* ============================================================== */}
      {viewState === "result" && evalResult && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          <div
            className={`rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl mb-8 relative overflow-hidden ${
              evalResult.isPassed
                ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-green-700"
                : "bg-gradient-to-r from-rose-600 via-red-600 to-orange-600"
            }`}
          >
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
                {evalResult.isPassed ? "🎓 Level 1 Certified!" : "📚 Certification Re-attempt Needed"}
              </span>

              <h2 className="text-3xl sm:text-5xl font-black font-heading mb-2">
                Score: {evalResult.score} / {evalResult.totalMarks}
              </h2>
              <p className="text-white/90 text-sm font-medium mb-6">
                {evalResult.isPassed
                  ? `Outstanding! You achieved ${evalResult.percentage}%, successfully passing the 70% certification requirement.`
                  : `You achieved ${evalResult.percentage}%. You need 70% to earn your official Level 1 graduation certificate.`}
              </p>

              <div className="grid grid-cols-3 gap-3 bg-black/20 rounded-2xl p-3 text-center text-xs font-bold">
                <div>
                  <div className="text-white/70 text-[10px] uppercase">Percentage</div>
                  <div className="text-base text-white">{evalResult.percentage}%</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-white/70 text-[10px] uppercase">Correct Items</div>
                  <div className="text-base text-white">
                    {evalResult.correctAnswers} / {evalResult.totalQuestions}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 text-[10px] uppercase">Duration</div>
                  <div className="text-base text-white">
                    {Math.floor(evalResult.timeTaken / 60)}m {evalResult.timeTaken % 60}s
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 -bottom-8 opacity-20 text-[150px] pointer-events-none">
              {evalResult.isPassed ? "🏅" : "📖"}
            </div>
          </div>

          {/* AI Proctoring Integrity Report */}
          {evalResult.proctoringSummary && (
            <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-md mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-base font-extrabold text-[#1D3557]">
                    AI Proctoring Examination Record
                  </h4>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    evalResult.proctoringSummary.status === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Integrity: {evalResult.proctoringSummary.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs mb-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Integrity Score</div>
                  <div className="text-lg font-black text-emerald-600">
                    {evalResult.proctoringSummary.integrityScore}/100
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Logged Events</div>
                  <div className="text-lg font-black text-[#1D3557]">
                    {evalResult.proctoringSummary.totalEvents}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">AI Verification</div>
                  <div className="text-lg font-black text-indigo-600">Compliant</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Note: In Phase 7, passing students will have their official certificates generated and signed after automated review.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {evalResult.isPassed ? (
              <Link
                href="/learning/certificate"
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-black text-base shadow-xl hover:scale-105 transition flex items-center gap-2 border-b-4 border-emerald-700"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>View Official Certificate 🎓</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/learning/certificate"
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-500 text-white font-black text-base shadow-xl hover:scale-105 transition flex items-center gap-2 border-b-4 border-amber-700"
              >
                <Timer className="w-5 h-5 text-white" />
                <span>Re-Exam Cooldown & Eligibility ⏱️</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            <Link
              href="/learning/mock-exam"
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black text-base shadow-xl hover:scale-105 transition flex items-center gap-2 border-b-4 border-[#C85A3D]"
            >
              <span>Back to Mock Exam Page</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={() => {
                setViewState("overview");
                setEvalResult(null);
              }}
              className="py-3 px-6 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Exam Overview</span>
            </button>

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
