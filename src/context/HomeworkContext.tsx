"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  HomeworkTask,
  HomeworkAttempt,
  INITIAL_HOMEWORK_LIST,
  createHomeworkFromPractice,
} from "@/data/homeworkData";
import { PracticeCategoryOption } from "@/data/practiceData";
import confetti from "canvas-confetti";

interface HomeworkContextType {
  // State
  homeworkList: HomeworkTask[];
  activeHomework: HomeworkTask | null;
  activeQuestionIndex: number;
  userAnswers: Record<string, number | null>;
  timerSeconds: number;
  isTimerRunning: boolean;
  viewMode: "dashboard" | "intro" | "player" | "submit-modal" | "result";
  activeTab: "all" | "pending" | "completed" | "attempts";
  attemptHistory: HomeworkAttempt[];
  latestAttempt: HomeworkAttempt | null;
  assignModalOpen: boolean;

  // Setters & Actions
  setActiveTab: (tab: "all" | "pending" | "completed" | "attempts") => void;
  setAssignModalOpen: (open: boolean) => void;
  openHomeworkIntro: (hw: HomeworkTask) => void;
  startHomework: (hw: HomeworkTask) => void;
  answerQuestion: (questionId: string, answer: number | null) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
  submitHomework: () => void;
  retryHomework: (hw: HomeworkTask) => void;
  backToDashboard: () => void;
  assignNewHomework: (
    category: PracticeCategoryOption,
    questionCount?: number,
    dueDate?: string,
    instructions?: string
  ) => void;
  deleteHomework: (hwId: string) => void;
  getAttemptsForHomework: (hwId: string) => HomeworkAttempt[];
  clearAttemptHistory: () => void;
}

const HomeworkContext = createContext<HomeworkContextType | undefined>(undefined);

const STORAGE_KEY = "abacus_homework_state_v1";
const ATTEMPTS_KEY = "abacus_homework_attempts_v1";

