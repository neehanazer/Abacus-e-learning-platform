"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  CircleDashed,
  FileCheck2,
  Video,
  ListOrdered,
  Eye,
  Activity,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  X,
  Save,
} from "lucide-react";
import ProctoringModal from "@/components/admin/ProctoringModal";

interface StudentDetailResponse {
  personalInformation: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateJoined: string;
    age: number;
    guardianName: string;
    guardianPhone: string;
    guardianInformation: {
      name: string;
      phone: string;
    };
    accountStatus: string;
    avatar: string;
  };
  learningInformation: {
    selectedLevel: string;
    currentLevel: string;
    completedLevels: string[];
    levelCompletionDates: { level: string; completedDate: string }[];
    lessonsCompleted: number;
    videosWatched: number;
    practiceAttempts: number;
    homeworkStatus: {
      assigned: number;
      submitted: number;
      evaluated: number;
      pending: number;
    };
    homeworkList?: {
      id: string;
      title: string;
      homeworkNumber: number;
      recommendedTime: number;
      assignedDate: string;
      dueDate: string;
      status: string;
      levelOrder?: number;
      levelName?: string;
    }[];
  };
  levelProgress: {
    levelId: string;
    levelName: string;
    order: number;
    status: "Completed" | "In Progress" | "Not Started";
    startedDate: string | null;
    completionDate: string | null;
    totalLessons: number;
    completedLessons: number;
    worksheetPractices?: number;
  }[];
  certificates?: {
    id: string;
    certificateId: string;
    verificationCode: string;
    levelId: string;
    levelName: string;
    levelOrder: number;
    examId: string;
    examTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    issueDate: string;
    status: string;
  }[];
  examInformation: {
    examsAttended: number;
    examsPassed: number;
    examsFailed: number;
    attempts: {
      attemptId: string;
      studentName: string;
      level: string;
      examName: string;
      examType: string;
      date: string;
      marks: string;
      score: number;
      totalMarks: number;
      percentage: number;
      result: "PASS" | "FAIL" | "IN PROGRESS";
      isPassed: boolean;
      attempt: number;
      overallAttempt?: number;
      status?: string;
      timeTaken: number;
      proctoringEventsCount: number;
    }[];
  };
}

