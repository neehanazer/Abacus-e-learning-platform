"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, Clock, Info } from "lucide-react";

interface ProctoringEvent {
  id: string;
  eventType: string;
  timestamp: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: Record<string, any>;
}

interface ProctoringModalProps {
  isOpen: boolean;
  attemptId: string | null;
  onClose: () => void;
}

export default function ProctoringModal({ isOpen, attemptId, onClose }: ProctoringModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    attemptInfo: any;
    proctoringReview: {
      totalEvents: number;
      severityCounts: { low: number; medium: number; high: number; critical: number };
      recommendation: string;
      events: ProctoringEvent[];
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !attemptId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("abacus_admin_token") : null;
        const headers: Record<string, string> = {};
        if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

        const res = await fetch(`/api/admin/exams/attempts/${attemptId}/proctoring`, {
          headers,
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Failed to load proctoring events.");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading proctoring details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isOpen, attemptId]);

  if (!isOpen) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-950 text-red-400 border border-red-800">Critical</span>;
      case "high":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-950 text-rose-300 border border-rose-800">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950 text-amber-300 border border-amber-800">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">Low</span>;
    }
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">AI Proctoring Review</h3>
              <p className="text-xs text-slate-400">
                Independent verification review &bull; Attempt ID: <span className="font-mono text-slate-300">{attemptId?.slice(-8)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Fetching recorded proctoring signals...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-950/50 border border-red-900 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Failed to retrieve review</p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Attempt Overview Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Student</span>
                  <span className="font-medium text-slate-200 text-sm">{data.attemptInfo?.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Exam</span>
                  <span className="font-medium text-slate-200 text-sm">{data.attemptInfo?.examTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Score</span>
                  <span className="font-medium text-slate-200 text-sm">
                    {data.attemptInfo?.score} / {data.attemptInfo?.totalMarks} ({data.attemptInfo?.percentage}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Exam Result</span>
                  <span className={`font-semibold inline-block mt-0.5 ${data.attemptInfo?.isPassed ? "text-emerald-400" : "text-rose-400"}`}>
                    {data.attemptInfo?.isPassed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>

              {/* Status Recommendation Box */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                data.proctoringReview.totalEvents === 0
                  ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                  : data.proctoringReview.severityCounts.critical > 0 || data.proctoringReview.severityCounts.high > 2
                  ? "bg-red-950/30 border-red-800/60 text-red-300"
                  : "bg-amber-950/30 border-amber-800/60 text-amber-300"
              }`}>
                {data.proctoringReview.totalEvents === 0 ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">Admin Review Summary</h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {data.proctoringReview.recommendation}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 italic flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Important: Automated proctoring events are advisory indicators for administrative review and do not automatically invalidate an exam.
                  </p>
                </div>
              </div>

              {/* Severity Counts Bar */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Critical</span>
                  <span className="text-xl font-bold text-red-400">{data.proctoringReview.severityCounts.critical}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="text-xs text-slate-400 block">High</span>
                  <span className="text-xl font-bold text-rose-400">{data.proctoringReview.severityCounts.high}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Medium</span>
                  <span className="text-xl font-bold text-amber-400">{data.proctoringReview.severityCounts.medium}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Low</span>
                  <span className="text-xl font-bold text-slate-300">{data.proctoringReview.severityCounts.low}</span>
                </div>
              </div>

              {/* Events Timeline / Table */}
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
                  <span>Recorded Event Log</span>
                  <span className="text-xs text-slate-400">Total: {data.proctoringReview.totalEvents} events</span>
                </h4>

                {data.proctoringReview.events.length === 0 ? (
                  <div className="py-10 text-center rounded-lg border border-dashed border-slate-800 text-slate-400 text-sm">
                    No proctoring anomalies or suspicious events were recorded during this session.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800/80">
                    {data.proctoringReview.events.map((ev, index) => (
                      <div key={ev.id || index} className="p-3.5 bg-slate-950/40 hover:bg-slate-950/70 transition flex items-start gap-4">
                        <div className="mt-0.5">{getSeverityBadge(ev.severity)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-slate-200">{formatEventType(ev.eventType)}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{ev.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                            <span>Confidence: <strong className="text-slate-300">{Math.round(ev.confidence * 100)}%</strong></span>
                            <span>&bull;</span>
                            <span>Recorded at: {new Date(ev.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
