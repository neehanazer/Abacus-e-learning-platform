"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface VerificationResult {
  valid: boolean;
  certificate?: {
    certificateId: string;
    studentName: string;
    levelName: string;
    examTitle: string;
    score: number;
    grade: string;
    issueDate: string;
    verificationCode: string;
    status: string;
  };
  error?: string;
}

interface CertificateVerifierSectionProps {
  initialCode?: string;
}

export default function CertificateVerifierSection({
  initialCode = "",
}: CertificateVerifierSectionProps) {
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setIsLoading(true);
      setResult(null);

      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (res.ok && data.success && data.valid) {
        setResult({
          valid: true,
          certificate: data.data,
        });
      } else {
        setResult({
          valid: false,
          error: data.error || "Certificate verification code not found or invalid.",
        });
      }
    } catch {
      setResult({
        valid: false,
        error: "Network error occurred while verifying certificate.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Public Verification Engine
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1D3557] font-heading">
            Live Certificate Authenticity Verifier
          </h3>
        </div>
        <p className="text-xs text-slate-500 max-w-xs">
          Verify digital credentials issued by Mind Beads AI. Enter the cryptographic code printed on the certificate.
        </p>
      </div>

      {/* Verification Input Form */}
      <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. VER-DD9BA2-547BC9"
            className="w-full px-4 py-3.5 pl-11 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-slate-800 font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:tracking-normal text-sm transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-200 transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <span>Verifying...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Authenticity</span>
            </>
          )}
        </button>
      </form>

      {/* Verification Result Card */}
      {result && (
        <div
          className={`rounded-2xl p-6 border-2 transition-all ${
            result.valid
              ? "bg-emerald-50 border-emerald-300"
              : "bg-rose-50 border-rose-300"
          }`}
        >
          {result.valid && result.certificate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="text-base font-extrabold text-emerald-950">
                      Authentic & Verified Certificate
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Matches official accreditation records in Mind Beads AI central ledger.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-200 text-emerald-900">
                  {result.certificate.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Certified Student
                  </span>
                  <span className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {result.certificate.studentName}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Examination & Level
                  </span>
                  <span className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {result.certificate.levelName}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Score & Honors Grade
                  </span>
                  <span className="text-sm font-black text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    {result.certificate.score}/100 • {result.certificate.grade}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Certificate ID
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-700 block mt-0.5">
                    {result.certificate.certificateId}
                  </code>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Verification Code
                  </span>
                  <code className="text-xs font-mono font-bold text-amber-900 block mt-0.5">
                    {result.certificate.verificationCode}
                  </code>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Issuance Date
                  </span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(result.certificate.issueDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-rose-950">
                  Certificate Verification Failed
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {result.error || "The provided code does not match any official Abacus certificate records."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
