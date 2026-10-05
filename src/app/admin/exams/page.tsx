"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Award,
  Users,
  Calendar,
} from "lucide-react";

interface ExamSummary {
  totalStudentsAttended: number;
  totalAttempts: number;
  studentsPassed: number;
  studentsFailed: number;
  overallPassPercentage: number;
  averageMarks: number;
  highestMarks: number;
}

interface ExamWiseResult {
  examId: string;
  examTitle: string;
  examType: string;
  level: string;
  totalAttempts: number;
  totalStudentsAttended: number;
  studentsPassed: number;
  studentsFailed: number;
  passPercentage: number;
  averageMarks: number;
  highestMarks: number;
}

export default function AdminExamsListPage() {
  const [summary, setSummary] = useState<ExamSummary | null>(null);
  const [exams, setExams] = useState<ExamWiseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchExamResults = async () => {
    setLoading(true);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch("/api/admin/exams/results", {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setExams(data.examWiseResults || []);
      }
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
  }, []);

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.examTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.level.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || e.examType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Exam Monitoring &amp; Results
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Evaluations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aggregate student exam outcomes, grade averages, pass rates, and exam attempt records.
          </p>
        </div>

        <button
          onClick={fetchExamResults}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Aggregate Metric Highlights */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Attended</span>
            <span className="text-2xl font-extrabold text-white">
              {summary.totalStudentsAttended}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">learners</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Passed</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {summary.studentsPassed}
            </span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">sessions</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Failed</span>
            <span className="text-2xl font-extrabold text-rose-400">
              {summary.studentsFailed}
            </span>
            <span className="text-[10px] text-rose-500 block mt-0.5">retakes needed</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Pass Rate</span>
            <span className="text-2xl font-extrabold text-indigo-400">
              {summary.overallPassPercentage}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">success ratio</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Avg Marks</span>
            <span className="text-2xl font-extrabold text-cyan-300">
              {summary.averageMarks}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">out of 100</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">High Score</span>
            <span className="text-2xl font-extrabold text-amber-400">
              {summary.highestMarks}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">peak score</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam by title or level..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Exam Types</option>
          <option value="mock">Mock Exam</option>
          <option value="final">Final Exam</option>
        </select>
      </div>

      {/* Exams Roster Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Exam Name</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Students Attended</th>
                <th className="py-3 px-4 text-center">Passed</th>
                <th className="py-3 px-4 text-center">Failed</th>
                <th className="py-3 px-4 text-center">Avg Marks</th>
                <th className="py-3 px-4 text-center">Pass %</th>
                <th className="py-3 px-4 text-right">Attempts &amp; Proctoring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading exam evaluations...
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No exam records found.
                  </td>
                </tr>
              ) : (
                filteredExams.map((ex) => (
                  <tr key={ex.examId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {ex.examTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{ex.level}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                        {ex.examType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                      {ex.totalStudentsAttended}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                      {ex.studentsPassed}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-400">
                      {ex.studentsFailed}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-200">
                      {ex.averageMarks}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-300">
                      {ex.passPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/exams/${ex.examId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Results</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
