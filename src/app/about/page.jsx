"use client";
import React from "react";
import Link from "next/link";
import { Sparkles, Heart, Target, Bot, Users, CheckCircle2, ArrowRight, ShieldCheck, Zap, } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
export default function AboutPage() {
    const pillars = [
        {
            title: "Affordable & Accessible",
            description: "High-quality abacus education historically required expensive offline centers. We make it accessible to every child everywhere at a fraction of the cost.",
            icon: <Heart className="w-6 h-6 text-rose-500"/>,
            color: "bg-rose-100 text-rose-600",
        },
        {
            title: "Student-Centered Approach",
            description: "We prioritize joy, patience, and encouraging feedback so children never feel stressed or afraid of making mistakes while learning numbers.",
            icon: <Target className="w-6 h-6 text-purple-500"/>,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "AI-Assisted Assessment",
            description: "Our intelligent algorithms track bead movement speed, accuracy patterns, and offer targeted micro-drills to strengthen weak areas automatically.",
            icon: <Bot className="w-6 h-6 text-teal-500"/>,
            color: "bg-teal-100 text-teal-600",
        },
        {
            title: "Parent & Teacher Harmony",
            description: "Seamless progress sharing lets parents celebrate every win, while giving teachers comprehensive class performance analytics.",
            icon: <Users className="w-6 h-6 text-amber-500"/>,
            color: "bg-amber-100 text-amber-600",
        },
    ];
    return (<div className="space-y-20 pt-8 pb-20">
      {/* PAGE HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 text-purple-800 font-bold text-xs sm:text-sm border border-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600"/>
          <span>Our Vision & Story</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto font-heading">
          Empowering Children to Build Lifelong <br />
          <span className="text-gradient-purple">Math Confidence</span> & <span className="text-gradient-amber">Speed</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AbacusMind AI was created with a simple belief: every child can master mental arithmetic when learning is visual, interactive, and joyful.
        </p>
      </section>

      {/* CORE MISSION & STORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Why We Built This Platform
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Bridging Ancient Abacus Wisdom with <span className="text-gradient-purple">Modern AI Technology</span>
            </h2>

            <p className="text-slate-600 leading-relaxed">
              The Abacus is one of humanity&apos;s most proven tools for developing brain hemispheric balance, concentration, memory, and speed arithmetic. However, traditional abacus coaching often suffers from rigid worksheets, lack of real-time guidance, and high tuition costs.
            </p>

            <p className="text-slate-600 leading-relaxed">
              We combined an interactive digital abacus with real-time AI evaluation to provide every child with an instant virtual mentor that guides bead movement, celebrates progress, and adjusts difficulty dynamically.
            </p>

            <div className="space-y-3 pt-2">
              {[
            "Instant bead movement error correction",
            "Non-intimidating, gamified learning path",
            "Accessible from any laptop, tablet, or smartphone",
            "Comprehensive level-wise digital certification",
        ].map((item) => (<div key={item} className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0"/>
                  <span>{item}</span>
                </div>))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="glass-card rounded-3xl p-8 border-2 border-purple-200 bg-gradient-to-tr from-purple-50 via-white to-amber-50 shadow-xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7"/>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 font-heading">
                The AI Advantage in Abacus
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Unlike passive video tutorials, our AI system observes child practice in real time. It detects whether a child is struggling with upper deck (5s) or lower deck (1s) combinations, providing instant visual hints so children never stay stuck.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-purple-100 text-xs text-purple-900 font-medium space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Targeted Speed Training</span>
                  <span>+340% Faster Calculation</span>
                </div>
                <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full w-[85%]"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR 4 PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Guiding Principles" badgeIcon={<ShieldCheck className="w-4 h-4 text-purple-600"/>} title="Built on Four Foundation" highlightText="Pillars" description="Every component of our e-learning platform is engineered to support children, empower parents, and assist educators."/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar) => (<Card key={pillar.title} icon={pillar.icon} iconBgColor={pillar.color}>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2 font-heading">
                {pillar.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {pillar.description}
              </p>
            </Card>))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-10 text-center space-y-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-white to-amber-50">
          <h2 className="text-3xl font-extrabold text-slate-800 font-heading">
            Want to Learn More or Partner with Us?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Whether you are a parent looking for courses or a school interested in digital abacus integration, we are here to help.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4"/>}>
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);
}
