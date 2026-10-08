"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRight,
  Hand,
  Film,
  Layers,
  FileVideo,
} from "lucide-react";
import { Lesson } from "@/data/lessonsData";
import { useLearning } from "@/context/LearningContext";
import { ANIMATED_LESSON_SCRIPTS, AnimatedScene } from "@/data/animatedLessonsScript";
import { playBeadClick, playStepChime, playFanfare } from "@/lib/abacusAudio";

interface VideoPlayerProps {
  lesson: Lesson;
  onNextLesson?: () => void;
}

const ANIMATED_SESSION_DURATION = 48;

export default function VideoPlayer({ lesson, onNextLesson }: VideoPlayerProps) {
  const { updateLessonProgress, markLessonCompleted } = useLearning();

  const hasVideoUrl = Boolean(lesson.videoUrl);
  const [viewMode, setViewMode] = useState<"video" | "interactive">(
    hasVideoUrl ? "video" : "interactive"
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(
    lesson.durationSeconds || 64
  );

  const script = ANIMATED_LESSON_SCRIPTS[lesson.id] || ANIMATED_LESSON_SCRIPTS["lesson-1"];
  const scenes = script.scenes;
  const sceneCount = scenes.length;
  const animatedDuration = ANIMATED_SESSION_DURATION;
  const secondsPerScene = animatedDuration / sceneCount;

  const totalDuration = viewMode === "video" ? videoDuration : animatedDuration;

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

  // Compute active scene for interactive mode
  const calculatedIndex = Math.min(
    sceneCount - 1,
    Math.max(0, Math.floor(currentTime / secondsPerScene))
  );
  const currentScene: AnimatedScene = scenes[calculatedIndex] || scenes[0];

  // Sync state on lesson change
  useEffect(() => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    prevStepRef.current = -1;
    setViewMode(Boolean(lesson.videoUrl) ? "video" : "interactive");
    setVideoDuration(lesson.durationSeconds || 64);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [lesson.id, lesson.videoUrl, lesson.durationSeconds]);

  // Audio trigger on step change in interactive mode
  useEffect(() => {
    if (viewMode === "interactive" && calculatedIndex !== prevStepRef.current) {
      if (prevStepRef.current !== -1 && !isMuted) {
        if (currentScene.soundCue === "click_up") playBeadClick("high");
        else if (currentScene.soundCue === "click_down") playBeadClick("low");
        else if (currentScene.soundCue === "pinch") playBeadClick("medium");
        else if (currentScene.soundCue === "fanfare") playFanfare();
        else playStepChime();
      }
      prevStepRef.current = calculatedIndex;
    }
  }, [calculatedIndex, currentScene.soundCue, isMuted, viewMode]);

  const updateProgressRef = useRef(updateLessonProgress);
  updateProgressRef.current = updateLessonProgress;
  const markCompletedRef = useRef(markLessonCompleted);
  markCompletedRef.current = markLessonCompleted;

  // Timer loop for interactive mode
  useEffect(() => {
    if (viewMode !== "interactive") return;
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
          if (Math.floor(nextTime) % 6 === 0) {
            const mappedSeconds = Math.round((nextTime / totalDuration) * lesson.durationSeconds);
            updateProgressRef.current(lesson.id, mappedSeconds);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed, lesson.id, lesson.durationSeconds, isMuted, viewMode]);

  // Handle video element timeupdate
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && viewMode === "video") {
      const cur = videoRef.current.currentTime;
      currentTimeRef.current = cur;
      setCurrentTime(cur);

      if (Math.floor(cur) % 5 === 0) {
        updateProgressRef.current(lesson.id, Math.round(cur));
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      const dur = Math.round(videoRef.current.duration);
      if (dur > 0 && !isNaN(dur)) {
        setVideoDuration(dur);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (!isMuted) playFanfare();
    updateProgressRef.current(lesson.id, totalDuration);
    markCompletedRef.current(lesson.id);
  };

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
    if (viewMode === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (videoRef.current.ended || videoRef.current.currentTime >= videoDuration) {
          videoRef.current.currentTime = 0;
        }
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
      return;
    }

    if (!isPlaying) {
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
    if (viewMode === "video" && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds: number) => {
    const next = Math.max(0, Math.min(totalDuration, currentTimeRef.current + seconds));
    currentTimeRef.current = next;
    setCurrentTime(next);
    if (viewMode === "video" && videoRef.current) {
      videoRef.current.currentTime = next;
    }
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

  const progressPercent = Math.min(
    100,
    Math.round((currentTime / (totalDuration || 1)) * 100)
  );

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
        viewMode === "video"
          ? "bg-slate-950 border-amber-400 shadow-amber-900/40"
          : isAnzan
          ? "bg-slate-950 border-purple-400/90 shadow-purple-900/40"
          : "bg-slate-950 border-yellow-300 shadow-2xl"
      }`}
    >
      {/* Top Banner Mode Selector & Title */}
      <div className="relative aspect-video w-full flex flex-col items-center justify-between overflow-hidden bg-black">
        {/* VIEW MODE 1: REAL MP4 VIDEO PLAYER */}
        {viewMode === "video" ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              key={lesson.id}
              ref={videoRef}
              src={
                lesson.videoUrl ||
                (lesson.levelNumber === 2 || lesson.id.startsWith("lesson-2-")
                  ? "/videos/one-digit-practice.mp4"
                  : lesson.id === "lesson-2"
                  ? "/videos/small-friend-rules.mp4"
                  : lesson.id === "lesson-3"
                  ? "/videos/big-friend-rules.mp4"
                  : "/videos/abacus-demo.mp4")
              }
              playsInline
              className="w-full h-full object-contain cursor-pointer"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={handleTogglePlay}
            >
              {lesson.videoUrl && (
                <source src={lesson.videoUrl} type="video/mp4" />
              )}
              <source
                src={
                  lesson.levelNumber === 2 || lesson.id.startsWith("lesson-2-")
                    ? "/videos/one-digit-practice.mp4"
                    : lesson.id === "lesson-2"
                    ? "/videos/small-friend-rules.mp4"
                    : lesson.id === "lesson-3"
                    ? "/videos/big-friend-rules.mp4"
                    : "/videos/abacus-demo.mp4"
                }
                type="video/mp4"
              />
              Your browser does not support HTML5 video.
            </video>

            {/* Video Watermark / Path Badge */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[11px] font-mono">
              <FileVideo className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {lesson.localVideoPath
                  ? lesson.localVideoPath.split(/[/\\]/).pop()
                  : "video.mp4"}
              </span>
            </div>
          </div>
        ) : (
          /* VIEW MODE 2: INTERACTIVE ANIMATED BEADS SIMULATION */
          <div
            className={`relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-6 ${
              isAnzan
                ? "bg-gradient-to-b from-[#0a051b] via-[#120738] to-[#1e0a4f]"
                : "bg-gradient-to-b from-[#141b2d] via-[#10203a] to-[#1e1e38]"
            }`}
          >
            {/* Background Atmosphere */}
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

            {/* Center Stage: Abacus Simulation */}
            <div className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center justify-center">
              {/* Teacher Narration */}
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

              {/* Soroban Frame */}
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
                {/* Corner Brackets */}
                {!isAnzan && (
                  <>
                    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
                    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
                    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
                    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-300" />
                  </>
                )}

                {/* Reckoning Beam */}
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

                {/* Rods */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 relative h-36 sm:h-44">
                  {/* Left Rod */}
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

                  {/* Center Unit Rod */}
                  <div
                    className={`relative flex flex-col justify-between items-center h-full transition-all ${
                      currentScene.highlightElement === "rod" ? "scale-105" : ""
                    }`}
                  >
                    <div
                      className={`absolute inset-y-0 w-2 rounded-full transition-all ${
                        isAnzan
                          ? "bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
                          : "bg-yellow-300 shadow-[0_0_10px_#f59e0b]"
                      }`}
                    />

                    {/* Heaven Bead */}
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

                    {/* Earth Beads */}
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

                  {/* Right Rod */}
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

                {/* Formula Display */}
                <div className="mt-3 pt-2.5 border-t border-amber-900/60 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-amber-200">
                    {currentScene.mathCalculation ||
                      `Rod Value: ${currentScene.activeHeavenBead ? 5 : 0 + currentScene.activeEarthBeadsCount}`}
                  </span>
                  <span className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    {currentScene.formulaDisplay}
                  </span>
                </div>
              </div>

              {/* Finger Action */}
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

            {/* Step markers for interactive mode */}
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
        )}

        {/* TOP OVERLAY HEADER (Common to both modes) */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-5 z-30 flex items-center justify-between gap-2 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Badge & Title */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md">
              Lesson {lesson.lessonNumber}
            </span>

            {/* Mode Selector Toggle if videoUrl is available */}
            {hasVideoUrl && (
              <div className="flex items-center bg-black/60 backdrop-blur-md rounded-full p-0.5 border border-white/20">
                <button
                  onClick={() => {
                    if (isPlaying && videoRef.current) videoRef.current.pause();
                    setIsPlaying(false);
                    setViewMode("video");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === "video"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>

                <button
                  onClick={() => {
                    if (isPlaying && videoRef.current) videoRef.current.pause();
                    setIsPlaying(false);
                    setViewMode("interactive");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === "interactive"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Interactive</span>
                </button>
              </div>
            )}

            {/* Live Playing Status */}
            {isPlaying ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-extrabold shadow-sm animate-pulse">
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                  <span className="w-1 bg-emerald-300 rounded-full animate-bounce h-3 delay-75" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 delay-150" />
                </span>
                <span>PLAYING</span>
              </span>
            ) : (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                Paused
              </span>
            )}
          </div>

          {/* Progress Percent Pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/40 text-xs font-extrabold shadow-sm">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* BIG CENTER PLAY BUTTON (when paused) */}
        {!isPlaying && (
          <button
            onClick={handleTogglePlay}
            className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#F4A261] via-[#E76F51] to-[#E9C46A] text-white flex items-center justify-center shadow-2xl shadow-orange-500/60 hover:scale-110 active:scale-95 transition-transform group cursor-pointer border-4 border-white/90"
            title="Play Lesson Video"
          >
            <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-white ml-1.5 group-hover:scale-105 transition-transform" />
          </button>
        )}
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
            max={totalDuration || 64}
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
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
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
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (videoRef.current) {
                  videoRef.current.muted = nextMuted;
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Timers */}
            <span className="text-xs text-slate-300 font-mono font-bold">
              {formatTime(currentTime)} / {formatTime(totalDuration || 64)}
            </span>
          </div>

          {/* Right Controls: Speed Selector, Fullscreen, Next Lesson */}
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={playbackSpeed}
              onChange={(e) => {
                const spd = Number(e.target.value);
                setPlaybackSpeed(spd);
                if (videoRef.current) {
                  videoRef.current.playbackRate = spd;
                }
              }}
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
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
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
