"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Play,
  Lock,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronDown,
  Star,
  Award,
} from "lucide-react";
import { SyllabusTopic } from "@/data/syllabusData";

interface VisualLearningPathProps {
  topics: SyllabusTopic[];
  onSelectTopicLesson: (targetLessonId: string) => void;
}

export default function VisualLearningPath({
  topics,
  onSelectTopicLesson,
}: VisualLearningPathProps) {
  return (
    <div className="space-y-8 relative py-4">
      {/* Path Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b-2 border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shadow-sm">
            🗺️
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-heading">
              Visual Learning Adventure Path
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Follow the step-by-step milestones to master all Level 1 topics!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-yellow-200 shadow-sm self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>5 Milestones</span>
        </div>
      </div>

      {/* Connected Pathway Container */}
      <div className="relative max-w-3xl mx-auto space-y-6">
        {/* Animated Connecting Center Spine (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-3 bg-gradient-to-b from-emerald-400 via-amber-400 to-slate-300 rounded-full z-0 shadow-inner" />

        {topics.map((topic, index) => {
          const isCompleted = topic.status === "completed";
          const isInProgress = topic.status === "in-progress";
          const isLocked = topic.status === "locked";
          const isNotStarted = topic.status === "not-started";

          // Alternating left and right layout on desktop
          const isLeft = index % 2 === 0;

          // Status Badge details
          let statusBadgeText = "Not Started ○";
          let statusBadgeClass = "bg-blue-50 text-blue-800 border-blue-200";
          let cardBorderColor = "border-yellow-200";
          let glowColor = "shadow-yellow-100/50";

          if (isCompleted) {
            statusBadgeText = "Completed ✓";
            statusBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
            cardBorderColor = "border-emerald-300";
            glowColor = "shadow-emerald-100";
          } else if (isInProgress) {
            statusBadgeText = "In Progress ▶";
            statusBadgeClass = "bg-orange-100 text-orange-800 border-orange-300 animate-pulse";
            cardBorderColor = "border-orange-400";
            glowColor = "shadow-orange-200/80";
          } else if (isLocked) {
            statusBadgeText = "Locked 🔒";
            statusBadgeClass = "bg-slate-100 text-slate-500 border-slate-200";
            cardBorderColor = "border-slate-200";
            glowColor = "shadow-slate-100";
          }

          return (
            <div key={topic.id} className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex flex-col md:flex-row items-center gap-4 sm:gap-6 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Pathway Milestone Step Card (Width 85%) */}
                <div
                  className={`w-full md:w-[46%] bg-white rounded-3xl p-5 sm:p-6 border-3 ${cardBorderColor} shadow-xl ${glowColor} hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}
                >
                  {/* Decorative background gradient on hover */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity ${
                      isInProgress
                        ? "bg-orange-300"
                        : isCompleted
                        ? "bg-emerald-200"
                        : "bg-yellow-200"
                    }`}
                  />

                  {/* Top Row: Topic Number, Icon, and Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFF9ED] border-2 border-yellow-200 text-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {topic.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                          Topic {topic.topicNumber}
                        </span>
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1D3557] leading-tight">
                          {topic.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${statusBadgeClass}`}
                    >
                      {statusBadgeText}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {topic.description}
                  </p>

                  {/* Learning Objectives Checklist */}
                  <div className="bg-[#FFFBF0] rounded-2xl p-3 border border-yellow-200/80 mb-4 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-[#1D3557] uppercase tracking-wide block">
                      🎯 What you will learn:
                    </span>
                    <ul className="space-y-1">
                      {topic.learningObjectives.slice(0, 2).map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-slate-700 font-medium"
                        >
                          <span className="text-emerald-500 font-bold text-xs mt-0.5">
                            ✓
                          </span>
                          <span className="line-clamp-1">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Stats & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-yellow-100 gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-[#F4A261]" />
                      <span>{topic.totalLessons} Lessons</span>
                      {topic.progress > 0 && (
                        <span className="text-orange-700 font-extrabold">
                          • {topic.progress}%
                        </span>
                      )}
                    </div>

                    {isLocked ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectTopicLesson(topic.targetLessonId)}
                        className={`px-4 py-2 rounded-full font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                          isInProgress
                            ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-orange-200"
                            : isCompleted
                            ? "bg-emerald-500 text-white shadow-emerald-200"
                            : "bg-[#1D3557] text-white shadow-blue-200"
                        }`}
                      >
                        {isInProgress ? (
                          <>
                            <Play className="w-3 h-3 fill-white" />
                            <span>Continue</span>
                          </>
                        ) : isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Review</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-white" />
                            <span>Start Lesson</span>
                          </>
                        )}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Center Pathway Node (Desktop Center Circle) */}
                <div className="hidden md:flex flex-col items-center justify-center relative">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-xl border-4 border-white transition-transform duration-300 hover:scale-110 ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-emerald-200"
                        : isInProgress
                        ? "bg-gradient-to-tr from-[#F4A261] to-[#E76F51] text-white shadow-orange-300 ring-4 ring-orange-200 animate-bounce"
                        : isLocked
                        ? "bg-slate-200 text-slate-500 shadow-slate-200"
                        : "bg-yellow-400 text-[#1D3557] shadow-yellow-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : isInProgress ? (
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <span>{topic.topicNumber}</span>
                    )}
                  </div>
                </div>

                {/* Empty side for balanced alternating desktop layout */}
                <div className="hidden md:block w-[46%]" />
              </motion.div>

              {/* Down Arrow for Mobile Connector */}
              {index < topics.length - 1 && (
                <div className="flex md:hidden justify-center my-2 text-yellow-500 font-bold">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center animate-bounce">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
