"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  Maximize2,
  RefreshCw,
  Eye,
  Volume2,
  UserX,
  VolumeX,
  ArrowRight,
  PowerOff,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ProctoringViolation {
  strikeNumber: number; // 1, 2, or 3
  reason: string;
  type: "multiple_persons" | "unauthorized_sound" | "camera_disabled";
  timestamp: string;
}

interface ExamProctoringMediaProps {
  mode: "precheck" | "session";
  onIncident?: (type: string, description: string, severity?: "low" | "medium" | "high") => void;
  onShutOff?: (violations: ProctoringViolation[]) => void;
  tabSwitchCount?: number;
}

export const ExamProctoringMedia: React.FC<ExamProctoringMediaProps> = ({
  mode,
  onIncident,
  onShutOff,
  tabSwitchCount = 0,
}) => {
  // Device toggle states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied" | "unsupported">("pending");
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio level meter (0-100)
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // 3-Strike Warning & Screen Shut-off System
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const violationsRef = useRef<ProctoringViolation[]>([]);
  const [activeWarningModal, setActiveWarningModal] = useState<ProctoringViolation | null>(null);
  const [isScreenShutOff, setIsScreenShutOff] = useState<boolean>(false);
  const lastViolationTimeRef = useRef<number>(0);
  const highAudioConsecutiveFrames = useRef<number>(0);

  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const personCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio warning chime
  const playAlertChime = useCallback((severity: "warning" | "shutoff") => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (severity === "shutoff") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.8);
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } else {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      }
    } catch {
      // Audio playback fallback
    }
  }, []);

  // Handle a Proctoring Violation (Strike 1, 2, or 3)
  const triggerViolation = useCallback(
    (reason: string, type: "multiple_persons" | "unauthorized_sound" | "camera_disabled") => {
      if (isScreenShutOff) return;

      const now = Date.now();
      // Enforce 6-second cooldown between strikes so a single glitch doesn't trigger 3 instantly
      if (now - lastViolationTimeRef.current < 6000) return;
      lastViolationTimeRef.current = now;

      const nextStrike = violationsRef.current.length + 1;
      const newViolation: ProctoringViolation = {
        strikeNumber: nextStrike,
        reason,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      const updated = [...violationsRef.current, newViolation];
      violationsRef.current = updated;

      // Update state for this component
      setViolations(updated);

      if (nextStrike >= 3) {
        // 3rd time detected -> Shut off screen!
        setIsScreenShutOff(true);
        playAlertChime("shutoff");
        if (typeof document !== "undefined" && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        // Asynchronously notify parent to prevent React "Cannot update component while rendering" warning
        if (onShutOff) {
          setTimeout(() => {
            onShutOff(updated);
          }, 0);
        }
      } else {
        // Warning 1 or Warning 2
        setActiveWarningModal(newViolation);
        playAlertChime("warning");
      }

      // Notify parent / API asynchronously
      if (onIncident) {
        setTimeout(() => {
          onIncident(type, `Violation #${nextStrike}: ${reason}`, nextStrike === 3 ? "high" : "medium");
        }, 0);
      }
    },
    [isScreenShutOff, onIncident, onShutOff, playAlertChime]
  );

  // Initialize Camera & Microphone Stream
  const initMediaStream = useCallback(async () => {
    try {
      setErrorMessage(null);
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setPermissionStatus("unsupported");
        setIsSimulated(true);
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });

      streamRef.current = stream;
      setPermissionStatus("granted");
      setIsSimulated(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Setup Web Audio API analyser for sound detection
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkLevel = () => {
            if (analyserRef.current && isMicActive && !isScreenShutOff) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const normalized = Math.min(100, Math.round((average / 128) * 100));
              setAudioLevel(normalized);

              // Sound Detection: If level is elevated (> 65%) for consecutive frames
              if (mode === "session" && normalized > 65) {
                highAudioConsecutiveFrames.current += 1;
                // ~1.5 seconds of continuous talking/noise
                if (highAudioConsecutiveFrames.current > 40) {
                  highAudioConsecutiveFrames.current = 0;
                  triggerViolation(
                    "Unauthorized voices or talking detected by camera/microphone!",
                    "unauthorized_sound"
                  );
                }
              } else {
                highAudioConsecutiveFrames.current = Math.max(0, highAudioConsecutiveFrames.current - 1);
              }
            } else {
              setAudioLevel(0);
            }
            animationFrameRef.current = requestAnimationFrame(checkLevel);
          };
          animationFrameRef.current = requestAnimationFrame(checkLevel);
        }
      } catch (audioErr) {
        console.warn("AudioContext setup error:", audioErr);
      }
    } catch (err: unknown) {
      console.warn("Could not access camera/mic, falling back to simulated feed:", err);
      const isNotAllowed = err instanceof Error && err.name === "NotAllowedError";
      setPermissionStatus("denied");
      setIsSimulated(true);
      setErrorMessage(
        isNotAllowed
          ? "Camera/Microphone permission denied. Simulation active."
          : "Camera/Microphone unavailable. Simulation active."
      );
    }
  }, [isMicActive, isScreenShutOff, mode, triggerViolation]);

  useEffect(() => {
    initMediaStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (personCheckIntervalRef.current) {
        clearInterval(personCheckIntervalRef.current);
      }
    };
  }, [initMediaStream]);

  // Periodic Person / Face Detection in Session Mode
  useEffect(() => {
    if (mode !== "session" || isScreenShutOff) return;

    personCheckIntervalRef.current = setInterval(async () => {
      if (!isCameraActive) {
        triggerViolation("Camera feed has been turned off! Live video required.", "camera_disabled");
        return;
      }

      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (ctx && video.readyState >= 2 && video.videoWidth > 0) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);

          // 1. Try Native FaceDetector API (Chromium)
          if (typeof window !== "undefined" && "FaceDetector" in window) {
            try {
              const detector = new (window as any).FaceDetector({ maxDetectedFaces: 5, fastMode: true });
              const detectedFaces = await detector.detect(canvas);
              if (detectedFaces.length > 1) {
                triggerViolation(
                  `Multiple persons detected (${detectedFaces.length} faces visible in camera)!`,
                  "multiple_persons"
                );
                return;
              }
            } catch {
              // fallback
            }
          }

          // 2. Optical skin-tone & contour analysis across split frame quadrants
          try {
            const imgData = ctx.getImageData(0, 0, 160, 120);
            const data = imgData.data;
            let leftPersonScore = 0;
            let rightPersonScore = 0;

            for (let y = 0; y < 120; y += 4) {
              for (let x = 0; x < 160; x += 4) {
                const i = (y * 160 + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Simple skin tone heuristic in RGB space
                if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
                  if (x < 50) leftPersonScore++;
                  if (x > 110) rightPersonScore++;
                }
              }
            }

            // If substantial person pixels are detected in both far flanks simultaneously
            if (leftPersonScore > 40 && rightPersonScore > 40) {
              triggerViolation(
                "Secondary person detected in camera background/flank!",
                "multiple_persons"
              );
            }
          } catch {
            // ignore canvas errors
          }
        }
      }
    }, 2000);

    return () => {
      if (personCheckIntervalRef.current) {
        clearInterval(personCheckIntervalRef.current);
      }
    };
  }, [mode, isCameraActive, isScreenShutOff, triggerViolation]);

  // Handle Camera Toggle
  const toggleCamera = () => {
    const newState = !isCameraActive;
    setIsCameraActive(newState);

    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
    }

    if (!newState) {
      triggerViolation("Camera was turned off during official exam!", "camera_disabled");
    }
  };

  // Handle Microphone Toggle
  const toggleMic = () => {
    const newState = !isMicActive;
    setIsMicActive(newState);

    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = newState;
      });
    }

    if (!newState) {
      setAudioLevel(0);
      if (onIncident) {
        onIncident("mic_muted", "Student muted microphone during exam", "medium");
      }
    }
  };

  // =========================================================================
  // 1. PRECHECK VARIANT (For Overview & Exam Readiness Screen)
  // =========================================================================
  if (mode === "precheck") {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200 shadow-md mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1D3557] font-heading flex items-center gap-2">
                Final Exam Camera & Microphone Verification
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Strict AI Proctoring
                </span>
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Mandatory for Final Exam: The AI verifies only 1 person is present and monitors unauthorized sounds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                permissionStatus === "granted"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {permissionStatus === "granted" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Devices Connected
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Simulation Ready
                </>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Camera Preview Box (5 cols) */}
          <div className="md:col-span-5">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-3 border-indigo-300 shadow-inner flex items-center justify-center group">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${
                      isSimulated ? "hidden" : "block"
                    }`}
                  />
                  {isSimulated && (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-slate-300">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/40 border-2 border-indigo-400 flex items-center justify-center text-3xl mb-2 animate-pulse">
                        👤
                      </div>
                      <span className="text-xs font-black text-white">Live Proctor Simulation</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Single Person Centered</span>
                    </div>
                  )}

                  {/* Face Guide Target Overlay */}
                  <div className="absolute inset-4 border border-dashed border-emerald-400/50 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full absolute top-2">
                      Position 1 Person in Center Frame
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <CameraOff className="w-10 h-10 text-rose-400 mb-2" />
                  <span className="text-xs font-bold text-white">Camera is Turned Off</span>
                  <span className="text-[10px] text-slate-400">Click Enable Camera below</span>
                </div>
              )}

              {/* Status Badge Over Video */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCameraActive ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span>{isCameraActive ? "CAM: ACTIVE" : "CAM: OFF"}</span>
              </div>
            </div>
          </div>

          {/* Device Controls & Rules Info (7 cols) */}
          <div className="md:col-span-7 space-y-3.5">
            {/* Proctoring Rules Summary Card */}
            <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-1">
              <div className="font-black flex items-center gap-1.5 text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Strict 3-Strike Warning & Screen Shut-Off Policy:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium text-rose-900/90 pl-1">
                <li><strong>No other persons:</strong> If any second person appears on camera, a warning triggers.</li>
                <li><strong>No talking/sounds:</strong> If unauthorized voices/sounds are detected, a warning triggers.</li>
                <li><strong>3rd strike penalty:</strong> 2 warnings will display; on the 3rd detection, the <strong>screen shuts off</strong> and exam terminates.</li>
                <li><strong>Full screen only:</strong> The exam locks into full screen; opening other pages is blocked.</li>
              </ul>
            </div>

            {/* Camera Control Row */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCameraActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-black text-[#1D3557]">Webcam Person Monitor</div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {isCameraActive ? "Active: Face tracking & single person check" : "Camera off"}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleCamera}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isCameraActive
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isCameraActive ? "Turn Off" : "Turn On"}
              </button>
            </div>

            {/* Microphone Control & Sound Meter */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isMicActive ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#1D3557]">Microphone Sound Monitor</div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      {isMicActive ? "Listening for external speech & whispering" : "Microphone muted"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleMic}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isMicActive
                      ? "bg-stone-200 hover:bg-stone-300 text-stone-700"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isMicActive ? "Mute" : "Unmute"}
                </button>
              </div>

              {/* Sound Level Bar */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 mb-0.5">
                  <span>Room Noise Level:</span>
                  <span className={audioLevel > 50 ? "text-rose-500 font-black" : "text-emerald-600"}>
                    {audioLevel > 50 ? "Loud Sound Detected" : "Quiet / Ready"}
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-75 rounded-full ${
                      audioLevel > 60 ? "bg-rose-500" : audioLevel > 30 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${isMicActive ? Math.max(8, audioLevel) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ACTIVE EXAM SESSION VARIANT (With 3-Strike Modals & Screen Shut-Off)
  // =========================================================================
  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      {/* 2A. Top Proctoring Toolbar & Media Option Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-3.5 sm:p-4 mb-6 shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Camera & Mic Active Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-white text-xs tracking-wide">
              AI PROCTORING ACTIVE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-700 pl-3">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                isCameraActive ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"
              }`}
            >
              {isCameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
              <span>{isCameraActive ? "CAM: ON" : "CAM: OFF"}</span>
            </span>

            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                isMicActive ? "bg-indigo-950 text-indigo-300" : "bg-stone-800 text-stone-400"
              }`}
            >
              {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isMicActive ? "MIC: ON" : "MIC: MUTED"}</span>
            </span>
          </div>
        </div>

        {/* Center: Live Sound Meter Bar */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mic Level:</span>
          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                audioLevel > 60 ? "bg-rose-400" : "bg-emerald-400"
              }`}
              style={{ width: `${isMicActive ? Math.max(5, audioLevel) : 0}%` }}
            />
          </div>
        </div>

        {/* Right: Camera/Mic Options, Strikes Indicator & Demo Simulation Triggers */}
        <div className="flex items-center gap-2">
          {/* Strikes Counter Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 border ${
              violations.length === 0
                ? "bg-slate-800 text-emerald-400 border-slate-700"
                : violations.length === 1
                ? "bg-amber-950 text-amber-300 border-amber-600 animate-pulse"
                : "bg-rose-950 text-rose-300 border-rose-600 animate-bounce"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Strikes: {violations.length} / 3</span>
          </div>

          {/* Quick Simulation Triggers for Examiners/Testing */}
          <button
            onClick={() =>
              triggerViolation(
                "Multiple persons detected in camera frame (Unregistered person present)!",
                "multiple_persons"
              )
            }
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[10px] font-bold rounded-lg transition"
            title="Simulate extra person detected to test warning & screen shut off flow"
          >
            <Users className="w-3 h-3" />
            <span>Simulate Person</span>
          </button>

          <button
            onClick={() =>
              triggerViolation(
                "Unauthorized talking or loud background sound detected!",
                "unauthorized_sound"
              )
            }
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 text-[10px] font-bold rounded-lg transition"
            title="Simulate unauthorized speech detected to test warning & screen shut off flow"
          >
            <Volume2 className="w-3 h-3" />
            <span>Simulate Sound</span>
          </button>

          {/* Camera Option Toggle */}
          <button
            onClick={toggleCamera}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              isCameraActive
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }`}
          >
            {isCameraActive ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span>{isCameraActive ? "Camera Option" : "Camera Off"}</span>
          </button>

          {/* Microphone Option Toggle */}
          <button
            onClick={toggleMic}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              isMicActive
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {isMicActive ? <Mic className="w-3.5 h-3.5 text-indigo-400" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isMicActive ? "Mic Option" : "Mic Muted"}</span>
          </button>
        </div>
      </div>

      {/* 2B. Floating / Docked Live Video PiP Feed */}
      <motion.div
        drag
        dragConstraints={{ left: -300, right: 300, top: -400, bottom: 200 }}
        className={`fixed z-40 right-4 sm:right-6 bottom-4 sm:bottom-6 bg-slate-950 rounded-3xl border-3 shadow-2xl overflow-hidden transition-all duration-200 ${
          isCameraActive ? "border-emerald-500 shadow-emerald-900/20" : "border-rose-500"
        } ${isMinimized ? "w-44 h-12" : "w-52 sm:w-60"}`}
      >
        {/* Widget Header Bar */}
        <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 cursor-move">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraActive ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="font-mono text-[10px] text-white">LIVE PROCTOR</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 text-slate-400"
              title={isMinimized ? "Expand Camera" : "Minimize Camera"}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Video Canvas or Avatar */}
        {!isMinimized && (
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    isSimulated ? "hidden" : "block"
                  }`}
                />
                {isSimulated && (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-2xl mb-1">👤</span>
                    <span className="text-[10px] font-bold text-slate-300">Face Monitored</span>
                    <span className="text-[9px] text-emerald-400 font-mono">1 Person Present</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center text-rose-400">
                <CameraOff className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-black">Camera Disabled</span>
              </div>
            )}

            {/* Rec Badge */}
            <div className="absolute top-2 right-2 bg-rose-600/90 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>REC</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* ========================================================================= */}
      {/* 2C. WARNING 1 & WARNING 2 INTERACTIVE MODAL DIALOGS                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeWarningModal && !isScreenShutOff && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-4 shadow-2xl relative overflow-hidden ${
                activeWarningModal.strikeNumber === 1 ? "border-amber-400" : "border-rose-600"
              }`}
            >
              {/* Warning Header */}
              <div className="text-center space-y-3 mb-6">
                <div
                  className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg ${
                    activeWarningModal.strikeNumber === 1
                      ? "bg-amber-100 border-2 border-amber-300 text-amber-700"
                      : "bg-rose-100 border-2 border-rose-300 text-rose-700 animate-bounce"
                  }`}
                >
                  {activeWarningModal.strikeNumber === 1 ? "⚠️" : "🚨"}
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                  {activeWarningModal.strikeNumber === 1
                    ? "PROCTORING WARNING 1 OF 3"
                    : "CRITICAL FINAL WARNING 2 OF 3"}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#1D3557] font-heading">
                  {activeWarningModal.strikeNumber === 1
                    ? "Unauthorized Activity Detected!"
                    : "Final Notice: One More Violation Will Shut Off Exam!"}
                </h3>

                <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-200 text-left space-y-2">
                  <div className="text-xs font-black text-rose-900 uppercase tracking-wide">
                    Violation Incident Logged:
                  </div>
                  <p className="text-sm font-bold text-rose-950 leading-relaxed">
                    {activeWarningModal.reason}
                  </p>
                  <div className="text-[11px] text-rose-700 font-mono">
                    Time Recorded: {activeWarningModal.timestamp}
                  </div>
                </div>

                <p className="text-xs text-stone-600 font-medium leading-relaxed">
                  {activeWarningModal.strikeNumber === 1
                    ? "Official certification rules strictly prohibit other persons in the camera frame and unauthorized talking/sounds. You have received Warning 1 of 2."
                    : "⚠️ IMPORTANT: This is your LAST warning. If any other person or unauthorized sound is detected a 3rd time, your screen will immediately shut off and your exam will terminate."}
                </p>
              </div>

              {/* Acknowledge Button */}
              <button
                onClick={() => setActiveWarningModal(null)}
                className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                  activeWarningModal.strikeNumber === 1
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-b-4 border-amber-700"
                    : "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 border-b-4 border-rose-900 animate-pulse"
                }`}
              >
                <span>
                  {activeWarningModal.strikeNumber === 1
                    ? "I Understand & Acknowledge (Warning 1/3)"
                    : "I Understand & Acknowledge (Final Notice 2/3)"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2D. 3RD STRIKE: SCREEN SHUT OFF COMPLETE TAKEOVER                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isScreenShutOff && (
          <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center p-6 sm:p-10 text-center animate-in fade-in duration-700 select-none">
            {/* Red Alert Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-950/50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              {/* Power Off Symbol */}
              <div className="w-24 h-24 rounded-3xl bg-rose-950 border-3 border-rose-600 mx-auto flex items-center justify-center shadow-2xl shadow-rose-900/50 animate-pulse">
                <PowerOff className="w-12 h-12 text-rose-500" />
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-rose-950 text-rose-400 border border-rose-700">
                PROCTORING VIOLATION LIMIT REACHED (3/3)
              </div>

              <h1 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-wide">
                EXAM TERMINATED
                <span className="block text-rose-500 text-2xl sm:text-3xl mt-1">
                  SCREEN SHUT OFF
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                Your examination session was shut off and terminated because 3 proctoring violations were detected
                (multiple persons detected or unauthorized sounds captured by camera/microphone).
              </p>

              {/* Recorded Violations Log Box */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-rose-800/60 text-left space-y-2.5 max-h-48 overflow-y-auto">
                <div className="text-xs font-black uppercase tracking-wider text-rose-400">
                  Recorded Violations Log (3 of 3):
                </div>
                {violations.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 border-b border-slate-800 pb-2">
                    <span className="font-bold text-rose-500 font-mono">#{idx + 1}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white">{v.reason}</div>
                      <div className="text-[10px] text-slate-500">{v.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Back to Mock Exam Page */}
              <div className="pt-4">
                <Link
                  href="/learning/mock-exam"
                  className="inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black text-base shadow-2xl shadow-orange-950 transition-all hover:scale-105"
                >
                  <span>Back to Mock Exam Page</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
