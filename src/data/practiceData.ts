export type QuestionType = "vertical-calc" | "multiple-choice" | "bead-representation" | "single-row" | "multiplication" | "division";

export type RuleType =
  | "direct"
  | "small-friend"
  | "big-friend"
  | "all"
  | "multiplication"
  | "division"
  | "mental";

export interface PracticeQuestion {
  id: string;
  level: number;
  title: string;
  category: string;
  categoryId?: string;
  ruleType: RuleType;
  digits: 1 | 2 | 3 | 4 | 5;
  rowCount: number;
  numbers: number[]; // e.g. [4, 5, -2] or [24, 7] for multiplication
  targetAnswer: number;
  questionType: QuestionType;
  operation?: "+" | "-" | "*" | "/";
  dividend?: number;
  divisor?: number;
  factorA?: number;
  factorB?: number;
  options?: number[]; // For multiple choice
  beadValue?: number;
  ruleHint?: string;
  explanation: string;
}

export interface PracticeAttempt {
  id: string;
  timestamp: number;
  dateFormatted: string;
  level: number;
  categoryTitle: string;
  categoryId?: string;
  ruleType: string;
  rowCount: number;
  digits: number;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  isTimed?: boolean;
  targetMinutes?: number;
  answers: {
    questionId: string;
    questionNumbers: number[];
    operation?: string;
    correctAnswer: number;
    userAnswer: number | null;
    isCorrect: boolean;
    ruleHint?: string;
  }[];
}

export interface PracticeCategoryOption {
  id: string;
  name: string;
  level: number;
  digits: 1 | 2 | 3 | 4 | 5;
  ruleType: RuleType;
  rowCount: number;
  operation?: "+" | "-" | "*" | "/";
  icon: string;
  badge: string;
  description: string;
  color: string;
}

