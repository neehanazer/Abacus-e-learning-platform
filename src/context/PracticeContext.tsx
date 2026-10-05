"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  PracticeQuestion,
  PracticeAttempt,
  PracticeCategoryOption,
  WorksheetFilterOptions,
  PRACTICE_CATEGORIES,
  generateWorksheet,
  generateComprehensivePracticeQuestions,
} from "@/data/practiceData";
import {
  generateUntimedWorksheetQuestions,
  UNTIMED_WORKSHEET_OPTIONS,
} from "@/data/untimedWorksheetsData";
import confetti from "canvas-confetti";

import { useAuth } from "@/context/AuthContext";

interface PracticeContextType {
  // Current view mode: dashboard vs active worksheet
  viewMode: "dashboard" | "worksheet" | "result";
  setViewMode: (mode: "dashboard" | "worksheet" | "result") => void;
  selectedLevel: number;
  setSelectedLevel: (level: number) => void;
  studentMaxLevel: number;
  setStudentMaxLevel: (level: number) => void;
  isLevelUnlocked: (level: number) => boolean;

  // Active Worksheet Config
  activeFilter: WorksheetFilterOptions;
  activeCategory: PracticeCategoryOption | null;
  worksheetTitle: string;
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  currentQuestion: PracticeQuestion | null;

  // Answers & Submission
  userAnswers: Record<string, number | null>;
  isSubmitted: Record<string, boolean>;
  isWorksheetComplete: boolean;

  // Live Timer & Practice Mode (1: Without Timer, 2: With Timer)
  practiceMode: "untimed" | "timed";
  setPracticeMode: (mode: "untimed" | "timed") => void;
  targetMinutes: number;
  setTargetMinutes: (mins: number) => void;
  timeRemaining: number;
  setTimeRemaining: (secs: number) => void;
  isTimeUp: boolean;
  setIsTimeUp: (val: boolean) => void;
  timerSeconds: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Results & Scoring
  score: number;
  totalQuestions: number;
  accuracy: number;
  currentAttempt: PracticeAttempt | null;
  attemptHistory: PracticeAttempt[];

  // Untimed Worksheets Navigation & Active Categories
  showUntimedDirectory: boolean;
  setShowUntimedDirectory: (val: boolean) => void;
  activeUntimedOptionId: string | null;
  setActiveUntimedOptionId: (id: string | null) => void;
  activeUntimedCategory: string;
  setActiveUntimedCategory: (cat: string) => void;
  backToUntimedDirectory: (category?: string) => void;
  backToSimpleCalculation: () => void;

  // Action Handlers
  startPracticeSession: (mode: "untimed" | "timed", minutes?: number) => void;
  startUntimedWorksheet: (optionId: string, count?: number) => void;
  startCategoryWorksheet: (category: PracticeCategoryOption) => void;
  startCustomWorksheet: (filter: WorksheetFilterOptions, title?: string) => void;
  answerQuestion: (questionId: string, answer: number | null) => void;
  submitCurrentQuestion: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitWorksheet: () => void;
  restartSameWorksheet: () => void;
  generateNewRandomWorksheet: () => void;
  backToDashboard: () => void;
  
  // Analytics helpers
  getCategoryBestScore: (categoryId: string) => { score: number; total: number } | null;
  getCategoryLastScore: (categoryId: string) => { score: number; total: number } | null;
  getCategoryAttemptsCount: (categoryId: string) => number;
  getCategoryAttemptsList: (categoryId: string) => PracticeAttempt[];
  clearAttemptHistory: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

const ATTEMPTS_STORAGE_KEY = "abacus_practice_attempts_v1";

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Extract initial level from auth user (e.g. Level 2)
  const initialStudentLevel = parseInt(user?.abacusLevel?.match(/\d+/)?.[0] || "2", 10);
  const [studentMaxLevel, setStudentMaxLevel] = useState<number>(initialStudentLevel || 2);

