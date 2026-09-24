"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Layers, BookOpen, Video, Calculator, FileText, Bot, FileCheck, Award, Sparkles, ArrowRight, } from "lucide-react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
export default function HowItWorksPage() {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        {
            num: 1,
            title: "Register",
            icon: <UserPlus className="w-6 h-6 text-purple-600"/>,
            tagline: "Quick 1-Minute Child Account Setup",
            description: "Create a free student profile with avatar customization. Parents can manage multiple child profiles under a single dashboard.",
            tip: "Parent consent & ad-free child environment built-in.",
            color: "bg-purple-100 border-purple-300 text-purple-700",
        },
        {
            num: 2,
            title: "Choose Level",
            icon: <Layers className="w-6 h-6 text-indigo-600"/>,
            tagline: "Level 1 (Beginner) to Level 8 (Advanced)",
            description: "Take a quick 2-minute diagnostic test or select your starting level from basic bead counts to 4-digit mental multiplication.",
            tip: "Flexible entry based on child age and prior abacus knowledge.",
            color: "bg-indigo-100 border-indigo-300 text-indigo-700",
        },
        {
            num: 3,
            title: "Follow Syllabus",
            icon: <BookOpen className="w-6 h-6 text-blue-600"/>,
            tagline: "Structured International Abacus Curriculum",
            description: "Follow a clear, step-by-step syllabus breaking down abacus formulas (Direct, Small Friends, Big Friends, Combination formulas).",
            tip: "Clear progress indicators keep learning organized.",
            color: "bg-blue-100 border-blue-300 text-blue-700",
        },
        {
            num: 4,
            title: "Watch Videos",
            icon: <Video className="w-6 h-6 text-teal-600"/>,
            tagline: "Bite-Sized Animated Video Lessons",
            description: "Watch 3-5 minute animated lesson clips showing exact finger techniques (Thumb for lower beads up, Index finger for upper beads down).",
            tip: "Pause, rewind, and practice alongside video demonstrations.",
            color: "bg-teal-100 border-teal-300 text-teal-700",
        },
        {
            num: 5,
            title: "Practice",
            icon: <Calculator className="w-6 h-6 text-emerald-600"/>,
            tagline: "Interactive Virtual Abacus Practice",
            description: "Move beads on screen with touch or mouse. Practice addition, subtraction, and mental math drills with instant visual confirmation.",
            tip: "Unlimited practice worksheets generated on demand.",
            color: "bg-emerald-100 border-emerald-300 text-emerald-700",
        },
        {
            num: 6,
            title: "Complete Homework",
            icon: <FileText className="w-6 h-6 text-amber-600"/>,
            tagline: "Daily 10-Minute Micro Drills",
            description: "Complete short daily exercises designed to build finger speed, visual bead imagination, and mental math memory.",
            tip: "Earn daily streaks and reward stars upon completion.",
            color: "bg-amber-100 border-amber-300 text-amber-700",
        },
        {
            num: 7,
            title: "Get Evaluated",
            icon: <Bot className="w-6 h-6 text-orange-600"/>,
            tagline: "Smart AI Accuracy & Speed Analysis",
            description: "AI evaluates submission speed, identifies formula mistakes, and provides targeted mini-exercises to fix common errors.",
            tip: "Gentle, non-intimidating suggestions without penalty stress.",
            color: "bg-orange-100 border-orange-300 text-orange-700",
        },
        {
            num: 8,
            title: "Take Mock Exam",
            icon: <FileCheck className="w-6 h-6 text-rose-600"/>,
            tagline: "Timed Practice Exam Simulations",
            description: "Practice under simulated exam conditions to build time management and test confidence before official level grading.",
            tip: "Retake mock exams as many times as desired.",
            color: "bg-rose-100 border-rose-300 text-rose-700",
        },
        {
            num: 9,
            title: "Attend Final Exam",
            icon: <FileCheck className="w-6 h-6 text-pink-600"/>,
            tagline: "Official Online Level Certification Exam",
            description: "Complete the official timed level evaluation covering mental arithmetic and speed abacus calculation.",
            tip: "Instant automated scoring and detailed performance breakdown.",
            color: "bg-pink-100 border-pink-300 text-pink-700",
        },
        {
            num: 10,
            title: "Receive Certificate",
            icon: <Award className="w-6 h-6 text-yellow-600"/>,
            tagline: "Verifiable Digital Certificate & Badge",
            description: "Earn a printable, shareable Level Completion Certificate celebrating your child's achievement and mental math mastery!",
            tip: "Unlock special avatar frames and level badges.",
            color: "bg-yellow-100 border-yellow-300 text-yellow-700",
        },
    ];
    return (<div className="space-y-16 pt-8 pb-20">
      {/* PAGE HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 text-purple-800 font-bold text-xs sm:text-sm border border-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600"/>
          <span>Complete Visual Learning Guide</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto font-heading">
          How Abacus Learning <span className="text-gradient-purple">Works</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From first registration to official digital certification: explore our 10-step guided learning roadmap.
        </p>
      </section>

      {/* INTERACTIVE STEP SELECTOR TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start md:justify-center">
          {steps.map((s, idx) => {
            const isSelected = activeStep === idx;
            return (<button key={s.num} onClick={() => setActiveStep(idx)} className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer border ${isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 scale-105"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:border-purple-200"}`}>
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-extrabold ${isSelected ? "bg-white text-purple-700" : "bg-purple-100 text-purple-700"}`}>
                  {s.num}
                </span>
                <span>{s.title}</span>
              </button>);
        })}
        </div>

        {/* ACTIVE STEP HIGHLIGHT CARD */}
        <div className="mt-6">
          <motion.div key={activeStep} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card rounded-3xl p-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50/80 via-white to-amber-50/80 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                    {steps[activeStep].num}
                  </span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                      Step {steps[activeStep].num}: {steps[activeStep].title}
                    </h3>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                      {steps[activeStep].tagline}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-base leading-relaxed">
                  {steps[activeStep].description}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600"/>
                  <span>Pro Tip: {steps[activeStep].tip}</span>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                <button onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-md hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2 transition">
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FULL 10-STEP VISUAL ROADMAP GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Complete Roadmap" badgeIcon={<BookOpen className="w-4 h-4 text-purple-600"/>} title="Explore All 10 Learning" highlightText="Phases" description="Click any card below to view details of each step in the child's educational journey."/>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((s, idx) => (<motion.div key={s.num} whileHover={{ y: -6, scale: 1.02 }} onClick={() => setActiveStep(idx)} className={`glass-card rounded-3xl p-6 border-2 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${activeStep === idx
                ? "border-purple-500 shadow-xl ring-2 ring-purple-300"
                : "border-slate-200/80 hover:border-purple-300"}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-extrabold text-sm flex items-center justify-center shadow-inner">
                    {s.num}
                  </span>
                  <div className={`p-2 rounded-xl border ${s.color}`}>
                    {s.icon}
                  </div>
                </div>

                <h4 className="font-heading font-extrabold text-lg text-slate-800 mb-1">
                  {s.title}
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {s.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-600">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </div>
            </motion.div>))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-10 text-center space-y-6 border-2 border-purple-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">
            Start Your Child&apos;s 10-Step Journey Today
          </h2>
          <p className="text-purple-100 max-w-lg mx-auto text-sm sm:text-base">
            Join thousands of happy parents and children experiencing fast mental math gains.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="secondary" size="lg" icon={<ArrowRight className="w-5 h-5"/>}>
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);
}
