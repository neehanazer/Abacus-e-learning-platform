"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Lesson,
  MOCK_LESSONS,
  LEVEL_1_LESSONS,
  LEVEL_2_LESSONS,
  LESSONS_BY_LEVEL,
} from "@/data/lessonsData";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

interface LearningContextType {
  lessons: Lesson[];
  currentLessonId: string;
  currentLesson: Lesson;
  activeLevel: number;
  setActiveLevel: (level: number) => void;
  setCurrentLessonId: (id: string) => void;
  markLessonCompleted: (id: string) => void;
  updateLessonProgress: (id: string, seconds: number) => void;
  overallProgress: number;
  completedCount: number;
  totalLessons: number;
  recentLesson: Lesson;
  bonusStars: number;
  isCelebrationModalOpen: boolean;
  setIsCelebrationModalOpen: (open: boolean) => void;
  completedLessonForModal: Lesson | null;
  resetProgress: () => void;
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  openTour: () => void;
  closeTour: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  // Determine user's assigned level (defaults to 2 if user profile is Level 2, else 1)
  const isUserLevel2 =
    (user?.selectedLevel?.includes("2") ||
      user?.abacusLevel?.includes("2") ||
      user?.currentLevel === 2) ??
    false;

  const [activeLevel, setActiveLevel] = useState<number>(isUserLevel2 ? 2 : 1);

  // Active level's default lessons
  const defaultLessons = LESSONS_BY_LEVEL[activeLevel] || LEVEL_1_LESSONS;

  const [lessons, setLessons] = useState<Lesson[]>(defaultLessons);
  const [currentLessonId, setCurrentLessonId] = useState<string>(
    defaultLessons[0]?.id || "lesson-1"
  );
  const [bonusStars, setBonusStars] = useState<number>(150);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [completedLessonForModal, setCompletedLessonForModal] =
    useState<Lesson | null>(null);

