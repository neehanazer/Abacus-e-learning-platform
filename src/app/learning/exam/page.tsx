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
  Clock,
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
import { isDueDateToday } from "@/data/homeworkData";

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

function cleanQuestionText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^Calculate\s*(?:[A-Za-z0-9\s()×÷/+-]+)?:\s*/i, "")
    .trim();
}

function formatMathExpression(text: string): string {
  const cleaned = cleanQuestionText(text);
  if (!cleaned) return "";
  if (cleaned.endsWith("=") || cleaned.endsWith("= ?")) {
    return cleaned;
  }
  return `${cleaned} = ?`;
}

const LEVEL_FINAL_EXAM_MAP: Record<number, { id: string; title: string; description: string }> = {
  1: {
    id: "67b100000000000000000003",
    title: "Level 1: Official Level Certification Final Exam",
    description:
      "Formal Level 1 Certification Exam (10 min max). Requires meeting readiness criteria before unlocking. Monitored with live camera & microphone AI proctoring.",
  },
  2: {
    id: "67b100000000000000000012",
    title: "Level 2: Official Level Certification Final Exam",
    description:
      "Formal Level 2 Certification Exam testing 1-Digit 10-15 rows and 2-Digit 3-8 rows multi-row stamina. AI camera & microphone proctored.",
  },
  3: {
    id: "67b100000000000000000013",
    title: "Level 3: Official Level Certification Final Exam",
    description:
      "Formal Level 3 Certification Exam covering 1-Digit 20-25 rows, 2-Digit 10-12 rows, and 3-Digit calculations. Monitored with live AI proctoring.",
  },
  4: {
    id: "67b100000000000000000014",
    title: "Level 4: Official Level Certification Final Exam",
    description:
      "Formal Level 4 Certification Exam testing 4-Digit multi-row, 3-Digit 10-row, and 2-Digit 20-row calculations. AI proctored.",
  },
  5: {
    id: "67b100000000000000000015",
    title: "Level 5: Official Level Certification Final Exam",
    description:
      "Formal Level 5 Certification Exam testing 2D × 1D Multiplication, 4-Digit 7-10 rows, and 3-Digit multi-row continuous drills. AI proctored.",
  },
  6: {
    id: "67b100000000000000000016",
    title: "Level 6: Official Level Certification Final Exam",
    description:
      "Formal Level 6 Certification Exam covering Advanced Multi-Digit Multiplication, Division, and 5-Digit rows. AI proctored.",
  },
  7: {
    id: "67b100000000000000000017",
    title: "Level 7: Official Level Certification Final Exam",
    description:
      "Formal Level 7 Certification Exam testing 3D×2D & 3D×3D Multiplication, 3D÷2D Division, and Multi-Row accuracy. AI proctored.",
  },
  8: {
    id: "67b100000000000000000018",
    title: "Level 8: Grand Master Mental Certification Final Exam",
    description:
      "Capstone Grand Master Certification Exam testing Anzan Mental Abacus mastery, Competition Flash Drills, and Rapid Multi-Row Mental Arithmetic. Fully proctored.",
  },
};

const CERTIFICATION_LEVELS = [
  { level: 1, name: "Foundations", icon: "🌱" },
  { level: 2, name: "Explorer", icon: "🚀" },
  { level: 3, name: "Intermediate", icon: "⭐" },
  { level: 4, name: "Advanced", icon: "⚡" },
  { level: 5, name: "Senior Expert", icon: "🔥" },
  { level: 6, name: "Master", icon: "🏆" },
  { level: 7, name: "Champion", icon: "👑" },
  { level: 8, name: "Grand Master", icon: "🧙‍♂️" },
];

