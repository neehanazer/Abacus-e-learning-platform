"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Play,
  Clock,
  Timer,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Award,
  BookOpen,
  GraduationCap,
  FileCheck2,
  CalendarCheck,
  Brain,
  ShieldCheck,
  Star,
  Zap,
  Rocket,
  Compass,
  Layers,
  HelpCircle,
  QrCode,
  Flame,
} from "lucide-react";
import { useLearning } from "@/context/LearningContext";
import confetti from "canvas-confetti";

interface TourSlide {
  id: string;
  stepNumber: number;
  badge: string;
  badgeColor: string;
  badgeIcon: React.ReactNode;
  title: string;
  highlightText: string;
  subtitle: string;
  content: React.ReactNode;
  tips: string[];
}

export default function LearningHubTourModal() {
  const router = useRouter();
  const { isTourOpen, closeTour } = useLearning();
  const [currentStep, setCurrentStep] = useState(0);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        closeTour();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourOpen, currentStep]);

  const slides: TourSlide[] = [
    // ----------------------------------------------------
    // SLIDE 1: Welcome & Overview of Learning Hub
    // ----------------------------------------------------
    {
      id: "welcome",
      stepNumber: 1,
      badge: "Welcome to Mind Beads",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      badgeIcon: <Sparkles className="w-3.5 h-3.5 text-orange-600" />,
      title: "Your Gateway to",
      highlightText: "Abacus & Mental Math Mastery",
      subtitle:
        "Step inside your complete learning hub! Discover how our structured 4-pillar system takes students from counting beads to calculating at the speed of thought.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center mx-auto text-lg shadow-sm">
                🎬
              </div>
              <span className="font-extrabold text-xs text-[#1D3557] block">
                1. Video Lessons
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Concept & Rule Demos
              </span>
            </div>

            <div className="bg-sky-50/90 border border-sky-200 rounded-2xl p-3 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center mx-auto text-lg shadow-sm">
                ⚡
              </div>
              <span className="font-extrabold text-xs text-[#1D3557] block">
                2. Daily Practice
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Untimed & Timed Drills
              </span>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto text-lg shadow-sm">
                📝
              </div>
              <span className="font-extrabold text-xs text-[#1D3557] block">
                3. Homework
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Structured Worksheets
              </span>
            </div>

            <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-3 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center mx-auto text-lg shadow-sm">
                🏆
              </div>
              <span className="font-extrabold text-xs text-[#1D3557] block">
                4. Exams & Certs
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Mock & Final Degrees
              </span>
            </div>
          </div>

          <div className="bg-white/80 border border-yellow-200 rounded-2xl p-3.5 flex items-center gap-3">
            <span className="text-2xl shrink-0">🧭</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every level is designed to build automatic muscle memory. Progress step-by-step to graduate with an official verified certificate!
            </p>
          </div>
        </div>
      ),
      tips: [
        "Earn +50 Bonus Stars for every completed lesson",
        "Switch between Level 1 and Level 2 anytime to review concepts",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 2: Why Practice is Essential (Muscle Memory)
    // ----------------------------------------------------
    {
      id: "why-practice",
      stepNumber: 2,
      badge: "The Secret to Mental Math",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      badgeIcon: <Brain className="w-3.5 h-3.5 text-blue-600" />,
      title: "Why You Need",
      highlightText: "Hands-On Daily Practice",
      subtitle:
        "Watching videos teaches you the rules — but daily practice builds finger muscle memory that makes calculation subconscious and instant.",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🖐️</span>
                <span className="font-extrabold text-xs text-[#1D3557]">
                  Muscle Memory
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Your fingers learn to automatically flick lower beads up and index beads down without hesitation.
              </p>
            </div>

            <div className="bg-gradient-to-b from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <span className="font-extrabold text-xs text-[#1D3557]">
                  Anzan Mental Image
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Physical bead drills rewire visual memory so you can soon visualize a Soroban in your mind with closed eyes.
              </p>
            </div>

            <div className="bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="font-extrabold text-xs text-[#1D3557]">
                  Zero Calculation Fear
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Consistent reps eliminate calculation anxiety, building effortless confidence in school math tests.
              </p>
            </div>
          </div>

          <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <span className="font-medium">
              <strong>Sensei Rule:</strong> 10 minutes of daily practice is 10x more effective than cramming for 2 hours once a week!
            </span>
          </div>
        </div>
      ),
      tips: [
        "Use your right thumb for lower beads UP (+)",
        "Use index finger for pulling lower beads DOWN (-) and upper bead (+5/-5)",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 3: Timed vs. Untimed Practice Modes
    // ----------------------------------------------------
    {
      id: "practice-modes",
      stepNumber: 3,
      badge: "Practice Modes Decoded",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      badgeIcon: <Timer className="w-3.5 h-3.5 text-emerald-600" />,
      title: "Untimed vs. Timed Practice",
      highlightText: "When & Why to Choose Each Mode",
      subtitle:
        "We offer two distinct practice modes. Choosing the right one at the right time accelerates your learning curve.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Untimed Mode Card */}
          <div className="bg-gradient-to-b from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[11px]">
                <span>🧘</span> Untimed (Zen Mode)
              </span>
              <span className="text-xs font-bold text-emerald-700">Accuracy First</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#1D3557]">
              Why Practice Without Timer?
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Zero Time Pressure:</strong> Take all the time you need to examine the abacus.
              </li>
              <li>
                <strong>Mastering New Formulas:</strong> Perfect when learning Small Friends (+5) or Big Friends (+10).
              </li>
              <li>
                <strong>Eliminate Errors:</strong> Verify your bead positions before typing the final answer.
              </li>
            </ul>
            <div className="pt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
              🎯 Best For: Beginners & Learning New Rules
            </div>
          </div>

          {/* Timed Mode Card */}
          <div className="bg-gradient-to-b from-orange-50 via-amber-50/50 to-white border-2 border-orange-300 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white font-extrabold text-[11px]">
                <Timer className="w-3.5 h-3.5" /> Timed (Speed Drill)
              </span>
              <span className="text-xs font-bold text-orange-700">Reflex Boost</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#1D3557]">
              Why Practice With Timer?
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Adrenaline Simulation:</strong> Mimics the excitement of competitions and official exams.
              </li>
              <li>
                <strong>Reaction Speed:</strong> Forces fingers to move instantly without second-guessing.
              </li>
              <li>
                <strong>Speed per Minute (SPM):</strong> Measures questions answered per 60 seconds to track growth.
              </li>
            </ul>
            <div className="pt-1 text-[11px] font-bold text-orange-800 bg-orange-100/80 px-2.5 py-1 rounded-xl">
              ⚡ Best For: Exam Preparation & Speed Mastery
            </div>
          </div>
        </div>
      ),
      tips: [
        "Golden rule: Learn in Zen Mode first ➔ Speed up in Timed Mode second!",
        "Stuck on a rule? Switch back to Untimed mode until accuracy reaches 95%.",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 4: Homework System
    // ----------------------------------------------------
    {
      id: "homework",
      stepNumber: 4,
      badge: "Weekly Assignments",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      badgeIcon: <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />,
      title: "Homework Tasks",
      highlightText: "Targeted Practice Assigned by Mentors",
      subtitle:
        "Homework is curated specifically for your syllabus level to reinforce what you learned in video lessons.",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white border-2 border-yellow-200 rounded-2xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-3xl block">📋</span>
              <h5 className="font-extrabold text-xs text-[#1D3557]">Curated Sets</h5>
              <p className="text-[11px] text-slate-500">
                10 to 20 progressive questions testing single & double digits.
              </p>
            </div>

            <div className="bg-white border-2 border-yellow-200 rounded-2xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-3xl block">⭐</span>
              <h5 className="font-extrabold text-xs text-[#1D3557]">Streak & Star Rewards</h5>
              <p className="text-[11px] text-slate-500">
                Earn bonus stars and keep your weekly practice streak on fire!
              </p>
            </div>

            <div className="bg-white border-2 border-yellow-200 rounded-2xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-3xl block">📈</span>
              <h5 className="font-extrabold text-xs text-[#1D3557]">Detailed Review</h5>
              <p className="text-[11px] text-slate-500">
                Instantly review wrong answers and discover which formula you missed.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-700">
              Need to pause? You can save progress and finish homework later!
            </span>
            <span className="font-extrabold text-orange-600 shrink-0 ml-2">
              Auto-saved 💾
            </span>
          </div>
        </div>
      ),
      tips: [
        "Complete homework on the same day as your video lesson for best retention",
        "Parents and teachers can review homework scores in real-time",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 5: Mock Exams vs. Real Final Exams
    // ----------------------------------------------------
    {
      id: "exams",
      stepNumber: 5,
      badge: "Testing & Graduation",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      badgeIcon: <GraduationCap className="w-3.5 h-3.5 text-purple-600" />,
      title: "Mock Exams vs. Real Exams",
      highlightText: "Your Path to Official Graduation",
      subtitle:
        "Understand the crucial difference between low-stakes Mock Trials and official Proctored Certification Exams.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Mock Exam Box */}
          <div className="bg-gradient-to-b from-sky-50 via-white to-sky-50/30 border-2 border-sky-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white font-extrabold text-[11px]">
                🎯 Mock Exam
              </span>
              <span className="text-[11px] font-bold text-sky-700">Safe Trial</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#1D3557]">
              The Risk-Free Sandbox
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Exact Exam Format:</strong> Same timer, question types, and interface as the real test.
              </li>
              <li>
                <strong>Zero Consequences:</strong> Scores do NOT affect your student record or grade.
              </li>
              <li>
                <strong>Unlimited Retakes:</strong> Take it 5 times until you easily hit 90%+!
              </li>
              <li>
                <strong>Identifies Weak Spots:</strong> Flags formulas you need to review before the final.
              </li>
            </ul>
          </div>

          {/* Real Final Exam Box */}
          <div className="bg-gradient-to-b from-purple-50 via-white to-purple-50/30 border-2 border-purple-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 text-white font-extrabold text-[11px]">
                🏆 Real Certification Exam
              </span>
              <span className="text-[11px] font-bold text-purple-700">Official</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#1D3557]">
              Proctored & Certified
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>AI & Webcam Proctoring:</strong> Monitors focus and integrity for global credibility.
              </li>
              <li>
                <strong>Passing Mark:</strong> 70%+ score unlocks promotion to the next syllabus level.
              </li>
              <li>
                <strong>Official Certificate:</strong> Generates your official accredited degree.
              </li>
              <li>
                <strong>Re-Exam Protection:</strong> If you don't pass, detailed coaching is provided before re-attempt.
              </li>
            </ul>
          </div>
        </div>
      ),
      tips: [
        "Always pass at least 2 Mock Exams with 85%+ before attempting the Real Final Exam!",
        "Real exams include a camera readiness check before the timer begins.",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 6: Official Certificates & Badges
    // ----------------------------------------------------
    {
      id: "certificates",
      stepNumber: 6,
      badge: "Credentials & Proof",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      badgeIcon: <Award className="w-3.5 h-3.5 text-rose-600" />,
      title: "Earn Official Certificates",
      highlightText: "Shareable, Verifiable & Beautiful",
      subtitle:
        "Every level you conquer awards an official certificate backed by a unique tamper-proof verification ID.",
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-amber-100/60 via-yellow-50 to-orange-100/60 border-2 border-yellow-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 border-2 border-white shadow-md flex items-center justify-center text-4xl shrink-0">
              📜
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-extrabold text-sm text-[#1D3557]">
                  Accredited Abacus Certification
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Signed by Grandmaster Sensei with student name, graduation level, score percentage, and issue date.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-500 font-mono">
                <QrCode className="w-3.5 h-3.5 text-slate-700" />
                <span>Verification ID: ABACUS-LVL1-XXXX</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-white border border-yellow-200 rounded-xl p-2.5">
              <span className="font-extrabold text-[#1D3557] block">🖨️ PDF Download & Print</span>
              <span className="text-[10px] text-slate-500">High-resolution for wall framing</span>
            </div>
            <div className="bg-white border border-yellow-200 rounded-xl p-2.5">
              <span className="font-extrabold text-[#1D3557] block">🔗 Online Verification</span>
              <span className="text-[10px] text-slate-500">School & competition submission</span>
            </div>
          </div>
        </div>
      ),
      tips: [
        "Certificates are permanently archived under your Profile and Learning Hub",
        "Scan the QR code on any certificate to confirm its authenticity online",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 7: Virtual Abacus & Brain Gym
    // ----------------------------------------------------
    {
      id: "tools",
      stepNumber: 7,
      badge: "Built-In Power Tools",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      badgeIcon: <Zap className="w-3.5 h-3.5 text-teal-600" />,
      title: "Interactive Soroban & Brain Gym",
      highlightText: "Practice Anywhere, Anytime",
      subtitle:
        "Don't have your wooden abacus with you? No problem! Use our built-in interactive simulator and speed warm-ups.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-white border-2 border-yellow-200 rounded-2xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl">
              🧮
            </div>
            <h4 className="font-extrabold text-sm text-[#1D3557]">
              Virtual 1-4 Japanese Soroban
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fully interactive beads with realistic click sounds! Flick beads on touch screens or mouse. Supports reckoning beam clear sweep in one click.
            </p>
            <span className="inline-block text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              Available at /virtual-abacus
            </span>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-2xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
              🧠
            </div>
            <h4 className="font-extrabold text-sm text-[#1D3557]">
              Brain Gym & Flash Math
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Warm up your concentration before exams with rapid number flash cards, color memory matrix, and speed bead matching mini-games.
            </p>
            <span className="inline-block text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Available in Student Dashboard
            </span>
          </div>
        </div>
      ),
      tips: [
        "Play 3 minutes of Brain Gym before taking a timed practice session to sharpen reflexes",
        "The virtual abacus works smoothly on iPads, tablets, and phones",
      ],
    },

    // ----------------------------------------------------
    // SLIDE 8: Ready to Launch!
    // ----------------------------------------------------
    {
      id: "get-started",
      stepNumber: 8,
      badge: "You Are Ready!",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      badgeIcon: <Rocket className="w-3.5 h-3.5 text-emerald-600" />,
      title: "Ready to Become a",
      highlightText: "Human Calculator? 🚀",
      subtitle:
        "You now know how everything fits together. Choose where you want to start today!",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                closeTour();
                router.push("/learning");
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white text-left space-y-1 shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🎬</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h5 className="font-extrabold text-sm">Watch Video Lessons</h5>
              <p className="text-[11px] text-white/90">
                Learn bead rules with Sensei Maya & animated Soroban models.
              </p>
            </button>

            <button
              onClick={() => {
                closeTour();
                router.push("/learning/practice");
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-left space-y-1 shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧘</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h5 className="font-extrabold text-sm">Try Zen Practice First</h5>
              <p className="text-[11px] text-white/90">
                Zero timer, pure accuracy drills to build comfortable finger habits.
              </p>
            </button>
          </div>

          <div className="bg-amber-50 border border-yellow-200 rounded-2xl p-3 text-center text-xs text-slate-600">
            You can reopen this tour anytime by clicking the{" "}
            <strong className="text-orange-700">“🚀 Tour Hub”</strong> button on the top navigation bar!
          </div>
        </div>
      ),
      tips: [
        "Aim for consistency: 1 lesson + 1 practice set daily unlocks rapid progress!",
      ],
    },
  ];

  const totalSteps = slides.length;
  const currentSlide = slides[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      triggerConfetti();
      closeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#F4A261", "#E76F51", "#2A9D8F", "#E9C46A"],
      });
    } catch {
      // ignore
    }
  };

  if (!isTourOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 25 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#FFFDF7] rounded-[2.5rem] max-w-2xl w-full border-4 border-yellow-300 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Decorative Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-2 border-b border-yellow-100 flex items-center justify-between shrink-0 relative z-10">
            {/* Step Counter Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${currentSlide.badgeColor}`}
              >
                {currentSlide.badgeIcon}
                <span>{currentSlide.badge}</span>
              </span>
              <span className="text-xs font-bold text-slate-500 bg-yellow-100/60 px-2.5 py-1 rounded-full">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={closeTour}
              className="w-9 h-9 rounded-full bg-yellow-100/80 hover:bg-yellow-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer font-bold"
              title="Close Tour (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="w-full bg-yellow-100/60 h-1.5 shrink-0">
            <motion.div
              className="bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#2A9D8F] h-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Modal Main Scrollable Content */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1 relative z-10 no-scrollbar">
            {/* Slide Title & Subtitle */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-heading leading-tight">
                {currentSlide.title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E76F51] to-[#F4A261]">
                  {currentSlide.highlightText}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Slide Bespoke Dynamic Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentSlide.content}
              </motion.div>
            </AnimatePresence>

            {/* Quick Tips Box */}
            {currentSlide.tips.length > 0 && (
              <div className="bg-yellow-50/80 border border-yellow-200/90 rounded-2xl p-3 space-y-1">
                <div className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Pro Sensei Tips:
                </div>
                <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                  {currentSlide.tips.map((tip, idx) => (
                    <li key={idx} className="leading-snug">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 sm:p-5 bg-white/95 border-t border-yellow-100 flex items-center justify-between gap-3 shrink-0 relative z-10">
            {/* Step Dots Indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? "w-6 bg-orange-500"
                      : idx < currentStep
                      ? "bg-amber-300"
                      : "bg-slate-200 hover:bg-slate-300"
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Skip Tour Button */}
              {currentStep < totalSteps - 1 && (
                <button
                  onClick={closeTour}
                  className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-yellow-100/60 transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>
              )}

              {/* Prev Button */}
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-[#1D3557] font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              {/* Next / Finish Button */}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] hover:from-[#E9C46A] hover:to-[#F4A261] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>
                  {currentStep === totalSteps - 1
                    ? "Finish Tour 🚀"
                    : "Next Step"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