// ============================================================
// EXACT SYLLABUS PRACTICE CATEGORIES (LEVELS 1 TO 8)
// ============================================================
export const PRACTICE_CATEGORIES: PracticeCategoryOption[] = [
  // ------------------------------------------------------------
  // LEVEL 1 (7 Categories)
  // ------------------------------------------------------------
  {
    id: "l1-simple-1digit",
    name: "Simple 1 Digit Calculations (Without Rules)",
    level: 1,
    digits: 1,
    ruleType: "direct",
    rowCount: 2,
    icon: "1️⃣",
    badge: "Level 1 • Direct",
    description: "Direct addition and subtraction on single unit rod without formulas.",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "l1-simple-2digit",
    name: "Simple 2 Digit Calculations (Without Rules)",
    level: 1,
    digits: 2,
    ruleType: "direct",
    rowCount: 2,
    icon: "🔢",
    badge: "Level 1 • Direct 2D",
    description: "Direct calculations across Tens and Units columns simultaneously.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "l1-small-friends",
    name: "Small Friend Rules (+4,+3,+2,+1,-4,-3,-2,-1)",
    level: 1,
    digits: 1,
    ruleType: "small-friend",
    rowCount: 3,
    icon: "🤝",
    badge: "Level 1 • Small Friends",
    description: "Complements to 5 (+4=+5-1, +3=+5-2, -4=-5+1, etc.).",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "l1-big-friends",
    name: "Big Friend Rules (+9..+1, -9..-1)",
    level: 1,
    digits: 1,
    ruleType: "big-friend",
    rowCount: 3,
    icon: "🚀",
    badge: "Level 1 • Big Friends",
    description: "Carrying and borrowing to 10 (+9=-1+10, +8=-2+10, etc.).",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "l1-1digit-3row",
    name: "1 Digit 3 Row Calculation",
    level: 1,
    digits: 1,
    ruleType: "all",
    rowCount: 3,
    icon: "⚡",
    badge: "Level 1 • 3 Rows",
    description: "Rapid 3-row single digit calculations.",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "l1-1digit-5row",
    name: "1 Digit 5 Row Calculation",
    level: 1,
    digits: 1,
    ruleType: "all",
    rowCount: 5,
    icon: "🔥",
    badge: "Level 1 • 5 Rows",
    description: "5-row sequential single digit addition and subtraction.",
    color: "from-orange-400 to-rose-500",
  },
  {
    id: "l1-1digit-7row",
    name: "1 Digit 7 Row Calculation",
    level: 1,
    digits: 1,
    ruleType: "all",
    rowCount: 7,
    icon: "🏆",
    badge: "Level 1 • 7 Rows",
    description: "Championship 7-row single-digit speed and accuracy drills.",
    color: "from-rose-500 to-red-600",
  },

  // ------------------------------------------------------------
  // LEVEL 2 (6 Categories)
  // ------------------------------------------------------------
  {
    id: "l2-1digit-10row",
    name: "1 Digit 10 Row Calculation",
    level: 2,
    digits: 1,
    ruleType: "all",
    rowCount: 10,
    icon: "🔟",
    badge: "Level 2 • 10 Rows",
    description: "10-row continuous single-digit calculation drills.",
    color: "from-sky-400 to-blue-500",
  },
  {
    id: "l2-1digit-12row",
    name: "1 Digit 12 Row Calculation",
    level: 2,
    digits: 1,
    ruleType: "all",
    rowCount: 12,
    icon: "⚡",
    badge: "Level 2 • 12 Rows",
    description: "12-row continuous calculation with mixed formulas.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "l2-1digit-15row",
    name: "1 Digit 15 Row Calculation",
    level: 2,
    digits: 1,
    ruleType: "all",
    rowCount: 15,
    icon: "🎯",
    badge: "Level 2 • 15 Rows",
    description: "15-row single-digit concentration challenge.",
    color: "from-indigo-500 to-violet-600",
  },
  {
    id: "l2-2digit-3row",
    name: "2 Digit 3 Row Calculation",
    level: 2,
    digits: 2,
    ruleType: "all",
    rowCount: 3,
    icon: "🔢",
    badge: "Level 2 • 2D 3 Rows",
    description: "Two-digit column additions and subtractions across 3 rows.",
    color: "from-teal-400 to-emerald-500",
  },
  {
    id: "l2-2digit-5row",
    name: "2 Digit 5 Row Calculation",
    level: 2,
    digits: 2,
    ruleType: "all",
    rowCount: 5,
    icon: "🔥",
    badge: "Level 2 • 2D 5 Rows",
    description: "Two-digit 5-row sequential arithmetic.",
    color: "from-amber-400 to-orange-600",
  },
  {
    id: "l2-2digit-8row",
    name: "2 Digit 8 Row Calculation",
    level: 2,
    digits: 2,
    ruleType: "all",
    rowCount: 8,
    icon: "👑",
    badge: "Level 2 • 2D 8 Rows",
    description: "Two-digit 8-row championship speed test.",
    color: "from-rose-500 to-pink-600",
  },

  // ------------------------------------------------------------
  // LEVEL 3 (6 Categories)
  // ------------------------------------------------------------
  {
    id: "l3-1digit-20row",
    name: "1 Digit 20 Row Calculation",
    level: 3,
    digits: 1,
    ruleType: "all",
    rowCount: 20,
    icon: "⚡",
    badge: "Level 3 • 20 Rows",
    description: "20-row continuous rapid single-digit calculation.",
    color: "from-purple-400 to-indigo-500",
  },
  {
    id: "l3-1digit-25row",
    name: "1 Digit 25 Row Calculation",
    level: 3,
    digits: 1,
    ruleType: "all",
    rowCount: 25,
    icon: "🔥",
    badge: "Level 3 • 25 Rows",
    description: "25-row grand endurance challenge.",
    color: "from-indigo-500 to-violet-600",
  },
  {
    id: "l3-2digit-10row",
    name: "2 Digit 10 Row Calculation",
    level: 3,
    digits: 2,
    ruleType: "all",
    rowCount: 10,
    icon: "🔟",
    badge: "Level 3 • 2D 10 Rows",
    description: "10 rows of 2-digit numbers.",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "l3-2digit-12row",
    name: "2 Digit 12 Row Calculation",
    level: 3,
    digits: 2,
    ruleType: "all",
    rowCount: 12,
    icon: "💫",
    badge: "Level 3 • 2D 12 Rows",
    description: "12 rows of 2-digit numbers.",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "l3-3digit-3row",
    name: "3 Digit 3 Row Calculation",
    level: 3,
    digits: 3,
    ruleType: "all",
    rowCount: 3,
    icon: "🔢",
    badge: "Level 3 • 3D 3 Rows",
    description: "Hundreds column coordination across 3 rows.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "l3-3digit-5row",
    name: "3 Digit 5 Row Calculation",
    level: 3,
    digits: 3,
    ruleType: "all",
    rowCount: 5,
    icon: "🏆",
    badge: "Level 3 • 3D 5 Rows",
    description: "5 rows of 3-digit numbers.",
    color: "from-emerald-500 to-teal-600",
  },

  // ------------------------------------------------------------
  // LEVEL 4 (7 Categories)
  // ------------------------------------------------------------
  {
    id: "l4-1digit-30row",
    name: "1 Digit 30 Row Calculation",
    level: 4,
    digits: 1,
    ruleType: "all",
    rowCount: 30,
    icon: "⚡",
    badge: "Level 4 • 30 Rows",
    description: "30-row extreme speed marathon.",
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: "l4-2digit-15row",
    name: "2 Digit 15 Row Calculation",
    level: 4,
    digits: 2,
    ruleType: "all",
    rowCount: 15,
    icon: "🔥",
    badge: "Level 4 • 2D 15 Rows",
    description: "15 rows of 2-digit calculations.",
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: "l4-2digit-20row",
    name: "2 Digit 20 Row Calculation",
    level: 4,
    digits: 2,
    ruleType: "all",
    rowCount: 20,
    icon: "🎯",
    badge: "Level 4 • 2D 20 Rows",
    description: "20 rows of 2-digit calculations.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "l4-3digit-7row",
    name: "3 Digit 7 Row Calculation",
    level: 4,
    digits: 3,
    ruleType: "all",
    rowCount: 7,
    icon: "🔢",
    badge: "Level 4 • 3D 7 Rows",
    description: "7 rows of 3-digit calculations.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "l4-3digit-10row",
    name: "3 Digit 10 Row Calculation",
    level: 4,
    digits: 3,
    ruleType: "all",
    rowCount: 10,
    icon: "🔟",
    badge: "Level 4 • 3D 10 Rows",
    description: "10 rows of 3-digit calculations.",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "l4-4digit-3row",
    name: "4 Digit 3 Row Calculation",
    level: 4,
    digits: 4,
    ruleType: "all",
    rowCount: 3,
    icon: "💎",
    badge: "Level 4 • 4D 3 Rows",
    description: "Thousands column abacus manipulation.",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "l4-4digit-5row",
    name: "4 Digit 5 Row Calculation",
    level: 4,
    digits: 4,
    ruleType: "all",
    rowCount: 5,
    icon: "👑",
    badge: "Level 4 • 4D 5 Rows",
    description: "5 rows of 4-digit numbers.",
    color: "from-amber-400 to-orange-600",
  },

  // ------------------------------------------------------------
  // LEVEL 5 (5 Categories)
  // ------------------------------------------------------------
  {
    id: "l5-2digit-25row",
    name: "2 Digit 25 Row Calculation",
    level: 5,
    digits: 2,
    ruleType: "all",
    rowCount: 25,
    icon: "⚡",
    badge: "Level 5 • 2D 25 Rows",
    description: "25 rows of 2-digit numbers.",
    color: "from-rose-400 to-red-500",
  },
  {
    id: "l5-3digit-12row",
    name: "3 Digit 12 Row Calculation",
    level: 5,
    digits: 3,
    ruleType: "all",
    rowCount: 12,
    icon: "🔢",
    badge: "Level 5 • 3D 12 Rows",
    description: "12 rows of 3-digit numbers.",
    color: "from-orange-400 to-amber-500",
  },
  {
    id: "l5-3digit-15row",
    name: "3 Digit 15 Row Calculation",
    level: 5,
    digits: 3,
    ruleType: "all",
    rowCount: 15,
    icon: "🔥",
    badge: "Level 5 • 3D 15 Rows",
    description: "15 rows of 3-digit numbers.",
    color: "from-amber-500 to-yellow-600",
  },
  {
    id: "l5-4digit-7row",
    name: "4 Digit 7 Row Calculation",
    level: 5,
    digits: 4,
    ruleType: "all",
    rowCount: 7,
    icon: "💎",
    badge: "Level 5 • 4D 7 Rows",
    description: "7 rows of 4-digit numbers.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "l5-mult-2dx1d",
    name: "Multiplication (2 Digit × 1 Digit)",
    level: 5,
    digits: 2,
    ruleType: "multiplication",
    rowCount: 2,
    operation: "*",
    icon: "✖️",
    badge: "Level 5 • 2D × 1D",
    description: "Abacus rod setting for 2-digit by 1-digit multiplication.",
    color: "from-indigo-500 to-blue-600",
  },

  // ------------------------------------------------------------
  // LEVEL 6 (10 Categories)
  // ------------------------------------------------------------
  {
    id: "l6-2digit-30row",
    name: "2 Digit 30 Row Calculation",
    level: 6,
    digits: 2,
    ruleType: "all",
    rowCount: 30,
    icon: "⚡",
    badge: "Level 6 • 2D 30 Rows",
    description: "30 rows of 2-digit numbers.",
    color: "from-teal-400 to-emerald-600",
  },
  {
    id: "l6-3digit-20row",
    name: "3 Digit 20 Row Calculation",
    level: 6,
    digits: 3,
    ruleType: "all",
    rowCount: 20,
    icon: "🔢",
    badge: "Level 6 • 3D 20 Rows",
    description: "20 rows of 3-digit numbers.",
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "l6-4digit-8row",
    name: "4 Digit 8 Row Calculation",
    level: 6,
    digits: 4,
    ruleType: "all",
    rowCount: 8,
    icon: "💎",
    badge: "Level 6 • 4D 8 Rows",
    description: "8 rows of 4-digit numbers.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "l6-4digit-10row",
    name: "4 Digit 10 Row Calculation",
    level: 6,
    digits: 4,
    ruleType: "all",
    rowCount: 10,
    icon: "🔟",
    badge: "Level 6 • 4D 10 Rows",
    description: "10 rows of 4-digit numbers.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "l6-5digit-3row",
    name: "5 Digit 3 Row Calculation",
    level: 6,
    digits: 5,
    ruleType: "all",
    rowCount: 3,
    icon: "🌟",
    badge: "Level 6 • 5D 3 Rows",
    description: "Ten-thousands column abacus calculation.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "l6-5digit-5row",
    name: "5 Digit 5 Row Calculation",
    level: 6,
    digits: 5,
    ruleType: "all",
    rowCount: 5,
    icon: "👑",
    badge: "Level 6 • 5D 5 Rows",
    description: "5 rows of 5-digit numbers.",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "l6-mult-3dx1d",
    name: "Multiplication (3 Digit × 1 Digit)",
    level: 6,
    digits: 3,
    ruleType: "multiplication",
    rowCount: 2,
    operation: "*",
    icon: "✖️",
    badge: "Level 6 • 3D × 1D",
    description: "3-digit multiplied by 1-digit on abacus.",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "l6-mult-4dx1d",
    name: "Multiplication (4 Digit × 1 Digit)",
    level: 6,
    digits: 4,
    ruleType: "multiplication",
    rowCount: 2,
    operation: "*",
    icon: "✖️",
    badge: "Level 6 • 4D × 1D",
    description: "4-digit multiplied by 1-digit on abacus.",
    color: "from-amber-500 to-yellow-600",
  },
  {
    id: "l6-mult-2dx2d",
    name: "Multiplication (2 Digit × 2 Digit)",
    level: 6,
    digits: 2,
    ruleType: "multiplication",
    rowCount: 2,
    operation: "*",
    icon: "✖️",
    badge: "Level 6 • 2D × 2D",
    description: "2D × 2D cross-column multiplication.",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "l6-div-2d1d",
    name: "Division (2 Digit ÷ 1 Digit)",
    level: 6,
    digits: 2,
    ruleType: "division",
    rowCount: 2,
    operation: "/",
    icon: "➗",
    badge: "Level 6 • 2D ÷ 1D",
    description: "Quotient estimation and remainder placement.",
    color: "from-sky-500 to-blue-600",
  },

  // ------------------------------------------------------------
  // LEVEL 7 (7 Categories)
  // ------------------------------------------------------------
  {
    id: "l7-3digit-25row",
    name: "3 Digit 25 Row Calculation",
    level: 7,
    digits: 3,
    ruleType: "all",
    rowCount: 25,
    icon: "⚡",
    badge: "Level 7 • 3D 25 Rows",
    description: "25 rows of 3-digit numbers.",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "l7-4digit-15row",
    name: "4 Digit 15 Row Calculation",
    level: 7,
    digits: 4,
    ruleType: "all",
    rowCount: 15,
    icon: "🔥",
    badge: "Level 7 • 4D 15 Rows",
    description: "15 rows of 4-digit numbers.",
    color: "from-orange-500 to-rose-600",
  },
  {
    id: "l7-5digit-10row",
    name: "5 Digit 10 Row Calculation",
    level: 7,
    digits: 5,
    ruleType: "all",
    rowCount: 10,
    icon: "🌟",
    badge: "Level 7 • 5D 10 Rows",
    description: "10 rows of 5-digit numbers.",
    color: "from-rose-500 to-red-600",
  },
  {
    id: "l7-mult-3dx2d",
    name: "Multiplication (3 Digit × 2 Digit)",
    level: 7,
    digits: 3,
    ruleType: "multiplication",
    rowCount: 2,
    operation: "*",
    icon: "✖️",
    badge: "Level 7 • 3D × 2D",
    description: "3-digit by 2-digit multiplication.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "l7-mult-3dx3d",
    name: "Multiplication (3 Digit × 3 Digit)",
    level: 7,
    digits: 3,
    ruleType: "multiplication",
    rowCount: 2,
    operation: "*",
    icon: "✖️",
    badge: "Level 7 • 3D × 3D",
    description: "Championship 3-digit by 3-digit calculation.",
    color: "from-indigo-600 to-violet-700",
  },
  {
    id: "l7-div-3d1d",
    name: "Division (3 Digit ÷ 1 Digit)",
    level: 7,
    digits: 3,
    ruleType: "division",
    rowCount: 2,
    operation: "/",
    icon: "➗",
    badge: "Level 7 • 3D ÷ 1D",
    description: "3-digit divided by 1-digit on abacus.",
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "l7-div-3d2d",
    name: "Division (3 Digit ÷ 2 Digit)",
    level: 7,
    digits: 3,
    ruleType: "division",
    rowCount: 2,
    operation: "/",
    icon: "➗",
    badge: "Level 7 • 3D ÷ 2D",
    description: "3-digit divided by 2-digit on abacus.",
    color: "from-emerald-500 to-cyan-600",
  },

  // ------------------------------------------------------------
  // LEVEL 8 (3 Categories)
  // ------------------------------------------------------------
  {
    id: "l8-flash-anzan",
    name: "Flash Anzan Mental Math",
    level: 8,
    digits: 1,
    ruleType: "mental",
    rowCount: 5,
    icon: "⚡",
    badge: "Level 8 • Flash Anzan",
    description: "Rapid flashing numbers calculated mentally in seconds.",
    color: "from-violet-600 to-purple-700",
  },
  {
    id: "l8-mental-multirow",
    name: "Mental Multi-Row Addition & Subtraction",
    level: 8,
    digits: 2,
    ruleType: "mental",
    rowCount: 10,
    icon: "🧠",
    badge: "Level 8 • Mental 10-20R",
    description: "Calculate 10 to 20 rows mentally with zero physical abacus.",
    color: "from-purple-600 to-indigo-700",
  },
  {
    id: "l8-competition-speed",
    name: "International Competition Speed Mental Math",
    level: 8,
    digits: 2,
    ruleType: "mental",
    rowCount: 15,
    icon: "👑",
    badge: "Level 8 • Speed Anzan",
    description: "Championship standard speed arithmetic trials.",
    color: "from-amber-500 to-yellow-600",
  },
];

