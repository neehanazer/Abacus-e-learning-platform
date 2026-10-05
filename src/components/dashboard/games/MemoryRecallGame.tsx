"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Timer,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Eye,
  Brain,
  Star,
  ChevronRight,
  Smile,
  Volume1,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playSound } from "./soundEffects";

// Category Definitions
export type MemoryCategory =
  | "fruits"
  | "vegetables"
  | "animals"
  | "vehicles"
  | "space"
  | "treats";

export interface ItemData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hint: string;
}

export type Difficulty = "easy" | "medium" | "hard" | "genius";

interface DifficultyConfig {
  itemsCount: number;
  distractorsCount: number;
  memorizeSeconds: number;
  label: string;
  badge: string;
}

const DIFFICULTY_MAP: Record<Difficulty, DifficultyConfig> = {
  easy: {
    itemsCount: 4,
    distractorsCount: 4,
    memorizeSeconds: 12,
    label: "Junior Explorer",
    badge: "4 Items",
  },
  medium: {
    itemsCount: 6,
    distractorsCount: 6,
    memorizeSeconds: 15,
    label: "Smart Champ",
    badge: "6 Items",
  },
  hard: {
    itemsCount: 8,
    distractorsCount: 8,
    memorizeSeconds: 18,
    label: "Brain Wizard",
    badge: "8 Items",
  },
  genius: {
    itemsCount: 10,
    distractorsCount: 10,
    memorizeSeconds: 22,
    label: "Memory Legend",
    badge: "10 Items",
  },
};

