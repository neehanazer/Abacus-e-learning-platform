"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  UserCheck,
  BookOpen,
  CheckCircle,
  FileClock,
  FileCheck2,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  newStudents: number;
  newStudentsPeriod: {
    from: string;
    to: string;
    days: number;
  };
  activeStudents: number;
  totalLevels: number;
  studentsCurrentlyLearning: number;
  completedLevels: number;
  pendingHomework: number;
  submittedHomework: number;
  totalExamsConducted: number;
  passedExams: number;
  failedExams: number;
  certificatesIssued: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async (days = selectedDays) => {
    try {
      setRefreshing(true);
      setError(null);
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/dashboard?days=${days}`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.statistics) {
        setStats(data.statistics);
      } else {
        setError(data.error || "Failed to retrieve statistics.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedDays);
  }, [selectedDays]);

  const handlePeriodChange = (days: number) => {
    setSelectedDays(days);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Platform Overview
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Executive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and platform performance metrics directly synchronized from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range filter for new students */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <span className="text-slate-400 px-2 font-medium">New student window:</span>
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => handlePeriodChange(d)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  selectedDays === d
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchDashboardStats()}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition active:scale-95 disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`}
            />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Primary KPI Grid (11 Required Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. Total Students */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Students
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : stats?.totalStudents ?? 0}
            </span>
            <span className="text-xs text-slate-400">enrolled</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            All registered learners in the database
          </p>
        </div>

        {/* 2. New Students */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              New Students ({selectedDays}d)
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {loading ? "..." : stats?.newStudents ?? 0}
            </span>
            <span className="text-xs text-emerald-500 font-medium">joined recently</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Registrations in the past {selectedDays} days
          </p>
        </div>

        {/* 3. Active Students */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Students
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : stats?.activeStudents ?? 0}
            </span>
            <span className="text-xs text-indigo-400 font-medium">good standing</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accounts with active status
          </p>
        </div>

        {/* 4. Students Currently Learning */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Currently Learning
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 tracking-tight">
              {loading ? "..." : stats?.studentsCurrentlyLearning ?? 0}
            </span>
            <span className="text-xs text-slate-400">engaged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Active lesson &amp; video progress recorded
          </p>
        </div>

        {/* 5. Completed Levels */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completed Levels
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : stats?.completedLevels ?? 0}
            </span>
            <span className="text-xs text-teal-400 font-medium">milestones</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total level completions by students
          </p>
        </div>

        {/* 6. Pending Homework */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Homework
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <FileClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {loading ? "..." : stats?.pendingHomework ?? 0}
            </span>
            <span className="text-xs text-slate-400">pending</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Assigned tasks awaiting submission
          </p>
        </div>

        {/* 7. Submitted Homework */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Submitted Homework
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-300 tracking-tight">
              {loading ? "..." : stats?.submittedHomework ?? 0}
            </span>
            <span className="text-xs text-slate-400">turned in</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Completed homework attempts submitted
          </p>
        </div>

        {/* 8. Total Exams */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Exams
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : stats?.totalExamsConducted ?? 0}
            </span>
            <span className="text-xs text-slate-400">conducted</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total mock &amp; final exam sessions
          </p>
        </div>

        {/* 9. Passed Exams */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Passed Exams
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {loading ? "..." : stats?.passedExams ?? 0}
            </span>
            <span className="text-xs text-emerald-500 font-medium">cleared</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Attempts meeting passing benchmark
          </p>
        </div>

        {/* 10. Failed Exams */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Failed Exams
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 tracking-tight">
              {loading ? "..." : stats?.failedExams ?? 0}
            </span>
            <span className="text-xs text-slate-400">attempts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Attempts eligible for re-examination
          </p>
        </div>

        {/* 11. Certificates Issued */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Certificates Issued
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {loading ? "..." : stats?.certificatesIssued ?? 0}
            </span>
            <span className="text-xs text-slate-400">credentials</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Verified cryptographic diplomas
          </p>
        </div>

        {/* 12. Active Syllabus Levels */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Levels
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : stats?.totalLevels ?? 0}
            </span>
            <span className="text-xs text-slate-400">curricula</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Active abacus syllabus grades
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Administrative Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/students"
            className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-indigo-300 transition">
                Student Directory
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                View student roster, dynamic level progress, and individual profiles.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Manage Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/homework"
            className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 w-fit mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-purple-300 transition">
                Homework Management
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Create assignments, target levels, and monitor submission metrics.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>View Homework</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/exams"
            className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-emerald-300 transition">
                Exam Monitoring
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Inspect attempt records, PASS/FAIL results, and AI proctoring events.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Review Exams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/certificates"
            className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-amber-300 transition">
                Certificate Registry
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Browse issued student diplomas and check verification codes.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Verify Certificates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
