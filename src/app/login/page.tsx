"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Calculator,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    const res = await login(cleanEmail, cleanPassword);
    if (res.success) {
      router.push("/dashboard");
    } else {
      if (res.notRegistered) {
        setErrorMsg("This user is not registered. Redirecting to registration page...");
        setTimeout(() => {
          router.push(`/register?email=${encodeURIComponent(cleanEmail)}`);
        }, 1500);
      } else {
        setErrorMsg(res.error || "Invalid email or password.");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative floating background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300/30 rounded-full blur-2xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-300/30 rounded-full blur-2xl animate-float-reverse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border-2 border-purple-200 shadow-2xl relative z-10 bg-white/90"
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
            Enter your registered email and password to log in
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Student Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="off"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
              />
            </div>
          </div>

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
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
