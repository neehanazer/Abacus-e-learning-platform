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
  ArrowRight,
  Hand,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Lesson } from "@/data/lessonsData";
import { useLearning } from "@/context/LearningContext";
import { ANIMATED_LESSON_SCRIPTS, AnimatedScene } from "@/data/animatedLessonsScript";
import { playBeadClick, playStepChime, playFanfare } from "@/lib/abacusAudio";

interface VideoPlayerProps {
  lesson: Lesson;
  onNextLesson?: () => void;
}

// Crisp, engaging animated video duration: 48 seconds total (12 seconds per step)
const ANIMATED_SESSION_DURATION = 48;

export default function VideoPlayer({ lesson, onNextLesson }: VideoPlayerProps) {
  const { updateLessonProgress, markLessonCompleted } = useLearning();

  const script = ANIMATED_LESSON_SCRIPTS[lesson.id] || ANIMATED_LESSON_SCRIPTS["lesson-1"];
  const scenes = script.scenes;
  const sceneCount = scenes.length;
  const totalDuration = ANIMATED_SESSION_DURATION;
  const secondsPerScene = totalDuration / sceneCount; // 12 seconds per scene

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef(0);
  const prevStepRef = useRef<number>(-1);

  // Compute current active scene based on currentTime
  const calculatedIndex = Math.min(
    sceneCount - 1,
    Math.max(0, Math.floor(currentTime / secondsPerScene))
  );
  const currentScene: AnimatedScene = scenes[calculatedIndex] || scenes[0];

  // Progress within the current step (0 to 1) for sub-animations
  const stepProgress = (currentTime % secondsPerScene) / secondsPerScene;

  // Sync state ONLY when lesson.id changes (NOT on watchedSeconds!)
  useEffect(() => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    prevStepRef.current = -1;
  }, [lesson.id]);

  // Audio trigger on step change
  useEffect(() => {
    if (calculatedIndex !== prevStepRef.current) {
      if (prevStepRef.current !== -1 && !isMuted) {
        if (currentScene.soundCue === "click_up") playBeadClick("high");
        else if (currentScene.soundCue === "click_down") playBeadClick("low");
        else if (currentScene.soundCue === "pinch") playBeadClick("medium");
        else if (currentScene.soundCue === "fanfare") playFanfare();
        else playStepChime();
      }
      prevStepRef.current = calculatedIndex;
    }
  }, [calculatedIndex, currentScene.soundCue, isMuted]);

  const updateProgressRef = useRef(updateLessonProgress);
  updateProgressRef.current = updateLessonProgress;
  const markCompletedRef = useRef(markLessonCompleted);
  markCompletedRef.current = markLessonCompleted;

  // Playback timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextTime = currentTimeRef.current + 1 * playbackSpeed;
        if (nextTime >= totalDuration) {
          currentTimeRef.current = totalDuration;
          setCurrentTime(totalDuration);
          setIsPlaying(false);
          if (!isMuted) playFanfare();
          updateProgressRef.current(lesson.id, lesson.durationSeconds);
          markCompletedRef.current(lesson.id);
        } else {
          currentTimeRef.current = nextTime;
          setCurrentTime(nextTime);
          // Periodically sync progress to provider
          if (Math.floor(nextTime) % 6 === 0) {
            const mappedSeconds = Math.round((nextTime / totalDuration) * lesson.durationSeconds);
            updateProgressRef.current(lesson.id, mappedSeconds);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed, lesson.id, lesson.durationSeconds, isMuted]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      // If at end, loop to beginning
      if (currentTimeRef.current >= totalDuration) {
        currentTimeRef.current = 0;
        setCurrentTime(0);
      }
      setIsPlaying(true);
      if (!isMuted) playBeadClick("medium");
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    currentTimeRef.current = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    const next = Math.max(0, Math.min(totalDuration, currentTimeRef.current + seconds));
    currentTimeRef.current = next;
    setCurrentTime(next);
  };

  const jumpToScene = (index: number) => {
    const targetTime = index * secondsPerScene;
    currentTimeRef.current = targetTime;
    setCurrentTime(targetTime);
    if (!isMuted) playBeadClick("medium");
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

  const progressPercent = Math.min(100, Math.round((currentTime / totalDuration) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isAnzan = currentScene.isAnzanHologram;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative rounded-3xl overflow-hidden border-4 shadow-2xl group select-none transition-all ${
        isAnzan
          ? "bg-slate-950 border-purple-400/90 shadow-purple-900/40"
          : "bg-slate-950 border-yellow-300 shadow-2xl"
      }`}
    >
      {/* Animated Video Canvas Screen */}
      <div
        className={`relative aspect-video w-full flex flex-col items-center justify-between overflow-hidden p-3 sm:p-6 ${
          isAnzan
            ? "bg-gradient-to-b from-[#0a051b] via-[#120738] to-[#1e0a4f]"
            : "bg-gradient-to-b from-[#141b2d] via-[#10203a] to-[#1e1e38]"
        }`}
      >
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div
            className={`absolute top-6 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse ${
              isAnzan ? "bg-cyan-500" : "bg-yellow-400"
            }`}
          />
          <div
            className={`absolute bottom-6 right-10 w-80 h-80 rounded-full blur-3xl animate-pulse ${
              isAnzan ? "bg-purple-600" : "bg-orange-500"
            }`}
          />
        </div>

        {/* TOP OVERLAY: Lesson Badge, Topic & Playing Status */}
        <div className="relative z-20 w-full flex items-center justify-between gap-2 pointer-events-auto">
          {/* Badge & Topic */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md">
              Lesson {script.lessonNumber}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white font-bold text-xs border border-white/20">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{script.topicBadge}</span>
            </span>

            {/* LIVE PLAYING EQUALIZER PULSE */}
            {isPlaying ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-extrabold shadow-sm animate-pulse">
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                  <span className="w-1 bg-emerald-300 rounded-full animate-bounce h-3 delay-75" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 delay-150" />
                </span>
                <span>ANIMATED LESSON PLAYING</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                Paused
              </span>
            )}
          </div>

          {/* Step Pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/40 text-xs font-extrabold shadow-sm">
              Step {currentScene.step} of {sceneCount}: {currentScene.title}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/10">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* CENTER STAGE: Animated Abacus & Hand Simulation */}
        <div className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center justify-center">
          {/* Teacher Narration / Speech Bubble */}
          <motion.div
            key={currentScene.step}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-3 w-full max-w-md text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-yellow-400/60 backdrop-blur-md text-yellow-200 text-xs sm:text-sm font-bold shadow-xl">
              <span className="text-lg">{script.instructorAvatar}</span>
              <span className="text-yellow-400 font-extrabold">{script.instructorName}:</span>
              <span className="text-white font-medium">"{currentScene.speechBubble}"</span>
            </div>
          </motion.div>

          {/* Abacus Visualizer (Soroban 1-4) */}
          <div
            className={`relative w-full max-w-sm sm:max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-500 ${
              isAnzan
                ? "bg-slate-900/80 border-4 border-cyan-400/80 shadow-cyan-500/20 shadow-2xl backdrop-blur-md"
                : `bg-[#2b170d] border-4 ${
                    currentScene.highlightElement === "frame"
                      ? "border-yellow-400 ring-4 ring-yellow-400/50"
                      : "border-[#5c3a21]"
                  }`
            }`}
          >
            {/* Wooden Ornaments / Metallic Corner Brackets */}
            {!isAnzan && (
              <>
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-300" />
              </>
            )}

            {/* Reckoning Beam (Center Divider) */}
            <div
              className={`absolute left-3 right-3 top-16 sm:top-20 h-3 z-10 flex items-center justify-around px-4 rounded-sm transition-all duration-300 ${
                isAnzan
                  ? "bg-cyan-400 border-y border-cyan-200 shadow-[0_0_12px_#22d3ee]"
                  : currentScene.highlightElement === "beam"
                  ? "bg-yellow-300 border-y-2 border-yellow-500 shadow-[0_0_15px_#fde047]"
                  : "bg-[#e9c46a] border-y border-[#b8860b]"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#8b4513]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md ring-2 ring-amber-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#8b4513]" />
            </div>

            {/* 3 Rod Columns (Tens, Active Unit Rod, Hundreds) */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 relative h-36 sm:h-44">
              {/* Left Helper Rod */}
              <div className="relative flex flex-col justify-between items-center h-full opacity-60">
                <div className="absolute inset-y-0 w-1 bg-amber-100/40 rounded-full" />
                <div className="relative z-10 w-9 sm:w-11 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-sm" />
                <div className="relative z-10 flex flex-col gap-1 mt-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-9 sm:w-11 h-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* CENTER ACTIVE UNIT ROD (Animated!) */}
              <div
                className={`relative flex flex-col justify-between items-center h-full transition-all ${
                  currentScene.highlightElement === "rod" ? "scale-105" : ""
                }`}
              >
                {/* Rod Beam */}
                <div
                  className={`absolute inset-y-0 w-2 rounded-full transition-all ${
                    isAnzan
                      ? "bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
                      : "bg-yellow-300 shadow-[0_0_10px_#f59e0b]"
                  }`}
                />

                {/* Upper Heaven Bead (Value: 5) */}
                <motion.div
                  animate={{
                    y: currentScene.activeHeavenBead ? (isAnzan ? 26 : 24) : 0,
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`relative z-20 w-12 sm:w-16 h-7 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-transform ${
                    isAnzan
                      ? "bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500 border-2 border-white shadow-[0_0_15px_#38bdf8]"
                      : "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 border-2 border-yellow-100"
                  } ${
                    currentScene.highlightElement === "heaven"
                      ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900"
                      : ""
                  }`}
                >
                  <span className="text-[11px] font-black text-amber-950">5</span>
                </motion.div>

                {/* Lower 4 Earth Beads (Value: 1 each) */}
                <div className="relative z-20 flex flex-col gap-1 mt-6">
                  {[1, 2, 3, 4].map((i) => {
                    const isRaised = i <= currentScene.activeEarthBeadsCount;
                    return (
                      <motion.div
                        key={i}
                        animate={{
                          y: isRaised ? -18 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        className={`w-12 sm:w-16 h-6 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-transform ${
                          isAnzan
                            ? isRaised
                              ? "bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-500 border border-white shadow-[0_0_12px_#34d399]"
                              : "bg-teal-900/60 border border-teal-500/40 opacity-70"
                            : isRaised
                            ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 border border-emerald-200 shadow-md ring-2 ring-emerald-300"
                            : "bg-gradient-to-r from-emerald-700 to-teal-800 opacity-75"
                        } ${
                          currentScene.highlightElement === "earth"
                            ? "ring-2 ring-emerald-300 ring-offset-1 ring-offset-slate-900"
                            : ""
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-950">1</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Helper Rod */}
              <div className="relative flex flex-col justify-between items-center h-full opacity-60">
                <div className="absolute inset-y-0 w-1 bg-amber-100/40 rounded-full" />
                <div className="relative z-10 w-9 sm:w-11 h-6 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 shadow-sm" />
                <div className="relative z-10 flex flex-col gap-1 mt-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-9 sm:w-11 h-5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Formula & Active Math display bar */}
            <div className="mt-3 pt-2.5 border-t border-amber-900/60 flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-amber-200">
                {currentScene.mathCalculation || `Rod Value: ${currentScene.activeHeavenBead ? 5 : 0 + currentScene.activeEarthBeadsCount}`}
              </span>
              <span className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {currentScene.formulaDisplay}
              </span>
            </div>
          </div>

          {/* Interactive Animated Finger Hand Movement Guide */}
          {currentScene.handGesture.finger !== "none" && (
            <motion.div
              animate={isPlaying ? { y: [0, -6, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold shadow-md"
            >
              <Hand className="w-4 h-4 text-amber-400" />
              <span>Finger Action:</span>
              <span className="text-amber-300 uppercase tracking-wide">
                {currentScene.handGesture.label}
              </span>
            </motion.div>
          )}
        </div>

        {/* BIG CENTER PLAY BUTTON (when paused) */}
        {!isPlaying && (
          <button
            onClick={handleTogglePlay}
            className="absolute z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white flex items-center justify-center shadow-2xl shadow-orange-500/60 hover:scale-110 active:scale-95 transition-transform group cursor-pointer border-4 border-white/90"
            title="Play Lesson Video"
          >
            <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-white ml-1.5 group-hover:scale-105 transition-transform" />
          </button>
        )}

        {/* BOTTOM TIMELINE CHAPTER MARKERS */}
        <div className="relative z-20 w-full pt-2 flex items-center justify-center gap-1.5 sm:gap-2">
          {scenes.map((scene, idx) => (
            <button
              key={scene.step}
              onClick={() => jumpToScene(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                calculatedIndex === idx
                  ? "bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-400/40"
                  : "bg-white/15 text-slate-300 hover:bg-white/25 hover:text-white"
              }`}
            >
              <span>Step {scene.step}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VIDEO CONTROLS BAR */}
      <div
        className={`bg-slate-900/95 border-t border-slate-800 px-4 sm:px-6 py-3 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 hover:opacity-100"
        }`}
      >
        {/* Scrubber Range */}
        <div className="relative mb-2">
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#F4A261]"
          />
        </div>

        {/* Control Buttons & Timings */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Controls: Play, Skip, Volume */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-full bg-[#F4A261] hover:bg-orange-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(-5)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Replay 5 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSkip(5)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Skip 5 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Timers */}
            <span className="text-xs text-slate-300 font-mono font-bold">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Right Controls: Speed Selector, Fullscreen, Next Lesson */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-slate-800 text-xs font-bold text-slate-200 px-2 py-1 rounded-lg border border-slate-700 cursor-pointer focus:outline-none"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {onNextLesson && (
              <button
                onClick={onNextLesson}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
