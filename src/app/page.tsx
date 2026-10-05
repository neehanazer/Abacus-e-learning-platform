import React from "react";
import Link from "next/link";
import {
  Sparkles,
  PlayCircle,
  Brain,
  Calculator,
  Bot,
  FileCheck,
  Award,
  ArrowRight,
  Smile,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

import InteractiveAbacus from "@/components/ui/InteractiveAbacus";
import HomeHeroButtons from "@/components/home/HomeHeroButtons";

export default function HomePage() {
  // Feature cards data
  const features = [
    {
      title: "Learn with Videos",
      description: "Bite-sized, animated video lessons tailored for children to understand bead movements step-by-step.",
      icon: <PlayCircle className="w-7 h-7 text-indigo-600" />,
      bgColor: "bg-indigo-100/80 text-indigo-600",
      badge: "Interactive",
    },
    {
      title: "Practice Unlimited",
      description: "Infinite auto-generated practice problems covering addition, subtraction, multiplication & speed drills.",
      icon: <Brain className="w-7 h-7 text-amber-600" />,
      bgColor: "bg-amber-100/80 text-amber-600",
      badge: "Self-Paced",
    },
    {
      title: "Virtual Abacus",
      description: "Interactive digital abacus tool with responsive bead sliding, instant calculation, and voice feedback.",
      icon: <Calculator className="w-7 h-7 text-purple-600" />,
      bgColor: "bg-purple-100/80 text-purple-600",
      badge: "Real-Time",
    },
    {
      title: "AI-Powered Evaluation",
      description: "Smart AI engine checks child accuracy, identifies pattern errors, and gives friendly improvement tips.",
      icon: <Bot className="w-7 h-7 text-teal-600" />,
      bgColor: "bg-teal-100/80 text-teal-600",
      badge: "Smart AI",
    },
    {
      title: "Daily Worksheets",
      description: "Engaging structured worksheets with instant grading and teacher feedback to build calculation speed and accuracy.",
      icon: <FileCheck className="w-7 h-7 text-rose-600" />,
      bgColor: "bg-rose-100/80 text-rose-600",
      badge: "Curriculum",
    },
    {
      title: "Digital Certification",
      description: "Earn colorful badges, level certificates, and rewards to celebrate every milestone reached!",
      icon: <Award className="w-7 h-7 text-emerald-600" />,
      bgColor: "bg-emerald-100/80 text-emerald-600",
      badge: "Verified",
    },
  ];

  // Visual Journey Steps
  const journeySteps = [
    { step: "01", name: "Learn", desc: "Watch animated lessons & master bead rules", color: "from-purple-500 to-indigo-500" },
    { step: "02", name: "Practice", desc: "Use virtual abacus & solve daily sheets", color: "from-amber-400 to-orange-500" },
    { step: "03", name: "Evaluate", desc: "AI checks your speed & accuracy instantly", color: "from-teal-400 to-emerald-500" },
    { step: "04", name: "Homework", desc: "Reinforce daily lessons with home tasks", color: "from-sky-400 to-blue-500" },
    { step: "05", name: "Mastery", desc: "Build calculation velocity and accuracy streaks", color: "from-rose-400 to-pink-500" },
    { step: "06", name: "Certificate", desc: "Unlock shareable digital certificate & badge", color: "from-yellow-400 to-amber-500" },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 overflow-hidden">
        {/* Floating background decorative abacus beads */}
        <div className="absolute top-10 left-[8%] w-16 h-16 rounded-full bg-purple-300/40 blur-xl animate-float-slow" />
        <div className="absolute top-40 right-[10%] w-24 h-24 rounded-full bg-amber-300/40 blur-xl animate-float-reverse" />
        <div className="absolute bottom-10 left-[15%] w-20 h-20 rounded-full bg-teal-300/40 blur-xl animate-float-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 text-purple-800 font-bold text-xs sm:text-sm border border-purple-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Next-Gen Abacus Learning for Kids</span>
                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  New
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Learn Abacus. <br />
                <span className="text-gradient-purple">Practice. Master.</span> <br />
                <span className="text-gradient-amber">Shine!</span> ✨
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                An interactive and affordable Abacus learning platform where children can learn, practice and improve at their own pace.
              </p>

              {/* Action Buttons */}
              <HomeHeroButtons />

              {/* Trust badges row */}
              <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Kid Safe & Ad-Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-500" />
                  <span>Gamified & Fun</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Parent Analytics</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Interactive Virtual Abacus */}
            <div className="lg:col-span-6 relative">
              {/* Glowing gradient backdrops */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 to-amber-300/30 rounded-3xl blur-2xl transform -rotate-2" />
              <InteractiveAbacus />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          badge="Why Choose Us"
          badgeIcon={<Zap className="w-4 h-4 text-purple-600" />}
          title="Everything Your Child Needs to"
          highlightText="Master Abacus"
          description="Designed from the ground up to make mental arithmetic effortless, engaging, and rewarding for young minds."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card
              key={feature.title}
              badge={feature.badge}
              icon={feature.icon}
              iconBgColor={feature.bgColor}
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / VISUAL LEARNING JOURNEY */}
      <section className="bg-gradient-to-b from-purple-900/5 via-indigo-900/5 to-transparent py-16 rounded-3xl mx-4 sm:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Visual Learning Roadmap"
            badgeIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
            title="Step-by-Step Path to"
            highlightText="Math Excellence"
            description="Our structured 6-phase journey guides children from absolute beginner bead recognition to certified mental math prodigy."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
            {journeySteps.map((item, idx) => (
              <div
                key={item.name}
                className="glass-card rounded-2xl p-5 text-center flex flex-col items-center justify-between border-2 border-purple-100 hover:border-purple-300 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} text-white font-extrabold text-sm flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform`}
                >
                  {item.step}
                </div>

                <h4 className="font-heading font-bold text-slate-800 text-lg mb-2">
                  {item.name}
                </h4>

                <p className="text-xs text-slate-500 leading-snug">
                  {item.desc}
                </p>

                {idx < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-purple-300">
                    <ChevronRight className="w-6 h-6 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHILD-FRIENDLY LEARNING SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 border-2 border-amber-200 bg-gradient-to-r from-amber-50/90 via-white to-purple-50/90 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                <Smile className="w-4 h-4 text-amber-600" />
                Designed For Kids Aged 5 to 14
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Making Math <span className="text-gradient-amber">Playful, Interactive</span> & Fear-Free!
              </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Traditional math can feel intimidating. Our platform converts abacus arithmetic into animated mini-challenges, vibrant bead interactions, instant sound feedback, and rewarding streaks so children stay naturally motivated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  "Interactive Bead Movements",
                  "Gamified Rewards & Badges",
                  "Bite-Sized Daily Practice",
                  "Audio-Visual Feedback",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square bg-gradient-to-tr from-amber-400 to-purple-500 rounded-3xl p-1 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[22px] p-6 flex flex-col justify-between text-center items-center">
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
                    <Star className="w-10 h-10 fill-amber-400" />
                  </div>
                  <h4 className="font-heading font-extrabold text-2xl text-slate-800">
                    "Math is My Favorite Hobby Now!"
                  </h4>
                  <p className="text-xs text-slate-500 italic">
                    Children visualize the abacus in their mind and solve 3-digit additions mentally in seconds.
                  </p>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    Mental Math Speed Up to 5x
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARENT-FRIENDLY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 border-2 border-purple-200 bg-gradient-to-r from-purple-50/90 via-white to-teal-50/90 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-purple-200 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-800 text-sm">Parent Insights</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Weekly Accuracy:</span>
                    <span className="font-bold text-slate-800">96.4%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-[96.4%]" />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Calculation Speed:</span>
                    <span className="font-bold text-teal-600">1.8 sec / problem</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Completed Worksheets:</span>
                    <span className="font-bold text-amber-600">42 Sheets</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-300">
                <Users className="w-4 h-4 text-purple-600" />
                Peace of Mind for Parents & Teachers
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Track Progress, Celebrate Growth & <span className="text-gradient-purple">Stay Informed</span>
              </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Parents receive transparent dashboard analytics showing their child&apos;s daily practice time, accuracy rates, speed improvements, and areas needing gentle practice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  "Detailed Accuracy Reports",
                  "Screen Time Control & Limits",
                  "Custom Worksheet Printing",
                  "Teacher Feedback Log",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION (CTA) SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-10 md:p-16 bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-500 text-white overflow-hidden shadow-2xl text-center space-y-6">
          {/* Decorative background overlay elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs sm:text-sm font-bold border border-white/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Join Thousands of Young Learners
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight font-heading">
            Ready to Start Your Abacus Journey?
          </h2>

          <p className="text-base sm:text-xl text-purple-100 max-w-xl mx-auto leading-relaxed">
            Give your child the lifelong gift of lightning-fast mental math confidence today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