export function calculateSum(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export function generateOptions(correctAnswer: number, count: number = 4): number[] {
  const options = new Set<number>([correctAnswer]);
  const offsets = [-2, 2, -1, 1, -10, 10, -5, 5, 3, -3];

  for (const offset of offsets) {
    const candidate = correctAnswer + offset;
    if (candidate >= 0 && candidate !== correctAnswer) {
      options.add(candidate);
      if (options.size >= count) break;
    }
  }

  let fallback = 1;
  while (options.size < count) {
    const candidate = Math.max(0, correctAnswer + fallback);
    options.add(candidate);
    fallback = fallback > 0 ? -fallback - 1 : -fallback + 1;
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}

// ============================================================
// DYNAMIC PROCEDURAL GENERATOR FOR SYLLABUS WORKSHEETS
// ============================================================
export function generateQuestionForCategory(cat: PracticeCategoryOption, index: number): PracticeQuestion {
  const qId = `q-${cat.id}-${index}-${Date.now()}`;

  // 1. Multiplication
  if (cat.operation === "*") {
    let a = 12;
    let b = 3;

    if (cat.id === "l5-mult-2dx1d") {
      a = Math.floor(Math.random() * 80) + 12; // 12-91
      b = Math.floor(Math.random() * 8) + 2;   // 2-9
    } else if (cat.id === "l6-mult-3dx1d") {
      a = Math.floor(Math.random() * 800) + 100; // 100-899
      b = Math.floor(Math.random() * 8) + 2;
    } else if (cat.id === "l6-mult-4dx1d") {
      a = Math.floor(Math.random() * 8000) + 1000;
      b = Math.floor(Math.random() * 8) + 2;
    } else if (cat.id === "l6-mult-2dx2d") {
      a = Math.floor(Math.random() * 80) + 12;
      b = Math.floor(Math.random() * 80) + 12;
    } else if (cat.id === "l7-mult-3dx2d") {
      a = Math.floor(Math.random() * 800) + 100;
      b = Math.floor(Math.random() * 80) + 12;
    } else if (cat.id === "l7-mult-3dx3d") {
      a = Math.floor(Math.random() * 800) + 100;
      b = Math.floor(Math.random() * 800) + 100;
    }

    const ans = a * b;
    return {
      id: qId,
      level: cat.level,
      title: cat.name,
      category: cat.name,
      categoryId: cat.id,
      ruleType: "multiplication",
      digits: cat.digits,
      rowCount: 2,
      operation: "*",
      factorA: a,
      factorB: b,
      numbers: [a, b],
      targetAnswer: ans,
      questionType: "multiplication",
      ruleHint: `Multiplication rule: ${a} × ${b}`,
      explanation: `${a} × ${b} = ${ans}.`,
    };
  }

  // 2. Division
  if (cat.operation === "/") {
    let divisor = 3;
    let quotient = 8;

    if (cat.id === "l6-div-2d1d") {
      divisor = Math.floor(Math.random() * 7) + 2; // 2-8
      quotient = Math.floor(Math.random() * 20) + 5; // 5-24
    } else if (cat.id === "l7-div-3d1d") {
      divisor = Math.floor(Math.random() * 8) + 2;
      quotient = Math.floor(Math.random() * 80) + 15;
    } else if (cat.id === "l7-div-3d2d") {
      divisor = Math.floor(Math.random() * 40) + 12;
      quotient = Math.floor(Math.random() * 20) + 4;
    }

    const dividend = divisor * quotient;
    return {
      id: qId,
      level: cat.level,
      title: cat.name,
      category: cat.name,
      categoryId: cat.id,
      ruleType: "division",
      digits: cat.digits,
      rowCount: 2,
      operation: "/",
      dividend,
      divisor,
      numbers: [dividend, divisor],
      targetAnswer: quotient,
      questionType: "division",
      ruleHint: `Division: ${dividend} ÷ ${divisor}`,
      explanation: `${dividend} ÷ ${divisor} = ${quotient}.`,
    };
  }

  // 3. Small Friends Specific
  if (cat.id === "l1-small-friends") {
    const sfPairs = [
      { start: 4, add: 4, rule: "+4 = +5 - 1" },
      { start: 3, add: 4, rule: "+4 = +5 - 1" },
      { start: 4, add: 3, rule: "+3 = +5 - 2" },
      { start: 3, add: 3, rule: "+3 = +5 - 2" },
      { start: 4, add: 2, rule: "+2 = +5 - 3" },
      { start: 3, add: 2, rule: "+2 = +5 - 3" },
      { start: 4, add: 1, rule: "+1 = +5 - 4" },
      { start: 5, add: -4, rule: "-4 = -5 + 1" },
      { start: 6, add: -3, rule: "-3 = -5 + 2" },
      { start: 7, add: -2, rule: "-2 = -5 + 3" },
      { start: 8, add: -4, rule: "-4 = -5 + 1" },
    ];
    const pick = sfPairs[Math.floor(Math.random() * sfPairs.length)];
    const nums = [pick.start, pick.add];
    const rem = pick.start + pick.add > 5 ? -2 : 1;
    nums.push(rem);
    const ans = calculateSum(nums);

    return {
      id: qId,
      level: 1,
      title: "Small Friend Rule Calculation",
      category: cat.name,
      categoryId: cat.id,
      ruleType: "small-friend",
      digits: 1,
      rowCount: 3,
      numbers: nums,
      targetAnswer: ans,
      questionType: "vertical-calc",
      ruleHint: `Small Friend Rule: ${pick.rule}`,
      explanation: `Using formula ${pick.rule}: ${nums.join(" ")} = ${ans}.`,
    };
  }

  // 4. Big Friends Specific
  if (cat.id === "l1-big-friends") {
    const bfPairs = [
      { start: 9, add: 9, rule: "+9 = -1 + 10" },
      { start: 8, add: 8, rule: "+8 = -2 + 10" },
      { start: 7, add: 7, rule: "+7 = -3 + 10" },
      { start: 6, add: 6, rule: "+6 = -4 + 10" },
      { start: 5, add: 8, rule: "+8 = -2 + 10" },
      { start: 4, add: 9, rule: "+9 = -1 + 10" },
      { start: 3, add: 8, rule: "+8 = -2 + 10" },
      { start: 14, add: -8, rule: "-8 = -10 + 2" },
      { start: 15, add: -9, rule: "-9 = -10 + 1" },
      { start: 12, add: -7, rule: "-7 = -10 + 3" },
    ];
    const pick = bfPairs[Math.floor(Math.random() * bfPairs.length)];
    const nums = [pick.start, pick.add];
    const rem = pick.start + pick.add > 10 ? -3 : 2;
    nums.push(rem);
    const ans = calculateSum(nums);

    return {
      id: qId,
      level: 1,
      title: "Big Friend Rule Calculation",
      category: cat.name,
      categoryId: cat.id,
      ruleType: "big-friend",
      digits: 1,
      rowCount: 3,
      numbers: nums,
      targetAnswer: ans,
      questionType: "vertical-calc",
      ruleHint: `Big Friend Rule: ${pick.rule}`,
      explanation: `Using formula ${pick.rule}: ${nums.join(" ")} = ${ans}.`,
    };
  }

  // 5. Multi-Row Multi-Digit Addition/Subtraction (All Row Counts: 2 to 30)
  const rows = cat.rowCount || 3;
  const digits = cat.digits || 1;
  const nums: number[] = [];

  const minBase = digits === 1 ? 1 : Math.pow(10, digits - 1) + 2;
  const maxBase = Math.pow(10, digits) - 1;

  let current = Math.floor(Math.random() * (maxBase - minBase)) + minBase;
  nums.push(current);

  for (let r = 1; r < rows; r++) {
    const isNegative = Math.random() > 0.65 && current > minBase * 1.5;
    if (isNegative) {
      const maxSub = Math.floor(current * 0.7);
      const sub = Math.max(1, Math.floor(Math.random() * maxSub));
      nums.push(-sub);
      current -= sub;
    } else {
      const maxAdd = Math.floor(maxBase * 0.7);
      const add = Math.max(1, Math.floor(Math.random() * maxAdd));
      nums.push(add);
      current += add;
    }
  }

  const ans = calculateSum(nums);
  const isMental = cat.level === 8;

  return {
    id: qId,
    level: cat.level,
    title: cat.name,
    category: cat.name,
    categoryId: cat.id,
    ruleType: isMental ? "mental" : cat.ruleType,
    digits,
    rowCount: rows,
    numbers: nums,
    targetAnswer: ans,
    questionType: "vertical-calc",
    ruleHint: `${digits}-Digit ${rows}-Row ${cat.name}`,
    explanation: `Step-by-step arithmetic sum = ${ans}.`,
  };
}

export interface WorksheetFilterOptions {
  level: number;
  categoryId?: string;
  digits?: number | "all";
  ruleType?: RuleType | "all";
  rowCount?: number | "all";
  questionType?: QuestionType | "all";
}

// Generate a randomized 20-question worksheet matching syllabus
export function generateWorksheet(filters: WorksheetFilterOptions, count: number = 20): PracticeQuestion[] {
  let targetCategories = PRACTICE_CATEGORIES.filter((c) => c.level === filters.level);

  if (filters.categoryId) {
    const single = PRACTICE_CATEGORIES.find((c) => c.id === filters.categoryId);
    if (single) targetCategories = [single];
  } else {
    if (filters.digits && filters.digits !== "all") {
      const dFiltered = targetCategories.filter((c) => c.digits === filters.digits);
      if (dFiltered.length > 0) targetCategories = dFiltered;
    }
    if (filters.rowCount && filters.rowCount !== "all") {
      const rFiltered = targetCategories.filter((c) => c.rowCount === filters.rowCount);
      if (rFiltered.length > 0) targetCategories = rFiltered;
    }
    if (filters.ruleType && filters.ruleType !== "all") {
      const ruleFiltered = targetCategories.filter((c) => c.ruleType === filters.ruleType);
      if (ruleFiltered.length > 0) targetCategories = ruleFiltered;
    }
  }

  if (targetCategories.length === 0) {
    targetCategories = PRACTICE_CATEGORIES.filter((c) => c.level === filters.level);
  }

  const questions: PracticeQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const cat = targetCategories[i % targetCategories.length];
    questions.push(generateQuestionForCategory(cat, i + 1));
  }

  // Shuffle array using Fisher-Yates
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}

// ============================================================
// COMPREHENSIVE PRACTICE QUESTION GENERATOR (ALL 4 CORE TOPICS)
// 1. Direct Calculation
// 2. Small Friend Rule
// 3. Big Friend Rule
// 4. 1-Digit 5-Row Calculation
// ============================================================
export function generateComprehensivePracticeQuestions(count: number = 20): PracticeQuestion[] {
  const qPerCategory = Math.max(1, Math.floor(count / 4));
  const timestamp = Date.now();

  // 1. Direct Calculation (Pure bead movements, no friend formulas)
  const directPool: number[][] = [
    [2, 1, 5],
    [3, 5, -2],
    [1, 3, 5],
    [4, 5, -3],
    [2, 2, 5, -4],
    [7, -2, 4],
    [14, 5, -3],
    [23, 15, -12],
    [5, 2, 1, -3],
    [6, 3, -4, 2],
    [11, 22, 15],
    [35, 12, -21],
  ];

  const directQuestions: PracticeQuestion[] = [];
  for (let i = 0; i < qPerCategory; i++) {
    const nums = directPool[i % directPool.length];
    const ans = calculateSum(nums);
    directQuestions.push({
      id: `q-direct-${i + 1}-${timestamp}`,
      level: 1,
      title: "Direct Calculation",
      category: "Direct Calculation",
      categoryId: "l1-simple-1digit",
      ruleType: "direct",
      digits: nums.some((n) => Math.abs(n) >= 10) ? 2 : 1,
      rowCount: nums.length,
      numbers: nums,
      targetAnswer: ans,
      questionType: "vertical-calc",
      ruleHint: "Direct Calculation: Move upper (value 5) and lower (value 1) beads directly without friend rules.",
      explanation: `Direct bead calculation: ${nums.map((n, idx) => (idx === 0 ? String(n) : n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(" ")} = ${ans}.`,
    });
  }

  // 2. Small Friend Rule (Base-5 complements: +4..+1, -4..-1)
  const smallFriendPool: { nums: number[]; rule: string }[] = [
    { nums: [4, 4, 1], rule: "+4 = +5 - 1" },
    { nums: [3, 4, 2], rule: "+4 = +5 - 1" },
    { nums: [4, 3, 2], rule: "+3 = +5 - 2" },
    { nums: [2, 3, 4], rule: "+3 = +5 - 2" },
    { nums: [4, 2, -1], rule: "+2 = +5 - 3" },
    { nums: [3, 2, 3], rule: "+2 = +5 - 3" },
    { nums: [4, 1, 3], rule: "+1 = +5 - 4" },
    { nums: [6, -4, 2], rule: "-4 = -5 + 1" },
    { nums: [7, -3, 5], rule: "-3 = -5 + 2" },
    { nums: [5, -2, 6], rule: "-2 = -5 + 3" },
    { nums: [8, -4, 3], rule: "-4 = -5 + 1" },
    { nums: [5, -1, 4], rule: "-1 = -5 + 4" },
  ];

  const sfQuestions: PracticeQuestion[] = [];
  for (let i = 0; i < qPerCategory; i++) {
    const item = smallFriendPool[i % smallFriendPool.length];
    const ans = calculateSum(item.nums);
    sfQuestions.push({
      id: `q-sf-${i + 1}-${timestamp}`,
      level: 1,
      title: "Small Friend Rule",
      category: "Small Friend Rule",
      categoryId: "l1-small-friends",
      ruleType: "small-friend",
      digits: 1,
      rowCount: item.nums.length,
      numbers: item.nums,
      targetAnswer: ans,
      questionType: "vertical-calc",
      ruleHint: `Small Friend Rule (Base 5): ${item.rule}`,
      explanation: `Applied Small Friend formula (${item.rule}): ${item.nums.map((n, idx) => (idx === 0 ? String(n) : n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(" ")} = ${ans}.`,
    });
  }

  // 3. Big Friend Rule (Base-10 complements: +9..+1, -9..-1)
  const bigFriendPool: { nums: number[]; rule: string }[] = [
    { nums: [9, 9, -3], rule: "+9 = -1 + 10" },
    { nums: [8, 8, -4], rule: "+8 = -2 + 10" },
    { nums: [7, 7, 5], rule: "+7 = -3 + 10" },
    { nums: [6, 6, -2], rule: "+6 = -4 + 10" },
    { nums: [5, 8, -3], rule: "+8 = -2 + 10" },
    { nums: [4, 9, 5], rule: "+9 = -1 + 10" },
    { nums: [3, 8, -1], rule: "+8 = -2 + 10" },
    { nums: [15, -9, 4], rule: "-9 = -10 + 1" },
    { nums: [14, -8, 3], rule: "-8 = -10 + 2" },
    { nums: [13, -7, 5], rule: "-7 = -10 + 3" },
    { nums: [12, -6, 2], rule: "-6 = -10 + 4" },
    { nums: [16, -9, 5], rule: "-9 = -10 + 1" },
  ];

  const bfQuestions: PracticeQuestion[] = [];
  for (let i = 0; i < qPerCategory; i++) {
    const item = bigFriendPool[i % bigFriendPool.length];
    const ans = calculateSum(item.nums);
    bfQuestions.push({
      id: `q-bf-${i + 1}-${timestamp}`,
      level: 1,
      title: "Big Friend Rule",
      category: "Big Friend Rule",
      categoryId: "l1-big-friends",
      ruleType: "big-friend",
      digits: 1,
      rowCount: item.nums.length,
      numbers: item.nums,
      targetAnswer: ans,
      questionType: "vertical-calc",
      ruleHint: `Big Friend Rule (Base 10): ${item.rule}`,
      explanation: `Applied Big Friend formula (${item.rule}): ${item.nums.map((n, idx) => (idx === 0 ? String(n) : n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(" ")} = ${ans}.`,
    });
  }

  // 4. 1-Digit 5-Row Calculation (5 consecutive single-digit operations)
  const fiveRowPool: number[][] = [
    [4, 2, 1, -5, 3],
    [2, 3, 4, -6, 5],
    [7, -4, 3, -2, 5],
    [9, -5, 4, -3, 2],
    [3, 5, -2, 3, -4],
    [6, 3, -5, 4, -3],
    [1, 7, -5, 6, -4],
    [8, -6, 5, 2, -4],
    [5, 4, -3, 2, -6],
    [2, 6, 1, -5, 4],
    [3, 1, 5, -7, 6],
    [4, 5, -2, -5, 6],
  ];

  const fiveRowQuestions: PracticeQuestion[] = [];
  for (let i = 0; i < qPerCategory; i++) {
    const nums = fiveRowPool[i % fiveRowPool.length];
    const ans = calculateSum(nums);
    fiveRowQuestions.push({
      id: `q-5row-${i + 1}-${timestamp}`,
      level: 1,
      title: "1-Digit 5-Row Calculation",
      category: "1-Digit 5-Row Calculation",
      categoryId: "l1-1digit-5row",
      ruleType: "all",
      digits: 1,
      rowCount: 5,
      numbers: nums,
      targetAnswer: ans,
      questionType: "vertical-calc",
      ruleHint: "1-Digit 5-Row Drill: Calculate 5 consecutive single-digit rows vertically on your soroban.",
      explanation: `5-Row sequential calculation: ${nums.map((n, idx) => (idx === 0 ? String(n) : n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(" ")} = ${ans}.`,
    });
  }

  // Interleave round-robin so the student experiences all 4 topics evenly
  const interleaved: PracticeQuestion[] = [];
  for (let i = 0; i < qPerCategory; i++) {
    if (directQuestions[i]) interleaved.push(directQuestions[i]);
    if (sfQuestions[i]) interleaved.push(sfQuestions[i]);
    if (bfQuestions[i]) interleaved.push(bfQuestions[i]);
    if (fiveRowQuestions[i]) interleaved.push(fiveRowQuestions[i]);
  }

  // If any remainder questions to reach count
  while (interleaved.length < count) {
    const extra = directQuestions[interleaved.length % directQuestions.length];
    interleaved.push({
      ...extra,
      id: `${extra.id}-extra-${interleaved.length}`,
    });
  }

  return interleaved.slice(0, count);
}

