"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  PracticeQuestion,
  PracticeAttempt,
  PracticeCategoryOption,
  WorksheetFilterOptions,
  PRACTICE_CATEGORIES,
  generateWorksheet,
} from "@/data/practiceData";
import confetti from "canvas-confetti";

import { useAuth } from "@/context/AuthContext";

interface PracticeContextType {
  // Current view mode: dashboard vs active worksheet
  viewMode: "dashboard" | "worksheet" | "result";
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

  // Live Timer
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

  // Action Handlers
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
  const [viewMode, setViewMode] = useState<"dashboard" | "worksheet" | "result">("worksheet");
  const [selectedLevel, setSelectedLevelState] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<WorksheetFilterOptions>({
    level: 1,
    digits: defaultCategory.digits,
    ruleType: defaultCategory.ruleType,
    rowCount: defaultCategory.rowCount,
    categoryId: defaultCategory.id,
  });
  const [activeCategory, setActiveCategory] = useState<PracticeCategoryOption | null>(defaultCategory);
  const [worksheetTitle, setWorksheetTitle] = useState<string>(defaultCategory.name);

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => {
    return generateWorksheet(
      {
        level: 1,
        digits: defaultCategory.digits,
        ruleType: defaultCategory.ruleType,
        rowCount: defaultCategory.rowCount,
        categoryId: defaultCategory.id,
      },
      20
    );
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<string, boolean>>({});
  const [isWorksheetComplete, setIsWorksheetComplete] = useState<boolean>(false);

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Timer interval
  useEffect(() => {
    if (isTimerRunning && viewMode === "worksheet") {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, viewMode]);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);
  const resetTimer = () => setTimerSeconds(0);

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
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  }, []);

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
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  }, []);

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
  const submitWorksheet = () => {
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
      timeTakenSeconds: timerSeconds,
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
  };

  // Retry the exact same worksheet
  const restartSameWorksheet = () => {
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setCurrentQuestionIndex(0);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  };

  // Generate a brand new random set of 20 questions with the same filter
  const generateNewRandomWorksheet = () => {
    const generated = generateWorksheet(activeFilter, 20);
    setQuestions(generated);
    setUserAnswers({});
    setIsSubmitted({});
    setIsWorksheetComplete(false);
    setCurrentQuestionIndex(0);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCurrentAttempt(null);
    setViewMode("worksheet");
  };

  const backToDashboard = () => {
    setIsTimerRunning(false);
    setViewMode("dashboard");
  };

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
        timerSeconds,
        isTimerRunning,
        toggleTimer,
        resetTimer,
        score,
        totalQuestions,
        accuracy,
        currentAttempt,
        attemptHistory,
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