  // Website Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-trigger tour for newly arriving students
  useEffect(() => {
    try {
      // The product-wide walkthrough already introduces this area in context.
      if (window.location.search.includes("product-tour=1")) return;
      const hasSeenTour = localStorage.getItem("has_seen_learning_hub_tour_v1");
      if (!hasSeenTour) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 750);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, []);

  const openTour = () => setIsTourOpen(true);
  const closeTour = () => {
    setIsTourOpen(false);
    try {
      localStorage.setItem("has_seen_learning_hub_tour_v1", "true");
    } catch {
      // Fallback
    }
  };

  // Automatically upgrade to Level 2 if student is upgraded in their profile
  useEffect(() => {
    if (isUserLevel2 && activeLevel !== 2) {
      setActiveLevel(2);
    }
  }, [isUserLevel2, activeLevel]);

  // Load and merge lessons whenever activeLevel changes
  useEffect(() => {
    const levelLessons = LESSONS_BY_LEVEL[activeLevel] || LEVEL_1_LESSONS;
    const storageKey = `abacus_learning_state_lvl_${activeLevel}`;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lessons && Array.isArray(parsed.lessons)) {
          const validLessonIds = new Set(levelLessons.map((m) => m.id));
          const filtered = parsed.lessons.filter((pl: Lesson) =>
            validLessonIds.has(pl.id)
          );
          const merged = levelLessons.map((def: Lesson) => {
            const pl = filtered.find((p: Lesson) => p.id === def.id);
            return pl
              ? {
                  ...def,
                  completed: pl.completed,
                  watchedSeconds: pl.watchedSeconds,
                  isLocked: pl.isLocked,
                }
              : def;
          });
          setLessons(merged);
        } else {
          setLessons(levelLessons);
        }

        if (
          parsed.currentLessonId &&
          levelLessons.some((m) => m.id === parsed.currentLessonId)
        ) {
          setCurrentLessonId(parsed.currentLessonId);
        } else {
          setCurrentLessonId(levelLessons[0]?.id || "lesson-1");
        }

        if (typeof parsed.bonusStars === "number") {
          setBonusStars(parsed.bonusStars);
        }
      } else {
        setLessons(levelLessons);
        setCurrentLessonId(levelLessons[0]?.id || "lesson-1");
      }
    } catch {
      setLessons(levelLessons);
      setCurrentLessonId(levelLessons[0]?.id || "lesson-1");
    }
  }, [activeLevel]);

  // Save changes to localStorage for active level
  const saveState = (
    updatedLessons: Lesson[],
    curId: string,
    stars: number,
    levelNum = activeLevel
  ) => {
    try {
      const storageKey = `abacus_learning_state_lvl_${levelNum}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          lessons: updatedLessons,
          currentLessonId: curId,
          bonusStars: stars,
        })
      );
    } catch {
      // Fallback
    }
  };

  const currentLesson =
    lessons.find((l) => l.id === currentLessonId) || lessons[0] || defaultLessons[0];

  const recentLesson =
    lessons.find((l) => !l.completed && l.watchedSeconds > 0) ||
    lessons.find((l) => !l.completed) ||
    lessons[0] ||
    defaultLessons[0];

  const completedCount = lessons.filter((l) => l.completed).length;
  const totalLessons = lessons.length;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const markLessonCompleted = (id: string) => {
    const target = lessons.find((l) => l.id === id);
    if (!target) return;

    const newStars = target.completed ? bonusStars : bonusStars + 50;

    // Unlock next lesson if available
    const currentIndex = lessons.findIndex((l) => l.id === id);
    const updated = lessons.map((l, index) => {
      if (l.id === id) {
        return {
          ...l,
          completed: true,
          watchedSeconds: l.durationSeconds,
        };
      }
      if (index === currentIndex + 1) {
        return {
          ...l,
          isLocked: false,
        };
      }
      return l;
    });

    setLessons(updated);
    setBonusStars(newStars);
    setCompletedLessonForModal(target);
    setIsCelebrationModalOpen(true);
    saveState(updated, currentLessonId, newStars);

    // Trigger colorful confetti fireworks
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F4A261", "#E76F51", "#2A9D8F", "#E9C46A", "#9B5DE5"],
      });
    } catch {
      // Confetti fallback
    }
  };

  const updateLessonProgress = useCallback((id: string, seconds: number) => {
    setLessons((prev) => {
      const target = prev.find((l) => l.id === id);
      if (!target) return prev;
      const clampedSeconds = Math.min(Math.max(0, seconds), target.durationSeconds);
      if (Math.abs(target.watchedSeconds - clampedSeconds) < 2) {
        return prev;
      }
      const isNowCompleted = clampedSeconds >= target.durationSeconds - 2;
      const updated = prev.map((l) => {
        if (l.id === id) {
          return {
            ...l,
            watchedSeconds: clampedSeconds,
            completed: isNowCompleted ? true : l.completed,
          };
        }
        return l;
      });
      return updated;
    });
  }, []);

  const resetProgress = () => {
    const levelLessons = LESSONS_BY_LEVEL[activeLevel] || LEVEL_1_LESSONS;
    setLessons(levelLessons);
    setCurrentLessonId(levelLessons[0]?.id || "lesson-1");
    setBonusStars(150);
    saveState(levelLessons, levelLessons[0]?.id || "lesson-1", 150);
  };

  return (
    <LearningContext.Provider
      value={{
        lessons,
        currentLessonId,
        currentLesson,
        activeLevel,
        setActiveLevel,
        setCurrentLessonId: (id: string) => {
          setCurrentLessonId(id);
          saveState(lessons, id, bonusStars);
        },
        markLessonCompleted,
        updateLessonProgress,
        overallProgress,
        completedCount,
        totalLessons,
        recentLesson,
        bonusStars,
        isCelebrationModalOpen,
        setIsCelebrationModalOpen,
        completedLessonForModal,
        resetProgress,
        isTourOpen,
        setIsTourOpen,
        openTour,
        closeTour,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
};
