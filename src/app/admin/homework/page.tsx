"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Plus,
  Search,
  Calendar,
  Layers,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  FileText,
} from "lucide-react";

interface HomeworkItem {
  id: string;
  homeworkId: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  lesson: string;
  assignedDate: string;
  dueDate: string;
  numberStudentsAssigned: number;
  submittedCount: number;
  pendingCount: number;
  evaluatedCount: number;
  status: string;
  questionsCount: number;
}

export default function AdminHomeworkListPage() {
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [levels, setLevels] = useState<{ id: string; levelName: string }[]>([]);

  const fetchLevels = async () => {
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch("/api/admin/levels", { headers, credentials: "include" });
      const data = await res.json();
      if (data.success && data.levels) {
        setLevels(data.levels);
      }
    } catch {
      // Ignore
    }
  };

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (levelFilter !== "all") params.set("level", levelFilter);

      const res = await fetch(`/api/admin/homework?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.homework) {
        setHomeworkList(data.homework);
      } else {
        setHomeworkList([]);
      }
    } catch {
      setHomeworkList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchHomework();
  }, [levelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHomework();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Homework Management
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
              {homeworkList.length} assignments
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create assignments, monitor student submissions, and review homework evaluation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchHomework()}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          </button>

          <Link
            href="/admin/homework/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create Homework</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search homework by title..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Levels</option>
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.levelName}
            </option>
          ))}
        </select>
      </div>

      {/* Homework Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Homework Title</th>
                <th className="py-3 px-4">Level &amp; Topic</th>
                <th className="py-3 px-4">Assigned Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Submitted</th>
                <th className="py-3 px-4 text-center">Pending</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading homework assignments...
                  </td>
                </tr>
              ) : homeworkList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No homework assignments found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &ldquo;Create Homework&rdquo; to assign exercises to students or levels.
                    </p>
                  </td>
                </tr>
              ) : (
                homeworkList.map((hw) => (
                  <tr key={hw.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{hw.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {hw.description || "No description provided"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-200 block">{hw.level}</span>
                      <span className="text-[11px] text-slate-400">{hw.topic}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {new Date(hw.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {new Date(hw.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                      {hw.numberStudentsAssigned}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-300">
                      {hw.submittedCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                      {hw.pendingCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {hw.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/homework/${hw.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Monitor</span>
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
