"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, MapPin, ListFilter, } from "lucide-react";
import { ABACUS_LEVELS_DATA } from "@/data/syllabusData";
import { useLearning } from "@/context/LearningContext";
import LevelOverviewHero from "@/components/syllabus/LevelOverviewHero";
import VisualLearningPath from "@/components/syllabus/VisualLearningPath";
import LevelSelectorTabs from "@/components/syllabus/LevelSelectorTabs";
import TopicDetailCard from "@/components/syllabus/TopicDetailCard";
export default function SyllabusPage() {
    const router = useRouter();
    const { setCurrentLessonId } = useLearning();
    const [selectedLevelId, setSelectedLevelId] = useState("level-1");
    const [viewMode, setViewMode] = useState("path");
    const selectedLevel = ABACUS_LEVELS_DATA.find((lvl) => lvl.id === selectedLevelId) ||
        ABACUS_LEVELS_DATA[0];
    const handleNavigateToLesson = (targetLessonId) => {
        setCurrentLessonId(targetLessonId);
        router.push("/learning");
    };
    return (<div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden pb-20">
      {/* Decorative Soft Background Blobs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl pointer-events-none"/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8 relative z-10">
        {/* ============================================================ */}
        {/* 1. LEVEL SELECTOR TABS (Levels 1 to 8) */}
        {/* ============================================================ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider flex items-center gap-1.5">
              <span>🥋</span>
              <span>Select Abacus Level:</span>
            </span>
            <span className="text-xs font-bold text-slate-500">
              8 Standardized Levels
            </span>
          </div>

          <LevelSelectorTabs levels={ABACUS_LEVELS_DATA} selectedLevelId={selectedLevelId} onSelectLevel={setSelectedLevelId}/>
        </div>

        {/* ============================================================ */}
        {/* 2. LEVEL OVERVIEW HERO CARD */}
        {/* ============================================================ */}
        <LevelOverviewHero level={selectedLevel} onContinue={handleNavigateToLesson}/>

        {/* ============================================================ */}
        {/* 3. LEVEL OBJECTIVES & "WHAT YOU WILL LEARN" */}
        {/* ============================================================ */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-yellow-200 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-yellow-100 text-[#F4A261] flex items-center justify-center font-bold text-lg shadow-sm">
              🎯
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-heading">
                What You Will Master in {selectedLevel.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Core mental math and bead manipulation skills acquired in this level:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {selectedLevel.learningObjectives.map((obj, idx) => (<div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFBF0] border border-yellow-200/80 text-slate-800 text-xs sm:text-sm font-medium hover:border-yellow-300 transition-colors">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <span className="leading-snug">{obj}</span>
              </div>))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. VIEW MODE TOGGLE (Visual Path vs Grid) */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div>
            <h3 className="text-2xl font-extrabold text-[#1D3557] font-heading">
              Level {selectedLevel.levelNumber} Topics & Milestones
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Explore the structured learning path designed for kid-friendly progression.
            </p>
          </div>

          {/* Switcher Buttons */}
          <div className="flex items-center bg-white p-1 rounded-full border border-yellow-200 shadow-sm self-start sm:self-auto">
            <button onClick={() => setViewMode("path")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${viewMode === "path"
            ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-md shadow-orange-200"
            : "text-slate-600 hover:text-[#1D3557]"}`}>
              <MapPin className="w-3.5 h-3.5"/>
              <span>Visual Path</span>
            </button>

            <button onClick={() => setViewMode("grid")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${viewMode === "grid"
            ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-md shadow-orange-200"
            : "text-slate-600 hover:text-[#1D3557]"}`}>
              <ListFilter className="w-3.5 h-3.5"/>
              <span>Curriculum Grid</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. TOPIC LISTING (Visual Path or Grid) */}
        {/* ============================================================ */}
        {selectedLevel.topics.length > 0 ? (viewMode === "path" ? (<VisualLearningPath topics={selectedLevel.topics} onSelectTopicLesson={handleNavigateToLesson}/>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedLevel.topics.map((topic) => (<TopicDetailCard key={topic.id} topic={topic} onSelectLesson={handleNavigateToLesson}/>))}
            </div>)) : (<div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-yellow-300 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-yellow-100 text-yellow-600 text-3xl flex items-center justify-center mx-auto shadow-sm">
              🔒
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-[#1D3557] font-heading">
                {selectedLevel.title} Unlocks Soon!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                Complete Level 1 and Level 2 video lessons to unlock the curriculum and milestones for this advanced belt!
              </p>
            </div>
            <button onClick={() => setSelectedLevelId("level-1")} className="px-6 py-3 rounded-full bg-[#1D3557] text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 transition-all">
              Back to Level 1 Syllabus
            </button>
          </div>)}

        {/* ============================================================ */}
        {/* 6. BOTTOM BANNER */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌟</div>
            <div>
              <h4 className="font-heading font-extrabold text-[#1D3557] text-lg sm:text-xl">
                Ready to practice your current lesson?
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                Jump right back into Lesson 4 Video Player with live animated Soroban!
              </p>
            </div>
          </div>

          <button onClick={() => handleNavigateToLesson("lesson-4")} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white font-extrabold text-base shadow-lg shadow-orange-300 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0">
            <Play className="w-5 h-5 fill-white"/>
            <span>Go to Video Lessons</span>
            <ArrowRight className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>);
}
