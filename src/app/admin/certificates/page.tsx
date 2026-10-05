"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  RefreshCw,
  Eye,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

interface CertificateItem {
  id: string;
  certificateId: string;
  verificationCode: string;
  student: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  level: string;
  levelId: string;
  exam: string;
  score: number;
  grade: string;
  issueDate: string;
  status: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const fetchCertificates = async () => {
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
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/certificates?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.certificates) {
        setCertificates(data.certificates);
      } else {
        setCertificates([]);
      }
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [levelFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCertificates();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Certificate Registry &amp; Verification
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {certificates.length} credentials issued
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified diploma issuances, examine cryptographic codes, and audit credential status.
          </p>
        </div>

        <button
          onClick={fetchCertificates}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh Registry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, certificate ID, or verification code..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Levels</option>
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.levelName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="issued">Issued</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Exam Completed</th>
                <th className="py-3 px-4">Score &amp; Grade</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Verification Code</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Learner Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading certificate records...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No certificates found in registry.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Certificates are automatically generated when students pass final level exams.
                    </p>
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block text-sm">{cert.student}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{cert.studentEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{cert.level}</td>
                    <td className="py-3.5 px-4 text-slate-300">{cert.exam}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-300 font-mono block">
                        {cert.score} / 100
                      </span>
                      <span className="text-[10px] text-slate-400">{cert.grade}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-indigo-300">
                      {cert.certificateId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400">
                      {cert.verificationCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          cert.status === "revoked"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/students/${cert.studentId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
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