export const HomeworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [homeworkList, setHomeworkList] = useState<HomeworkTask[]>(INITIAL_HOMEWORK_LIST);
  const [activeHomework, setActiveHomework] = useState<HomeworkTask | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [viewMode, setViewMode] = useState<"dashboard" | "intro" | "player" | "submit-modal" | "result">("dashboard");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed" | "attempts">("all");
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [attemptHistory, setAttemptHistory] = useState<HomeworkAttempt[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<HomeworkAttempt | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHomeworkList(parsed);
        }
      }

      const savedAttempts = localStorage.getItem(ATTEMPTS_KEY);
      if (savedAttempts) {
        const parsed = JSON.parse(savedAttempts);
        if (Array.isArray(parsed)) {
          setAttemptHistory(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = (tasks: HomeworkTask[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setHomeworkList(tasks);
    } catch {
      // Ignore
    }
  };

  // Save attempts to localStorage
  const saveAttempts = (attempts: HomeworkAttempt[]) => {
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
      setAttemptHistory(attempts);
    } catch {
      // Ignore
    }
  };

  // Timer interval
  useEffect(() => {
    if (isTimerRunning && (viewMode === "player" || viewMode === "submit-modal")) {
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

  // Open Intro Screen (only for pending or in-progress homework)
  const openHomeworkIntro = (hw: HomeworkTask) => {
    if (hw.status === "evaluated" || hw.status === "submitted") {
      return; // Once it is done then done
    }
    setActiveHomework(hw);
    setViewMode("intro");
  };

  // Start Homework Player (only for non-completed homework)
  const startHomework = (hw: HomeworkTask) => {
    if (hw.status === "evaluated" || hw.status === "submitted") {
      return; // Once it is done then done
    }
    setActiveHomework(hw);
    setActiveQuestionIndex(0);
    setUserAnswers({});
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setViewMode("player");

    // Update status to in-progress if pending
    if (hw.status === "pending") {
      const updated = homeworkList.map((t) =>
        t.id === hw.id ? { ...t, status: "in-progress" as const } : t
      );
      saveTasks(updated);
    }
  };

  const answerQuestion = (questionId: string, answer: number | null) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (activeHomework && activeQuestionIndex < activeHomework.questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (activeHomework && index >= 0 && index < activeHomework.questions.length) {
      setActiveQuestionIndex(index);
    }
  };

  const openSubmitModal = () => {
    setViewMode("submit-modal");
  };

  const closeSubmitModal = () => {
    setViewMode("player");
  };

  // Submit Homework & Trigger Instant Evaluation
  const submitHomework = () => {
    if (!activeHomework) return;

    setIsTimerRunning(false);

    let correctCount = 0;
    const answersRecord = activeHomework.questions.map((q) => {
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

    const total = activeHomework.questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const starsEarned = correctCount * 5;

    let evalFeedback = "Great effort! Review the step-by-step solutions to strengthen your mental math.";
    if (accuracy === 100) {
      evalFeedback = "Outstanding! 100% perfect score! Your bead movement and mental arithmetic are flawless! 🌟";
    } else if (accuracy >= 80) {
      evalFeedback = "Awesome work! You mastered this homework topic with exceptional speed and accuracy! 👍";
    } else if (accuracy >= 60) {
      evalFeedback = "Good job! Practice the formula tips for the problems you missed to improve your reflex! 💪";
    }

    const newAttempt: HomeworkAttempt = {
      id: `hw-attempt-${Date.now()}`,
      homeworkId: activeHomework.id,
      homeworkTitle: activeHomework.title,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      score: correctCount,
      totalQuestions: total,
      accuracy,
      timeTakenSeconds: timerSeconds,
      answers: answersRecord,
    };

    setLatestAttempt(newAttempt);
    const updatedAttempts = [newAttempt, ...attemptHistory];
    saveAttempts(updatedAttempts);

    // Update the homework task status & best score
    const updatedTasks = homeworkList.map((t) => {
      if (t.id === activeHomework.id) {
        const higherScore = Math.max(t.score ?? 0, correctCount);
        return {
          ...t,
          status: "evaluated" as const,
          score: higherScore,
          accuracy: Math.round((higherScore / total) * 100),
          evaluatedFeedback: evalFeedback,
          evaluatedStars: starsEarned,
          attemptsCount: (t.attemptsCount || 0) + 1,
          lastAttemptDate: "Today",
        };
      }
      return t;
    });

    saveTasks(updatedTasks);
    setActiveHomework(updatedTasks.find((t) => t.id === activeHomework.id) || null);

    // Trigger fireworks confetti
    if (accuracy >= 60) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#F4A261", "#E76F51", "#2A9D8F", "#E9C46A", "#9B5DE5"],
        });
      } catch {
        // Fallback
      }
    }

    setViewMode("result");
  };

  // Retry Homework with clean slate (blocked for completed homework)
  const retryHomework = (hw: HomeworkTask) => {
    if (hw.status === "evaluated" || hw.status === "submitted") {
      return; // Once it is done then done
    }
    startHomework(hw);
  };

  const backToDashboard = () => {
    setIsTimerRunning(false);
    setViewMode("dashboard");
  };

  // Assign custom homework task from practice syllabus
  const assignNewHomework = (
    category: PracticeCategoryOption,
    questionCount: number = 10,
    dueDate: string = "18 September",
    instructions?: string
  ) => {
    const newTask = createHomeworkFromPractice(category, questionCount, dueDate, instructions);
    const updated = [newTask, ...homeworkList];
    saveTasks(updated);
    setAssignModalOpen(false);
  };

  const deleteHomework = (hwId: string) => {
    const updated = homeworkList.filter((t) => t.id !== hwId);
    saveTasks(updated);
  };

  const getAttemptsForHomework = (hwId: string) => {
    return attemptHistory.filter((a) => a.homeworkId === hwId);
  };

  const clearAttemptHistory = () => {
    localStorage.removeItem(ATTEMPTS_KEY);
    setAttemptHistory([]);
  };

  return (
    <HomeworkContext.Provider
      value={{
        homeworkList,
        activeHomework,
        activeQuestionIndex,
        userAnswers,
        timerSeconds,
        isTimerRunning,
        viewMode,
        activeTab,
        attemptHistory,
        latestAttempt,
        assignModalOpen,
        setActiveTab,
        setAssignModalOpen,
        openHomeworkIntro,
        startHomework,
        answerQuestion,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        openSubmitModal,
        closeSubmitModal,
        submitHomework,
        retryHomework,
        backToDashboard,
        assignNewHomework,
        deleteHomework,
        getAttemptsForHomework,
        clearAttemptHistory,
      }}
    >
      {children}
    </HomeworkContext.Provider>
  );
};

export const useHomework = () => {
  const context = useContext(HomeworkContext);
  if (!context) {
    throw new Error("useHomework must be used within a HomeworkProvider");
  }
  return context;
};
