"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import ProctoringModal from "@/components/admin/ProctoringModal";

interface ExamAttemptItem {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  examId: string;
  examName: string;
  examType: string;
  level: string;
  levelId: string;
  examDate: string;
  marks: string;
  score: number;
  totalMarks: number;
  percentage: number;
  result: "PASS" | "FAIL";
  isPassed: boolean;
  attemptNumber: number;
  timeTaken: number;
  status: string;
  proctoringEventsCount: number;
}

export default function AdminExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;

  const [attempts, setAttempts] = useState<ExamAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  // Proctoring modal
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [isProctoringOpen, setIsProctoringOpen] = useState(false);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/exams/attempts?limit=100`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.attempts) {
        // If an examId filter is present, filter to matching attempts (or show all matching)
        if (examId && examId !== "all") {
          const matching = data.attempts.filter(
            (a: ExamAttemptItem) => a.examId === examId
          );
          setAttempts(matching.length > 0 ? matching : data.attempts);
        } else {
          setAttempts(data.attempts);
        }
      } else {
        setAttempts([]);
      }
    } catch {
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [examId]);

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      att.studentName.toLowerCase().includes(search.toLowerCase()) ||
      att.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      att.examName.toLowerCase().includes(search.toLowerCase());
    const matchesResult =
      resultFilter === "all" ||
      (resultFilter === "pass" && att.isPassed) ||
      (resultFilter === "fail" && !att.isPassed);
    return matchesSearch && matchesResult;
  });

  const examTitle = attempts[0]?.examName || "Abacus Exam Results";
  const examLevel = attempts[0]?.level || "Standard Level";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/exams"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {examTitle}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {examLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Individual student scores, grading breakdown, and AI proctoring signals review.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAttempts}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by student name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Outcomes</option>
          <option value="pass">Passed Only</option>
          <option value="fail">Failed Only</option>
        </select>
      </div>

      {/* Attempts Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Exam</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4">Marks</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 font-mono">Attempt #</th>
                <th className="py-3 px-4 text-right">Proctoring Signals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading exam attempt records...
                  </td>
                </tr>
              ) : filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching exam attempts found.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => (
                  <tr key={att.attemptId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/students/${att.studentId}`}
                        className="font-semibold text-white hover:text-indigo-400 transition block text-sm"
                      >
                        {att.studentName}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {att.studentEmail}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {att.examName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{att.level}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {new Date(att.examDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {att.marks}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-300">
                      {att.percentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          att.isPassed
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}
                      >
                        {att.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {att.attemptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAttemptId(att.attemptId);
                          setIsProctoringOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition shadow-sm"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View Proctoring Events ({att.proctoringEventsCount})</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proctoring Events Review Modal */}
      <ProctoringModal
        isOpen={isProctoringOpen}
        attemptId={selectedAttemptId}
        onClose={() => {
          setIsProctoringOpen(false);
          setSelectedAttemptId(null);
        }}
      />
    </div>
  );
}
