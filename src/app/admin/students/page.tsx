"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";

interface StudentItem {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string;
  selectedLevel: string;
  currentLevel: string;
  completedLevels: string[];
  accountStatus: string;
  age: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Levels for filter dropdown
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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search.trim()) params.set("search", search.trim());
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, levelFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleResetFilters = () => {
    setSearch("");
    setLevelFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950 text-rose-300 border border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Student Directory
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {total} registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse registered learners, dynamic level progress, and individual profiles.
          </p>
        </div>

        <button
          onClick={() => fetchStudents()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.levelName}>
                  {lvl.levelName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Submit / Reset */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Registration Date Range:
          </span>
          <div className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setPage(1);
                fetchStudents();
              }}
              className="px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition"
            >
              Apply Date
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Date Joined</th>
                <th className="py-3 px-4">Current Level</th>
                <th className="py-3 px-4">Completed Levels</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-white block text-sm">
                            {st.name}
                          </span>
                          <span className="text-[11px] text-slate-400">Age: {st.age}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-300">{st.email}</div>
                      <div className="text-[11px] text-slate-400">{st.phone}</div>
                    </td>

                    {/* Date Joined */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-300 font-medium">
                        {new Date(st.dateJoined).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(st.dateJoined).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Current Level */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded text-[11px] inline-block">
                        {st.currentLevel}
                      </span>
                    </td>

                    {/* Completed Levels */}
                    <td className="py-3.5 px-4">
                      {st.completedLevels && st.completedLevels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {st.completedLevels.map((lvl, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]"
                            >
                              {lvl}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">None yet</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(st.accountStatus)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/students/${st.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <strong className="text-slate-200">{page}</strong> of{" "}
              <strong className="text-slate-200">{totalPages}</strong> ({total} total students)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
