"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Lesson, MOCK_LESSONS } from "@/data/lessonsData";
import confetti from "canvas-confetti";

interface LearningContextType {
  lessons: Lesson[];
  currentLessonId: string;
  currentLesson: Lesson;
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
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const STORAGE_KEY = "abacus_learning_state_v1";

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [currentLessonId, setCurrentLessonId] = useState<string>("lesson-4");
  const [bonusStars, setBonusStars] = useState<number>(150);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [completedLessonForModal, setCompletedLessonForModal] = useState<Lesson | null>(null);

  // Load persisted state if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lessons && Array.isArray(parsed.lessons)) {
          setLessons(parsed.lessons);
        }
        if (parsed.currentLessonId) {
          setCurrentLessonId(parsed.currentLessonId);
        }
        if (typeof parsed.bonusStars === "number") {
          setBonusStars(parsed.bonusStars);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save changes to localStorage
  const saveState = (updatedLessons: Lesson[], curId: string, stars: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
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
    lessons.find((l) => l.id === currentLessonId) || lessons[0];

  const recentLesson =
    lessons.find((l) => !l.completed && l.watchedSeconds > 0) ||
    lessons.find((l) => !l.completed) ||
    lessons[0];

  const completedCount = lessons.filter((l) => l.completed).length;
  const totalLessons = lessons.length;
  const overallProgress = Math.round((completedCount / totalLessons) * 100);

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
      // Avoid state update if seconds haven't changed significantly (less than 2s difference)
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
    setLessons(MOCK_LESSONS);
    setCurrentLessonId("lesson-4");
    setBonusStars(150);
    saveState(MOCK_LESSONS, "lesson-4", 150);
  };

  return (
    <LearningContext.Provider
      value={{
        lessons,
        currentLessonId,
        currentLesson,
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
