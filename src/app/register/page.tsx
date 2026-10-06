"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Users,
  Phone,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Calculator,
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

const DEFAULT_LEVEL = "Level 1 - Direct Addition & Subtraction";

const calculateAge = (dobString: string): number | null => {
  if (!dobString) return null;
  const parts = dobString.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const dob = new Date(year, month, day);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  age?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    dateOfBirth: "",
    avatar: "🧙‍♂️",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "age" || field === "dateOfBirth") {
      setFieldErrors((prev) => ({
        ...prev,
        age: undefined,
        dateOfBirth: undefined,
      }));
    } else if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAgeOrDobBlur = () => {
    if (formData.age.trim() && formData.dateOfBirth) {
      const enteredAge = parseInt(formData.age, 10);
      const calcAge = calculateAge(formData.dateOfBirth);
      if (!isNaN(enteredAge) && calcAge !== null) {
        if (calcAge < 0) {
          setFieldErrors((prev) => ({
            ...prev,
            dateOfBirth: "Date of birth cannot be in the future.",
          }));
        } else if (calcAge !== enteredAge) {
          setFieldErrors((prev) => ({
            ...prev,
            age: `Age (${enteredAge}) does not match Date of Birth (${calcAge} years old).`,
            dateOfBirth: `Date of birth does not match student age (${enteredAge} years old, but DOB indicates ${calcAge} years old).`,
          }));
        }
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors = {};

    // 1. Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Student full name is required.";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    // 2. Email validation: MUST be @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!formData.email.trim()) {
      errors.email = "Student email is required.";
    } else if (!gmailRegex.test(formData.email.trim())) {
      errors.email = "Student email must be a valid @gmail.com address (e.g. student@gmail.com).";
    }

    // 3. Password length check
    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    // 4. Age validation
    const ageNum = parseInt(formData.age, 10);
    if (!formData.age.trim()) {
      errors.age = "Student age is required.";
    } else if (isNaN(ageNum) || ageNum < 3 || ageNum > 100) {
      errors.age = "Student age must be between 3 and 100.";
    }

    // 5. Date of Birth and Age match validation
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const calcAge = calculateAge(formData.dateOfBirth);
      if (calcAge === null || isNaN(calcAge)) {
        errors.dateOfBirth = "Please select a valid date of birth.";
      } else if (calcAge < 0) {
        errors.dateOfBirth = "Date of birth cannot be today or in the future.";
      } else if (!errors.age && !isNaN(ageNum)) {
        if (calcAge !== ageNum) {
          errors.dateOfBirth = `Date of birth does not match student age (entered: ${ageNum}, but DOB indicates ${calcAge} years old).`;
          errors.age = `Age (${ageNum}) does not match Date of Birth (${calcAge} years old).`;
        }
      }
    }

    // 6. Guardian Name validation
    if (!formData.parentName.trim()) {
      errors.parentName = "Guardian name is required.";
    }

    // 7. Phone number validation
    const phoneDigits = formData.parentPhone.replace(/\D/g, "");
    if (!formData.parentPhone.trim()) {
      errors.parentPhone = "Guardian phone number is required.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.parentPhone = "Guardian phone must be a valid 10-15 digit number (e.g. 9876543210).";
    }

    // 8. Guardian Email validation (optional, but if provided, must be valid)
    if (formData.parentEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.parentEmail.trim())) {
        errors.parentEmail = "Please enter a valid email address.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const res = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      age: parseInt(formData.age, 10) || 8,
      dateOfBirth: formData.dateOfBirth,
      abacusLevel: DEFAULT_LEVEL,
      avatar: formData.avatar,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail || formData.email,
      parentPhone: formData.parentPhone,
    });

    if (res.success) {
      router.push("/dashboard");
    } else {
      const err = res.error || "Registration failed. Please try again.";
      const lower = err.toLowerCase();
      if (lower.includes("email") || lower.includes("account with this email")) {
        setFieldErrors({ email: err });
      } else if (lower.includes("password")) {
        setFieldErrors({ password: err });
      } else if (lower.includes("phone")) {
        setFieldErrors({ parentPhone: err });
      } else if (lower.includes("name")) {
        setFieldErrors({ fullName: err });
      } else if (lower.includes("age")) {
        setFieldErrors({ age: err });
      } else {
        setFieldErrors({ general: err });
      }
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
            Create your child&apos;s learning account to unlock interactive bead practice, video lessons, and BrainGym games! All students begin at Level 1.
          </p>
        </div>

        {/* General Error Alert (Only if server error not bound to specific input) */}
        {fieldErrors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs sm:text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{fieldErrors.general}</span>
          </motion.div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
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
                  placeholder="e.g. Alex Parker"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.fullName
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student Email (@gmail.com) *
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@gmail.com"
                  autoComplete="off"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student Age *
                </label>
                <input
                  type="number"
                  min="3"
                  max="100"
                  placeholder="e.g. 8"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  onBlur={handleAgeOrDobBlur}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.age
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.age && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.age}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  onBlur={handleAgeOrDobBlur}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.dateOfBirth
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.dateOfBirth}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: PARENT / GUARDIAN INFORMATION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm font-heading">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Parent / Guardian Information (Required)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Guardian Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emma Parker"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.parentName
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.parentName && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.parentName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Guardian Phone (10-15 digits) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.parentPhone
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.parentPhone && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.parentPhone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Guardian Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border transition text-sm font-medium focus:outline-none focus:ring-2 ${
                    fieldErrors.parentEmail
                      ? "border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-rose-400/50"
                      : "border-slate-200 bg-slate-50/50 focus:ring-purple-500/50"
                  }`}
                />
                {fieldErrors.parentEmail && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.parentEmail}</span>
                  </p>
                )}
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
              {isLoading ? "Creating Account..." : "Register & Start at Level 1"}
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