export default function FinalExamPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

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

  const currentFinalDef = LEVEL_FINAL_EXAM_MAP[activeLevelTab] || LEVEL_FINAL_EXAM_MAP[1];
  const finalExamId = currentFinalDef.id;

  // State: "overview" | "session" | "result"
  const [viewState, setViewState] = useState<"overview" | "session" | "result">("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Readiness data
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [examData, setExamData] = useState<any>(null);

  // Active exam session state
  const [attemptId, setAttemptId] = useState<string>("");

  // Homework progress metrics (Compulsory 70% completion to attend exam)
  const [homeworkStats, setHomeworkStats] = useState<{
    total: number;
    completed: number;
    percentage: number;
    isEligible: boolean;
    dueTodayTasks: { id: string; title: string; dueDate: string }[];
  }>({
    total: 0,
    completed: 0,
    percentage: 100,
    isEligible: true,
    dueTodayTasks: [],
  });

  // 24-hour Re-Examination Cooldown for failed attempts
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [cooldownExpiry, setCooldownExpiry] = useState<string | null>(null);
  const [hasPreviousFailedAttempt, setHasPreviousFailedAttempt] = useState<boolean>(false);

  // 24-Hour Cooldown ticker
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const ticker = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(ticker);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [cooldownSeconds]);

  const studentKey = React.useMemo(() => {
    return user?.id || user?.email ? String(user.id || user.email).replace(/[^a-zA-Z0-9_-]/g, "_") : "guest";
  }, [user]);

  // Compute student homework progress from storage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(`abacus_homework_state_v3_${studentKey}`);
      let tasks: any[] = [];
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) tasks = parsed;
      }
      if (tasks.length === 0) {
        const { INITIAL_HOMEWORK_LIST } = require("@/data/homeworkData");
        tasks = INITIAL_HOMEWORK_LIST;
      }

      const currentLvlTasks = tasks.filter((t: any) => t.level === studentLevel);
      const completed = currentLvlTasks.filter(
        (t: any) =>
          t.status === "completed" ||
          t.status === "submitted" ||
          t.status === "evaluated" ||
          (t.attemptsCount > 0 && t.lastAttemptDate)
      );
      const pending = currentLvlTasks.filter(
        (t: any) =>
          t.status !== "completed" &&
          t.status !== "submitted" &&
          t.status !== "evaluated"
      );

      const dueToday = pending
        .filter((t: any) => isDueDateToday(t.dueDate))
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
        }));

      const total = currentLvlTasks.length;
      const pct = total > 0 ? Math.round((completed.length / total) * 100) : 100;
      const eligible = total === 0 || pct >= 70;

      setHomeworkStats({
        total,
        completed: completed.length,
        percentage: pct,
        isEligible: eligible,
        dueTodayTasks: dueToday,
      });
    } catch {}
  }, [studentKey, studentLevel]);

  // Sync with API metrics from readiness if provided
  useEffect(() => {
    if (readiness && (readiness as any).homeworkMetrics) {
      const hw = (readiness as any).homeworkMetrics;
      if (hw.total > 0) {
        setHomeworkStats((prev) => ({
          ...prev,
          total: hw.total,
          completed: hw.completed,
          percentage: hw.completionRate,
          isEligible: hw.isEligible,
          dueTodayTasks:
            hw.dueTodayTitles && hw.dueTodayTitles.length > 0
              ? hw.dueTodayTitles.map((title: string, i: number) => ({
                  id: `due-api-${i}`,
                  title,
                  dueDate: "Today",
                }))
              : prev.dueTodayTasks,
        }));
      }
    }
  }, [readiness]);
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

  // Fetch Readiness & Final Exam Info
  const fetchExamOverview = useCallback(async (targetExamId: string = finalExamId) => {
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
      const examRes = await fetch(`/api/exams/${targetExamId}`);
      const examJson = await examRes.json();
      if (examJson.success) {
        setExamData(examJson.data);
      } else {
        // Fallback default structure for selected level
        const currentDef = LEVEL_FINAL_EXAM_MAP[activeLevelTab] || LEVEL_FINAL_EXAM_MAP[1];
        setExamData({
          id: targetExamId,
          title: currentDef.title,
          description: currentDef.description,
          levelName: `Level ${activeLevelTab}`,
          duration: 10,
          totalQuestions: 10,
          totalMarks: 100,
          passingMarks: 70,
          isLocked: readinessJson.data?.readinessScore < 70,
        });
      }

      // 3. Check 24-hour Re-Examination Cooldown (Only allow re-exam after 24h if failed)
      try {
        const reExamRes = await fetch(
          `/api/exams/re-exam-status?examId=${targetExamId}&studentId=${encodeURIComponent(user?.id || studentKey)}`
        );
        const reExamJson = await reExamRes.json();
        if (reExamJson.success && reExamJson.data) {
          const st = reExamJson.data;
          if (st.hasAttempted && !st.isPassed) {
            setHasPreviousFailedAttempt(true);
            if (!st.canReEnroll && st.cooldown?.eligibleAt) {
              const eligibleTime = new Date(st.cooldown.eligibleAt).getTime();
              const remaining = Math.max(0, Math.floor((eligibleTime - Date.now()) / 1000));
              setCooldownSeconds(remaining);
              setCooldownExpiry(st.cooldown.eligibleAt);
            } else {
              setCooldownSeconds(0);
            }
          }
        }
      } catch {}

      // Fallback check from local storage cooldown
      try {
        const localCooldown = localStorage.getItem(`abacus_exam_cooldown_${targetExamId}_${studentKey}`);
        if (localCooldown) {
          const eligibleTime = new Date(localCooldown).getTime();
          const remaining = Math.max(0, Math.floor((eligibleTime - Date.now()) / 1000));
          if (remaining > 0) {
            setHasPreviousFailedAttempt(true);
            setCooldownSeconds((prev) => Math.max(prev, remaining));
            setCooldownExpiry(localCooldown);
          } else {
            localStorage.removeItem(`abacus_exam_cooldown_${targetExamId}_${studentKey}`);
          }
        }
      } catch {}
    } catch (err: any) {
      console.error("Error loading final exam:", err);
      setError(err.message || "Failed to load exam information");
    } finally {
      setLoading(false);
    }
  }, [finalExamId, activeLevelTab]);

  useEffect(() => {
    fetchExamOverview(finalExamId);
  }, [fetchExamOverview, finalExamId]);

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

      if (cooldownSeconds > 0) {
        const hours = Math.floor(cooldownSeconds / 3600);
        const mins = Math.floor((cooldownSeconds % 3600) / 60);
        const secs = cooldownSeconds % 60;
        throw new Error(
          `Re-examination Cooldown Active: Under official rules, students who fail can only reappear for this examination after 24 hours. Please wait ${hours}h ${mins}m ${secs}s.`
        );
      }

      if (homeworkStats.total > 0 && !homeworkStats.isEligible) {
        throw new Error(
          `Final Exam Locked: You have completed ${homeworkStats.percentage}% (${homeworkStats.completed}/${homeworkStats.total}) of your Level ${studentLevel} homework assignments. At least 70% homework completion is strictly compulsory to attend the final exam.`
        );
      }

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

      // Automatic level upgrade upon passing final exam
      if (data.data.isPassed) {
        const nextLevel = Math.min(8, studentLevel + 1);
        const existingCompleted = Array.isArray(user?.completedLevels) ? [...user.completedLevels] : [];
        if (!existingCompleted.includes(studentLevel)) {
          existingCompleted.push(studentLevel);
        }
        updateProfile({
          currentLevel: nextLevel,
          selectedLevel: `Level ${nextLevel}`,
          abacusLevel: `Level ${nextLevel}`,
          completedLevels: existingCompleted,
          finalExamStatus: "PASS",
          finalExamScore: data.data.score,
          completionDate: new Date().toISOString(),
        });
      } else {
        const failureDate = new Date();
        const eligibleAt = new Date(failureDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
        try {
          localStorage.setItem(`abacus_exam_cooldown_${finalExamId}_${studentKey}`, eligibleAt);
        } catch {}
        setCooldownSeconds(24 * 3600);
        setCooldownExpiry(eligibleAt);
        setHasPreviousFailedAttempt(true);
        updateProfile({
          finalExamStatus: "FAIL",
          finalExamScore: data.data.score,
        });
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

  const formatCooldownTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isCooldownActive = cooldownSeconds > 0;
  const isHomeworkLocked = homeworkStats.total > 0 && !homeworkStats.isEligible;
  const isLocked =
    isCooldownActive ||
    isHomeworkLocked ||
    (examData?.isLocked ?? (readiness ? readiness.readinessScore < 70 : false));
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1D3557] pb-24">
      {/* ============================================================== */}
      {/* 1. OVERVIEW & READINESS GUARD VIEW */}
      {/* ============================================================== */}
      {viewState === "overview" && (
        <div data-tour="exam-center" className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          {/* URGENT DUE DATE TODAY NOTIFICATION BANNER */}
          {homeworkStats.dueTodayTasks.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-500/50 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-sm animate-pulse">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md text-xl">
                  🔔
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                      ⚠️ Urgent: Homework Due Today!
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {homeworkStats.dueTodayTasks.length} assignment{homeworkStats.dueTodayTasks.length > 1 ? "s" : ""} pending
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#1D3557]">
                    Today is the due date for your assigned homework!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                    {homeworkStats.dueTodayTasks.map((t) => `"${t.title}"`).join(", ")} — At least 70% homework completion is strictly compulsory to attend the Official Final Exam. Complete it before midnight!
                  </p>
                </div>
              </div>
              <Link
                href="/learning/homework"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
              >
                <span>Submit Homework Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* COMPULSORY 70% HOMEWORK LOCK STATUS BANNER */}
          {isHomeworkLocked && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 font-black text-lg">
                  🔒
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200 px-2 py-0.5 rounded-full">
                      Exam Attendance Blocked
                    </span>
                    <span className="text-xs font-bold text-rose-700">
                      Compulsory: 70% Homework Completion Required
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-rose-950">
                    You have completed {homeworkStats.percentage}% ({homeworkStats.completed}/{homeworkStats.total}) of Level {studentLevel} homework assignments.
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5">
                    You must complete at least {Math.ceil(homeworkStats.total * 0.7) - homeworkStats.completed} more homework assignment(s) before you are permitted to start this official certification exam.
                  </p>
                </div>
              </div>
              <Link
                href="/learning/homework"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1.5 flex-shrink-0"
              >
                Go to Homework Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* 24-HOUR RE-EXAMINATION COOLDOWN BANNER */}
          {isCooldownActive && (
            <div className="bg-gradient-to-r from-rose-950 via-purple-950 to-[#1D3557] rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-8 border-2 border-rose-400/50 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-400/40">
                    <Timer className="w-3.5 h-3.5 text-rose-300" />
                    Official Re-Examination Policy • 24-Hour Cooldown Active
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-heading text-rose-100">
                    Reappearance Available In:
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                    Under official certification regulations, once a student does not achieve passing marks (≥70%), they are compulsory required to wait <strong>24 hours</strong> before reappearing for the exam. This interval ensures focused worksheet review and prevents cognitive fatigue.
                  </p>
                </div>

                {/* Cooldown Digital Countdown Clock */}
                <div className="bg-black/50 border-2 border-rose-400/60 rounded-2xl p-5 text-center min-w-[220px] backdrop-blur-md shadow-inner">
                  <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-1">
                    Time Until Reappearance
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-wider">
                    {formatCooldownTime(cooldownSeconds)}
                  </div>
                  <div className="text-[10px] text-white/60 mt-1 font-semibold">
                    Hours : Minutes : Seconds
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 opacity-10 text-[160px] pointer-events-none select-none">
                ⏱️
              </div>
            </div>
          )}

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
                onClick={() => fetchExamOverview(finalExamId)}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Enrolled Level Final Exam Banner (No level switching allowed) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-indigo-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl shadow-inner">
                🎓
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Assigned Final Examination:
                </div>
                <div className="text-base font-extrabold text-[#1D3557]">
                  Level {studentLevel} Final Certification Exam Only
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-300">
                🔒 Exam Access Restricted to Enrolled Level {studentLevel}
              </span>
            </div>
          </div>

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
              {cooldownSeconds > 0 ? (
                <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200 px-2.5 py-0.5 rounded-full">
                        24-Hour Cooldown Active
                      </span>
                      <span className="text-xs font-bold text-rose-700">
                        {formatCooldownTime(cooldownSeconds)} remaining
                      </span>
                    </div>
                    <div className="text-xs text-rose-900 font-medium">
                      Under official policy, students who failed must observe a 24-hour preparation interval before reappearing. You can reappear once the countdown expires.
                    </div>
                  </div>
                  <button
                    disabled
                    className="py-3 px-6 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                  >
                    <Timer className="w-4 h-4" />
                    <span>Reappear in {formatCooldownTime(cooldownSeconds)}</span>
                  </button>
                </div>
              ) : isLocked ? (
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
                    {hasPreviousFailedAttempt ? (
                      <>
                        <RotateCcw className="w-5 h-5 text-amber-300" />
                        <span>Reappear for Final Certification Exam</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5 text-amber-300" />
                        <span>Begin Official Final Exam</span>
                      </>
                    )}
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
                  {examData?.title || `Official Level ${activeLevelTab} Certification Exam`}
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
              {currentQ.ruleType || `Official Level ${activeLevelTab} Evaluation Problem`}
            </span>

            {/* Clean Horizontal Math Expression: Display as a clean, large inline equation */}
            <div className="my-6 px-4 py-6 sm:py-8 rounded-3xl bg-[#FFFDF7] border-2 border-indigo-200/90 shadow-sm flex items-center justify-center">
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-wide text-[#1D3557] select-all leading-relaxed break-words text-center">
                {formatMathExpression(currentQ.questionText)}
              </h3>
            </div>

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

            {/* Prev / Next & Submit controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-extrabold hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-500">
                {currentQuestionIndex + 1} / {questions.length}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Submit Final Exam Button placed right next to Next */}
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
                  className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? "Grading..." : "Submit Exam"}</span>
                </button>
              </div>
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
                {evalResult.isPassed ? `🎓 Level ${activeLevelTab} Certified!` : "📚 Certification Re-attempt Needed"}
              </span>

              <h2 className="text-3xl sm:text-5xl font-black font-heading mb-2">
                Score: {evalResult.score} / {evalResult.totalMarks}
              </h2>
              <p className="text-white/90 text-sm font-medium mb-6">
                {evalResult.isPassed
                  ? `Outstanding! You achieved ${evalResult.percentage}%, successfully passing the 70% certification requirement.`
                  : `You achieved ${evalResult.percentage}%. You need 70% to earn your official Level ${activeLevelTab} graduation certificate.`}
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

          {/* 24-Hour Cooldown Notice if Failed */}
          {!evalResult.isPassed && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 mb-8 text-center max-w-2xl mx-auto shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-black uppercase mb-2">
                <Timer className="w-4 h-4 text-rose-700" />
                24-Hour Re-Examination Cooldown Initiated
              </div>
              <h4 className="text-lg font-black text-rose-950 mb-1">
                Reappearance Option Locked for 24 Hours
              </h4>
              <p className="text-xs sm:text-sm text-rose-800 leading-relaxed font-medium">
                Per official examination regulations, if a student does not achieve passing marks (≥70%), the option to reappear is strictly locked for 24 hours. The reappearance option will automatically unlock once the cooldown expires.
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
