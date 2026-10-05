"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  FileCheck,
  HelpCircle,
  RefreshCw,
  Search,
} from "lucide-react";

interface HomeworkDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  lesson: string;
  recommendedTime: number;
  assignedDate: string;
  dueDate: string;
  status: string;
  monitoring: {
    assigned: number;
    started: number;
    submitted: number;
    pending: number;
    evaluated: number;
  };
  questions: {
    id: string;
    question: string;
    questionType: string;
    correctAnswer: any;
    marks: number;
    explanation: string;
    order: number;
  }[];
  students: {
    studentId: string;
    name: string;
    email: string;
    phone: string;
    level: string;
    status: string;
    score: number;
    accuracy: number;
    timeTaken: number;
    submittedAt: string | null;
    attemptNumber: number;
  }[];
}

export default function AdminHomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params?.homeworkId as string;

  const [homework, setHomework] = useState<HomeworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/homework/${homeworkId}`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.homework) {
        setHomework(data.homework);
      } else {
        setError(data.error || "Homework assignment not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load homework details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (homeworkId) fetchDetail();
  }, [homeworkId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading homework submission monitoring...</p>
      </div>
    );
  }

  if (error || !homework) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 max-w-xl mx-auto my-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="font-semibold text-lg">Homework Not Found</h3>
        <p className="text-xs text-red-400">{error || "Unable to find the requested assignment."}</p>
        <button
          onClick={() => router.push("/admin/homework")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homework List</span>
        </button>
      </div>
    );
  }

  const filteredStudents = homework.students.filter(
    (st) =>
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/homework"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {homework.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800 capitalize">
                {homework.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Level: <strong className="text-slate-300">{homework.level}</strong> &bull; Topic:{" "}
              <strong className="text-slate-300">{homework.topic}</strong> &bull; Due:{" "}
              <strong className="text-slate-300">{new Date(homework.dueDate).toLocaleDateString()}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchDetail}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Monitoring Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">Assigned</span>
          <span className="text-3xl font-extrabold text-white">
            {homework.monitoring.assigned}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">total learners</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">Started</span>
          <span className="text-3xl font-extrabold text-cyan-400">
            {homework.monitoring.started}
          </span>
          <span className="text-[10px] text-cyan-500 block mt-1">in progress</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">Submitted</span>
          <span className="text-3xl font-extrabold text-purple-300">
            {homework.monitoring.submitted}
          </span>
          <span className="text-[10px] text-purple-400 block mt-1">turned in</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">Pending</span>
          <span className="text-3xl font-extrabold text-amber-400">
            {homework.monitoring.pending}
          </span>
          <span className="text-[10px] text-amber-500 block mt-1">awaiting action</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">Evaluated</span>
          <span className="text-3xl font-extrabold text-emerald-400">
            {homework.monitoring.evaluated}
          </span>
          <span className="text-[10px] text-emerald-500 block mt-1">graded &amp; verified</span>
        </div>
      </div>

      {/* Assignment Questions Overview */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Question Set ({homework.questions.length})</span>
          <span className="text-xs text-slate-400 lowercase">
            estimated time: {homework.recommendedTime} mins
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {homework.questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between font-semibold text-indigo-400">
                <span>Q#{q.order || idx + 1}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {q.marks} marks
                </span>
              </div>
              <p className="text-slate-200 font-medium">{q.question}</p>
              <p className="text-slate-400">
                Answer: <strong className="text-emerald-400 font-mono">{String(q.correctAnswer)}</strong>
              </p>
              {q.explanation && (
                <p className="text-[11px] text-slate-400 italic">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Students Roster Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
            Student Submission Status ({homework.students.length})
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student in roster..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrolled Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Time Spent</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Student Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No student submissions found matching filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{st.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{st.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{st.level}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          st.status === "evaluated"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : st.status === "submitted"
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : st.status === "started" || st.status === "inProgress"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {st.score}
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-300">
                      {st.accuracy}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {st.timeTaken ? `${Math.round(st.timeTaken / 60)}m` : "0m"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {st.submittedAt
                        ? new Date(st.submittedAt).toLocaleDateString()
                        : "Not submitted"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/students/${st.studentId}`}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition"
                      >
                        Profile &rarr;
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
