"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both admin email and password.");
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      router.push("/admin/dashboard");
    } else {
      setError(res.error || "Invalid admin credentials.");
    }
  };

  const handleUseDemoCredentials = () => {
    setEmail("admin@abacus.com");
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-600/30 mb-4">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Mind Beads Executive Management Console
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-900/80 text-red-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@abacus.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials pill */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2.5">
              Default system administrator account:
            </p>
            <button
              type="button"
              onClick={handleUseDemoCredentials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fill: admin@abacus.com / admin123</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Authorized personnel only. All access attempts are cryptographically verified and logged.
        </p>
      </div>
    </div>
  );
}
