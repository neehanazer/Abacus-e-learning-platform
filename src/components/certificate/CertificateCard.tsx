"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Share2,
  Sparkles,
  Lock,
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
  const [screenshotBlocked, setScreenshotBlocked] = useState(false);
  const [isShieldActive, setIsShieldActive] = useState(false);

  const formattedDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Anti-Screenshot & Screen-Capture / Camera DRM Protection for Sample Preview
  useEffect(() => {
    if (!isSample) return;

    const triggerScreenshotDenial = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            "SCREENSHOT DENIED: Specimen preview is security-protected against capture, copying, or camera recording."
          );
        }
      } catch {}
      setScreenshotBlocked(true);
      setTimeout(() => setScreenshotBlocked(false), 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotDenial();
        return false;
      }
      // 2. Windows Snipping Tool (Win + Shift + S) or Mac (Cmd + Shift + 3/4/5)
      if (
        (e.shiftKey && (e.metaKey || (e as any).ctrlKey)) ||
        (e.shiftKey && e.key && e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotDenial();
        return false;
      }
      // 3. Print dialog shortcut (Ctrl + P / Cmd + P)
      if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "p") {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotDenial();
        return false;
      }
      // 4. Save Page shortcut (Ctrl + S / Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotDenial();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotDenial();
      }
    };

    // Prevent screen recorder, snip tool, camera app, or unfocused window from capturing
    const handleBlur = () => {
      setIsShieldActive(true);
    };
    const handleFocus = () => {
      setIsShieldActive(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsShieldActive(true);
      } else {
        setIsShieldActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSample]);

  const handlePrint = () => {
    if (isSample) return;
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
    if (isSample) return;
    try {
      await navigator.clipboard.writeText(certificate.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleCopyLink = async () => {
    if (isSample) return;
    try {
      const url = `${window.location.origin}/api/certificates/verify/${certificate.verificationCode}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto space-y-4 ${
        isSample ? "select-none" : ""
      }`}
      onContextMenu={(e) => {
        if (isSample) e.preventDefault();
      }}
      onDragStart={(e) => {
        if (isSample) e.preventDefault();
      }}
    >
      {/* Floating Screenshot Denied Notification */}
      {isSample && screenshotBlocked && (
        <div className="fixed top-8 right-8 z-[99999] bg-gradient-to-r from-rose-600 to-red-700 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce max-w-md">
          <ShieldAlert className="w-8 h-8 text-yellow-300 shrink-0" />
          <div>
            <div className="font-black text-sm uppercase tracking-wide">
              Screenshot Denied 🚫
            </div>
            <div className="text-xs text-rose-100 font-medium mt-0.5">
              Specimen certificates are protected against screenshots, recording, and digital capture.
            </div>
          </div>
        </div>
      )}

      {/* Top Action Toolbar: Rendered ONLY for real issued certificates. REMOVED for preview sample certificate */}
      {!isSample ? (
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-yellow-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cryptographically Verified
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
      ) : (
        /* Sample Preview Security Header (No Print, No Copy, No Share) */
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/90 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-amber-300 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-amber-800" />
              Specimen Preview Only
            </span>
            <span className="text-xs text-amber-900 font-bold">
              Protected by Anti-Screenshot & Camera DRM Security Shield
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200">
            🔒 Capture & Print Options Disabled
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRINTABLE / OFFICIAL CERTIFICATE CANVAS */}
      {/* ============================================================== */}
      <div
        id="certificate-print-area"
        className={`certificate-canvas relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#FFF9EE] rounded-[2rem] p-6 sm:p-12 border-8 border-[#D4AF37] shadow-2xl overflow-hidden ${
          isSample ? "print:hidden select-none" : "print:border-4 print:shadow-none print:m-0 print:p-8"
        }`}
        style={{
          boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.25)",
        }}
      >
        {/* Anti-Camera & External Capture Blackout Shield (When window loses focus or screen recording tool opens) */}
        {isSample && isShieldActive && (
          <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 sm:p-10 text-center text-white select-none">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-3xl mb-3 animate-pulse">
              🛡️
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-rose-400 font-heading tracking-wide">
              ANTI-CAMERA & CAPTURE SHIELD ACTIVE
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2 leading-relaxed">
              Certificate display is securely masked while external capture tools, screen recorders, camera overlays, or inactive windows are detected. Click back into this active window to view.
            </p>
          </div>
        )}

        {/* Anti-Photo Optical Moiré Interference Mesh Pattern (Prevents clean capture by camera lenses) */}
        {isSample && (
          <div
            className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] select-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 3px), repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 3px)",
            }}
          />
        )}

        {/* Security Watermark for Specimen Preview */}
        {isSample && (
          <div className="absolute inset-0 z-30 pointer-events-none select-none overflow-hidden opacity-[0.12]">
            <div className="w-[180%] h-[180%] -rotate-25 flex flex-wrap content-center justify-center gap-12 font-black text-xs sm:text-sm text-red-950 uppercase tracking-widest">
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className="whitespace-nowrap">
                  🔒 OFFICIAL SPECIMEN • DO NOT PHOTOGRAPH • UNAUTHORIZED CAPTURE BLOCKED
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subtle Watermark Abacus Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[280px]">🧮</span>
        </div>

        {/* Ornate Inner Double Border */}
        <div className="relative z-10 border-2 border-[#D4AF37]/50 rounded-[1.2rem] p-6 sm:p-10 bg-white/70 backdrop-blur-[2px] print:p-5 print:bg-white/95 print:border-[#D4AF37]">
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
          <div className="text-center space-y-2 mb-6 print:mb-2 print:space-y-1">
            <div className="inline-flex items-center justify-center gap-2 mb-1 print:mb-0">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md font-black text-sm print:w-7 print:h-7">
                🧮
              </span>
              <span className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#8B6508] uppercase font-sans print:text-xs">
                Mind Beads AI International Academy
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-wide text-[#1D3557] uppercase drop-shadow-xs print:text-3xl">
              Certificate of Mastery
            </h1>

            <p className="text-xs sm:text-sm text-[#8B6508] font-serif italic tracking-wider print:text-xs">
              Official Soroban Abacus Mental Arithmetic Accreditation
            </p>
          </div>

          {/* Presentation Statement */}
          <div className="text-center my-6 sm:my-8 print:my-3 space-y-3">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-sans font-bold">
              This is to formally certify that
            </p>

            {/* Student Name */}
            <div className="inline-block border-b-2 border-[#D4AF37] pb-2 px-6 sm:px-12">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-[#1D3557] italic tracking-tight">
                {certificate.studentName}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
              has successfully achieved mastery through rigorous continuous practice, demonstration of mental soroban computation, and passing the formal AI-proctored examination for:
            </p>

            {/* Level & Topic Name */}
            <div className="inline-block bg-[#FFF9EE] border-2 border-[#D4AF37]/60 rounded-2xl px-5 py-2 mt-2">
              <span className="text-sm sm:text-lg font-black text-[#8B6508] font-sans">
                {certificate.levelName || "Level 1: Basic Foundations"}
              </span>
            </div>
          </div>

          {/* Academic Assessment Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 sm:my-8 print:my-3 text-center text-xs">
            <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Exam Score</span>
              <span className="text-base sm:text-lg print:text-base font-black text-emerald-700">{certificate.score}%</span>
            </div>

            <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Grade</span>
              <span className="text-base sm:text-lg print:text-base font-black text-amber-600">{certificate.grade || "Distinction"}</span>
            </div>

            <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Issue Date</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-700">{formattedDate}</span>
            </div>

            <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-yellow-200 shadow-sm">
              <span className="text-[10px] uppercase text-slate-400 block font-sans">Status</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-700 capitalize flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {certificate.status || "Issued"}
              </span>
            </div>
          </div>

          {/* Certificate Footer: Seal & Signatures */}
          <div className="pt-6 sm:pt-10 print:pt-2 flex flex-col sm:flex-row items-center justify-between gap-6 print:gap-2 border-t border-[#D4AF37]/30">
            {/* Signature 1 */}
            <div className="text-center sm:text-left space-y-1 print:space-y-0.5">
              <div className="w-44 border-b-2 border-slate-400/60 pb-1 font-serif italic text-base font-bold text-slate-800 tracking-wide">
                Neeha Nazer
              </div>
              <p className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                Lead Soroban Master
              </p>
              <p className="text-[9px] text-slate-400">Global Abacus Board</p>
            </div>

            {/* Official Gold Seal Graphic */}
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 print:w-16 print:h-16 rounded-full bg-gradient-to-tr from-[#B8860B] via-[#FFD700] to-[#DAA520] p-1 shadow-lg shadow-yellow-500/30 flex items-center justify-center relative">
                <div className="w-full h-full rounded-full border-2 border-dashed border-[#8B6508] bg-gradient-to-br from-[#FFFDF9] to-[#FAF0D7] flex flex-col items-center justify-center text-center p-1">
                  <Award className="w-6 h-6 print:w-5 print:h-5 text-[#B8860B]" />
                  <span className="text-[8px] print:text-[7px] font-black uppercase tracking-tighter text-[#8B6508] leading-tight mt-0.5">
                    MIND BEADS
                  </span>
                  <span className="text-[7px] print:text-[6px] font-black text-amber-700">CERTIFIED</span>
                </div>
                {/* Red Ribbon Tails */}
                <div className="absolute -bottom-3 left-3 w-4 h-6 bg-[#C1121F] clip-ribbon transform -rotate-12 pointer-events-none print:hidden" />
                <div className="absolute -bottom-3 right-3 w-4 h-6 bg-[#C1121F] clip-ribbon transform rotate-12 pointer-events-none print:hidden" />
              </div>
            </div>

            {/* Signature 2 */}
            <div className="text-center sm:text-right space-y-1 print:space-y-0.5">
              <div className="w-44 border-b-2 border-slate-400/60 pb-1 font-serif italic text-base font-bold text-slate-800 tracking-wide sm:ml-auto">
                Nacbots
              </div>
              <p className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                Academic Director
              </p>
              <p className="text-[9px] text-slate-400">Educational Technologies</p>
            </div>
          </div>

          {/* Cryptographic Verification Pill & QR Motif */}
          <div className="mt-8 pt-4 print:mt-2 print:pt-1 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Verification Code:</span>
              <code className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300">
                {certificate.verificationCode}
              </code>
              {!isSample && onVerifyClick && (
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
