"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_LESSONS } from "@/data/lessonsData";
import confetti from "canvas-confetti";
const LearningContext = createContext(undefined);
const STORAGE_KEY = "abacus_learning_state_v1";
export const LearningProvider = ({ children, }) => {
    const [lessons, setLessons] = useState(MOCK_LESSONS);
    const [currentLessonId, setCurrentLessonId] = useState("lesson-4");
    const [bonusStars, setBonusStars] = useState(150);
    const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
    const [completedLessonForModal, setCompletedLessonForModal] = useState(null);
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
        }
        catch {
            // Fallback
        }
    }, []);
    // Save changes to localStorage
    const saveState = (updatedLessons, curId, stars) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                lessons: updatedLessons,
                currentLessonId: curId,
                bonusStars: stars,
            }));
        }
        catch {
            // Fallback
        }
    };
    const currentLesson = lessons.find((l) => l.id === currentLessonId) || lessons[0];
    const recentLesson = lessons.find((l) => !l.completed && l.watchedSeconds > 0) ||
        lessons.find((l) => !l.completed) ||
        lessons[0];
    const completedCount = lessons.filter((l) => l.completed).length;
    const totalLessons = lessons.length;
    const overallProgress = Math.round((completedCount / totalLessons) * 100);
    const markLessonCompleted = (id) => {
        const target = lessons.find((l) => l.id === id);
        if (!target)
            return;
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
        }
        catch {
            // Confetti fallback
        }
    };
    const updateLessonProgress = (id, seconds) => {
        const updated = lessons.map((l) => {
            if (l.id === id) {
                const clampedSeconds = Math.min(Math.max(0, seconds), l.durationSeconds);
                const isNowCompleted = clampedSeconds >= l.durationSeconds - 2;
                return {
                    ...l,
                    watchedSeconds: clampedSeconds,
                    completed: isNowCompleted ? true : l.completed,
                };
            }
            return l;
        });
        setLessons(updated);
        saveState(updated, currentLessonId, bonusStars);
    };
    const resetProgress = () => {
        setLessons(MOCK_LESSONS);
        setCurrentLessonId("lesson-4");
        setBonusStars(150);
        saveState(MOCK_LESSONS, "lesson-4", 150);
    };
    return (<LearningContext.Provider value={{
            lessons,
            currentLessonId,
            currentLesson,
            setCurrentLessonId: (id) => {
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
        }}>
      {children}
    </LearningContext.Provider>);
};
export const useLearning = () => {
    const context = useContext(LearningContext);
    if (!context) {
        throw new Error("useLearning must be used within a LearningProvider");
    }
    return context;
};
