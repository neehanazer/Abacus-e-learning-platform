"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Award, CheckCircle2, ArrowRight, X } from "lucide-react";
import { useLearning } from "@/context/LearningContext";
export default function CelebrationModal() {
    const { isCelebrationModalOpen, setIsCelebrationModalOpen, completedLessonForModal, lessons, setCurrentLessonId, overallProgress, } = useLearning();
    if (!isCelebrationModalOpen || !completedLessonForModal)
        return null;
    const currentIndex = lessons.findIndex((l) => l.id === completedLessonForModal.id);
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    const handleContinueNext = () => {
        setIsCelebrationModalOpen(false);
        if (nextLesson) {
            setCurrentLessonId(nextLesson.id);
        }
    };
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 30 }} className="bg-[#FFFBF0] rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full border-4 border-yellow-300 shadow-2xl relative overflow-hidden text-center space-y-6">
          {/* Confetti & Glow Elements */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-60 pointer-events-none"/>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-60 pointer-events-none"/>

          {/* Close Button */}
          <button onClick={() => setIsCelebrationModalOpen(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-yellow-100 text-slate-700 hover:bg-yellow-200 flex items-center justify-center font-bold transition-colors">
            <X className="w-5 h-5"/>
          </button>

          {/* Big Animated Badge */}
          <div className="relative pt-2">
            <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }} className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 text-white flex items-center justify-center mx-auto shadow-2xl shadow-orange-300 text-5xl border-4 border-white">
              🎉
            </motion.div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="absolute bottom-0 right-1/3 translate-x-4 bg-emerald-500 text-white p-2 rounded-full border-2 border-white shadow-lg">
              <CheckCircle2 className="w-5 h-5"/>
            </motion.div>
          </div>

          {/* Title & Celebration Info */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500"/>
              Lesson Complete!
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-heading">
              Awesome Job, Math Champ!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              You mastered <strong>Lesson {completedLessonForModal.lessonNumber}: {completedLessonForModal.title}</strong>!
            </p>
          </div>

          {/* Rewards Box */}
          <div className="bg-white rounded-2xl p-4 border-2 border-yellow-200 shadow-sm flex items-center justify-around">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-500"/>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-500 font-bold block">Reward</span>
                <span className="text-base font-extrabold text-[#1D3557]">+50 Stars</span>
              </div>
            </div>

            <div className="h-8 w-px bg-yellow-200"/>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5"/>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-500 font-bold block">Progress</span>
                <span className="text-base font-extrabold text-emerald-700">{overallProgress}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {nextLesson ? (<button onClick={handleContinueNext} className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] hover:from-[#E9C46A] hover:to-[#F4A261] text-white font-extrabold text-base shadow-lg shadow-orange-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Continue to Lesson {nextLesson.lessonNumber}</span>
                <ArrowRight className="w-5 h-5"/>
              </button>) : (<button onClick={() => setIsCelebrationModalOpen(false)} className="w-full py-4 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Level 1 Video Lessons Completed! 🏆</span>
              </button>)}

            <button onClick={() => setIsCelebrationModalOpen(false)} className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
              Close & Stay on this lesson
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);
}
