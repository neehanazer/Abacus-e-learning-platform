"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHomework } from "@/context/HomeworkContext";
import { HomeworkTask, isDueDateToday } from "@/data/homeworkData";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Video,
  Calendar,
  ArrowRight,
  TrendingUp,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { HomeworkIntroModal } from "./HomeworkIntroModal";
import { HomeworkPlayer } from "./HomeworkPlayer";
import { HomeworkSubmitModal } from "./HomeworkSubmitModal";
import { HomeworkResultView } from "./HomeworkResultView";

export function isDueDateOver(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  const now = new Date();

  // Try direct parse
  let parsed = new Date(dueDateStr);
  if (!isNaN(parsed.getTime())) {
    if (!dueDateStr.includes("T") && !dueDateStr.includes(":")) {
      parsed.setHours(23, 59, 59, 999);
    }
    return now.getTime() > parsed.getTime();
  }

  // Handle format like "18 September" or "18 September 2026"
  const currentYear = now.getFullYear();
  parsed = new Date(`${dueDateStr} ${currentYear}`);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(23, 59, 59, 999);
    return now.getTime() > parsed.getTime();
  }

  return false;
}

const HOMEWORK_LEVELS = [
  { level: 1, name: "Foundations", icon: "🌱" },
  { level: 2, name: "Explorer", icon: "🚀" },
  { level: 3, name: "Intermediate", icon: "⭐" },
  { level: 4, name: "Advanced", icon: "⚡" },
  { level: 5, name: "Senior Expert", icon: "🔥" },
  { level: 6, name: "Master", icon: "🏆" },
  { level: 7, name: "Champion", icon: "👑" },
  { level: 8, name: "Grand Master", icon: "🧙‍♂️" },
];

