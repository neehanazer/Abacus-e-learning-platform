"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, RotateCcw, Clock, Sparkles, Star, Eye, 
  Volume2, VolumeX, CheckCircle2, ChevronRight, HelpCircle, AlertCircle
} from "lucide-react";
import { playSound } from "./soundEffects";

interface DifferenceHotspot {
  id: string;
  name: string;
  description: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number; // percentage radius for click detection
}

interface SceneData {
  id: string;
  category: "animals" | "fruits" | "space" | "scholar";
  categoryIcon: string;
  title: string;
  subtitle: string;
  differences: DifferenceHotspot[];
  renderScene: (variant: "left" | "right", foundIds: string[]) => React.ReactNode;
}

const SCENES: SceneData[] = [
  // --- SCENE 1: WILD ANIMALS SAFARI ---
  {
    id: "safari-animals",
    category: "animals",
    categoryIcon: "🦁",
    title: "Safari Jungle Friends",
    subtitle: "Spot 5 differences in the animal sanctuary!",
    differences: [
      {
        id: "d1",
        name: "Lion King's Flower",
        description: "The lion has a blooming red flower in his mane on the right image!",
        x: 24,
        y: 45,
        radius: 14
      },
      {
        id: "d2",
        name: "Elephant's Snack",
        description: "The baby elephant holds a red apple on the left, but a yellow banana on the right!",
        x: 75,
        y: 55,
        radius: 14
      },
      {
        id: "d3",
        name: "Jungle Butterfly",
        description: "There is an extra bright blue butterfly fluttering on the top right!",
        x: 82,
        y: 18,
        radius: 12
      },
      {
        id: "d4",
        name: "Playful Monkey's Tail",
        description: "The monkey hanging from the vine has a curly tail ring on the right!",
        x: 48,
        y: 25,
        radius: 13
      },
      {
        id: "d5",
        name: "Savanna Sun",
        description: "The golden sun has rays on the left, but cute sunglasses on the right!",
        x: 15,
        y: 15,
        radius: 12
      }
    ],
    renderScene: (variant: "left" | "right", foundIds: string[]) => (
      <svg viewBox="0 0 400 300" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`safariSky-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="300" fill={`url(#safariSky-${variant})`} />

        {/* Sun (Diff 5: Normal vs with sunglasses) */}
        <circle cx="60" cy="50" r="28" fill="#f59e0b" />
        <circle cx="60" cy="50" r="24" fill="#fbbf24" />
        {variant === "left" ? (
          // Normal sun rays
          <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
            <line x1="60" y1="14" x2="60" y2="8" />
            <line x1="60" y1="86" x2="60" y2="92" />
            <line x1="24" y1="50" x2="18" y2="50" />
            <line x1="96" y1="50" x2="102" y2="50" />
            <line x1="35" y1="25" x2="30" y2="20" />
            <line x1="85" y1="75" x2="90" y2="80" />
          </g>
        ) : (
          // Sun with cute sunglasses!
          <g>
            <rect x="42" y="44" width="16" height="12" rx="3" fill="#0f172a" />
            <rect x="62" y="44" width="16" height="12" rx="3" fill="#0f172a" />
            <line x1="58" y1="48" x2="62" y2="48" stroke="#0f172a" strokeWidth="2.5" />
            <path d="M 52 64 Q 60 70 68 64" stroke="#d97706" strokeWidth="3" fill="none" />
          </g>
        )}

        {/* Distant Mountains & Savanna Grass */}
        <polygon points="120,200 210,120 300,200" fill="#86efac" opacity="0.6" />
        <polygon points="230,200 310,135 390,200" fill="#4ade80" opacity="0.7" />
        {/* Ground */}
        <rect x="0" y="190" width="400" height="110" fill="#15803d" />
        <path d="M 0 190 Q 100 175 200 190 T 400 190 L 400 300 L 0 300 Z" fill="#16a34a" />

        {/* Big Jungle Tree */}
        <rect x="180" y="80" width="22" height="120" fill="#78350f" />
        <circle cx="190" cy="70" r="50" fill="#15803d" />
        <circle cx="160" cy="80" r="35" fill="#16a34a" />
        <circle cx="220" cy="80" r="35" fill="#22c55e" />

        {/* Diff 4: Monkey on Tree */}
        <g id="monkey">
          <circle cx="190" cy="95" r="14" fill="#a16207" />
          <circle cx="190" cy="97" r="10" fill="#fde047" />
          {/* Eyes */}
          <circle cx="186" cy="94" r="2" fill="#0f172a" />
          <circle cx="194" cy="94" r="2" fill="#0f172a" />
          {/* Ears */}
          <circle cx="176" cy="94" r="4" fill="#a16207" />
          <circle cx="204" cy="94" r="4" fill="#a16207" />
          {/* Tail: straight vs looped */}
          {variant === "left" ? (
            <path d="M 195 105 Q 210 115 205 130" stroke="#a16207" strokeWidth="3.5" fill="none" />
          ) : (
            <path d="M 195 105 Q 215 110 205 125 A 6 6 0 1 1 215 125" stroke="#a16207" strokeWidth="3.5" fill="none" />
          )}
        </g>

        {/* Diff 3: Extra Butterfly on right */}
        {variant === "right" ? (
          <g>
            <ellipse cx="330" cy="55" rx="8" ry="12" fill="#38bdf8" transform="rotate(25 330 55)" />
            <ellipse cx="340" cy="55" rx="8" ry="12" fill="#0284c7" transform="rotate(-25 340 55)" />
            <line x1="335" y1="45" x2="335" y2="65" stroke="#0f172a" strokeWidth="2" />
          </g>
        ) : null}

        {/* Lion (Left character) */}
        <g id="lion">
          {/* Mane */}
          <circle cx="100" cy="205" r="42" fill="#d97706" />
          {/* Diff 1: Flower in Lion's mane on right */}
          {variant === "right" && (
            <g>
              <circle cx="80" cy="175" r="7" fill="#ef4444" />
              <circle cx="80" cy="175" r="3" fill="#fef08a" />
            </g>
          )}
          {/* Face */}
          <circle cx="100" cy="205" r="28" fill="#fde047" />
          {/* Ears */}
          <circle cx="80" cy="180" r="9" fill="#d97706" />
          <circle cx="80" cy="180" r="5" fill="#fde047" />
          <circle cx="120" cy="180" r="9" fill="#d97706" />
          <circle cx="120" cy="180" r="5" fill="#fde047" />
          {/* Eyes & Nose */}
          <circle cx="92" cy="200" r="3" fill="#0f172a" />
          <circle cx="108" cy="200" r="3" fill="#0f172a" />
          <polygon points="98,208 102,208 100,214" fill="#b45309" />
          {/* Smile */}
          <path d="M 94 218 Q 100 224 106 218" stroke="#b45309" strokeWidth="2" fill="none" />
          {/* Body */}
          <path d="M 75 240 C 75 225 125 225 125 240 L 130 280 L 70 280 Z" fill="#facc15" />
        </g>

        {/* Baby Elephant (Right character) */}
        <g id="elephant">
          {/* Body */}
          <ellipse cx="300" cy="225" rx="38" ry="32" fill="#94a3b8" />
          {/* Legs */}
          <rect x="275" y="245" width="14" height="35" rx="4" fill="#64748b" />
          <rect x="310" y="245" width="14" height="35" rx="4" fill="#64748b" />
          {/* Head & Ear */}
          <circle cx="270" cy="205" r="24" fill="#94a3b8" />
          <ellipse cx="290" cy="198" rx="14" ry="18" fill="#64748b" />
          {/* Eye */}
          <circle cx="262" cy="198" r="3" fill="#0f172a" />
          {/* Trunk */}
          <path d="M 252 210 Q 240 230 255 240" stroke="#94a3b8" strokeWidth="8" fill="none" strokeLinecap="round" />
          
          {/* Diff 2: Snack held by trunk (apple vs banana) */}
          {variant === "left" ? (
            // Red Apple
            <g>
              <circle cx="260" cy="242" r="7" fill="#ef4444" />
              <line x1="260" y1="235" x2="262" y2="231" stroke="#78350f" strokeWidth="2" />
            </g>
          ) : (
            // Yellow Banana
            <path d="M 254 246 Q 262 238 270 244" stroke="#eab308" strokeWidth="5" fill="none" strokeLinecap="round" />
          )}
        </g>
      </svg>
    )
  },

  // --- SCENE 2: FRUITS & YUMMY FOOD FEAST ---
  {
    id: "fruit-feast",
    category: "fruits",
    categoryIcon: "🍎",
    title: "The Yummy Fruit Feast",
    subtitle: "Spot 5 differences on the chef's snack table!",
    differences: [
      {
        id: "d1",
        name: "Watermelon Seeds",
        description: "The juicy watermelon slice has black seeds on the left, but NO seeds on the right!",
        x: 25,
        y: 65,
        radius: 14
      },
      {
        id: "d2",
        name: "Chef's Hat Star",
        description: "The pastry chef's hat has a sparkling gold star pin on the right!",
        x: 50,
        y: 20,
        radius: 14
      },
      {
        id: "d3",
        name: "Pizza Topping",
        description: "The pizza slice has green peppers on the left, but red mushrooms on the right!",
        x: 75,
        y: 65,
        radius: 14
      },
      {
        id: "d4",
        name: "Cupcake Cherry",
        description: "The sweet pink cupcake has a cherry on top on the left, but a candle on the right!",
        x: 50,
        y: 72,
        radius: 13
      },
      {
        id: "d5",
        name: "Kitchen Wall Clock",
        description: "The kitchen clock shows 12:00 on the left, but 3:00 on the right!",
        x: 82,
        y: 22,
        radius: 12
      }
    ],
    renderScene: (variant: "left" | "right", foundIds: string[]) => (
      <svg viewBox="0 0 400 300" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`kitchenBg-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="100%" stopColor="#ffe4e6" />
          </linearGradient>
        </defs>

        {/* Kitchen Wall */}
        <rect width="400" height="300" fill={`url(#kitchenBg-${variant})`} />
        {/* Wall Tiles Line */}
        <line x1="0" y1="130" x2="400" y2="130" stroke="#fbcfe8" strokeWidth="2" />

        {/* Diff 5: Clock on wall */}
        <circle cx="330" cy="55" r="24" fill="#ffffff" stroke="#e11d48" strokeWidth="3" />
        <circle cx="330" cy="55" r="2.5" fill="#0f172a" />
        <line x1="330" y1="55" x2="330" y2="40" stroke="#0f172a" strokeWidth="2.5" />
        {variant === "left" ? (
          <line x1="330" y1="55" x2="330" y2="38" stroke="#e11d48" strokeWidth="2" />
        ) : (
          <line x1="330" y1="55" x2="345" y2="55" stroke="#e11d48" strokeWidth="2" />
        )}

        {/* Chef Mascot in center top */}
        <circle cx="200" cy="85" r="26" fill="#fed7aa" />
        {/* Eyes & Smile */}
        <circle cx="192" cy="82" r="3" fill="#0f172a" />
        <circle cx="208" cy="82" r="3" fill="#0f172a" />
        <path d="M 194 94 Q 200 102 206 94" stroke="#ea580c" strokeWidth="2" fill="none" />
        {/* Mustache */}
        <path d="M 188 90 Q 196 95 200 90 Q 204 95 212 90" stroke="#78350f" strokeWidth="3" fill="none" />

        {/* Chef Hat (Diff 2: Plain vs Star pin) */}
        <path d="M 180 65 C 170 45 230 45 220 65 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="180" y="62" width="40" height="8" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        {variant === "right" && (
          <polygon points="200,45 202,51 208,51 203,55 205,61 200,57 195,61 197,55 192,51 198,51" fill="#f59e0b" />
        )}

        {/* Feast Table */}
        <rect x="0" y="150" width="400" height="150" fill="#f97316" />
        <rect x="0" y="145" width="400" height="12" fill="#ea580c" />
        {/* Table Runner */}
        <rect x="50" y="150" width="300" height="150" fill="#fef3c7" />

        {/* Diff 1: Watermelon Slice (Left) */}
        <g id="watermelon">
          {/* Green Rind */}
          <path d="M 50 240 A 55 55 0 0 1 150 240 Z" fill="#16a34a" />
          {/* Red Flesh */}
          <path d="M 56 238 A 48 48 0 0 1 144 238 Z" fill="#ef4444" />
          {/* Seeds */}
          {variant === "left" && (
            <g fill="#0f172a">
              <ellipse cx="80" cy="225" rx="2" ry="3.5" transform="rotate(-15 80 225)" />
              <ellipse cx="100" cy="220" rx="2" ry="3.5" />
              <ellipse cx="120" cy="225" rx="2" ry="3.5" transform="rotate(15 120 225)" />
              <ellipse cx="90" cy="232" rx="2" ry="3.5" />
              <ellipse cx="110" cy="232" rx="2" ry="3.5" />
            </g>
          )}
        </g>

        {/* Diff 4: Sweet Cupcake (Center) */}
        <g id="cupcake">
          {/* Wrapper */}
          <polygon points="182,245 186,220 214,220 218,245" fill="#f43f5e" />
          {/* Cream Swirl */}
          <path d="M 184 220 Q 200 195 216 220 Z" fill="#fbcfe8" />
          <circle cx="200" cy="202" r="14" fill="#fda4af" />
          {/* Top Decor: Cherry vs Candle */}
          {variant === "left" ? (
            <g>
              <circle cx="200" cy="190" r="5" fill="#e11d48" />
              <path d="M 200 186 Q 208 175 204 172" stroke="#78350f" strokeWidth="1.5" fill="none" />
            </g>
          ) : (
            <g>
              <rect x="198" y="180" width="4" height="12" rx="1" fill="#38bdf8" />
              <circle cx="200" cy="176" r="3" fill="#f59e0b" />
            </g>
          )}
        </g>

        {/* Diff 3: Pizza Slice (Right) */}
        <g id="pizza">
          {/* Crust & Sauce */}
          <polygon points="320,180 260,250 330,250" fill="#f59e0b" />
          <polygon points="314,188 268,246 324,246" fill="#fbbf24" />
          {/* Toppings: Green peppers vs Red mushrooms */}
          {variant === "left" ? (
            // Green peppers
            <g stroke="#15803d" strokeWidth="3" fill="none">
              <path d="M 295 210 Q 302 215 305 210" />
              <path d="M 285 235 Q 290 240 295 235" />
              <path d="M 310 230 Q 315 235 320 230" />
            </g>
          ) : (
            // Red mushrooms
            <g fill="#ef4444">
              <circle cx="298" cy="212" r="4.5" />
              <rect x="296" y="215" width="4" height="4" fill="#fef08a" />
              <circle cx="288" cy="235" r="4.5" />
              <rect x="286" y="238" width="4" height="4" fill="#fef08a" />
              <circle cx="314" cy="232" r="4.5" />
              <rect x="312" y="235" width="4" height="4" fill="#fef08a" />
            </g>
          )}
        </g>
      </svg>
    )
  },

  // --- SCENE 3: SPACE & COSMIC PLANETS ---
  {
    id: "space-galaxy",
    category: "space",
    categoryIcon: "🪐",
    title: "Cosmic Space & Planets",
    subtitle: "Spot 5 differences in outer space exploration!",
    differences: [
      {
        id: "d1",
        name: "Saturn's Rings",
        description: "Planet Saturn has majestic rings on the left, but is missing rings on the right!",
        x: 22,
        y: 35,
        radius: 14
      },
      {
        id: "d2",
        name: "Alien Friend Eyes",
        description: "The cute green alien has 2 big eyes on the left, but 3 eyes on the right!",
        x: 82,
        y: 42,
        radius: 14
      },
      {
        id: "d3",
        name: "Rocket Fin Color",
        description: "The rocket fins are fiery red on the left, but cosmic purple on the right!",
        x: 50,
        y: 50,
        radius: 14
      },
      {
        id: "d4",
        name: "Astronaut Helmet Badge",
        description: "The astronaut's space helmet has an Earth flag badge on the right!",
        x: 25,
        y: 78,
        radius: 14
      },
      {
        id: "d5",
        name: "Shooting Comet Tail",
        description: "The blazing shooting comet has a cyan trail on left, but golden trail on right!",
        x: 80,
        y: 15,
        radius: 13
      }
    ],
    renderScene: (variant: "left" | "right", foundIds: string[]) => (
      <svg viewBox="0 0 400 300" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`spaceGrad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#090a0f" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Space Cosmos Background */}
        <rect width="400" height="300" fill={`url(#spaceGrad-${variant})`} />

        {/* Stars */}
        <circle cx="50" cy="40" r="1.5" fill="#ffffff" />
        <circle cx="120" cy="20" r="2" fill="#ffffff" />
        <circle cx="180" cy="45" r="1" fill="#ffffff" />
        <circle cx="280" cy="30" r="2" fill="#ffffff" />
        <circle cx="360" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="140" cy="150" r="1" fill="#ffffff" />
        <circle cx="380" cy="180" r="1.5" fill="#ffffff" />

        {/* Diff 5: Shooting Comet */}
        <g id="comet">
          <circle cx="330" cy="40" r="5" fill="#ffffff" />
          {variant === "left" ? (
            <line x1="330" y1="40" x2="365" y2="25" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <line x1="330" y1="40" x2="365" y2="25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* Diff 1: Saturn (Left) */}
        <g id="saturn">
          <circle cx="85" cy="90" r="26" fill="#eab308" />
          <circle cx="85" cy="90" r="23" fill="#facc15" />
          {/* Ring (Only on left scene!) */}
          {variant === "left" && (
            <ellipse cx="85" cy="90" rx="46" ry="12" fill="none" stroke="#fef08a" strokeWidth="4" transform="rotate(-20 85 90)" />
          )}
        </g>

        {/* Diff 3: Big Center Rocket */}
        <g id="rocket" transform="translate(160, 90)">
          {/* Booster Flame */}
          <polygon points="35,110 40,135 45,110" fill="#f97316" />
          <polygon points="38,110 40,128 42,110" fill="#fde047" />
          {/* Rocket Body */}
          <rect x="25" y="30" width="30" height="75" rx="15" fill="#f8fafc" />
          {/* Nose Cone */}
          <path d="M 25 35 C 25 5 55 5 55 35 Z" fill="#ef4444" />
          {/* Porothole Window */}
          <circle cx="40" cy="55" r="9" fill="#0284c7" stroke="#94a3b8" strokeWidth="2.5" />
          {/* Rocket Fins: Red on left vs Purple on right */}
          <polygon 
            points="25,85 10,110 25,105" 
            fill={variant === "left" ? "#ef4444" : "#a855f7"} 
          />
          <polygon 
            points="55,85 70,110 55,105" 
            fill={variant === "left" ? "#ef4444" : "#a855f7"} 
          />
        </g>

        {/* Diff 2: Cute Alien in Flying Saucer (Right) */}
        <g id="alien" transform="translate(290, 80)">
          {/* Glass Dome */}
          <ellipse cx="40" cy="35" rx="24" ry="20" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Alien Body */}
          <circle cx="40" cy="35" r="14" fill="#22c55e" />
          {/* Alien Eyes: 2 vs 3 */}
          {variant === "left" ? (
            <>
              <circle cx="35" cy="32" r="3.5" fill="#ffffff" />
              <circle cx="35" cy="32" r="1.5" fill="#0f172a" />
              <circle cx="45" cy="32" r="3.5" fill="#ffffff" />
              <circle cx="45" cy="32" r="1.5" fill="#0f172a" />
            </>
          ) : (
            <>
              <circle cx="32" cy="33" r="3" fill="#ffffff" />
              <circle cx="32" cy="33" r="1.5" fill="#0f172a" />
              <circle cx="40" cy="27" r="3" fill="#ffffff" />
              <circle cx="40" cy="27" r="1.5" fill="#0f172a" />
              <circle cx="48" cy="33" r="3" fill="#ffffff" />
              <circle cx="48" cy="33" r="1.5" fill="#0f172a" />
            </>
          )}
          {/* Saucer Base */}
          <ellipse cx="40" cy="50" rx="36" ry="12" fill="#64748b" />
          <ellipse cx="40" cy="48" rx="32" ry="8" fill="#94a3b8" />
          {/* Saucer Glow Lights */}
          <circle cx="20" cy="50" r="2.5" fill="#facc15" />
          <circle cx="32" cy="52" r="2.5" fill="#facc15" />
          <circle cx="48" cy="52" r="2.5" fill="#facc15" />
          <circle cx="60" cy="50" r="2.5" fill="#facc15" />
        </g>

        {/* Diff 4: Spacewalk Astronaut (Bottom Left) */}
        <g id="astronaut" transform="translate(60, 200)">
          {/* Suit */}
          <rect x="25" y="40" width="30" height="38" rx="8" fill="#e2e8f0" />
          {/* Helmet */}
          <circle cx="40" cy="25" r="18" fill="#f8fafc" />
          <ellipse cx="40" cy="25" rx="13" ry="10" fill="#fbbf24" />
          {/* Diff 4 Badge on Helmet: Right side has Earth flag badge */}
          {variant === "right" && (
            <circle cx="49" cy="18" r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
          )}
        </g>

        {/* Distant Planet Earth in background */}
        <circle cx="330" cy="250" r="35" fill="#3b82f6" />
        <path d="M 310 240 Q 325 230 335 245 T 350 260" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    )
  }
];

export default function SpotTheDifferenceGame() {
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [foundDifferences, setFoundDifferences] = useState<string[]>([]);
  const [lastFound, setLastFound] = useState<DifferenceHotspot | null>(null);
  const [misses, setMisses] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hintsLeft, setHintsLeft] = useState<number>(2);
  const [hintedId, setHintedId] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [clickFeedback, setClickFeedback] = useState<{ x: number; y: number; isHit: boolean } | null>(null);

  const currentScene = SCENES[sceneIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initScene = (idx: number) => {
    setSceneIndex(idx);
    setFoundDifferences([]);
    setLastFound(null);
    setMisses(0);
    setSeconds(0);
    setHintsLeft(2);
    setHintedId(null);
    setIsGameOver(false);
    setClickFeedback(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  useEffect(() => {
    initScene(sceneIndex);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sceneIndex]);

  const handlePanelClick = (
    e: React.MouseEvent<HTMLDivElement>, 
    side: "left" | "right"
  ) => {
    if (isGameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    let hit: DifferenceHotspot | null = null;

    for (const diff of currentScene.differences) {
      if (foundDifferences.includes(diff.id)) continue;
      const dist = Math.hypot(clickXPercent - diff.x, clickYPercent - diff.y);
      if (dist <= diff.radius) {
        hit = diff;
        break;
      }
    }

    if (hit) {
      const newFound = [...foundDifferences, hit.id];
      setFoundDifferences(newFound);
      setLastFound(hit);
      setHintedId(null);
      if (soundEnabled) playSound("success");

      setClickFeedback({ x: hit.x, y: hit.y, isHit: true });
      setTimeout(() => setClickFeedback(null), 1200);

      if (newFound.length === currentScene.differences.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsGameOver(true);
        if (soundEnabled) playSound("win");
      }
    } else {
      setMisses((m) => m + 1);
      if (soundEnabled) playSound("wrong");
      setClickFeedback({ x: clickXPercent, y: clickYPercent, isHit: false });
      setTimeout(() => setClickFeedback(null), 800);
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0 || isGameOver) return;
    const unfound = currentScene.differences.filter((d) => !foundDifferences.includes(d.id));
    if (unfound.length === 0) return;

    const randomTarget = unfound[Math.floor(Math.random() * unfound.length)];
    setHintedId(randomTarget.id);
    setHintsLeft((h) => h - 1);
    if (soundEnabled) playSound("sparkle");

    setTimeout(() => {
      setHintedId(null);
    }, 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto">
      {/* Top Header & Scene Topic Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span>{currentScene.categoryIcon}</span> {currentScene.title}
          </h3>
          <p className="text-xs text-slate-500 font-semibold">{currentScene.subtitle}</p>
        </div>

        {/* Scene Topics selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => initScene(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                sceneIndex === idx
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{scene.categoryIcon}</span>
              <span>{scene.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || isGameOver}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
              hintsLeft > 0
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
            title="Highlight 1 difference for 3 seconds"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hint ({hintsLeft})</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => initScene(sceneIndex)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Differences Found</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">
            {foundDifferences.length}{" "}
            <span className="text-xs sm:text-sm font-normal text-indigo-600">
              / {currentScene.differences.length}
            </span>
          </span>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-purple-500 tracking-wider">Accuracy</span>
          <span className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">
            {misses === 0 ? "100%" : `${Math.max(20, 100 - misses * 10)}%`}
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Time</span>
          <div className="flex items-center gap-1 text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{formatTime(seconds)}</span>
          </div>
        </div>
      </div>

      {/* Large Side-by-Side Comparison Canvas for Big Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Left Picture */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🖼️</span> Original Image
            </span>
            <span className="text-xs text-slate-400 font-semibold">Click to spot</span>
          </div>

          <div
            onClick={(e) => handlePanelClick(e, "left")}
            className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border-3 border-indigo-200 shadow-lg cursor-crosshair bg-slate-900"
          >
            {currentScene.renderScene("left", foundDifferences)}

            {/* Found Rings on Left */}
            {currentScene.differences.map((diff) => {
              const isFound = foundDifferences.includes(diff.id);
              const isHinted = hintedId === diff.id;
              if (!isFound && !isHinted) return null;

              return (
                <div
                  key={diff.id}
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    width: `${diff.radius * 2}%`,
                    height: `${diff.radius * 2}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
                    isFound
                      ? "border-4 border-emerald-400 bg-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.9)] animate-pulse"
                      : "border-4 border-amber-400 bg-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-bounce"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Right Picture */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔍</span> Modified Image
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Find {currentScene.differences.length - foundDifferences.length} more
            </span>
          </div>

          <div
            onClick={(e) => handlePanelClick(e, "right")}
            className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border-3 border-purple-200 shadow-lg cursor-crosshair bg-slate-900"
          >
            {currentScene.renderScene("right", foundDifferences)}

            {/* Found Rings on Right */}
            {currentScene.differences.map((diff) => {
              const isFound = foundDifferences.includes(diff.id);
              const isHinted = hintedId === diff.id;
              if (!isFound && !isHinted) return null;

              return (
                <div
                  key={diff.id}
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    width: `${diff.radius * 2}%`,
                    height: `${diff.radius * 2}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
                    isFound
                      ? "border-4 border-emerald-400 bg-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.9)] animate-pulse"
                      : "border-4 border-amber-400 bg-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-bounce"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Discovery Checklist */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Clues & Discoveries
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentScene.differences.map((diff, index) => {
            const isFound = foundDifferences.includes(diff.id);
            return (
              <div
                key={diff.id}
                className={`p-3 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                  isFound
                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-medium"
                    : "bg-slate-50/70 border-slate-200 text-slate-400"
                }`}
              >
                <div className="mt-0.5">
                  {isFound ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-black text-xs sm:text-sm">
                    {isFound ? diff.name : `Difference #${index + 1}`}
                  </div>
                  {isFound && (
                    <div className="text-xs text-emerald-700/90 mt-0.5 leading-snug">
                      {diff.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Victory Celebration */}
      {isGameOver && (
        <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
            <Trophy className="w-10 h-10 text-yellow-300 animate-bounce" />
          </div>

          <h3 className="text-3xl font-black mb-1">Eagle Eyes! Outstanding!</h3>
          <p className="text-white/80 text-sm max-w-sm mb-5">
            You spotted all {currentScene.differences.length} differences in{" "}
            <span className="font-bold text-white">{formatTime(seconds)}</span> with only {misses} miss{misses === 1 ? "" : "es"}!
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => initScene(sceneIndex)}
              className="px-6 py-3 bg-white text-indigo-700 hover:bg-white/90 rounded-2xl font-black text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Replay Scene
            </button>
            {sceneIndex < SCENES.length - 1 && (
              <button
                onClick={() => initScene(sceneIndex + 1)}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 rounded-2xl font-black text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                Next Topic Scene
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
