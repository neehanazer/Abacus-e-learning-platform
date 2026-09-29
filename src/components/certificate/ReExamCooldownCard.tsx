"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export interface ReExamStatusResponse {
  examId?: string;
  studentId: string;
  hasAttempted: boolean;
  canReEnroll: boolean;
  isPassed: boolean;
  attemptsCount?: number;
  latestAttempt?: {
    attemptId: string;
    attemptNumber: number;
    score: number;
    percentage: number;
    failureDate?: string;
  };
  cooldown?: {
    cooldownHours: number;
    isEligible: boolean;
    failureDate?: string;
    eligibleAt?: string;
    hoursRemaining: number;
    minutesRemaining: number;
    secondsRemaining: number;
  };
  message?: string;
  history?: any[];
}

interface ReExamCooldownCardProps {
  status: ReExamStatusResponse | null;
  examId?: string;
  studentId?: string;
  onReEnrollSuccess?: (attempt: any) => void;
}

export default function ReExamCooldownCard({
  status,
  examId = "67b100000000000000000003",
  studentId = "std_demo_101",
  onReEnrollSuccess,
}: ReExamCooldownCardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live countdown state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isEligibleNow, setIsEligibleNow] = useState<boolean>(false);

  // Initialize countdown from cooldown.eligibleAt
  useEffect(() => {
    if (!status?.cooldown?.eligibleAt) {
      setIsEligibleNow(status?.canReEnroll ?? true);
      setRemainingSeconds(0);
      return;
    }

    const eligibleTime = new Date(status.cooldown.eligibleAt).getTime();

    const calculateDiff = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((eligibleTime - now) / 1000));
      setRemainingSeconds(diffSec);
      setIsEligibleNow(diffSec === 0 || !!status.cooldown?.isEligible);
    };

    calculateDiff();
    const interval = setInterval(calculateDiff, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  // Percentage of 24h elapsed
  const totalCooldownSeconds = (status?.cooldown?.cooldownHours || 24) * 3600;
  const elapsedSeconds = Math.max(0, totalCooldownSeconds - remainingSeconds);
  const progressPercent = Math.min(
    100,
    Math.round((elapsedSeconds / totalCooldownSeconds) * 100)
  );

  const handleReEnroll = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch(`/api/exams/${examId}/re-enroll?studentId=${encodeURIComponent(studentId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to re-enroll for examination.");
      }

      if (onReEnrollSuccess) {
        onReEnrollSuccess(data.data);
      } else {
        router.push("/learning/exam");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Re-enrollment error";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Case 1: Student already passed!
  if (status?.isPassed) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              Examination Complete
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-heading">
              Final Certification Passed!
            </h3>
            <p className="text-white/90 text-sm max-w-lg leading-relaxed">
              You have already achieved a passing score in the Final Level Exam. Your official certificate is issued and permanently archived. Re-examination is not required.
            </p>
          </div>
          <div className="text-5xl sm:text-6xl select-none">🏆</div>
        </div>
      </div>
    );
  }

  // Case 2: Student has not attempted yet
  if (!status?.hasAttempted) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Graduation Pathway
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1D3557] font-heading">
              Ready to Take the Final Exam?
            </h3>
            <p className="text-slate-600 text-sm max-w-lg leading-relaxed">
              Complete the Level 1 Final Certification Exam with a passing score of 70% or higher to earn your accredited digital certificate and official honors grade.
            </p>
          </div>

          <button
            onClick={() => router.push("/learning/exam")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-black text-base shadow-xl hover:scale-105 transition cursor-pointer border-b-4 border-emerald-700 whitespace-nowrap"
          >
            <span>Start Final Exam</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Student failed attempt - Cooldown active or expired
  const latest = status.latestAttempt;
  const failureFormatted = latest?.failureDate
    ? new Date(latest.failureDate).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isEligibleNow
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {isEligibleNow ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  Re-Examination Unlocked
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  24-Hour Cooldown In Progress
                </>
              )}
            </span>
            <span className="text-xs font-extrabold text-slate-500">
              Attempt #{latest?.attemptNumber || 1}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1D3557] font-heading">
            Re-Examination Status & Cooldown Policy
          </h3>
        </div>

        {/* Failed Attempt Preservation Pill */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-rose-500 block">
            Previous Attempt Recorded
          </span>
          <span className="text-xs font-extrabold text-rose-900">
            Score: {latest?.score ?? 0} / 100 ({latest?.percentage ?? 0}%)
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {failureFormatted}
          </span>
        </div>
      </div>

      {/* Countdown Timer Block (If cooldown active) */}
      {!isEligibleNow ? (
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-white/80">
                Cooldown Timer Remaining
              </span>
              <p className="text-xs text-white/90">
                Next exam attempt will unlock automatically once the 24-hour review period elapses.
              </p>
            </div>

            {/* Time Ticker Boxes */}
            <div className="flex items-center gap-2 font-mono">
              <div className="bg-black/30 backdrop-blur-md rounded-xl px-3 py-2 text-center min-w-[54px]">
                <span className="text-2xl sm:text-3xl font-black">
                  {String(hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/70 block">Hours</span>
              </div>
              <span className="text-xl font-black text-white/60">:</span>
              <div className="bg-black/30 backdrop-blur-md rounded-xl px-3 py-2 text-center min-w-[54px]">
                <span className="text-2xl sm:text-3xl font-black">
                  {String(minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/70 block">Mins</span>
              </div>
              <span className="text-xl font-black text-white/60">:</span>
              <div className="bg-black/30 backdrop-blur-md rounded-xl px-3 py-2 text-center min-w-[54px]">
                <span className="text-2xl sm:text-3xl font-black">
                  {String(seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/70 block">Secs</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-white/80">
              <span>24h Cooldown Elapsed</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Cooldown Completed Banner */
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-yellow-300" />
              Cooldown Complete
            </div>
            <h4 className="text-xl font-black font-heading">
              You are Eligible for Re-Examination!
            </h4>
            <p className="text-xs text-white/90">
              The 24-hour review period has elapsed. You may now create a brand new exam attempt.
            </p>
          </div>

          <button
            onClick={handleReEnroll}
            disabled={isSubmitting}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-yellow-50 text-emerald-800 font-black text-sm shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            {isSubmitting ? (
              <span>Re-Enrolling...</span>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Re-Enroll Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Policy Explanation Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-extrabold">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Important Academic Policy:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
          <li>
            <strong>Attempt History Preserved:</strong> Prior failed attempts and answers are permanently archived for teacher review and are never deleted.
          </li>
          <li>
            <strong>24-Hour Cooldown:</strong> Antigravity Abacus curriculum enforces a 24-hour interval between final exam attempts to prevent cognitive fatigue and encourage targeted worksheet revision.
          </li>
          <li>
            <strong>New Attempt Generation:</strong> Upon re-enrollment, a fresh exam attempt (Attempt #{ (status.attemptsCount || 1) + 1 }) is generated with updated questions.
          </li>
        </ul>
      </div>
    </div>
  );
}