export const HomeworkDashboard: React.FC = () => {
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

  const isLevel2OrHigher = studentLevel >= 2;

  const {
    homeworkList,
    viewMode,
    activeTab,
    setActiveTab,
    openHomeworkIntro,
    startHomework,
    retryHomework,
    attemptHistory,
  } = useHomework();

  // If in active player, intro, or result mode, render those views
  if (viewMode === "intro") return <HomeworkIntroModal />;
  if (viewMode === "player") return <HomeworkPlayer />;
  if (viewMode === "submit-modal") {
    return (
      <>
        <HomeworkPlayer />
        <HomeworkSubmitModal />
      </>
    );
  }
  if (viewMode === "result") return <HomeworkResultView />;

  // Filter tasks: completed homeworks must NOT be visible on the homework page!
  const pendingTasks = homeworkList.filter(
    (t) => t.status !== "submitted" && t.status !== "evaluated"
  );
  const completedTasks = homeworkList.filter(
    (t) => t.status === "submitted" || t.status === "evaluated"
  );

  // Homework Access Rule: Show ONLY currentLevel homework!
  const displayedTasks = pendingTasks.filter((t) => t.level === studentLevel);

  // Pending tasks due today for the student's level
  const dueTodayTasks = displayedTasks.filter((t) => isDueDateToday(t.dueDate));

  // Calculate high-level stats for student's current level
  const activeLevelPending = displayedTasks.length;
  const activeLevelCompleted = completedTasks.filter((t) => t.level === studentLevel).length;
  const totalLevelTasks = activeLevelPending + activeLevelCompleted;
  const homeworkCompletionRate =
    totalLevelTasks > 0 ? Math.round((activeLevelCompleted / totalLevelTasks) * 100) : 100;
  const isExamEligible = totalLevelTasks === 0 || homeworkCompletionRate >= 70;

  const totalCompleted = completedTasks.length;
  const totalPending = pendingTasks.length;
  const avgScore =
    completedTasks.length > 0
      ? Math.round(
          (completedTasks.reduce((acc, t) => acc + (t.score || 0), 0) /
            (completedTasks.length * 10)) *
            100
        )
      : 0;

  return (
    <div data-tour="homework-center" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ============================================================ */}
      {/* URGENT DUE DATE TODAY NOTIFICATION BANNER */}
      {/* ============================================================ */}
      {dueTodayTasks.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-500/60 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md text-xl">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                  ⚠️ Urgent Due Date Notice
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {dueTodayTasks.length} assignment{dueTodayTasks.length > 1 ? "s" : ""} due today
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#1D3557]">
                Today is the official due date for your homework!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                {dueTodayTasks.map((t) => `"${t.title}"`).join(", ")} — 70% homework completion is strictly compulsory to attend the Official Certification Exam. Complete and submit today!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (dueTodayTasks[0]) openHomeworkIntro(dueTodayTasks[0]);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>Start Due Homework</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* COMPULSORY 70% EXAM ELIGIBILITY PROGRESS BAR */}
      {/* ============================================================ */}
      <div
        className={`rounded-3xl p-5 border-2 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isExamEligible
            ? "bg-emerald-50/80 border-emerald-300"
            : "bg-amber-50/90 border-amber-300"
        }`}
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isExamEligible ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-900"
              }`}
            >
              Compulsory Exam Requirement (≥70%)
            </span>
            <span className="text-xs font-bold text-slate-600">
              Level {studentLevel} Progress: {activeLevelCompleted}/{totalLevelTasks} ({homeworkCompletionRate}%)
            </span>
          </div>
          <div className="text-sm font-extrabold text-[#1D3557]">
            {isExamEligible ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Exam Prerequisite Met: You are eligible to attend the Official Level {studentLevel} Certification Exam!
              </span>
            ) : (
              <span className="text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Exam Attendance Locked: Complete at least {Math.max(1, Math.ceil(totalLevelTasks * 0.7) - activeLevelCompleted)} more assignment(s) to reach the compulsory 70% threshold.
              </span>
            )}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden max-w-md">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExamEligible ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, homeworkCompletionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. HERO & METRICS BANNER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 sm:p-8 border-4 border-[#E9C46A] shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {`Level ${studentLevel} Enrolled • Current Homework Only 🚀`}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#1D3557] font-heading">
              {`Level ${studentLevel} Homework Hub 📝`}
            </h1>
            <p className="text-stone-600 text-sm sm:text-base font-medium">
              {studentLevel >= 2
                ? `You have graduated to Level ${studentLevel}! Showing strictly assignments for your enrolled Level ${studentLevel}. Complete assignments for instant AI evaluation!`
                : "Reinforce what you learned in video lessons with targeted homework worksheets. Complete assignments, get instant evaluation, and track your accuracy."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 min-w-[110px] bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase">Level {studentLevel} Pending</div>
              <div className="text-2xl font-black text-amber-600">{activeLevelPending}</div>
            </div>

            <div className="flex-1 min-w-[110px] bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase">Level {studentLevel} Done</div>
              <div className="text-2xl font-black text-emerald-600">{activeLevelCompleted}</div>
            </div>

            <div className="flex-1 min-w-[110px] bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase">Overall Accuracy</div>
              <div className="text-2xl font-black text-indigo-600">
                {avgScore > 0 ? `${avgScore}%` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ENROLLED LEVEL BANNER (NO OTHER LEVELS CAN BE SELECTED) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shadow-inner">
            📚
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-500">
              Assigned Homework Level:
            </div>
            <div className="text-base font-extrabold text-[#1D3557]">
              Level {studentLevel} Assignments Only
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            🔒 Level Access Locked to Enrolled Level {studentLevel}
          </span>
        </div>
      </div>


      {/* ============================================================ */}
      {/* 4. TABS & FILTER BAR */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab !== "attempts"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {`Level ${activeLevelTab} Assigned Homework (${displayedTasks.length})`}
          </button>
          <button
            onClick={() => setActiveTab("attempts")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === "attempts"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Attempts History ({attemptHistory.length})
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. HOMEWORK TASKS GRID OR ATTEMPTS LIST */}
      {/* ============================================================ */}
      {activeTab === "attempts" ? (
        /* Attempts History List */
        <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-lg font-black text-[#1D3557] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-500" />
              Past Submissions & Evaluation Records
            </h3>
            <span className="text-xs font-bold text-stone-500">
              {attemptHistory.length} Total Submissions
            </span>
          </div>

          {attemptHistory.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <div className="text-base font-black text-stone-600">No past attempts yet</div>
              <p className="text-xs text-stone-400 mt-1">
                Complete and submit a homework worksheet to see your historical evaluation logs!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attemptHistory.map((att) => (
                <div
                  key={att.id}
                  className="bg-[#FFFBF0] rounded-2xl p-4 border-2 border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400">
                        {att.dateFormatted}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                        Evaluated
                      </span>
                    </div>
                    <div className="text-base font-black text-[#1D3557] mt-0.5">
                      {att.homeworkTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Score</div>
                      <div className="text-lg font-black text-[#1D3557]">
                        {att.score}/{att.totalQuestions}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Accuracy</div>
                      <div className="text-lg font-black text-emerald-600">
                        {att.accuracy}%
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Time</div>
                      <div className="text-sm font-mono font-bold text-stone-700">
                        {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : displayedTasks.length === 0 ? (
        /* Empty State: All Homework Completed */
        <div className="bg-white rounded-3xl p-12 border-3 border-amber-200 text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>
          <h3 className="text-xl font-black text-[#1D3557]">All Homework Completed!</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto font-medium">
            Great job! Completed homeworks are safely submitted. You have no pending homework tasks right now.
          </p>
        </div>
      ) : (
        /* Homework Tasks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedTasks.map((task) => {
            const isInProgress = task.status === "in-progress";
            const isOverdue = isDueDateOver(task.dueDate);

            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-3xl border-3 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  isOverdue
                    ? "border-rose-200 bg-rose-50/20"
                    : isInProgress
                    ? "border-blue-300"
                    : "border-amber-200"
                }`}
              >
                {/* Top Status & Level */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      Level {task.level}
                    </span>

                    {isOverdue ? (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Expired
                      </span>
                    ) : isInProgress ? (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        In Progress
                      </span>
                    ) : (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-sm">
                        🟡 Pending
                      </span>
                    )}
                  </div>

                  {/* Task Title */}
                  <h3 className="text-lg font-black text-[#1D3557] font-heading line-clamp-2 mb-1">
                    {task.title}
                  </h3>

                  {/* Topic & Related Lesson */}
                  <div className="space-y-1.5 my-3">
                    <div className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span className="line-clamp-1">{task.topic}</span>
                    </div>
                    <div className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-orange-500" />
                      <span className="line-clamp-1">{task.relatedLessonTitle}</span>
                    </div>
                  </div>

                  {/* Due Date & Questions Badge */}
                  <div
                    className={`flex items-center justify-between text-xs font-bold p-2.5 rounded-xl border mb-4 ${
                      isOverdue
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-stone-50 border-stone-200 text-stone-500"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar className={`w-3.5 h-3.5 ${isOverdue ? "text-rose-500" : "text-stone-400"}`} />
                      Due: {task.dueDate}
                    </span>
                    {isOverdue ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                        Overdue
                      </span>
                    ) : (
                      <span>10 Questions</span>
                    )}
                  </div>
                </div>

                {/* Card Action CTA */}
                <div className="pt-2">
                  {isOverdue ? (
                    <div className="w-full py-3 px-3 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm text-center leading-tight select-none">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>will not be able to attend because due dates are over</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openHomeworkIntro(task)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 border-b-2 border-[#C85A3D]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isInProgress ? "Resume Homework" : "Start Homework"}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};