  const defaultCategory = PRACTICE_CATEGORIES[0];
  const [viewMode, setViewMode] = useState<"dashboard" | "worksheet" | "result">("dashboard");
  const [selectedLevel, setSelectedLevelState] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<WorksheetFilterOptions>({
    level: 1,
    digits: defaultCategory.digits,
    ruleType: defaultCategory.ruleType,
    rowCount: defaultCategory.rowCount,
    categoryId: defaultCategory.id,
  });
  const [activeCategory, setActiveCategory] = useState<PracticeCategoryOption | null>(defaultCategory);
  const [worksheetTitle, setWorksheetTitle] = useState<string>("Practice Without Timer");

  // Untimed worksheets directory & active category state
  const [showUntimedDirectory, setShowUntimedDirectory] = useState<boolean>(false);
  const [activeUntimedOptionId, setActiveUntimedOptionId] = useState<string | null>(null);
  const [activeUntimedCategory, setActiveUntimedCategory] = useState<string>("all");

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => {
    return generateComprehensivePracticeQuestions(20);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<string, boolean>>({});
  const [isWorksheetComplete, setIsWorksheetComplete] = useState<boolean>(false);

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Practice Modes: Section 1 (Without Timer) vs Section 2 (With Timer)
  const [practiceMode, setPracticeMode] = useState<"untimed" | "timed">("untimed");
  const [targetMinutes, setTargetMinutesState] = useState<number>(5);
  const [timeRemaining, setTimeRemaining] = useState<number>(5 * 60);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  const setTargetMinutes = (mins: number) => {
    const clamped = Math.max(1, Math.min(60, Math.round(mins)));
    setTargetMinutesState(clamped);
    setTimeRemaining(clamped * 60);
  };

  const submitWorksheetRef = useRef<() => void>(() => {});

  const [currentAttempt, setCurrentAttempt] = useState<PracticeAttempt | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<PracticeAttempt[]>([]);

  // Load saved attempt history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAttemptHistory(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save attempt history to localStorage
  const saveAttemptHistory = (newHistory: PracticeAttempt[]) => {
    try {
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(newHistory));
      setAttemptHistory(newHistory);
    } catch {
      // Ignore
    }
  };

