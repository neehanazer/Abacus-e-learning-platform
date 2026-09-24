"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { INITIAL_HOMEWORK_LIST, createHomeworkFromPractice, } from "@/data/homeworkData";
import confetti from "canvas-confetti";
const HomeworkContext = createContext(undefined);
const STORAGE_KEY = "abacus_homework_state_v1";
const ATTEMPTS_KEY = "abacus_homework_attempts_v1";
export const HomeworkProvider = ({ children }) => {
    const [homeworkList, setHomeworkList] = useState(INITIAL_HOMEWORK_LIST);
    const [activeHomework, setActiveHomework] = useState(null);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [viewMode, setViewMode] = useState("dashboard");
    const [activeTab, setActiveTab] = useState("all");
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const [attemptHistory, setAttemptHistory] = useState([]);
    const [latestAttempt, setLatestAttempt] = useState(null);
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
        }
        catch {
            // Ignore
        }
    }, []);
    // Save tasks to localStorage
    const saveTasks = (tasks) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            setHomeworkList(tasks);
        }
        catch {
            // Ignore
        }
    };
    // Save attempts to localStorage
    const saveAttempts = (attempts) => {
        try {
            localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
            setAttemptHistory(attempts);
        }
        catch {
            // Ignore
        }
    };
    // Timer interval
    useEffect(() => {
        if (isTimerRunning && (viewMode === "player" || viewMode === "submit-modal")) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((prev) => prev + 1);
            }, 1000);
        }
        else {
            if (timerRef.current)
                clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
    }, [isTimerRunning, viewMode]);
    // Open Intro Screen
    const openHomeworkIntro = (hw) => {
        setActiveHomework(hw);
        setViewMode("intro");
    };
    // Start Homework Player
    const startHomework = (hw) => {
        setActiveHomework(hw);
        setActiveQuestionIndex(0);
        setUserAnswers({});
        setTimerSeconds(0);
        setIsTimerRunning(true);
        setViewMode("player");
        // Update status to in-progress if pending
        if (hw.status === "pending") {
            const updated = homeworkList.map((t) => t.id === hw.id ? { ...t, status: "in-progress" } : t);
            saveTasks(updated);
        }
    };
    const answerQuestion = (questionId, answer) => {
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
    const goToQuestion = (index) => {
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
        if (!activeHomework)
            return;
        setIsTimerRunning(false);
        let correctCount = 0;
        const answersRecord = activeHomework.questions.map((q) => {
            const uAns = userAnswers[q.id] ?? null;
            const isCorrect = uAns === q.targetAnswer;
            if (isCorrect)
                correctCount++;
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
        }
        else if (accuracy >= 80) {
            evalFeedback = "Awesome work! You mastered this homework topic with exceptional speed and accuracy! 👍";
        }
        else if (accuracy >= 60) {
            evalFeedback = "Good job! Practice the formula tips for the problems you missed to improve your reflex! 💪";
        }
        const newAttempt = {
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
                    status: "evaluated",
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
            }
            catch {
                // Fallback
            }
        }
        setViewMode("result");
    };
    // Retry Homework with clean slate
    const retryHomework = (hw) => {
        startHomework(hw);
    };
    const backToDashboard = () => {
        setIsTimerRunning(false);
        setViewMode("dashboard");
    };
    // Assign custom homework task from practice syllabus
    const assignNewHomework = (category, questionCount = 10, dueDate = "18 September", instructions) => {
        const newTask = createHomeworkFromPractice(category, questionCount, dueDate, instructions);
        const updated = [newTask, ...homeworkList];
        saveTasks(updated);
        setAssignModalOpen(false);
    };
    const deleteHomework = (hwId) => {
        const updated = homeworkList.filter((t) => t.id !== hwId);
        saveTasks(updated);
    };
    const getAttemptsForHomework = (hwId) => {
        return attemptHistory.filter((a) => a.homeworkId === hwId);
    };
    const clearAttemptHistory = () => {
        localStorage.removeItem(ATTEMPTS_KEY);
        setAttemptHistory([]);
    };
    return (<HomeworkContext.Provider value={{
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
        }}>
      {children}
    </HomeworkContext.Provider>);
};
export const useHomework = () => {
    const context = useContext(HomeworkContext);
    if (!context) {
        throw new Error("useHomework must be used within a HomeworkProvider");
    }
    return context;
};
