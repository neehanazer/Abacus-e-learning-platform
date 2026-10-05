"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Layers,
  BookOpenCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
} from "lucide-react";

interface QuestionDraft {
  question: string;
  questionType: "numberInput" | "multipleChoice" | "abacus";
  options: string[];
  correctAnswer: string | number;
  marks: number;
  explanation: string;
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
  selectedLevel: string;
}

export default function AdminHomeworkCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelId, setLevelId] = useState("");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [recommendedTime, setRecommendedTime] = useState(15);

  // Assignment type: "level" vs "selected_students"
  const [assignmentType, setAssignmentType] = useState<"level" | "students">("level");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      question: "Calculate 4 + 5",
      questionType: "numberInput",
      options: [],
      correctAnswer: 9,
      marks: 2,
      explanation: "Add 4 lower beads, then push upper bead down (5) = 9",
    },
  ]);

  // Options loaded from server
  const [levels, setLevels] = useState<{ id: string; levelName: string }[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("abacus_admin_token")
            : null;
        const headers: Record<string, string> = {};
        if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

        const [lvlRes, studRes] = await Promise.all([
          fetch("/api/admin/levels", { headers, credentials: "include" }),
          fetch("/api/admin/students?limit=100", { headers, credentials: "include" }),
        ]);

        const lvlData = await lvlRes.json();
        if (lvlData.success && lvlData.levels) {
          setLevels(lvlData.levels);
          if (lvlData.levels.length > 0) {
            setLevelId(lvlData.levels[0].id);
          }
        }

        const studData = await studRes.json();
        if (studData.success && studData.students) {
          setStudents(studData.students);
        }
      } catch {
        // Ignore
      }
    };

    fetchData();
  }, []);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        questionType: "numberInput",
        options: [],
        correctAnswer: "",
        marks: 2,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionDraft, val: any) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleToggleStudentSelection = (stId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a homework title.");
      return;
    }

    if (!levelId) {
      setError("Please select a target level.");
      return;
    }

    if (assignmentType === "students" && selectedStudentIds.length === 0) {
      setError("Please select at least one student to assign this homework to.");
      return;
    }

    setLoading(true);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("abacus_admin_token")
          : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        levelId,
        topic: topic.trim() || "General Abacus Practice",
        lesson: lesson.trim() || "Homework Practice Exercise",
        dueDate: new Date(dueDate).toISOString(),
        recommendedTime: Number(recommendedTime) || 15,
        assignedStudents: assignmentType === "students" ? selectedStudentIds : undefined,
        assignToAllInLevel: assignmentType === "level",
        questions: questions.map((q, idx) => ({
          question: q.question.trim() || `Problem #${idx + 1}`,
          questionType: q.questionType,
          correctAnswer: q.correctAnswer,
          options: q.options,
          marks: Number(q.marks) || 1,
          explanation: q.explanation.trim(),
          order: idx + 1,
        })),
      };

      const res = await fetch("/api/admin/homework", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/homework");
      } else {
        setError(data.error || "Failed to create and assign homework.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while saving homework.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Back button & Title */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
        <Link
          href="/admin/homework"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create &amp; Assign Homework
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure new practice exercises and assign them to an entire curriculum grade or individual students.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-900 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800">
            1. Homework Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Homework Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Lower Bead Additions Practice"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Instructions
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide instructions for students regarding calculation techniques or bead positioning..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Level *
              </label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.levelName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic Name
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Direct Arithmetic"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Related Lesson
              </label>
              <input
                type="text"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="Lesson 2: Friend Rules"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Assignment Scope Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800">
            2. Assignee Audience
          </h3>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
              <input
                type="radio"
                name="assignmentType"
                value="level"
                checked={assignmentType === "level"}
                onChange={() => setAssignmentType("level")}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Assign to all students in selected level</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
              <input
                type="radio"
                name="assignmentType"
                value="students"
                checked={assignmentType === "students"}
                onChange={() => setAssignmentType("students")}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Assign to specific selected students</span>
            </label>
          </div>

          {assignmentType === "students" && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block mb-2 font-medium">
                Choose students ({selectedStudentIds.length} selected):
              </span>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 pr-2">
                {students.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-center justify-between py-2 px-1 hover:bg-slate-900/60 rounded cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={() => handleToggleStudentSelection(st.id)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-200">{st.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({st.email})</span>
                    </div>
                    <span className="text-[11px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                      {st.selectedLevel}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions Builder Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              3. Questions ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Question #{idx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Problem Statement *
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                      placeholder="e.g. Calculate 2 + 5 - 1"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Question Type
                    </label>
                    <select
                      value={q.questionType}
                      onChange={(e) => handleQuestionChange(idx, "questionType", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="numberInput">Number Input (Direct)</option>
                      <option value="multipleChoice">Multiple Choice</option>
                      <option value="abacus">Abacus Bead Manipulation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Correct Answer *
                    </label>
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(idx, "correctAnswer", e.target.value)}
                      placeholder="e.g. 6"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(idx, "marks", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Explanation / Bead Method
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(idx, "explanation", e.target.value)}
                    placeholder="Move lower bead up, push upper bead down..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href="/admin/homework"
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Homework...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish &amp; Assign Homework</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
