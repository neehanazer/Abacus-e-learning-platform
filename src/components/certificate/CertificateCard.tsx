"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Share2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface CertificateData {
  id?: string;
  _id?: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  levelId?: string;
  levelName?: string;
  examId?: string;
  examTitle?: string;
  score: number;
  grade: string;
  issueDate: string | Date;
  verificationCode: string;
  status: "issued" | "active" | "revoked";
}

interface CertificateCardProps {
  certificate: CertificateData;
  onVerifyClick?: (code: string) => void;
  isSample?: boolean;
}

export default function CertificateCard({
  certificate,
  onVerifyClick,
  isSample = false,
}: CertificateCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const handlePrint = () => {
    // Trigger confetti celebration on print
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
    window.print();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(certificate.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/api/certificates/verify/${certificate.verificationCode}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-yellow-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {isSample ? "Official Preview Specimen" : "Cryptographically Verified"}
          </span>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            ID: <code className="text-[#1D3557] font-bold">{certificate.certificateId}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-slate-700 text-xs font-bold transition border border-yellow-200 cursor-pointer"
            title="Copy unique verification code"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
            <span>{copiedCode ? "Code Copied!" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 cursor-pointer"
            title="Copy public verification link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-black shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINTABLE / OFFICIAL CERTIFICATE CANVAS */}
      {/* ============================================================== */}
      <div
        id="certificate-print-area"
        className="certificate-canvas relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#FFF9EE] rounded-[2rem] p-6 sm:p-12 border-8 border-[#D4AF37] shadow-2xl overflow-hidden print:border-4 print:shadow-none print:m-0 print:p-8"
        style={{
          boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.25)",
        }}
      >
        {/* Subtle Watermark Abacus Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[280px]">🧮</span>
        </div>

        {/* Ornate Inner Double Border */}
        <div className="relative z-10 border-2 border-[#D4AF37]/50 rounded-[1.2rem] p-6 sm:p-10 bg-white/70 backdrop-blur-[2px]">
          {/* Corner Flourishes */}
          <div className="absolute top-2 left-2 text-[#D4AF37] text-2xl font-serif select-none pointer-events-none">
            ✦
          </div>
          <div className="absolute top-2 right-2 text-[#D4AF37] text-2xl font-serif select-none pointer-events-none">
            ✦
          </div>
          <div className="absolute bottom-2 left-2 text-[#D4AF37] text-2xl font-serif select-none pointer-events-none">
            ✦
          </div>
          <div className="absolute bottom-2 right-2 text-[#D4AF37] text-2xl font-serif select-none pointer-events-none">
            ✦
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md font-black text-sm">
                🧮
              </span>
              <span className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#8B6508] uppercase font-sans">
                AbacusMind AI International Academy
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] font-serif tracking-tight uppercase drop-shadow-sm">
              Certificate of Excellence
            </h1>

            <p className="text-xs sm:text-sm font-bold text-[#8B6508] uppercase tracking-[0.18em]">
              Soroban Abacus & Mental Arithmetic Accreditation
            </p>

            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2" />
          </div>

          {/* Recipient Presentation */}
          <div className="text-center my-6 space-y-3">
            <p className="text-xs sm:text-sm font-medium text-slate-500 italic">
              This is to officially and proudly certify that
            </p>

            {/* Student Name */}
            <div className="py-2">
              <h2 className="text-3xl sm:text-5xl font-black text-[#1D3557] font-serif tracking-normal border-b-2 border-[#D4AF37]/40 pb-2 inline-block px-8 min-w-[280px]">
                {certificate.studentName || "Abacus Master Student"}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed pt-1">
              has successfully fulfilled all rigorous pedagogical criteria, timed mental arithmetic evaluations, and AI-proctored examination requirements for:
            </p>

            {/* Exam / Level Title Badge */}
            <div className="inline-block bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border-2 border-[#D4AF37] rounded-2xl px-6 py-2 shadow-sm my-2">
              <span className="text-sm sm:text-lg font-black text-[#1D3557] tracking-wide">
                {certificate.levelName || "Level 1: Basic Foundations & Direct Bead Movement"}
              </span>
              <span className="block text-xs font-bold text-amber-900 mt-0.5">
                {certificate.examTitle || "Final Comprehensive Level Certification Exam"}
              </span>
            </div>
          </div>

          {/* Score & Honors Grade Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto my-6 text-center text-xs font-bold">
            <div className="bg-white/90 p-2.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Final Score</span>
              <span className="text-base sm:text-lg font-black text-emerald-600">{certificate.score}/100</span>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Honors Grade</span>
              <span className="text-base sm:text-lg font-black text-amber-600">{certificate.grade || "Distinction"}</span>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Issue Date</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-700">{formattedDate}</span>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Status</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-700 capitalize flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {certificate.status || "Issued"}
              </span>
            </div>
          </div>

          {/* Certificate Footer: Seal & Signatures */}
          <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#D4AF37]/30">
            {/* Signature 1 */}
            <div className="text-center sm:text-left space-y-1">
              <div className="w-40 border-b-2 border-slate-400/60 pb-1 font-serif italic text-sm text-slate-700">
                Dr. R. H. Tanaka
              </div>
              <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Lead Soroban Master
              </p>
              <p className="text-[9px] text-slate-400">Global Abacus Board</p>
            </div>

            {/* Official Gold Seal Graphic */}
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#B8860B] via-[#FFD700] to-[#DAA520] p-1 shadow-lg shadow-yellow-500/30 flex items-center justify-center relative">
                <div className="w-full h-full rounded-full border-2 border-dashed border-[#8B6508] bg-gradient-to-br from-[#FFFDF9] to-[#FAF0D7] flex flex-col items-center justify-center text-center p-1">
                  <Award className="w-6 h-6 text-[#B8860B]" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-[#8B6508] leading-tight mt-0.5">
                    ABACUS MIND
                  </span>
                  <span className="text-[7px] font-black text-amber-700">CERTIFIED</span>
                </div>
                {/* Red Ribbon Tails */}
                <div className="absolute -bottom-3 left-3 w-4 h-6 bg-[#C1121F] clip-ribbon transform -rotate-12 pointer-events-none" />
                <div className="absolute -bottom-3 right-3 w-4 h-6 bg-[#C1121F] clip-ribbon transform rotate-12 pointer-events-none" />
              </div>
            </div>

            {/* Signature 2 */}
            <div className="text-center sm:text-right space-y-1">
              <div className="w-40 border-b-2 border-slate-400/60 pb-1 font-serif italic text-sm text-slate-700 sm:ml-auto">
                Elena Rostova, Ph.D.
              </div>
              <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Academic Director
              </p>
              <p className="text-[9px] text-slate-400">Cognitive Arithmetic Lab</p>
            </div>
          </div>

          {/* Cryptographic Verification Pill & QR Motif */}
          <div className="mt-8 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Verification Code:</span>
              <code className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300">
                {certificate.verificationCode}
              </code>
              {onVerifyClick && (
                <button
                  onClick={() => onVerifyClick(certificate.verificationCode)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline font-bold print:hidden cursor-pointer"
                >
                  Verify Now
                </button>
              )}
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-700">Certificate ID: </span>
              <span className="font-mono text-slate-600">{certificate.certificateId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
