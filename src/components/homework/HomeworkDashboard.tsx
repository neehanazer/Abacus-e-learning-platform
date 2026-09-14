"use client";

import React from "react";
import { motion } from "framer-motion";
import { useHomework } from "@/context/HomeworkContext";
import { HomeworkTask } from "@/data/homeworkData";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  PlusCircle,
  Video,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { HomeworkIntroModal } from "./HomeworkIntroModal";
import { HomeworkPlayer } from "./HomeworkPlayer";
import { HomeworkSubmitModal } from "./HomeworkSubmitModal";
import { HomeworkResultView } from "./HomeworkResultView";
import { AssignHomeworkModal } from "./AssignHomeworkModal";

export const HomeworkDashboard: React.FC = () => {
  const {
    homeworkList,
    viewMode,
    activeTab,
    setActiveTab,
    openHomeworkIntro,
    startHomework,
    retryHomework,
    setAssignModalOpen,
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

  // Filter tasks according to active tab
  const pendingTasks = homeworkList.filter(
    (t) => t.status === "pending" || t.status === "in-progress"
  );
  const completedTasks = homeworkList.filter(
    (t) => t.status === "submitted" || t.status === "evaluated"
  );

  const displayedTasks =
    activeTab === "pending"
      ? pendingTasks
      : activeTab === "completed"
      ? completedTasks
      : homeworkList;

  // Calculate high-level stats
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ============================================================ */}
      {/* 1. HERO & METRICS BANNER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 sm:p-8 border-4 border-[#E9C46A] shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Module 2 • Homework Section
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#1D3557] font-heading">
              Abacus Homework Hub
            </h1>
            <p className="text-stone-600 text-sm sm:text-base font-medium">
              Reinforce what you learned in video lessons with targeted homework worksheets. Complete assignments, get instant evaluation, and track your accuracy.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 min-w-[110px] bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase">Pending</div>
              <div className="text-2xl font-black text-amber-600">{totalPending}</div>
            </div>

            <div className="flex-1 min-w-[110px] bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase">Completed</div>
              <div className="text-2xl font-black text-emerald-600">{totalCompleted}</div>
            </div>

            <div className="flex-1 min-w-[110px] bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase">Avg. Accuracy</div>
              <div className="text-2xl font-black text-indigo-600">
                {avgScore > 0 ? `${avgScore}%` : "—"}
              </div>
            </div>

            <button
              onClick={() => setAssignModalOpen(true)}
              className="w-full sm:w-auto px-4 py-3.5 bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 border-b-4 border-[#C85A3D]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Assign Homework</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. LEARNING FLOW STEPPER BANNER */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-4 border-2 border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-stone-500 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Learning Progression:</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold w-full sm:w-auto justify-center">
            <Link
              href="/learning"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-orange-600" />
              <span>1. Video Lesson</span>
            </Link>

            <span className="text-stone-300 font-black">→</span>

            <Link
              href="/learning/practice"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Practice</span>
            </Link>

            <span className="text-stone-300 font-black">→</span>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1D3557] text-white font-black shadow-sm">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>3. Homework</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. TABS & FILTER BAR */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "all"
                ? "bg-white text-[#1D3557] shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            All Tasks ({homeworkList.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === "completed"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Completed ({completedTasks.length})
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
      {/* 4. HOMEWORK TASKS GRID OR ATTEMPTS LIST */}
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
      ) : (
        /* Homework Tasks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedTasks.map((task) => {
            const isEvaluated = task.status === "evaluated";
            const isInProgress = task.status === "in-progress";

            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-3xl border-3 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  isEvaluated
                    ? "border-emerald-300"
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

                    {isEvaluated ? (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        Evaluated ({task.score}/10)
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
                  <div className="flex items-center justify-between text-xs font-bold text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Due: {task.dueDate}
                    </span>
                    <span>10 Questions</span>
                  </div>

                  {/* Feedback Snippet if evaluated */}
                  {task.evaluatedFeedback && (
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 mb-4 text-xs font-bold text-amber-900 line-clamp-2">
                      🧙‍♂️ <span className="font-semibold">{task.evaluatedFeedback}</span>
                    </div>
                  )}
                </div>

                {/* Card Action CTA */}
                <div className="pt-2">
                  {isEvaluated ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openHomeworkIntro(task)}
                        className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs border border-emerald-300 transition-colors flex items-center justify-center gap-1"
                      >
                        Review Work
                      </button>
                      <button
                        onClick={() => retryHomework(task)}
                        className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs border border-stone-200 transition-colors"
                        title="Retry this homework task"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
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

      {/* Assign Homework Modal */}
      <AssignHomeworkModal />
    </div>
  );
};
