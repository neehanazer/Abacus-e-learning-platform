"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Sparkles,
  ShieldCheck,
  History,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Printer,
  FileCheck2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CertificateCard, { CertificateData } from "@/components/certificate/CertificateCard";
import ReExamCooldownCard, { ReExamStatusResponse } from "@/components/certificate/ReExamCooldownCard";
import CertificateVerifierSection from "@/components/certificate/CertificateVerifierSection";
import ExamHistoryTable from "@/components/certificate/ExamHistoryTable";
import confetti from "canvas-confetti";

interface CertificatePageViewProps {
  layoutContext?: "dashboard" | "learning";
}

export default function CertificatePageView({
  layoutContext = "dashboard",
}: CertificatePageViewProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [reExamStatus, setReExamStatus] = useState<ReExamStatusResponse | null>(null);

  const [activeTab, setActiveTab] = useState<"certificate" | "reexam" | "verify" | "history">("certificate");
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  const [verifierPrefill, setVerifierPrefill] = useState<string>("");

  const studentId = user?.id || (user as any)?._id?.toString() || "std_demo_101";
  const studentName = user?.fullName || "Alex Parker";

  // Fetch Certificates and Re-Exam Status
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [certRes, examRes] = await Promise.all([
        fetch(`/api/certificates?studentId=${encodeURIComponent(studentId)}`),
        fetch(`/api/exams/re-exam-status?studentId=${encodeURIComponent(studentId)}&examId=67b100000000000000000003`),
      ]);

      const [certData, examData] = await Promise.all([
        certRes.json().catch(() => ({ success: false, data: [] })),
        examRes.json().catch(() => ({ success: false, data: null })),
      ]);

      let certList: CertificateData[] = [];
      if (certData.success && Array.isArray(certData.data)) {
        certList = certData.data;
        setCertificates(certList);
      }

      if (examData.success && examData.data) {
        setReExamStatus(examData.data);
      }

      // If user has certificates, trigger celebratory confetti
      if (certList.length > 0) {
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      } else if (examData?.data?.hasAttempted && !examData?.data?.isPassed) {
        // If student failed, default to reexam tab so they see cooldown immediately
        setActiveTab("reexam");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load certification data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerifyCodeFromCard = (code: string) => {
    setVerifierPrefill(code);
    setActiveTab("verify");
    const el = document.getElementById("verifier-engine");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Sample specimen certificate for preview when student hasn't passed yet
  const sampleCertificate: CertificateData = {
    certificateId: "CERT-2026-SPECIMEN",
    studentId,
    studentName,
    levelName: "Level 1: Basic Foundations & Direct Bead Movement",
    examTitle: "Final Comprehensive Level Certification Exam",
    score: 95,
    grade: "A+ (Outstanding)",
    issueDate: new Date().toISOString(),
    verificationCode: "VER-PREVIEW-HONORS",
    status: "issued",
  };

  const primaryCertificate = certificates.length > 0 ? certificates[0] : null;

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden pb-20 font-sans selection:bg-yellow-200">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header for Dashboard Context (if not in learning layout) */}
      {layoutContext === "dashboard" && (
        <header className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-yellow-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-[#1D3557] font-bold text-xs sm:text-sm transition"
              >
                <ArrowLeft className="w-4 h-4 text-[#F4A261]" />
                <span>Dashboard</span>
              </Link>
              <div className="h-5 w-px bg-yellow-200" />
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="text-base sm:text-lg font-black text-[#1D3557]">
                  Certificates & Re-Examination
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/learning/exam"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>Final Exam Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 relative z-10">
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-2 border-yellow-200 shadow-xl shadow-yellow-100/50 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Accreditation & Academic Record
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1D3557] font-heading tracking-tight">
                Official Certification Hub 🎓
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                View your globally accredited Soroban Abacus diplomas, manage 24-hour re-examination eligibility, and verify cryptographic authenticity keys.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center min-w-[130px]">
                <span className="text-[10px] font-black uppercase text-amber-800 block">
                  Certificates Earned
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#1D3557] mt-1 block">
                  {certificates.length}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                  {certificates.length > 0 ? "Level 1 Certified" : "Pending Exam"}
                </span>
              </div>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 text-center min-w-[130px]">
                <span className="text-[10px] font-black uppercase text-indigo-800 block">
                  Total Attempts
                </span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1 block">
                  {reExamStatus?.history?.length ?? 0}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                  Immutable Record
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Pill Bar */}
          <div className="mt-8 pt-6 border-t border-yellow-100 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("certificate")}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "certificate"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-yellow-50 text-[#1D3557] hover:bg-yellow-100"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Official Certificate</span>
              {certificates.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("reexam")}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "reexam"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-yellow-50 text-[#1D3557] hover:bg-yellow-100"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Re-Examination & 24h Cooldown</span>
              {reExamStatus?.hasAttempted && !reExamStatus?.isPassed && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("verify")}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "verify"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-yellow-50 text-[#1D3557] hover:bg-yellow-100"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Authenticity</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-yellow-50 text-[#1D3557] hover:bg-yellow-100"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Exam History ({reExamStatus?.history?.length ?? 0})</span>
            </button>

            <button
              onClick={fetchData}
              className="ml-auto px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-yellow-50 transition flex items-center gap-1 cursor-pointer"
              title="Refresh certificate & attempt state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </section>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 animate-spin flex items-center justify-center text-white text-2xl mx-auto">
              🧮
            </div>
            <p className="text-sm font-bold text-amber-800">
              Synchronizing Accreditation Ledger...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-rose-800 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: OFFICIAL CERTIFICATE */}
        {/* ============================================================ */}
        {!loading && activeTab === "certificate" && (
          <div className="space-y-6">
            {primaryCertificate ? (
              <CertificateCard
                certificate={primaryCertificate}
                onVerifyClick={handleVerifyCodeFromCard}
              />
            ) : (
              /* Student has not earned certificate yet */
              <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 sm:p-12 text-center space-y-6 shadow-xl">
                <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
                  🏅
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#1D3557] font-heading">
                    No Certificate Issued Yet
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Certificates are awarded upon achieving a score of <strong>70% or higher</strong> in the AI-proctored Final Level Certification Exam.
                  </p>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs font-bold my-6">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                    <span className="text-emerald-600 text-sm font-black">Step 1</span>
                    <h5 className="text-slate-800 font-extrabold">Complete Syllabus</h5>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Master basic movement and small friend rules.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                    <span className="text-emerald-600 text-sm font-black">Step 2</span>
                    <h5 className="text-slate-800 font-extrabold">Pass Final Exam</h5>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Score at least 70/100 under AI Proctoring.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                    <span className="text-emerald-600 text-sm font-black">Step 3</span>
                    <h5 className="text-slate-800 font-extrabold">Get Certified</h5>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Receive verified diploma with cryptographic QR code.
                    </p>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link
                    href="/learning/exam"
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-black text-sm shadow-xl hover:scale-105 transition flex items-center gap-2 border-b-4 border-emerald-700"
                  >
                    <span>Take Final Certification Exam</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setShowSamplePreview(!showSamplePreview)}
                    className="px-6 py-4 rounded-2xl bg-yellow-100 hover:bg-yellow-200 text-[#1D3557] font-extrabold text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-amber-700" />
                    <span>{showSamplePreview ? "Hide Sample Specimen" : "Preview Sample Certificate"}</span>
                  </button>
                </div>

                {/* Sample Specimen View if toggled */}
                {showSamplePreview && (
                  <div className="pt-8 border-t border-yellow-200 text-left">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase">
                        Specimen Preview Mode
                      </span>
                      <span className="text-xs text-slate-400">
                        This is an official demonstration of what your diploma looks like upon passing.
                      </span>
                    </div>
                    <CertificateCard
                      certificate={sampleCertificate}
                      isSample={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: RE-EXAMINATION & 24-HOUR COOLDOWN */}
        {/* ============================================================ */}
        {!loading && activeTab === "reexam" && (
          <div className="space-y-6">
            <ReExamCooldownCard
              status={reExamStatus}
              studentId={studentId}
              onReEnrollSuccess={() => {
                router.push("/learning/exam");
              }}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PUBLIC AUTHENTICITY VERIFIER */}
        {/* ============================================================ */}
        {!loading && activeTab === "verify" && (
          <div id="verifier-engine" className="space-y-6">
            <CertificateVerifierSection
              initialCode={verifierPrefill || primaryCertificate?.verificationCode || ""}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CHRONOLOGICAL EXAM HISTORY */}
        {/* ============================================================ */}
        {!loading && activeTab === "history" && (
          <div className="space-y-6">
            <ExamHistoryTable
              history={reExamStatus?.history || []}
            />
          </div>
        )}
      </main>
    </div>
  );
}
