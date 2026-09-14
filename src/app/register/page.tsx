"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Layers,
  Users,
  Phone,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Calculator,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const AVATAR_OPTIONS = [
  { id: "🧙‍♂️", label: "Math Wizard" },
  { id: "🥷", label: "Bead Ninja" },
  { id: "🚀", label: "Space Explorer" },
  { id: "⭐", label: "Star Champ" },
  { id: "🦊", label: "Clever Fox" },
  { id: "🐯", label: "Speed Tiger" },
];

const ABACUS_LEVELS = [
  "Level 1 - Direct Addition & Subtraction",
  "Level 2 - Small Friends (+4/+3/+2/+1)",
  "Level 3 - Big Friends (+9 to +1)",
  "Level 4 - Combination Formulas",
  "Level 5 - Multiplication Basics",
  "Level 6 - Division & Decimal Abacus",
  "Level 7 - Advanced Mental Speed Drills",
  "Level 8 - Master Anzan Championship",
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "8",
    dateOfBirth: "2018-05-14",
    abacusLevel: ABACUS_LEVELS[0],
    avatar: "🧙‍♂️",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  if (isAuthenticated) {
    router.push("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.parentName.trim() ||
      !formData.parentEmail.trim()
    ) {
      setErrorMsg("Please fill out all required student and guardian fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    const res = await register({
      fullName: formData.fullName,
      email: formData.email,
      age: parseInt(formData.age, 10) || 8,
      dateOfBirth: formData.dateOfBirth,
      abacusLevel: formData.abacusLevel,
      avatar: formData.avatar,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
    });

    if (res.success) {
      router.push("/dashboard");
    } else {
      setErrorMsg(res.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto glass-card rounded-3xl p-8 sm:p-12 border-2 border-purple-200 shadow-2xl relative z-10 bg-white/95"
      >
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Join 10,000+ Young Learners</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-heading">
            Student Registration 🌟
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Create your child&apos;s learning account to unlock interactive bead practice, video lessons, and BrainGym games!
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs sm:text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: AVATAR SELECTION */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              1. Choose Student Avatar *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = formData.avatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: opt.id })}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-purple-100 border-purple-600 scale-105 shadow-md"
                        : "bg-slate-50 border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <span className="text-3xl">{opt.id}</span>
                    <span className="text-[10px] font-bold text-slate-700">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: STUDENT DETAILS */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-sm font-heading">
              <User className="w-4 h-4 text-purple-600" />
              <span>Student Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Parker"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student Age *
                </label>
                <input
                  type="number"
                  min="4"
                  max="16"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Starting Abacus Level *
              </label>
              <select
                value={formData.abacusLevel}
                onChange={(e) => setFormData({ ...formData, abacusLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-bold text-purple-800"
              >
                {ABACUS_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 3: PARENT / GUARDIAN INFORMATION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm font-heading">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Parent / Guardian Information (Required for Young Students)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emma Parker"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Guardian Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Guardian Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              {isLoading ? "Creating Account..." : "Register & Start Dashboard"}
            </Button>

            <div className="text-center text-xs text-slate-500">
              Already have a student account?{" "}
              <Link href="/login" className="font-bold text-purple-600 hover:underline">
                Log In Here
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
