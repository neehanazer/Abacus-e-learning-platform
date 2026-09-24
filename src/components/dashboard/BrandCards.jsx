"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
// 3D-Styled Learning Hub Icon (A-B-C Toy Blocks with 3D isometric shading & lighting)
export function LearningHubIcon({ className = "w-28 h-28" }) {
    return (<svg viewBox="0 0 140 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 12px 20px rgba(217, 83, 79, 0.25))" }}>
      <defs>
        {/* 3D Gradients */}
        <linearGradient id="cubeRedTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7675"/>
          <stop offset="100%" stopColor="#E74C3C"/>
        </linearGradient>
        <linearGradient id="cubeRedFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E74C3C"/>
          <stop offset="100%" stopColor="#C0392B"/>
        </linearGradient>

        <linearGradient id="cubeYellowTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED330"/>
          <stop offset="100%" stopColor="#F7B731"/>
        </linearGradient>
        <linearGradient id="cubeYellowFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7B731"/>
          <stop offset="100%" stopColor="#E18C12"/>
        </linearGradient>

        <linearGradient id="cubeBlackTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155"/>
          <stop offset="100%" stopColor="#1E293B"/>
        </linearGradient>
        <linearGradient id="cubeBlackFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B"/>
          <stop offset="100%" stopColor="#0F172A"/>
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="70" cy="120" rx="55" ry="12" fill="rgba(108, 92, 231, 0.12)"/>

      {/* Top Cube 'A' (Red) */}
      <g id="cube-A" transform="translate(48, 14)">
        {/* Cube body with rounded 3D corners */}
        <rect x="0" y="4" width="44" height="44" rx="10" fill="url(#cubeRedFront)"/>
        <rect x="0" y="0" width="44" height="40" rx="10" fill="url(#cubeRedTop)"/>
        {/* Top inner shine */}
        <rect x="3" y="3" width="38" height="12" rx="6" fill="white" fillOpacity="0.25"/>
        {/* Letter A with 3D bevel effect */}
        <text x="22" y="28" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          A
        </text>
      </g>

      {/* Bottom Left Cube 'B' (Warm Golden Amber) */}
      <g id="cube-B" transform="translate(24, 62)">
        <rect x="0" y="4" width="44" height="44" rx="10" fill="url(#cubeYellowFront)"/>
        <rect x="0" y="0" width="44" height="40" rx="10" fill="url(#cubeYellowTop)"/>
        <rect x="3" y="3" width="38" height="12" rx="6" fill="white" fillOpacity="0.3"/>
        <text x="22" y="28" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          B
        </text>
      </g>

      {/* Bottom Right Cube 'C' (Charcoal Black) */}
      <g id="cube-C" transform="translate(72, 62)">
        <rect x="0" y="4" width="44" height="44" rx="10" fill="url(#cubeBlackFront)"/>
        <rect x="0" y="0" width="44" height="40" rx="10" fill="url(#cubeBlackTop)"/>
        <rect x="3" y="3" width="38" height="12" rx="6" fill="white" fillOpacity="0.18"/>
        <text x="22" y="28" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
          C
        </text>
      </g>

      {/* Floating 3D Sparkle Star */}
      <circle cx="112" cy="24" r="5" fill="#FED330"/>
      <path d="M112 14L114 21L121 23L114 25L112 32L110 25L103 23L110 21L112 14Z" fill="#FED330"/>
    </svg>);
}
// 3D-Styled BrainGym Games Icon (Speech Bubble with 3D Question Badge)
export function BrainGymIcon({ className = "w-28 h-28" }) {
    return (<svg viewBox="0 0 140 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 12px 20px rgba(155, 35, 53, 0.25))" }}>
      <defs>
        <linearGradient id="bubbleBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#F1F5F9"/>
        </linearGradient>

        <linearGradient id="badgeRed3D" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D63031"/>
          <stop offset="60%" stopColor="#9B2335"/>
          <stop offset="100%" stopColor="#6D1421"/>
        </linearGradient>

        <linearGradient id="badgeBevel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7675"/>
          <stop offset="100%" stopColor="#9B2335"/>
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="70" cy="120" rx="55" ry="12" fill="rgba(155, 35, 53, 0.12)"/>

      {/* Main Speech Bubble Body with thick border & 3D bevel */}
      <g transform="translate(18, 16)">
        {/* Bubble shadow layer */}
        <path d="M12 28C12 16.9543 20.9543 8 32 8H80C91.0457 8 100 16.9543 100 28V62C100 73.0457 91.0457 82 80 82H38L20 96V82H32C20.9543 82 12 73.0457 12 62V28Z" fill="#CBD5E1" transform="translate(0, 4)"/>

        {/* Bubble main white surface */}
        <path d="M12 28C12 16.9543 20.9543 8 32 8H80C91.0457 8 100 16.9543 100 28V62C100 73.0457 91.0457 82 80 82H38L20 96V82H32C20.9543 82 12 73.0457 12 62V28Z" fill="url(#bubbleBodyGrad)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>

        {/* Message Horizontal Chat Lines */}
        <line x1="28" y1="36" x2="68" y2="36" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="28" y1="48" x2="64" y2="48" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="28" y1="60" x2="50" y2="60" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round"/>
      </g>

      {/* Overlapping 3D Circular Question Mark Badge */}
      <g id="question-badge" transform="translate(86, 14)">
        {/* Badge 3D depth rim */}
        <circle cx="22" cy="24" r="22" fill="#4B0E17"/>
        <circle cx="22" cy="22" r="22" fill="url(#badgeRed3D)"/>
        {/* Inner highlight ring */}
        <circle cx="22" cy="22" r="19" stroke="url(#badgeBevel)" strokeWidth="2.5"/>
        {/* Top shine arc */}
        <ellipse cx="22" cy="12" rx="14" ry="6" fill="white" fillOpacity="0.28"/>

        {/* Bold 3D Question Mark Serif */}
        <text x="22" y="30" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
          ?
        </text>
      </g>
    </svg>);
}
export default function DashboardBoxCard({ type, onClick }) {
    const cardRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    // 3D Mouse Parallax Tilt Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
        stiffness: 300,
        damping: 25,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
        stiffness: 300,
        damping: 25,
    });
    const handleMouseMove = (e) => {
        if (!cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const xPct = (e.clientX - rect.left) / width - 0.5;
        const yPct = (e.clientY - rect.top) / height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    };
    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setHovered(false);
    };
    const isLearning = type === "learning";
    return (<div style={{ perspective: 1200 }} className="w-full flex justify-center">
      <motion.div ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={() => setHovered(true)} onMouseLeave={handleMouseLeave} onClick={onClick} style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
        }} whileTap={{ scale: 0.97 }} className={`group relative w-full max-w-[420px] bg-white/95 rounded-[44px] p-8 sm:p-10 border-2 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center min-h-[380px] sm:min-h-[420px] overflow-hidden ${isLearning
            ? "border-amber-200/90 hover:border-amber-400 hover:shadow-amber-200/60"
            : "border-rose-200/90 hover:border-rose-400 hover:shadow-rose-200/60"}`}>
        {/* 3D Glassmorphism Specular Reflection Sweep */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ transform: "translateZ(30px)" }}/>

        {/* Top Floating Mini Badge */}
        <div className="w-full flex justify-between items-center" style={{ transform: "translateZ(40px)" }}>
          <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-sm ${isLearning
            ? "bg-amber-100/90 text-amber-800 border-amber-200"
            : "bg-rose-100/90 text-rose-800 border-rose-200"}`}>
            {isLearning ? "Core Learning" : "Brain Arcade"}
          </span>

          <span className="text-xs font-extrabold text-slate-400 flex items-center gap-1">
            {isLearning ? "🌟 Level 1-8" : "⚡ Speed Drills"}
          </span>
        </div>

        {/* 3D Centered Brand Icon */}
        <div className="my-auto py-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ transform: "translateZ(60px)" }}>
          {isLearning ? (<LearningHubIcon className="w-32 h-32 sm:w-36 sm:h-36"/>) : (<BrainGymIcon className="w-32 h-32 sm:w-36 sm:h-36"/>)}
        </div>

        {/* Styled Two-Tone Brand Title exactly from user image */}
        <div className="space-y-1.5 mt-2 w-full" style={{ transform: "translateZ(50px)" }}>
          {isLearning ? (<h3 className="text-3xl sm:text-4xl font-black tracking-tight font-serif flex items-center justify-center gap-1">
              <span style={{ color: "#D4A017" }}>Learning</span>
              <span style={{ color: "#111827" }}>Hub</span>
            </h3>) : (<h3 className="text-3xl sm:text-4xl font-black tracking-tight font-serif flex items-center justify-center gap-1">
              <span style={{ color: "#9B2335" }}>BrainGym</span>
              <span style={{ color: "#111827" }}>Games</span>
            </h3>)}

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xs mx-auto">
            {isLearning
            ? "Master abacus video tutorials, step-by-step formulas & worksheets"
            : "Boost speed, memory flash drills, spatial puzzles & math battle quizzes"}
          </p>
        </div>

        {/* Action Button Pill */}
        <div className="mt-6 w-full pt-4 border-t border-slate-100 flex items-center justify-center" style={{ transform: "translateZ(45px)" }}>
          <div className={`inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md ${isLearning
            ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
            : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"}`}>
            <span>{isLearning ? "Enter Learning Hub" : "Play BrainGym Games"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform"/>
          </div>
        </div>
      </motion.div>
    </div>);
}
