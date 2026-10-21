"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Calculator,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [studentUsernames, setStudentUsernames] = useState<string[]>([
    "Neeha Nazer",
    "Alex Parker",
  ]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [customUsername, setCustomUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // Prefetch dashboard so login redirect is instant
    router.prefetch("/dashboard");

    // Check if this device has "Remember Me" enabled
    try {
      const isRemembered = localStorage.getItem("abacus_remember_me") === "true";
      if (isRemembered) {
        const savedUser = localStorage.getItem("abacus_remembered_username") || "";
        const savedPass = localStorage.getItem("abacus_remembered_password") || "";
        if (savedUser) {
          setRememberMe(true);
          setSelectedUsername(savedUser);
          if (savedPass) {
            setPassword(savedPass);
          }
        }
      } else {
        // Other devices or not remembered: start completely clean
        setRememberMe(false);
        setSelectedUsername("");
        setCustomUsername("");
        setPassword("");
      }
    } catch {
      // Ignore
    }

    async function loadUsernames() {
      const names: string[] = ["Neeha Nazer", "Alex Parker"];

      // 1. Fetch from backend API
      try {
        const res = await fetch("/api/auth/students");
        const data = await res.json();
        if (data?.students && Array.isArray(data.students)) {
          for (const s of data.students) {
            const rawName = (s.username || s.fullName || s.name || "").trim();
            if (rawName && !names.some((n) => n.toLowerCase() === rawName.toLowerCase())) {
              names.push(rawName);
            }
          }
        }
      } catch {
        // Fallback to defaults
      }

      // 2. Fetch locally registered student pool
      try {
        const localPoolStr = localStorage.getItem("abacus_registered_students");
        if (localPoolStr) {
          const pool = JSON.parse(localPoolStr);
          if (Array.isArray(pool)) {
            for (const s of pool) {
              const rawName = (s.fullName || s.name || "").trim();
              if (rawName && !names.some((n) => n.toLowerCase() === rawName.toLowerCase())) {
                names.push(rawName);
              }
            }
          }
        }
      } catch {
        // Ignore
      }

      setStudentUsernames(names);
    }

    loadUsernames();
  }, [router]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUsername(val);
    setErrorMsg("");

    // Only auto-populate password if Remember Me was previously saved on THIS device
    try {
      const isRemembered = localStorage.getItem("abacus_remember_me") === "true";
      const savedUser = localStorage.getItem("abacus_remembered_username") || "";
      const savedPass = localStorage.getItem("abacus_remembered_password") || "";
      if (isRemembered && savedUser.toLowerCase() === val.toLowerCase() && savedPass) {
        setPassword(savedPass);
        setRememberMe(true);
      } else {
        // On other devices or without Remember Me, password must be manually entered
        setPassword("");
      }
    } catch {
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const targetUser =
      selectedUsername === "__custom__"
        ? customUsername.trim()
        : selectedUsername.trim();

    const cleanPassword = password.trim();

    if (!targetUser) {
      setErrorMsg("Please select or enter your student username.");
      return;
    }

    if (!cleanPassword) {
      setErrorMsg("Please enter your password.");
      return;
    }

    const res = await login(targetUser, cleanPassword, rememberMe);
    if (res.success) {
      router.push("/dashboard");
    } else {
      if (res.notRegistered) {
        setErrorMsg("This student is not registered. Redirecting to registration page...");
        setTimeout(() => {
          router.push(`/register?email=${encodeURIComponent(targetUser)}`);
        }, 1500);
      } else {
        setErrorMsg(res.error || "Invalid username or password.");
      }
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-10 w-44 h-44 bg-purple-300/30 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-52 h-52 bg-amber-300/30 rounded-full blur-3xl animate-float-reverse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border-2 border-purple-200 shadow-2xl relative z-10 bg-white/95"
      >
        {/* Header Icon */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-400 p-0.5 mx-auto shadow-lg shadow-purple-200">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-600">
              <Calculator className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 font-heading">
            Student Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose your username to start your abacus learning session
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* Username Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="student-username"
              className="text-xs font-bold text-slate-700 block flex items-center justify-between"
            >
              <span>Student Username</span>
              <span className="text-[11px] font-semibold text-purple-600">
                Choose from list
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-600">
                <User className="w-4 h-4" />
              </div>
              <select
                id="student-username"
                value={selectedUsername}
                onChange={handleSelectChange}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/70 font-bold text-slate-800 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Username --
                </option>
                {studentUsernames.map((uname) => (
                  <option key={uname} value={uname}>
                    {uname}
                  </option>
                ))}
                <option value="__custom__">✍️ Type a different username...</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Custom username input if chosen */}
          {selectedUsername === "__custom__" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1.5 pt-1"
            >
              <label className="text-xs font-bold text-slate-700 block">
                Enter Custom Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter your username or email"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-purple-50/30 font-medium"
                />
              </div>
            </motion.div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 block">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-600 font-medium hover:text-slate-900 group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer transition-all"
              />
              <span className="group-hover:text-purple-700 transition-colors">
                Remember me on this device
              </span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Device preference
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
            icon={<LogIn className="w-5 h-5" />}
          >
            {isLoading ? "Signing In..." : "Log In to Dashboard"}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Not registered yet?{" "}
          <Link href="/register" className="font-bold text-purple-600 hover:underline">
            Register Student Account Free
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