export default function AdminStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.studentId as string;

  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proctoring modal state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [isProctoringOpen, setIsProctoringOpen] = useState(false);
  const [examFilter, setExamFilter] = useState<"all" | "final" | "mock">("all");

  // Level & Homework date editing states
  const [levelDateModal, setLevelDateModal] = useState<{
    levelOrder: number;
    levelName: string;
    startDate: string;
    completionDate: string;
  } | null>(null);

  const [hwDateModal, setHwDateModal] = useState<{
    homeworkId: string;
    title: string;
    assignedDate: string;
    dueDate: string;
  } | null>(null);

  const [isSavingDate, setIsSavingDate] = useState(false);
  const [dateFeedback, setDateFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Homework level filter state (all, 1, 2, etc.)
  const [hwLevelFilter, setHwLevelFilter] = useState<"all" | number>("all");

  const fetchDetails = async () => {
    if (!studentId) return;
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/students/${studentId}`, {
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.student) {
        setStudent(data.student);
      } else {
        setError(data.error || "Failed to load student details.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error loading student details.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [studentId]);

  const handleOpenProctoring = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setIsProctoringOpen(true);
  };

  const handleSaveLevelDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelDateModal) return;
    setIsSavingDate(true);
    setDateFeedback(null);

    try {
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("abacus_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          action: "update_level_dates",
          levelOrder: levelDateModal.levelOrder,
          startDate: levelDateModal.startDate,
          completionDate: levelDateModal.completionDate || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDateFeedback({
          type: "success",
          text: `Level ${levelDateModal.levelOrder} dates saved! Next level start date automatically chained +1 day after completion.`,
        });
        await fetchDetails();
        setTimeout(() => {
          setLevelDateModal(null);
          setDateFeedback(null);
        }, 1500);
      } else {
        setDateFeedback({ type: "error", text: data.error || "Failed to update level dates." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error updating dates.";
      setDateFeedback({ type: "error", text: errorMsg });
    } finally {
      setIsSavingDate(false);
    }
  };

  const handleSaveHomeworkDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwDateModal) return;
    setIsSavingDate(true);
    setDateFeedback(null);

    try {
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("abacus_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          action: "update_homework_dates",
          homeworkId: hwDateModal.homeworkId,
          assignedDate: hwDateModal.assignedDate,
          dueDate: hwDateModal.dueDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDateFeedback({ type: "success", text: "Homework dates updated successfully!" });
        await fetchDetails();
        setTimeout(() => {
          setHwDateModal(null);
          setDateFeedback(null);
        }, 1200);
      } else {
        setDateFeedback({ type: "error", text: data.error || "Failed to update homework dates." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error updating homework dates.";
      setDateFeedback({ type: "error", text: errorMsg });
    } finally {
      setIsSavingDate(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading comprehensive student learning profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 max-w-xl mx-auto my-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="font-semibold text-lg">Student Profile Not Found</h3>
        <p className="text-xs text-red-400">{error || "Unable to find the requested student record."}</p>
        <button
          onClick={() => router.push("/admin/students")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students List</span>
        </button>
      </div>
    );
  }

  const { personalInformation, learningInformation, levelProgress, examInformation, certificates = [] } = student;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {personalInformation.name}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  personalInformation.accountStatus === "active"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-rose-950 text-rose-300 border border-rose-800"
                }`}
              >
                {personalInformation.accountStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered ID: <span className="font-mono text-slate-300">{personalInformation.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Level:</span>
          <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            {learningInformation.currentLevel}
          </span>
        </div>
      </div>

      {/* Grid: Personal Information & Learning Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: Personal Information Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              Personal Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Full Name</span>
              <span className="text-slate-200 font-semibold text-sm">{personalInformation.name}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Email Address</span>
              <span className="text-slate-200 font-mono flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {personalInformation.email}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Phone Number</span>
              <span className="text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {personalInformation.phone || "Not provided"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Age</span>
                <span className="text-slate-200 font-semibold">{personalInformation.age} years old</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date Joined</span>
                <span className="text-slate-200 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(personalInformation.dateJoined).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-2">
                Guardian Information
              </span>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-slate-200 font-medium">
                    {personalInformation.guardianName || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-slate-200 font-mono">
                    {personalInformation.guardianPhone || "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Learning Activity & Homework */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              Learning Activity &amp; Workload
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <Video className="w-4 h-4 text-cyan-400 mx-auto mb-2" />
              <span className="text-2xl font-bold text-white block">
                {learningInformation.videosWatched}
              </span>
              <span className="text-[11px] text-slate-400">Videos Watched</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <BookOpen className="w-4 h-4 text-indigo-400 mx-auto mb-2" />
              <span className="text-2xl font-bold text-white block">
                {learningInformation.lessonsCompleted}
              </span>
              <span className="text-[11px] text-slate-400">Lessons Done</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <ListOrdered className="w-4 h-4 text-amber-400 mx-auto mb-2" />
              <span className="text-2xl font-bold text-white block">
                {learningInformation.practiceAttempts}
              </span>
              <span className="text-[11px] text-slate-400">Practice Sets</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <FileCheck2 className="w-4 h-4 text-emerald-400 mx-auto mb-2" />
              <span className="text-2xl font-bold text-emerald-400 block tracking-tight">
                {learningInformation.homeworkStatus.submitted}/{learningInformation.homeworkStatus.assigned}
              </span>
              <span className="text-[11px] text-slate-400">Homework Completed</span>
            </div>
          </div>

          {/* Homework Detail Card */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Homework Performance Breakdown
              </h4>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono">
                Completed: {learningInformation.homeworkStatus.submitted}/{learningInformation.homeworkStatus.assigned}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Assigned</span>
                <span className="font-bold text-slate-200 text-sm">
                  {learningInformation.homeworkStatus.assigned}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Submitted</span>
                <span className="font-bold text-purple-300 text-sm">
                  {learningInformation.homeworkStatus.submitted}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pending</span>
                <span className="font-bold text-amber-400 text-sm">
                  {learningInformation.homeworkStatus.pending}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Evaluated</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {learningInformation.homeworkStatus.evaluated}
                </span>
              </div>
            </div>

            {/* Individual Student Homework Assignments Table with Date Changing */}
            {learningInformation.homeworkList && learningInformation.homeworkList.length > 0 && (() => {
              const allHwList = learningInformation.homeworkList || [];
              const availableHwLevels = Array.from(
                new Set(allHwList.map((h) => h.levelOrder || 1))
              ).sort((a, b) => a - b);
              const displayHwList = allHwList.filter((h) => {
                if (hwLevelFilter === "all") return true;
                return (h.levelOrder || 1) === hwLevelFilter;
              });

              return (
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Manage Student Homework Schedule &amp; Dates
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Click Change Dates to reschedule
                    </span>
                  </div>

                  {/* Level Tabs / Filter Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                    <button
                      type="button"
                      onClick={() => setHwLevelFilter("all")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                        hwLevelFilter === "all"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      All Levels ({allHwList.length})
                    </button>
                    {availableHwLevels.map((lvl) => {
                      const count = allHwList.filter((h) => (h.levelOrder || 1) === lvl).length;
                      const isCurrent =
                        (learningInformation.currentLevel || "").toLowerCase().includes(`level ${lvl}`);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setHwLevelFilter(lvl)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1.5 ${
                            hwLevelFilter === lvl
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                          }`}
                        >
                          <span>Level {lvl} ({count})</span>
                          {isCurrent && (
                            <span className="px-1 py-0.2 text-[9px] rounded bg-purple-400/20 text-purple-200 border border-purple-400/30">
                              Current
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-lg border border-slate-800/80">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Homework</th>
                          <th className="py-2 px-3">Assigned Date</th>
                          <th className="py-2 px-3">Due Date</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {displayHwList.map((hw) => {
                          const isEvaluated = hw.status?.toLowerCase() === "evaluated";
                          return (
                            <tr key={hw.id} className="hover:bg-slate-900/50 transition">
                              <td className="py-2 px-3 font-medium text-white whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span>HW {hw.homeworkNumber}: {hw.title}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      (hw.levelOrder || 1) === 1
                                        ? "bg-blue-950/70 text-blue-300 border border-blue-800/40"
                                        : "bg-purple-950/70 text-purple-300 border border-purple-800/40"
                                    }`}
                                  >
                                    Level {hw.levelOrder || 1}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3 font-mono text-purple-300 whitespace-nowrap">
                                {hw.assignedDate}
                              </td>
                              <td className="py-2 px-3 font-mono text-amber-300 whitespace-nowrap">
                                {hw.dueDate}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                    isEvaluated
                                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                                      : hw.status?.toLowerCase() === "submitted"
                                      ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {hw.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                {isEvaluated ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Evaluated
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHwDateModal({
                                        homeworkId: hw.id,
                                        title: `HW ${hw.homeworkNumber}: ${hw.title}`,
                                        assignedDate: hw.assignedDate,
                                        dueDate: hw.dueDate,
                                      })
                                    }
                                    className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-semibold transition"
                                  >
                                    Change Dates
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* SECTION 3: Dynamic Level Progress Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              Curriculum &amp; Level Completion Progress
            </h3>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Completed Levels:</span>
            <strong className="text-emerald-400 font-semibold">
              {learningInformation.completedLevels.length > 0
                ? learningInformation.completedLevels.join(", ")
                : "None"}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levelProgress.map((lvl) => {
            const isCompleted = lvl.status === "Completed";
            const isInProgress = lvl.status === "In Progress";

            return (
              <div
                key={lvl.levelId}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isCompleted
                    ? "bg-emerald-950/20 border-emerald-800/60"
                    : isInProgress
                    ? "bg-indigo-950/20 border-indigo-800/60"
                    : "bg-slate-950/40 border-slate-800/80 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">
                      Level {lvl.order}: {lvl.levelName}
                    </span>
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed
                      </span>
                    ) : isInProgress ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        In Progress
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                        <CircleDashed className="w-3 h-3 text-slate-500" />
                        Not Started
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 mt-3">
                    <div className="flex justify-between items-center">
                      <span>Videos Completed:</span>
                      <span className="text-slate-100 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                        {lvl.completedLessons} / {lvl.totalLessons} videos
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Worksheets Practiced:</span>
                      <span className="text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                        <ListOrdered className="w-3 h-3 text-amber-400" />
                        {lvl.worksheetPractices || 0} times
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {lvl.startedDate
                          ? new Date(lvl.startedDate).toLocaleDateString()
                          : "Not scheduled"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Completion Date:</span>
                      <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                        {lvl.completionDate
                          ? new Date(lvl.completionDate).toLocaleDateString()
                          : "In progress / Ongoing"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setLevelDateModal({
                          levelOrder: lvl.order,
                          levelName: lvl.levelName,
                          startDate: lvl.startedDate
                            ? lvl.startedDate.split("T")[0]
                            : "2026-10-05",
                          completionDate: lvl.completionDate
                            ? lvl.completionDate.split("T")[0]
                            : "",
                        })
                      }
                      className="mt-2 w-full py-1 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Edit Enrollment Dates</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Official Certificates & Verified Credentials */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              Official Certificates &amp; Credentials
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Issued: <strong className="text-amber-400 font-bold">{certificates.length}</strong>
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
            No certificates issued yet for this student. Certificates are automatically awarded upon passing a Final Certification Exam.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-slate-950 border border-amber-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{cert.levelName}</h4>
                      <span className="text-[11px] text-slate-400 block">{cert.examTitle}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {cert.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Score</span>
                    <span className="font-bold text-amber-300 font-mono text-sm">
                      {cert.score} / {cert.totalMarks || 100}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium ml-1">({cert.percentage}%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Grade</span>
                    <span className="font-bold text-white text-xs">{cert.grade}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Issue Date</span>
                    <span className="font-mono text-slate-300 text-xs">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="font-mono text-slate-400 flex items-center gap-1.5">
                    <span>Cert ID:</span>
                    <strong className="text-indigo-300 font-semibold">{cert.certificateId}</strong>
                  </div>
                  <div className="font-mono text-slate-400 flex items-center gap-1.5">
                    <span>Verification:</span>
                    <strong className="text-emerald-400 font-semibold">{cert.verificationCode}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: Complete Student Exam History */}
      {(() => {
        const allAttempts = examInformation.attempts || [];
        const finalExamsCount = allAttempts.filter((a) => a.examType === "final").length;
        const mockExamsCount = allAttempts.filter((a) => a.examType === "mock").length;
        const filteredAttempts = allAttempts.filter((att) => {
          if (examFilter === "final") return att.examType === "final";
          if (examFilter === "mock") return att.examType === "mock";
          return true;
        });

        return (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
                  Exam History &amp; Proctoring Logs
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {/* Filter Pills */}
                <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setExamFilter("all")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      examFilter === "all"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All ({allAttempts.length})
                  </button>
                  <button
                    onClick={() => setExamFilter("final")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      examFilter === "final"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Final ({finalExamsCount})
                  </button>
                  <button
                    onClick={() => setExamFilter("mock")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      examFilter === "mock"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Mock ({mockExamsCount})
                  </button>
                </div>
                <span className="text-slate-400">
                  Total Attended: <strong className="text-slate-200">{allAttempts.length}</strong>
                </span>
              </div>
            </div>

            {filteredAttempts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                No exam attempts found for the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Exam</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Marks</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Attempt #</th>
                      <th className="py-3 px-4 text-right">Proctoring Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAttempts.map((att, idx) => {
                      const displayAttemptNumber = att.overallAttempt || (allAttempts.length - idx);

                      return (
                        <tr key={att.attemptId} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-semibold text-white">
                            {att.examName}
                            <span className="block text-[10px] text-slate-400 uppercase font-mono">
                              {att.examType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{att.level}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-200">
                            {att.marks}
                          </td>
                          <td className="py-3 px-4 font-semibold text-indigo-300">
                            {att.percentage}%
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                att.status === "in_progress"
                                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                                  : att.isPassed
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-rose-950 text-rose-300 border border-rose-800"
                              }`}
                            >
                              {att.status === "in_progress" ? "IN PROGRESS" : att.result}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-white text-sm">
                              #{displayAttemptNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              {att.examType === "mock" ? "Mock" : "Final"} #{att.attempt}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenProctoring(att.attemptId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                              <span>View Proctoring ({att.proctoringEventsCount})</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Level Enrollment Dates Modal */}
      {levelDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white">
                  Edit Level {levelDateModal.levelOrder} Enrollment Dates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLevelDateModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Customize the start date and completion date for{" "}
              <strong className="text-slate-200">{levelDateModal.levelName}</strong>.
            </p>

            {dateFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                  dateFeedback.type === "success"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/60 border-rose-800 text-rose-300"
                }`}
              >
                {dateFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{dateFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveLevelDates} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Level Start Date
                </label>
                <input
                  type="date"
                  required
                  value={levelDateModal.startDate}
                  onChange={(e) =>
                    setLevelDateModal({ ...levelDateModal, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Level Completion Date (optional)
                </label>
                <input
                  type="date"
                  value={levelDateModal.completionDate}
                  onChange={(e) =>
                    setLevelDateModal({ ...levelDateModal, completionDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-indigo-300 block pt-1">
                  💡 When a completion date is entered, the next level (Level {levelDateModal.levelOrder + 1}) will automatically begin 1 day after.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLevelDateModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDate}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingDate ? "Saving..." : "Save Dates"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Homework Dates Reschedule Modal */}
      {hwDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm text-white">
                  Reschedule Homework Dates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHwDateModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Change assigned date and due date for:{" "}
              <strong className="text-slate-200">{hwDateModal.title}</strong>
            </p>

            {dateFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                  dateFeedback.type === "success"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/60 border-rose-800 text-rose-300"
                }`}
              >
                {dateFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{dateFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveHomeworkDates} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Assigned Date
                </label>
                <input
                  type="date"
                  required
                  value={hwDateModal.assignedDate}
                  onChange={(e) =>
                    setHwDateModal({ ...hwDateModal, assignedDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={hwDateModal.dueDate}
                  onChange={(e) =>
                    setHwDateModal({ ...hwDateModal, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setHwDateModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDate}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingDate ? "Saving..." : "Save Homework Dates"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proctoring Events Modal */}
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