  // Timer interval (incremental for stats + countdown if timed mode)
  useEffect(() => {
    if (isTimerRunning && viewMode === "worksheet") {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);

        if (practiceMode === "timed") {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsTimeUp(true);
              if (submitWorksheetRef.current) {
                submitWorksheetRef.current();
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, viewMode, practiceMode]);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);
  const resetTimer = () => {
    setTimerSeconds(0);
    setTimeRemaining(targetMinutes * 60);
    setIsTimeUp(false);
  };

  // Start Comprehensive Practice Session (Untimed or Timed, covering all 4 core topics: Direct, Small Friend, Big Friend, 1-Digit 5-Row)
  const startPracticeSession = useCallback((mode: "untimed" | "timed", minutes?: number) => {
    const selectedMins = minutes ? Math.max(1, Math.min(60, Math.round(minutes))) : targetMinutes;
    setPracticeMode(mode);
    if (minutes) {
      setTargetMinutesState(selectedMins);
    }

    const generated = generateComprehensivePracticeQuestions(20);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setTimerSeconds(0);
    setTimeRemaining(selectedMins * 60);
    setIsTimeUp(false);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setWorksheetTitle(mode === "timed" ? `Practice With Timer (${selectedMins} Mins)` : "Practice Without Timer");
    setViewMode("worksheet");
  }, [targetMinutes]);

  // Start specific untimed worksheet from the 31 options (loads all 30 questions from official PDF where available)
  const startUntimedWorksheet = useCallback((optionId: string, count: number = 30) => {
    const option = UNTIMED_WORKSHEET_OPTIONS.find((o) => o.id === optionId) || UNTIMED_WORKSHEET_OPTIONS[0];
    const generated = generateUntimedWorksheetQuestions(optionId, count);
    setActiveUntimedOptionId(optionId);
    setActiveUntimedCategory(option.category || "simple");
    setShowUntimedDirectory(true);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setTimerSeconds(0);
    setPracticeMode("untimed");
    setIsTimerRunning(false);
    setCurrentAttempt(null);
    setWorksheetTitle(option.name);
    setViewMode("worksheet");
  }, []);

  // Start category worksheet
  const startCategoryWorksheet = useCallback((category: PracticeCategoryOption) => {
    const filter: WorksheetFilterOptions = {
      level: category.level,
      digits: category.digits,
      ruleType: category.ruleType,
      rowCount: category.rowCount || "all",
      categoryId: category.id,
    };

    setActiveFilter(filter);
    setActiveCategory(category);
    setWorksheetTitle(category.name);

    const generated = generateWorksheet(filter, 20);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setTimerSeconds(0);
    setTimeRemaining(targetMinutes * 60);
    setIsTimeUp(false);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  }, [targetMinutes]);

  const setSelectedLevel = useCallback((lvl: number) => {
    setSelectedLevelState(lvl);
    const firstCatOfLevel = PRACTICE_CATEGORIES.find((c) => c.level === lvl) || PRACTICE_CATEGORIES[0];
    startCategoryWorksheet(firstCatOfLevel);
  }, [startCategoryWorksheet]);

  // Start custom worksheet
  const startCustomWorksheet = useCallback((filter: WorksheetFilterOptions, title?: string) => {
    setActiveFilter(filter);
    setActiveCategory(null);
    setWorksheetTitle(title || `Level ${filter.level} Custom Worksheet`);

    const generated = generateWorksheet(filter, 20);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setTimerSeconds(0);
    setTimeRemaining(targetMinutes * 60);
    setIsTimeUp(false);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  }, [targetMinutes]);

  // Answer a question
  const answerQuestion = (questionId: string, answer: number | null) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Mark single question as submitted for immediate feedback
  const submitCurrentQuestion = (questionId: string) => {
    setIsSubmitted((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit complete worksheet
  const submitWorksheet = useCallback(() => {
    setIsTimerRunning(false);
    setIsWorksheetComplete(true);

    let correctCount = 0;
    const answersRecord = questions.map((q) => {
      const uAns = userAnswers[q.id] ?? null;
      const isCorrect = uAns === q.targetAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionNumbers: q.numbers,
        correctAnswer: q.targetAnswer,
        userAnswer: uAns,
        isCorrect,
        ruleHint: q.ruleHint,
      };
    });

    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const elapsedSeconds = practiceMode === "timed" ? Math.max(1, (targetMinutes * 60) - timeRemaining) : timerSeconds;

    const newAttempt: PracticeAttempt = {
      id: `attempt-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      level: activeFilter.level,
      categoryTitle: activeCategory?.name || worksheetTitle,
      ruleType: activeFilter.ruleType || "all",
      rowCount: activeFilter.rowCount === "all" ? 3 : Number(activeFilter.rowCount || 3),
      digits: activeFilter.digits === "all" ? 1 : Number(activeFilter.digits || 1),
      score: correctCount,
      totalQuestions: total,
      accuracy,
      timeTakenSeconds: elapsedSeconds,
      isTimed: practiceMode === "timed",
      targetMinutes: practiceMode === "timed" ? targetMinutes : undefined,
      answers: answersRecord,
    };

    setCurrentAttempt(newAttempt);
    const updatedHistory = [newAttempt, ...attemptHistory];
    saveAttemptHistory(updatedHistory);

    // Trigger celebration confetti
    if (accuracy >= 60) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#F4A261", "#E76F51", "#2A9D8F", "#E9C46A", "#9B5DE5"],
        });
      } catch {
        // Confetti fallback
      }
    }

    setViewMode("result");
  }, [questions, userAnswers, activeFilter, activeCategory, worksheetTitle, timerSeconds, practiceMode, targetMinutes, timeRemaining, attemptHistory]);

  submitWorksheetRef.current = submitWorksheet;

  // Retry the exact same worksheet
  const restartSameWorksheet = () => {
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setCurrentQuestionIndex(0);
    setTimerSeconds(0);
    setTimeRemaining(targetMinutes * 60);
    setIsTimeUp(false);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  };

  // Generate a brand new random set of 20 questions with the 4 core topics
  const generateNewRandomWorksheet = () => {
    const generated = generateComprehensivePracticeQuestions(20);
    setQuestions(generated);
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setCurrentQuestionIndex(0);
    setTimerSeconds(0);
    setTimeRemaining(targetMinutes * 60);
    setIsTimeUp(false);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  };

  const backToUntimedDirectory = useCallback((category?: string) => {
    setIsTimerRunning(false);
    setShowUntimedDirectory(true);
    if (category) {
      setActiveUntimedCategory(category);
    }
    setViewMode("dashboard");
  }, []);

  const backToSimpleCalculation = useCallback(() => {
    setIsTimerRunning(false);
    setShowUntimedDirectory(true);
    setActiveUntimedCategory("simple");
    setViewMode("dashboard");
  }, []);

  const backToDashboard = useCallback(() => {
    setIsTimerRunning(false);
    setShowUntimedDirectory(false);
    setActiveUntimedOptionId(null);
    setViewMode("dashboard");
  }, []);

  // Analytics
  const getCategoryAttemptsList = (categoryId: string) => {
    const targetCat = PRACTICE_CATEGORIES.find((c) => c.id === categoryId);
    if (!targetCat) return [];
    return attemptHistory.filter(
      (a) => a.categoryTitle === targetCat.name || a.level === targetCat.level
    );
  };

  const getCategoryBestScore = (categoryId: string) => {
    const list = getCategoryAttemptsList(categoryId);
    if (list.length === 0) return null;
    const best = list.reduce((max, curr) => (curr.score > max.score ? curr : max), list[0]);
    return { score: best.score, total: best.totalQuestions };
  };

  const getCategoryLastScore = (categoryId: string) => {
    const list = getCategoryAttemptsList(categoryId);
    if (list.length === 0) return null;
    const last = list[0]; // newest is first
    return { score: last.score, total: last.totalQuestions };
  };

  const getCategoryAttemptsCount = (categoryId: string) => {
    return getCategoryAttemptsList(categoryId).length;
  };

  const clearAttemptHistory = () => {
    localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
    setAttemptHistory([]);
  };

  const currentQuestion = questions[currentQuestionIndex] || null;
  const score = Object.entries(userAnswers).filter(
    ([qId, ans]) => ans !== null && questions.find((q) => q.id === qId)?.targetAnswer === ans
  ).length;
  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const isLevelUnlocked = (lvl: number) => {
    return lvl <= studentMaxLevel;
  };

  return (
    <PracticeContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedLevel,
        setSelectedLevel,
        studentMaxLevel,
        setStudentMaxLevel,
        isLevelUnlocked,
        activeFilter,
        activeCategory,
        worksheetTitle,
        questions,
        currentQuestionIndex,
        currentQuestion,
        userAnswers,
        isSubmitted,
        isWorksheetComplete,
        practiceMode,
        setPracticeMode,
        targetMinutes,
        setTargetMinutes,
        timeRemaining,
        setTimeRemaining,
        isTimeUp,
        setIsTimeUp,
        timerSeconds,
        isTimerRunning,
        toggleTimer,
        resetTimer,
        score,
        totalQuestions,
        accuracy,
        currentAttempt,
        attemptHistory,
        showUntimedDirectory,
        setShowUntimedDirectory,
        activeUntimedOptionId,
        setActiveUntimedOptionId,
        activeUntimedCategory,
        setActiveUntimedCategory,
        backToUntimedDirectory,
        backToSimpleCalculation,
        startPracticeSession,
        startUntimedWorksheet,
        startCategoryWorksheet,
        startCustomWorksheet,
        answerQuestion,
        submitCurrentQuestion,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        submitWorksheet,
        restartSameWorksheet,
        generateNewRandomWorksheet,
        backToDashboard,
        getCategoryBestScore,
        getCategoryLastScore,
        getCategoryAttemptsCount,
        getCategoryAttemptsList,
        clearAttemptHistory,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
};
