"use client";

import React from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

export interface ExamHistoryItem {
  attemptId: string;
  attemptNumber: number;
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  status: string;
  failureDate?: string | null;
  reExamEligibleAt?: string | null;
  submittedAt?: string | null;
  timeTaken?: number;
}

interface ExamHistoryTableProps {
  history: ExamHistoryItem[];
}

export default function ExamHistoryTable({ history }: ExamHistoryTableProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-xl">
          📚
        </div>
        <h4 className="text-base font-extrabold text-[#1D3557]">
          No Exam Attempts Recorded
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Complete the Final Certification Exam to see your full attempt records and evaluation analytics preserved here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-slate-600" />
            Immutable Academic Record
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1D3557] font-heading">
            Chronological Examination History
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total Attempts Preserved: <strong className="text-[#1D3557]">{history.length}</strong>
        </span>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Attempt</th>
              <th className="py-3.5 px-4">Exam Module</th>
              <th className="py-3.5 px-4">Evaluation Date</th>
              <th className="py-3.5 px-4">Score & %</th>
              <th className="py-3.5 px-4">Outcome</th>
              <th className="py-3.5 px-4">Cooldown / Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((item, idx) => {
              const attemptDate = item.submittedAt || item.failureDate;
              const dateStr = attemptDate
                ? new Date(attemptDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "In Progress";

              return (
                <tr key={item.attemptId || idx} className="hover:bg-slate-50/60 transition">
                  {/* Attempt # */}
                  <td className="py-4 px-4 font-extrabold text-[#1D3557] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono">
                      #{item.attemptNumber || idx + 1}
                    </span>
                  </td>

                  {/* Exam Title */}
                  <td className="py-4 px-4 font-bold text-slate-800">
                    <div>{item.examTitle || "Abacus Certification Exam"}</div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {item.attemptId.slice(-8)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateStr}</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-slate-900">
                      {item.score} / {item.totalMarks}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      {item.percentage}%
                    </span>
                  </td>

                  {/* Outcome */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.isPassed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED
                      </span>
                    ) : item.status === "in_progress" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        IN PROGRESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        FAILED
                      </span>
                    )}
                  </td>

                  {/* Cooldown Record */}
                  <td className="py-4 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                    {item.isPassed ? (
                      <span className="text-emerald-700 font-bold">Certificate Issued</span>
                    ) : item.failureDate ? (
                      <span className="text-amber-800 font-medium">
                        Failure preserved • 24h locked
                      </span>
                    ) : (
                      <span className="text-slate-400">Current attempt</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>
          Previous exam attempts are permanently preserved for academic continuity and teacher review.
        </span>
      </div>
    </div>
  );
}
