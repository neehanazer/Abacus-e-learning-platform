"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Award,
  Zap,
  Flame,
  Info,
} from "lucide-react";
import { Lesson } from "@/data/lessonsData";
import { useLearning } from "@/context/LearningContext";

interface VideoPlayerProps {
  lesson: Lesson;
  onNextLesson?: () => void;
}

export default function VideoPlayer({ lesson, onNextLesson }: VideoPlayerProps) {
  const { updateLessonProgress, markLessonCompleted } = useLearning();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(lesson.watchedSeconds || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBeadStage, setActiveBeadStage] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when lesson changes
  useEffect(() => {
    setCurrentTime(lesson.watchedSeconds || 0);
    setIsPlaying(false);
    setActiveBeadStage(0);
  }, [lesson.id, lesson.watchedSeconds]);

  // Video progress calculations
  const totalDuration = lesson.durationSeconds;
  const progressPercent = Math.min(100, Math.round((currentTime / totalDuration) * 100));

  // Determine friendly progress status text
  let statusText = "Ready to start! 🚀";
  let statusColor = "bg-blue-100 text-blue-800 border-blue-200";
  if (lesson.completed || progressPercent >= 100) {
    statusText = "Completed! 🎉";
    statusColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (progressPercent >= 75) {
    statusText = "Almost Done! 🏃💨";
    statusColor = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (progressPercent >= 40) {
    statusText = "Great Progress! ⭐";
    statusColor = "bg-purple-100 text-purple-800 border-purple-300";
  } else if (progressPercent > 0) {
    statusText = "In Progress 📖";
    statusColor = "bg-orange-100 text-orange-800 border-orange-300";
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Video playback timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1 * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            updateLessonProgress(lesson.id, totalDuration);
            markLessonCompleted(lesson.id);
            return totalDuration;
          }
          updateLessonProgress(lesson.id, Math.floor(next));
          return next;
        });

        // Cycle through interactive bead demonstration stages
        setActiveBeadStage((prev) => (prev + 1) % 4);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed, lesson.id, updateLessonProgress, markLessonCompleted]);

  // Auto-hide player controls during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    updateLessonProgress(lesson.id, newTime);
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime((prev) => {
      const next = Math.max(0, Math.min(totalDuration, prev + seconds));
      updateLessonProgress(lesson.id, next);
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Visual abacus calculation simulation based on lesson & current time
  const beadActive5 =
    activeBeadStage >= 2 || lesson.animatedScenario.activeBeads.includes(5);
  const lowerActiveCount =
    activeBeadStage === 0
      ? 1
      : activeBeadStage === 1
      ? 2
      : activeBeadStage === 2
      ? 3
      : 4;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative rounded-3xl overflow-hidden bg-slate-950 border-4 border-yellow-200/80 shadow-2xl group select-none transition-all"
    >
      {/* Dynamic Simulated Video Screen */}
      <div className="relative aspect-video w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#16213E] via-[#0F3460] to-[#1A1A2E] overflow-hidden p-4 sm:p-8">
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Top Video Header Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Badge & Topic */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-extrabold text-xs shadow-md">
              Lesson {lesson.lessonNumber}
            </span>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs">
              {lesson.topic}
            </span>
          </div>

          {/* Progress Status Pill */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full border text-xs font-extrabold shadow-md backdrop-blur-md transition-all ${statusColor}`}
            >
              {statusText}
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-yellow-300 font-extrabold text-xs border border-white/20">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Center Stage: Interactive Child-Friendly Abacus Animated Demonstration */}
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center justify-center">
          {/* Instructor & Title Prompt */}
          <motion.div
            key={activeBeadStage}
            initial={{ opacity: 0.8, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-yellow-400/50 backdrop-blur-md text-yellow-300 text-xs sm:text-sm font-bold shadow-lg">
              <span className="text-base">{lesson.instructor.avatar}</span>
              <span>{lesson.instructor.name}:</span>
              <span className="text-white">
                "{lesson.animatedScenario.explanation}"
              </span>
            </div>
          </motion.div>

          {/* 3D Soroban Abacus Visualizer Canvas */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-[#2C1810] border-4 border-[#5C3A21] rounded-2xl p-4 sm:p-5 shadow-2xl">
            {/* Wooden Grain & Metallic Corner Brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-300" />

            {/* Inner Reckoning Beam (Separator) */}
            <div className="absolute left-3 right-3 top-16 sm:top-20 h-3 bg-[#E9C46A] border-y border-[#B8860B] z-10 flex items-center justify-around px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B4513]" />
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" /> {/* Unit Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B4513]" />
            </div>

            {/* 3 Abacus Rod Columns */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 relative h-36 sm:h-44">
              {/* Left Rod: Tens */}
              <div className="relative flex flex-col justify-between items-center h-full">
                <div className="absolute inset-y-0 w-1 bg-amber-100/60 rounded-full" />
                {/* Upper Bead */}
                <div className="relative z-10 w-9 sm:w-12 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-md transform hover:scale-105 transition-transform" />
                {/* Lower 4 Beads */}
                <div className="relative z-10 flex flex-col gap-1 mt-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-9 sm:w-12 h-5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-600 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Center Rod: Active Unit Rod (Animated!) */}
              <div className="relative flex flex-col justify-between items-center h-full">
                <div className="absolute inset-y-0 w-1.5 bg-yellow-300 rounded-full shadow-[0_0_8px_#F4A261]" />
                
                {/* Upper Bead (Heaven Bead: 5) */}
                <motion.div
                  animate={{
                    y: beadActive5 ? 24 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative z-20 w-11 sm:w-14 h-7 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-lg border-2 border-yellow-100 flex items-center justify-center cursor-pointer ${
                    beadActive5 ? "ring-2 ring-yellow-300 ring-offset-2 ring-offset-slate-900" : ""
                  }`}
                >
                  <span className="text-[10px] font-black text-amber-950">5</span>
                </motion.div>

                {/* Lower 4 Beads (Earth Beads: 1 each) */}
                <div className="relative z-20 flex flex-col gap-1 mt-6">
                  {[1, 2, 3, 4].map((i) => {
                    const isRaised = i <= lowerActiveCount;
                    return (
                      <motion.div
                        key={i}
                        animate={{
                          y: isRaised ? -18 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-11 sm:w-14 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-600 shadow-md border border-emerald-200 flex items-center justify-center cursor-pointer ${
                          isRaised ? "ring-2 ring-emerald-300" : "opacity-80"
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-950">1</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Rod: Decimals / Helper */}
              <div className="relative flex flex-col justify-between items-center h-full">
                <div className="absolute inset-y-0 w-1 bg-amber-100/60 rounded-full" />
                {/* Upper Bead */}
                <div className="relative z-10 w-9 sm:w-12 h-6 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 shadow-md" />
                {/* Lower Beads */}
                <div className="relative z-10 flex flex-col gap-1 mt-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-9 sm:w-12 h-5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Formula Display */}
            <div className="mt-3 pt-2 border-t border-amber-900/50 flex items-center justify-between text-xs text-amber-200 font-mono font-bold">
              <span>Rod: Unit Rod (Units: 1s)</span>
              <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                Formula: {lesson.animatedScenario.abacusFormula}
              </span>
            </div>
          </div>
        </div>

        {/* Big Center Play Overlay (when paused) */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 hover:scale-110 active:scale-95 transition-transform group cursor-pointer border-4 border-white/80"
            title="Click to Play Lesson Video"
          >
            <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-white ml-1.5 group-hover:scale-105 transition-transform" />
          </button>
        )}
      </div>

      {/* Video Controls Bar */}
      <div
        className={`bg-slate-900/95 border-t border-slate-800 px-4 sm:px-6 py-3 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Interactive Progress Bar & Time Scrubber */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="text-yellow-400">{formatTime(currentTime)}</span>
            <span className="text-slate-400">
              Duration: {formatTime(totalDuration)}
            </span>
          </div>

          <div className="relative flex items-center group/scrubber">
            <input
              type="range"
              min={0}
              max={totalDuration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#F4A261] focus:outline-none"
              style={{
                background: `linear-gradient(to right, #F4A261 0%, #F4A261 ${progressPercent}%, #334155 ${progressPercent}%, #334155 100%)`,
              }}
            />
          </div>
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Controls: Play/Pause, Skip */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#F4A261] hover:bg-[#E76F51] text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fast Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? "Unmute" : "Mute Sound"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Right Controls: Playback Speed, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Pill Selector */}
            <div className="flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700 text-xs">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    playbackSpeed === speed
                      ? "bg-[#F4A261] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