// Rich items catalog for all categories
export const CATEGORY_ITEMS: Record<MemoryCategory, { title: string; icon: string; items: ItemData[] }> = {
  fruits: {
    title: "Fruits Frenzy",
    icon: "🍎",
    items: [
      { id: "f_apple", name: "Apple", emoji: "🍎", color: "#EF4444", bgColor: "bg-red-50", borderColor: "border-red-200", hint: "Crisp red or green orchard fruit" },
      { id: "f_banana", name: "Banana", emoji: "🍌", color: "#EAB308", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Yellow curved tropical treat" },
      { id: "f_mango", name: "Mango", emoji: "🥭", color: "#F59E0B", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "The king of juicy summer fruits" },
      { id: "f_strawberry", name: "Strawberry", emoji: "🍓", color: "#F43F5E", bgColor: "bg-rose-50", borderColor: "border-rose-200", hint: "Red sweet berry with tiny seeds" },
      { id: "f_watermelon", name: "Watermelon", emoji: "🍉", color: "#10B981", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hint: "Green rind with juicy pink inside" },
      { id: "f_orange", name: "Orange", emoji: "🍊", color: "#F97316", bgColor: "bg-orange-50", borderColor: "border-orange-200", hint: "Citrus burst full of Vitamin C" },
      { id: "f_grapes", name: "Grapes", emoji: "🍇", color: "#8B5CF6", bgColor: "bg-purple-50", borderColor: "border-purple-200", hint: "Bunch of purple or green bites" },
      { id: "f_pineapple", name: "Pineapple", emoji: "🍍", color: "#D97706", bgColor: "bg-yellow-50", borderColor: "border-yellow-300", hint: "Spiky crown with sweet golden slices" },
      { id: "f_kiwi", name: "Kiwi", emoji: "🥝", color: "#84CC16", bgColor: "bg-lime-50", borderColor: "border-lime-200", hint: "Fuzzy outside, bright green inside" },
      { id: "f_cherry", name: "Cherries", emoji: "🍒", color: "#DC2626", bgColor: "bg-red-50", borderColor: "border-red-300", hint: "Twin shiny red berries on a stem" },
      { id: "f_peach", name: "Peach", emoji: "🍑", color: "#FB923C", bgColor: "bg-orange-50", borderColor: "border-orange-200", hint: "Soft fuzzy fruit with sweet pink flesh" },
      { id: "f_avocado", name: "Avocado", emoji: "🥑", color: "#65A30D", bgColor: "bg-lime-50", borderColor: "border-lime-300", hint: "Creamy green fruit with a round pit" },
      { id: "f_lemon", name: "Lemon", emoji: "🍋", color: "#FACC15", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Zesty sour yellow citrus" },
      { id: "f_blueberry", name: "Blueberries", emoji: "🫐", color: "#3B82F6", bgColor: "bg-blue-50", borderColor: "border-blue-200", hint: "Tiny deep blue power berries" },
      { id: "f_coconut", name: "Coconut", emoji: "🥥", color: "#78350F", bgColor: "bg-amber-50", borderColor: "border-amber-300", hint: "Hard brown shell with sweet water" },
      { id: "f_pear", name: "Pear", emoji: "🍐", color: "#A3E635", bgColor: "bg-lime-50", borderColor: "border-lime-200", hint: "Bell-shaped juicy sweet fruit" },
    ],
  },
  vegetables: {
    title: "Veggie Patch",
    icon: "🥕",
    items: [
      { id: "v_carrot", name: "Carrot", emoji: "🥕", color: "#EA580C", bgColor: "bg-orange-50", borderColor: "border-orange-200", hint: "Crunchy orange root bunny favorite" },
      { id: "v_broccoli", name: "Broccoli", emoji: "🥦", color: "#16A34A", bgColor: "bg-green-50", borderColor: "border-green-200", hint: "Looks like a mini green tree" },
      { id: "v_tomato", name: "Tomato", emoji: "🍅", color: "#DC2626", bgColor: "bg-red-50", borderColor: "border-red-200", hint: "Plump red garden jewel for salads" },
      { id: "v_potato", name: "Potato", emoji: "🥔", color: "#B45309", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Earth's golden spud for fries & mash" },
      { id: "v_corn", name: "Sweet Corn", emoji: "🌽", color: "#EAB308", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Golden kernels on a cob" },
      { id: "v_eggplant", name: "Eggplant", emoji: "🍆", color: "#7E22CE", bgColor: "bg-purple-50", borderColor: "border-purple-200", hint: "Glossy purple vegetable called aubergine" },
      { id: "v_cucumber", name: "Cucumber", emoji: "🥒", color: "#15803D", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hint: "Cool and crisp refreshing green slice" },
      { id: "v_pepper", name: "Bell Pepper", emoji: "🫑", color: "#16A34A", bgColor: "bg-green-50", borderColor: "border-green-300", hint: "Sweet crunchy bell-shaped pepper" },
      { id: "v_pumpkin", name: "Pumpkin", emoji: "🎃", color: "#F97316", bgColor: "bg-orange-50", borderColor: "border-orange-300", hint: "Giant orange autumn squash" },
      { id: "v_mushroom", name: "Mushroom", emoji: "🍄", color: "#DC2626", bgColor: "bg-rose-50", borderColor: "border-rose-200", hint: "Fun little umbrella with spots" },
      { id: "v_peas", name: "Green Peas", emoji: "🫛", color: "#22C55E", bgColor: "bg-green-50", borderColor: "border-green-200", hint: "Little sweet green pearls in a pod" },
      { id: "v_onion", name: "Onion", emoji: "🧅", color: "#A855F7", bgColor: "bg-purple-50", borderColor: "border-purple-200", hint: "Layered bulb that brings savory flavor" },
      { id: "v_garlic", name: "Garlic", emoji: "🧄", color: "#64748B", bgColor: "bg-slate-50", borderColor: "border-slate-200", hint: "Aromatic bulb with tasty cloves" },
      { id: "v_radish", name: "Radish", emoji: "🌱", color: "#E11D48", bgColor: "bg-rose-50", borderColor: "border-rose-200", hint: "Peppery crunchy pink root" },
      { id: "v_cabbage", name: "Cabbage", emoji: "🥬", color: "#10B981", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hint: "Dense round head of green leaves" },
      { id: "v_chili", name: "Red Chili", emoji: "🌶️", color: "#EF4444", bgColor: "bg-red-50", borderColor: "border-red-200", hint: "Spicy fiery red pepper" },
    ],
  },
  animals: {
    title: "Animal Safari",
    icon: "🦁",
    items: [
      { id: "a_lion", name: "Lion", emoji: "🦁", color: "#D97706", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Mighty king of the savanna with a mane" },
      { id: "a_elephant", name: "Elephant", emoji: "🐘", color: "#475569", bgColor: "bg-slate-50", borderColor: "border-slate-300", hint: "Gentle giant with a long trunk" },
      { id: "a_giraffe", name: "Giraffe", emoji: "🦒", color: "#CA8A04", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Tallest animal reaching top tree leaves" },
      { id: "a_panda", name: "Panda", emoji: "🐼", color: "#0F172A", bgColor: "bg-slate-50", borderColor: "border-slate-300", hint: "Cute black & white bamboo muncher" },
      { id: "a_monkey", name: "Monkey", emoji: "🐵", color: "#B45309", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Playful tree climber loving bananas" },
      { id: "a_tiger", name: "Tiger", emoji: "🐯", color: "#EA580C", bgColor: "bg-orange-50", borderColor: "border-orange-200", hint: "Big cat with fiery orange stripes" },
      { id: "a_zebra", name: "Zebra", emoji: "🦓", color: "#334155", bgColor: "bg-slate-50", borderColor: "border-slate-200", hint: "Striped black & white herd runner" },
      { id: "a_kangaroo", name: "Kangaroo", emoji: "🦘", color: "#D97706", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Aussie jumper with a pouch for joey" },
      { id: "a_koala", name: "Koala", emoji: "🐨", color: "#64748B", bgColor: "bg-slate-50", borderColor: "border-slate-200", hint: "Fluffy tree hugger eating eucalyptus" },
      { id: "a_dolphin", name: "Dolphin", emoji: "🐬", color: "#0284C7", bgColor: "bg-sky-50", borderColor: "border-sky-200", hint: "Smart ocean swimmer performing leaps" },
      { id: "a_fox", name: "Red Fox", emoji: "🦊", color: "#F97316", bgColor: "bg-orange-50", borderColor: "border-orange-200", hint: "Clever forest friend with a bushy tail" },
      { id: "a_rabbit", name: "Rabbit", emoji: "🐰", color: "#EC4899", bgColor: "bg-pink-50", borderColor: "border-pink-200", hint: "Hop hop hopper with long soft ears" },
      { id: "a_penguin", name: "Penguin", emoji: "🐧", color: "#0284C7", bgColor: "bg-sky-50", borderColor: "border-sky-200", hint: "Waddling bird in a tuxedo swimming in ice" },
      { id: "a_bear", name: "Brown Bear", emoji: "🐻", color: "#78350F", bgColor: "bg-amber-50", borderColor: "border-amber-300", hint: "Big furry creature loving sweet honey" },
      { id: "a_hippo", name: "Hippo", emoji: "🦛", color: "#64748B", bgColor: "bg-slate-50", borderColor: "border-slate-200", hint: "Heavy river swimmer with big yawning teeth" },
      { id: "a_owl", name: "Wise Owl", emoji: "🦉", color: "#B45309", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Night bird turning head with big eyes" },
    ],
  },
  vehicles: {
    title: "Vehicles on the Move",
    icon: "🚗",
    items: [
      { id: "vh_car", name: "Red Sports Car", emoji: "🚗", color: "#EF4444", bgColor: "bg-red-50", borderColor: "border-red-200", hint: "Four wheels cruising down the street" },
      { id: "vh_airplane", name: "Airplane", emoji: "✈️", color: "#0284C7", bgColor: "bg-sky-50", borderColor: "border-sky-200", hint: "High flyer soaring above the clouds" },
      { id: "vh_rocket", name: "Rocket Ship", emoji: "🚀", color: "#DC2626", bgColor: "bg-rose-50", borderColor: "border-rose-200", hint: "3, 2, 1 blast off into outer space!" },
      { id: "vh_bicycle", name: "Bicycle", emoji: "🚲", color: "#16A34A", bgColor: "bg-green-50", borderColor: "border-green-200", hint: "Pedal-powered two-wheel green ride" },
      { id: "vh_train", name: "Bullet Train", emoji: "🚅", color: "#2563EB", bgColor: "bg-blue-50", borderColor: "border-blue-200", hint: "Choo-choo on high-speed rail tracks" },
      { id: "vh_boat", name: "Speedboat", emoji: "🚤", color: "#0891B2", bgColor: "bg-cyan-50", borderColor: "border-cyan-200", hint: "Splashing through waves on open seas" },
      { id: "vh_helicopter", name: "Helicopter", emoji: "🚁", color: "#EA580C", bgColor: "bg-orange-50", borderColor: "border-orange-200", hint: "Spinning rotor blades hovering in air" },
      { id: "vh_schoolbus", name: "School Bus", emoji: "🚌", color: "#EAB308", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Bright yellow bus taking kids to class" },
      { id: "vh_firetruck", name: "Fire Truck", emoji: "🚒", color: "#DC2626", bgColor: "bg-red-50", borderColor: "border-red-300", hint: "Siren blaring with ladder & hose" },
      { id: "vh_police", name: "Police Car", emoji: "🚓", color: "#1E40AF", bgColor: "bg-blue-50", borderColor: "border-blue-300", hint: "Flashing blue lights keeping town safe" },
      { id: "vh_submarine", name: "Submarine", emoji: "🤿", color: "#0284C7", bgColor: "bg-sky-50", borderColor: "border-sky-300", hint: "Underwater vessel exploring the deep" },
      { id: "vh_tractor", name: "Farm Tractor", emoji: "🚜", color: "#16A34A", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hint: "Big back wheels plowing fertile fields" },
      { id: "vh_motorcycle", name: "Motorcycle", emoji: "🏍️", color: "#D97706", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Speedy two-wheeler with a roaring engine" },
      { id: "vh_ambulance", name: "Ambulance", emoji: "🚑", color: "#EF4444", bgColor: "bg-rose-50", borderColor: "border-rose-200", hint: "Emergency hero vehicle rushing to hospital" },
      { id: "vh_balloon", name: "Hot Air Balloon", emoji: "🎈", color: "#F43F5E", bgColor: "bg-pink-50", borderColor: "border-pink-200", hint: "Floating gently high above mountains" },
      { id: "vh_truck", name: "Monster Truck", emoji: "🚚", color: "#475569", bgColor: "bg-slate-50", borderColor: "border-slate-200", hint: "Carrying big cargo boxes across the state" },
    ],
  },
  space: {
    title: "Cosmic Space",
    icon: "🪐",
    items: [
      { id: "s_sun", name: "Golden Sun", emoji: "☀️", color: "#EAB308", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Our brilliant star warming the planets" },
      { id: "s_moon", name: "Glowing Moon", emoji: "🌕", color: "#CA8A04", bgColor: "bg-yellow-50", borderColor: "border-yellow-100", hint: "Night lantern with craters" },
      { id: "s_earth", name: "Planet Earth", emoji: "🌍", color: "#0284C7", bgColor: "bg-blue-50", borderColor: "border-blue-200", hint: "Our blue marble home with blue oceans" },
      { id: "s_mars", name: "Red Mars", emoji: "🔴", color: "#EF4444", bgColor: "bg-red-50", borderColor: "border-red-200", hint: "The dusty red planet explored by rovers" },
      { id: "s_saturn", name: "Saturn Rings", emoji: "🪐", color: "#D97706", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Giant gas planet with sparkling rings" },
      { id: "s_star", name: "Shooting Star", emoji: "⭐", color: "#F59E0B", bgColor: "bg-amber-50", borderColor: "border-amber-100", hint: "Wish upon this glowing cosmic spark" },
      { id: "s_astronaut", name: "Astronaut", emoji: "👨‍🚀", color: "#64748B", bgColor: "bg-slate-50", borderColor: "border-slate-200", hint: "Space walker floating in zero gravity" },
      { id: "s_ufo", name: "Alien UFO", emoji: "🛸", color: "#10B981", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hint: "Flying saucer from distant star systems" },
      { id: "s_telescope", name: "Telescope", emoji: "🔭", color: "#3B82F6", bgColor: "bg-sky-50", borderColor: "border-sky-200", hint: "Looking deep into galaxies far away" },
      { id: "s_comet", name: "Icy Comet", emoji: "☄️", color: "#06B6D4", bgColor: "bg-cyan-50", borderColor: "border-cyan-200", hint: "Speeding rock with a burning glowing tail" },
      { id: "s_alien", name: "Friendly Alien", emoji: "👽", color: "#10B981", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hint: "Cosmic green pal with big eyes" },
      { id: "s_satellite", name: "Satellite", emoji: "🛰️", color: "#475569", bgColor: "bg-slate-50", borderColor: "border-slate-300", hint: "Orbiting station beaming signals down" },
    ],
  },
  treats: {
    title: "Sweet Treats & Bakery",
    icon: "🧁",
    items: [
      { id: "t_cupcake", name: "Vanilla Cupcake", emoji: "🧁", color: "#EC4899", bgColor: "bg-pink-50", borderColor: "border-pink-200", hint: "Frosted cake with sprinkles on top" },
      { id: "t_donut", name: "Glazed Donut", emoji: "🍩", color: "#D97706", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Round ring with sweet pink glaze" },
      { id: "t_icecream", name: "Ice Cream Cone", emoji: "🍦", color: "#F59E0B", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Cold swirling soft-serve scoop" },
      { id: "t_cookie", name: "Choco Cookie", emoji: "🍪", color: "#B45309", bgColor: "bg-amber-50", borderColor: "border-amber-300", hint: "Freshly baked with chocolate chips" },
      { id: "t_cake", name: "Birthday Cake", emoji: "🎂", color: "#F43F5E", bgColor: "bg-rose-50", borderColor: "border-rose-200", hint: "Layers of icing with party candles" },
      { id: "t_lollipop", name: "Swirl Lollipop", emoji: "🍭", color: "#A855F7", bgColor: "bg-purple-50", borderColor: "border-purple-200", hint: "Candy spiral on a stick" },
      { id: "t_pancake", name: "Stack of Pancakes", emoji: "🥞", color: "#D97706", bgColor: "bg-amber-50", borderColor: "border-amber-200", hint: "Fluffy breakfast stack with syrup & butter" },
      { id: "t_waffle", name: "Crispy Waffle", emoji: "🧇", color: "#F59E0B", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Golden checkered Belgian morning treat" },
      { id: "t_chocolate", name: "Chocolate Bar", emoji: "🍫", color: "#78350F", bgColor: "bg-amber-50", borderColor: "border-amber-300", hint: "Snap a square of cocoa goodness" },
      { id: "t_croissant", name: "Butter Croissant", emoji: "🥐", color: "#CA8A04", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Flaky golden French crescent pastry" },
      { id: "t_popcorn", name: "Movie Popcorn", emoji: "🍿", color: "#EAB308", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hint: "Buttery popped kernels in a bucket" },
      { id: "t_candy", name: "Sweet Candy", emoji: "🍬", color: "#EC4899", bgColor: "bg-pink-50", borderColor: "border-pink-200", hint: "Wrapped chewy fruit toffee" },
    ],
  },
};

interface MemoryRecallGameProps {
  onBack?: () => void;
}

export default function MemoryRecallGame({ onBack }: MemoryRecallGameProps) {
  // Category & Difficulty
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory>("fruits");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  // Game Phases: "memorize" | "recall" | "victory"
  const [phase, setPhase] = useState<"memorize" | "recall" | "victory">("memorize");

  // Items for the current round
  const [targetItems, setTargetItems] = useState<ItemData[]>([]);
  const [choiceItems, setChoiceItems] = useState<ItemData[]>([]);
  const [recalledIds, setRecalledIds] = useState<string[]>([]);
  const [wrongClickId, setWrongClickId] = useState<string | null>(null);

  // Timer & Stats
  const [timeLeft, setTimeLeft] = useState<number>(DIFFICULTY_MAP.easy.memorizeSeconds);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [hintsRemaining, setHintsRemaining] = useState<number>(2);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("Take your time to memorize all items on the tray!");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Text-To-Speech helper
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Friendly kid-pitched voice
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech fallback
    }
  }, [voiceEnabled]);

  // Audio effect wrapper
  const triggerSound = useCallback((type: "pop" | "success" | "wrong" | "flip" | "win" | "sparkle") => {
    if (soundEnabled) {
      playSound(type);
    }
  }, [soundEnabled]);

  // Start / Reset Round
  const startRound = useCallback((catKey: MemoryCategory, diffKey: Difficulty) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const cfg = DIFFICULTY_MAP[diffKey];
    const pool = [...CATEGORY_ITEMS[catKey].items];

    // Shuffle pool
    const shuffledPool = pool.sort(() => Math.random() - 0.5);

    // Pick target items
    const targets = shuffledPool.slice(0, cfg.itemsCount);

    // Pick distractors from remaining
    const remaining = shuffledPool.slice(cfg.itemsCount);
    const distractors = remaining.slice(0, cfg.distractorsCount);

    // Combine & shuffle choices for the recall phase
    const allChoices = [...targets, ...distractors].sort(() => Math.random() - 0.5);

    setTargetItems(targets);
    setChoiceItems(allChoices);
    setRecalledIds([]);
    setWrongClickId(null);
    setMistakes(0);
    setHintsRemaining(2);
    setActiveHint(null);
    setTimeLeft(cfg.memorizeSeconds);
    setPhase("memorize");
    setFeedbackMessage(`Memorize these ${targets.length} ${CATEGORY_ITEMS[catKey].title.toLowerCase()} before time runs out!`);

    triggerSound("pop");
    speak(`Memorize these items!`);
  }, [triggerSound, speak]);

  // Initial load
  useEffect(() => {
    startRound(selectedCategory, difficulty);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedCategory, difficulty, startRound]);

  // Memorization Phase Timer
  useEffect(() => {
    if (phase !== "memorize") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Automatically transition to recall phase
          setPhase("recall");
          triggerSound("flip");
          speak("Now, name them all!");
          setFeedbackMessage("Tap each item you remember from the tray!");
          return 0;
        }
        if (prev === 4) {
          triggerSound("pop");
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, triggerSound, speak]);

  // Manual "I'm Ready!" skip button to jump straight to recall
  const handleReadyNow = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("recall");
    triggerSound("flip");
    speak("Awesome! Name them all!");
    setFeedbackMessage("Which items were on the tray? Tap them below!");
  };

  // Item click during Recall Phase
  const handleChoiceClick = (item: ItemData) => {
    if (phase !== "recall") return;
    if (recalledIds.includes(item.id)) return; // Already picked

    const isTarget = targetItems.some((t) => t.id === item.id);

    if (isTarget) {
      // Correct match!
      const newRecalled = [...recalledIds, item.id];
      setRecalledIds(newRecalled);
      setStreak((s) => s + 1);
      setScore((sc) => sc + 100 + streak * 20);
      triggerSound("success");
      speak(item.name);
      setFeedbackMessage(`Super! You remembered ${item.name}! ✨`);

      // Check if all found!
      if (newRecalled.length === targetItems.length) {
        setTimeout(() => {
          setPhase("victory");
          triggerSound("win");
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          speak(`Hooray! You remembered all of them!`);
        }, 500);
      }
    } else {
      // Distractor clicked (wrong!)
      setWrongClickId(item.id);
      setMistakes((m) => m + 1);
      setStreak(0);
      triggerSound("wrong");
      speak(`Oops! Not on the tray`);
      setFeedbackMessage(`Oops! ${item.name} wasn't on the tray. Look closely!`);

      setTimeout(() => {
        setWrongClickId(null);
      }, 700);
    }
  };

  // Hint button handler
  const handleUseHint = () => {
    if (hintsRemaining <= 0 || phase !== "recall") return;
    const remainingTargets = targetItems.filter((t) => !recalledIds.includes(t.id));
    if (remainingTargets.length === 0) return;

    // Pick one unfound target to give hint
    const hintTarget = remainingTargets[0];
    setHintsRemaining((h) => h - 1);
    setActiveHint(`Clue: Look for an item that starts with "${hintTarget.name.charAt(0)}" (${hintTarget.hint})`);
    triggerSound("sparkle");
    speak(`Look for something starting with ${hintTarget.name.charAt(0)}`);
  };

  // Calculate victory stars (3 stars = 0 mistakes, 2 stars = 1-2 mistakes, 1 star = 3+)
  const starsEarned = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls Ribbon */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 mb-6 bg-slate-50/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-sm">
        {/* Categories Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(Object.keys(CATEGORY_ITEMS) as MemoryCategory[]).map((catKey) => {
            const cat = CATEGORY_ITEMS[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Difficulty Selector & Sound / Voice Toggles */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Difficulty Chips */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {(["easy", "medium", "hard", "genius"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2.5 py-1 rounded-xl transition cursor-pointer capitalize ${
                  difficulty === d
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Sound & Speech Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Mute Voice Speech" : "Enable Voice Speech"}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                voiceEnabled
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              <Volume1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-lg font-black text-slate-900">{score}</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Streak</div>
            <div className="text-lg font-black text-slate-900">{streak} 🔥</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Found</div>
            <div className="text-lg font-black text-slate-900">
              {recalledIds.length} / {targetItems.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 font-bold">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {phase === "memorize" ? "Memorize Time" : "Phase"}
            </div>
            <div className="text-lg font-black text-slate-900">
              {phase === "memorize" ? `${timeLeft}s` : phase === "recall" ? "Recall!" : "Solved! ⭐"}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Instruction Banner */}
      <div className="w-full bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 border border-rose-200/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0">
            {phase === "memorize" ? "👀" : phase === "recall" ? "🧠" : "🏆"}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {phase === "memorize"
                ? "Look & Memorize the Tray!"
                : phase === "recall"
                ? "Recall and Name Every Item!"
                : "Marvelous Memory!"}
            </h3>
            <p className="text-xs text-slate-600 font-medium">{feedbackMessage}</p>
          </div>
        </div>

        {phase === "memorize" && (
          <button
            onClick={handleReadyNow}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <span>I Remember! Ready</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {phase === "recall" && hintsRemaining > 0 && (
          <button
            onClick={handleUseHint}
            className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Need a Clue? ({hintsRemaining} left)</span>
          </button>
        )}
      </div>

      {/* Hint Alert if Active */}
      {activeHint && phase === "recall" && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800 font-semibold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{activeHint}</span>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* PHASE 1: MEMORIZATION TRAY (LOOK & REMEMBER)              */}
      {/* ======================================================== */}
      {phase === "memorize" && (
        <div className="w-full flex flex-col items-center">
          {/* Progress bar countdown */}
          <div className="w-full max-w-xl bg-slate-200 h-2.5 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: DIFFICULTY_MAP[difficulty].memorizeSeconds, ease: "linear" }}
            />
          </div>

          {/* The Shutterstock-Style Item Tray */}
          <div className="w-full max-w-4xl bg-gradient-to-b from-white to-slate-50/80 rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-xl relative overflow-hidden">
            {/* Visual Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CATEGORY_ITEMS[selectedCategory].icon}</span>
                <span className="font-black text-slate-800 text-sm sm:text-base tracking-wide">
                  Memory Tray: {CATEGORY_ITEMS[selectedCategory].title}
                </span>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 animate-pulse">
                ⏳ {timeLeft}s remaining
              </span>
            </div>

            {/* Tray Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 justify-center">
              {targetItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => speak(item.name)}
                  className={`p-4 rounded-2xl border-2 ${item.borderColor} ${item.bgColor} shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer group`}
                >
                  <div className="text-4xl sm:text-5xl mb-2 filter drop-shadow-sm group-hover:scale-115 transition-transform duration-200">
                    {item.emoji}
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-tight">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5 group-hover:text-rose-500 transition-colors">
                    🔊 Tap to listen
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Bottom Tray Helper Note */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500 font-medium">
                💡 Tip: Say the names out loud:{" "}
                <span className="font-bold text-slate-700">
                  {targetItems.map((t) => t.name).join(" • ")}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 2: RECALL & NAME ALL OF THEM                       */}
      {/* ======================================================== */}
      {phase === "recall" && (
        <div className="w-full flex flex-col items-center">
          {/* Top Covered Tray: Mystery pedestals being revealed */}
          <div className="w-full max-w-4xl bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl mb-8 relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-rose-400" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                  Memory Board ({recalledIds.length} of {targetItems.length} Unlocked)
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                ⭐ {targetItems.length - recalledIds.length} remaining
              </span>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {targetItems.map((target, idx) => {
                const isFound = recalledIds.includes(target.id);
                return (
                  <div
                    key={target.id}
                    className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                      isFound
                        ? "bg-white text-slate-900 border-emerald-400 shadow-md scale-102"
                        : "bg-slate-800/80 border-slate-700 text-slate-400 border-dashed"
                    }`}
                  >
                    {isFound ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-3xl mb-1">{target.emoji}</span>
                        <span className="text-xs font-black text-slate-800 leading-tight">
                          {target.name}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Found
                        </span>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center opacity-60">
                        <span className="text-2xl mb-1">❓</span>
                        <span className="text-[11px] font-bold text-slate-400">
                          Slot #{idx + 1}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Selection Bank: "Which ones were on the tray? Tap to name!" */}
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg">
            <div className="text-center mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                Interactive Word & Picture Bank
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 mt-2">
                Tap Each Item That Was on the Tray
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Careful! Distractors are mixed in to test your sharp memory!
              </p>
            </div>

            {/* Selection Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {choiceItems.map((choice) => {
                const isRecalled = recalledIds.includes(choice.id);
                const isWrong = wrongClickId === choice.id;

                return (
                  <motion.button
                    key={choice.id}
                    disabled={isRecalled}
                    onClick={() => handleChoiceClick(choice)}
                    whileHover={!isRecalled ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!isRecalled ? { scale: 0.96 } : {}}
                    animate={
                      isWrong
                        ? {
                            x: [-8, 8, -6, 6, -3, 3, 0],
                            transition: { duration: 0.4 },
                          }
                        : {}
                    }
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative ${
                      isRecalled
                        ? "bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed scale-95"
                        : isWrong
                        ? "bg-rose-100 border-rose-500 shadow-md"
                        : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md"
                    }`}
                  >
                    {isRecalled && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-3xl sm:text-4xl mb-1.5 filter drop-shadow-xs">
                      {choice.emoji}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                      {choice.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 3: VICTORY & SUMMARY SCREEN                         */}
      {/* ======================================================== */}
      {phase === "victory" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-2xl text-center flex flex-col items-center"
        >
          {/* Confetti & Trophy Animation */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
            🏆
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 tracking-tight">
            Sensational Memory!
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            You successfully recalled and named all{" "}
            <span className="font-bold text-slate-800">{targetItems.length}</span>{" "}
            {CATEGORY_ITEMS[selectedCategory].title.toLowerCase()}!
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-2 my-5">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-9 h-9 ${
                  starNum <= starsEarned
                    ? "text-amber-400 fill-amber-400 filter drop-shadow-md scale-110"
                    : "text-slate-200 fill-slate-100"
                } transition-all`}
              />
            ))}
          </div>

          {/* Results Summary Grid */}
          <div className="w-full grid grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Score</span>
              <p className="text-lg font-black text-slate-900">+{score} pts</p>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mistakes</span>
              <p className="text-lg font-black text-slate-900">{mistakes}</p>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</span>
              <p className="text-sm font-black text-rose-600 truncate mt-1">
                {CATEGORY_ITEMS[selectedCategory].title}
              </p>
            </div>
          </div>

          {/* Recalled Items Pills Showcase */}
          <div className="w-full mb-8">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              All Items You Successfully Remembered:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {targetItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              onClick={() => startRound(selectedCategory, difficulty)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            {/* Next Category Selector */}
            <button
              onClick={() => {
                const cats = Object.keys(CATEGORY_ITEMS) as MemoryCategory[];
                const currIdx = cats.indexOf(selectedCategory);
                const nextCat = cats[(currIdx + 1) % cats.length];
                setSelectedCategory(nextCat);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Next Category ➔</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Floating Bottom Reset Button */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => startRound(selectedCategory, difficulty)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Current Category</span>
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
          >
            ← Exit Game
          </button>
        )}
      </div>
    </div>
  );
}
