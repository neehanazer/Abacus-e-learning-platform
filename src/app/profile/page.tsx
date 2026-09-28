"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Layers,
  Users,
  Phone,
  Sparkles,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  Award,
  ShieldCheck,
  Edit,
  Save,
  ArrowLeft,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";

const AVATAR_OPTIONS = [
  { id: "🧙‍♂️", label: "Math Wizard" },
  { id: "🥷", label: "Bead Ninja" },
  { id: "🚀", label: "Space Explorer" },
  { id: "⭐", label: "Star Champ" },
  { id: "🦊", label: "Clever Fox" },
  { id: "🐯", label: "Speed Tiger" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || "",
    avatar: user?.avatar || "🧙‍♂️",
    age: user?.age ? user.age.toString() : "8",
    parentName: user?.parentName || user?.guardianName || "",
    parentEmail: user?.parentEmail || "",
    parentPhone: user?.parentPhone || user?.guardianPhone || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        avatar: user.avatar || "🧙‍♂️",
        age: user.age ? user.age.toString() : "8",
        parentName: user.parentName || user.guardianName || "",
        parentEmail: user.parentEmail || "",
        parentPhone: user.parentPhone || user.guardianPhone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-bold text-purple-700 animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: formData.fullName,
      avatar: formData.avatar,
      age: parseInt(formData.age, 10) || user.age,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
    });
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-800 transition bg-purple-50 px-3.5 py-2 rounded-2xl border border-purple-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </Link>

        {savedNotice && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile Updated Successfully!
          </motion.span>
        )}
      </div>

      {/* STUDENT PROFILE HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border-2 border-purple-200 shadow-xl bg-gradient-to-r from-purple-50/90 via-white to-amber-50/90 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-purple-100 border-4 border-purple-300 flex items-center justify-center text-5xl shadow-md shrink-0">
              {user.avatar || "🧙‍♂️"}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl font-extrabold text-slate-800 font-heading">
                  {user.fullName || user.name || "Student"}
                </h1>
                <span className="text-xs font-extrabold bg-purple-600 text-white px-3 py-1 rounded-full shadow-sm">
                  {user.abacusLevel || user.selectedLevel || "Level 1 - Direct Addition & Subtraction"}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Student Account • Registered on {user.createdAt}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1 text-purple-700">
                  <User className="w-3.5 h-3.5" /> Age: {user.age} Years
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-700">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {user.streakDays} Day Streak
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 transition shadow-sm"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>
      </motion.div>

      {/* EDIT PROFILE FORM OR VIEW DETAILS */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-3xl p-8 border-2 border-purple-200 shadow-xl bg-white space-y-6"
        >
          <h3 className="text-xl font-extrabold text-slate-800 font-heading border-b border-slate-100 pb-3">
            Edit Student & Guardian Information
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Choose Student Avatar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: opt.id })}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition cursor-pointer ${
                      formData.avatar === opt.id
                        ? "bg-purple-100 border-purple-600 scale-105"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-3xl">{opt.id}</span>
                    <span className="text-[10px] font-bold text-slate-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Student Age</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-heading font-extrabold text-amber-800 text-base">
                Parent / Guardian Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Guardian Email</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Guardian Phone</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </form>
        </motion.div>
      ) : null}

      {/* PARENT / GUARDIAN INFORMATION CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 font-heading">
                Parent / Guardian Info
              </h3>
              <p className="text-xs text-slate-500">Stored for young student safety & reports</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-amber-100">
              <span className="text-slate-500 text-xs font-bold">Guardian Name:</span>
              <span className="font-extrabold text-slate-800">{user.parentName}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-amber-100">
              <span className="text-slate-500 text-xs font-bold">Guardian Email:</span>
              <span className="font-extrabold text-purple-700">{user.parentEmail}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-amber-100">
              <span className="text-slate-500 text-xs font-bold">Guardian Phone:</span>
              <span className="font-extrabold text-slate-800">{user.parentPhone || "Not provided"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold bg-amber-100/90 px-3.5 py-2 rounded-2xl border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Weekly progress reports sent to parent email</span>
          </div>
        </div>

        {/* LEARNING STATS & BADGES CARD */}
        <div className="glass-card rounded-3xl p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-purple-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 font-heading">
                Practice Statistics
              </h3>
              <p className="text-xs text-slate-500">Your total learning achievements</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
              <span className="text-2xl font-extrabold text-purple-600 block">{user.totalPracticeMinutes}m</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Minutes</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
              <span className="text-2xl font-extrabold text-teal-600 block">{user.completedWorksheets}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Worksheets</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">Earned Badges:</span>
            <div className="flex flex-wrap gap-2">
              {user.earnedBadges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 flex items-center gap-1"
                >
                  🎖️ {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
