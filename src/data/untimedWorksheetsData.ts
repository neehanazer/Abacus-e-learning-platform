import { PracticeQuestion, QuestionType, RuleType } from "./practiceData";
import { getQuestionsForRule } from "@/lib/abacusRuleGenerator";

export interface UntimedWorksheetOption {
  id: string;
  name: string;
  level?: number;
  category:
    | "simple"
    | "small-friend-add"
    | "small-friend-sub"
    | "big-friend-add"
    | "big-friend-sub"
    | "multi-row"
    | "multiplication"
    | "division"
    | "mental";
  categoryGroup: string;
  ruleFormula?: string;
  icon: string;
  badge: string;
  description: string;
  color: string;
  digits?: 1 | 2 | 3 | 4 | 5;
  rowCount?: number;
  operation?: "+" | "-" | "*" | "/";
  isPdfWorksheet?: boolean;
  questionCount?: number;
}

export const UNTIMED_WORKSHEET_OPTIONS: UntimedWorksheetOption[] = [
  // --- 1. SIMPLE CALCULATIONS ---
  {
    id: "simple-1digit",
    name: "Simple Calculation 1 Digit",
    category: "simple",
    categoryGroup: "Simple Calculations (Direct)",
    icon: "1️⃣",
    badge: "1 Digit • Direct • 40 Qs",
    description: "Direct addition and subtraction on unit beads without formulas (20× 3-Row & 20× 5-Row Drills).",
    color: "from-amber-400 to-orange-500",
    isPdfWorksheet: true,
    questionCount: 40,
  },
  {
    id: "simple-2digits",
    name: "Simple Calculation 2 Digits",
    category: "simple",
    categoryGroup: "Simple Calculations (Direct)",
    icon: "🔢",
    badge: "2 Digits • Direct • 54 Qs",
    description: "Direct calculations across tens and units rods without rules (2-Row, 3-Row & 5-Row Drills).",
    color: "from-blue-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 54,
  },

  // --- 2. SMALL FRIEND RULES (ADDITION: +4, +3, +2, +1) ---
  {
    id: "small-friend-plus-4",
    name: "Small Friend Rule (+4)",
    category: "small-friend-add",
    categoryGroup: "Small Friend Addition (+)",
    ruleFormula: "+4 = +5 - 1",
    icon: "🤝",
    badge: "+4 Rule • 30 Qs",
    description: "Formula: +4 = +5 - 1 (Complement of 4 to 5 is 1). Exactly one rule event.",
    color: "from-emerald-400 to-teal-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "small-friend-plus-3",
    name: "Small Friend Rule (+3)",
    category: "small-friend-add",
    categoryGroup: "Small Friend Addition (+)",
    ruleFormula: "+3 = +5 - 2",
    icon: "🤝",
    badge: "+3 Rule • 30 Qs",
    description: "Formula: +3 = +5 - 2 (Complement of 3 to 5 is 2). Exactly one rule event.",
    color: "from-emerald-400 to-teal-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "small-friend-plus-2",
    name: "Small Friend Rule (+2)",
    category: "small-friend-add",
    categoryGroup: "Small Friend Addition (+)",
    ruleFormula: "+2 = +5 - 3",
    icon: "🤝",
    badge: "+2 Rule • 30 Qs",
    description: "Formula: +2 = +5 - 3 (Complement of 2 to 5 is 3). Exactly one rule event.",
    color: "from-emerald-400 to-teal-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "small-friend-plus-1",
    name: "Small Friend Rule (+1)",
    category: "small-friend-add",
    categoryGroup: "Small Friend Addition (+)",
    ruleFormula: "+1 = +5 - 4",
    icon: "🤝",
    badge: "+1 Rule • 30 Qs",
    description: "Formula: +1 = +5 - 4 (Complement of 1 to 5 is 4). Exactly one rule event.",
    color: "from-emerald-400 to-teal-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },

  // --- 3. SMALL FRIEND RULES (SUBTRACTION: -4, -3, -2, -1) ---
  {
    id: "small-friend-minus-4",
    name: "Small Friend Rule (-4)",
    category: "small-friend-sub",
    categoryGroup: "Small Friend Subtraction (-)",
    ruleFormula: "-4 = -5 + 1",
    icon: "🤝",
    badge: "-4 Rule • 30 Qs",
    description: "Formula: -4 = -5 + 1 (Borrow 5, return 1). Exactly one rule event.",
    color: "from-rose-400 to-pink-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "small-friend-minus-3",
    name: "Small Friend Rule (-3)",
    category: "small-friend-sub",
    categoryGroup: "Small Friend Subtraction (-)",
    ruleFormula: "-3 = -5 + 2",
    icon: "🤝",
    badge: "-3 Rule • 30 Qs",
    description: "Formula: -3 = -5 + 2 (Borrow 5, return 2). Exactly one rule event.",
    color: "from-rose-400 to-pink-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "small-friend-minus-2",
    name: "Small Friend Rule (-2)",
    category: "small-friend-sub",
    categoryGroup: "Small Friend Subtraction (-)",
    ruleFormula: "-2 = -5 + 3",
    icon: "🤝",
    badge: "-2 Rule • 30 Qs",
    description: "Formula: -2 = -5 + 3 (Borrow 5, return 3). Exactly one rule event.",
    color: "from-rose-400 to-pink-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "small-friend-minus-1",
    name: "Small Friend Rule (-1)",
    category: "small-friend-sub",
    categoryGroup: "Small Friend Subtraction (-)",
    ruleFormula: "-1 = -5 + 4",
    icon: "🤝",
    badge: "-1 Rule • 30 Qs",
    description: "Formula: -1 = -5 + 4 (Borrow 5, return 4). Exactly one rule event.",
    color: "from-rose-400 to-pink-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },

  // --- 4. BIG FRIEND RULES (ADDITION: +9 to +1) ---
  {
    id: "big-friend-plus-9",
    name: "Big Friend Rule (+9)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+9 = -1 + 10",
    icon: "🚀",
    badge: "+9 Rule • 30 Qs",
    description: "Formula: +9 = -1 + 10 (Complement of 9 to 10 is 1). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-8",
    name: "Big Friend Rule (+8)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+8 = -2 + 10",
    icon: "🚀",
    badge: "+8 Rule • 30 Qs",
    description: "Formula: +8 = -2 + 10 (Complement of 8 to 10 is 2). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-7",
    name: "Big Friend Rule (+7)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+7 = -3 + 10",
    icon: "🚀",
    badge: "+7 Rule • 30 Qs",
    description: "Formula: +7 = -3 + 10 (Complement of 7 to 10 is 3). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-6",
    name: "Big Friend Rule (+6)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+6 = -4 + 10",
    icon: "🚀",
    badge: "+6 Rule • 30 Qs",
    description: "Formula: +6 = -4 + 10 (Complement of 6 to 10 is 4). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-5",
    name: "Big Friend Rule (+5)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+5 = -5 + 10",
    icon: "🚀",
    badge: "+5 Rule • 30 Qs",
    description: "Formula: +5 = -5 + 10 (Complement of 5 to 10 is 5). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-4",
    name: "Big Friend Rule (+4)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+4 = -6 + 10",
    icon: "🚀",
    badge: "+4 Rule • 30 Qs",
    description: "Formula: +4 = -6 + 10 (Complement of 4 to 10 is 6). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-3",
    name: "Big Friend Rule (+3)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+3 = -7 + 10",
    icon: "🚀",
    badge: "+3 Rule • 30 Qs",
    description: "Formula: +3 = -7 + 10 (Complement of 3 to 10 is 7). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-2",
    name: "Big Friend Rule (+2)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+2 = -8 + 10",
    icon: "🚀",
    badge: "+2 Rule • 30 Qs",
    description: "Formula: +2 = -8 + 10 (Complement of 2 to 10 is 8). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-plus-1",
    name: "Big Friend Rule (+1)",
    category: "big-friend-add",
    categoryGroup: "Big Friend Addition (+)",
    ruleFormula: "+1 = -9 + 10",
    icon: "🚀",
    badge: "+1 Rule • 30 Qs",
    description: "Formula: +1 = -9 + 10 (Complement of 1 to 10 is 9). Exactly one rule event.",
    color: "from-purple-400 to-indigo-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },

  // --- 5. BIG FRIEND RULES (SUBTRACTION: -9 to -1) ---
  {
    id: "big-friend-minus-9",
    name: "Big Friend Rule (-9)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-9 = -10 + 1",
    icon: "🎯",
    badge: "-9 Rule • 30 Qs",
    description: "Formula: -9 = -10 + 1 (Borrow 10, return 1). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-8",
    name: "Big Friend Rule (-8)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-8 = -10 + 2",
    icon: "🎯",
    badge: "-8 Rule • 30 Qs",
    description: "Formula: -8 = -10 + 2 (Borrow 10, return 2). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-7",
    name: "Big Friend Rule (-7)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-7 = -10 + 3",
    icon: "🎯",
    badge: "-7 Rule • 30 Qs",
    description: "Formula: -7 = -10 + 3 (Borrow 10, return 3). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-6",
    name: "Big Friend Rule (-6)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-6 = -10 + 4",
    icon: "🎯",
    badge: "-6 Rule • 30 Qs",
    description: "Formula: -6 = -10 + 4 (Borrow 10, return 4). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-5",
    name: "Big Friend Rule (-5)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-5 = -10 + 5",
    icon: "🎯",
    badge: "-5 Rule • 30 Qs",
    description: "Formula: -5 = -10 + 5 (Borrow 10, return 5). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-4",
    name: "Big Friend Rule (-4)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-4 = -10 + 6",
    icon: "🎯",
    badge: "-4 Rule • 30 Qs",
    description: "Formula: -4 = -10 + 6 (Borrow 10, return 6). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-3",
    name: "Big Friend Rule (-3)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-3 = -10 + 7",
    icon: "🎯",
    badge: "-3 Rule • 30 Qs",
    description: "Formula: -3 = -10 + 7 (Borrow 10, return 7). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-2",
    name: "Big Friend Rule (-2)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-2 = -10 + 8",
    icon: "🎯",
    badge: "-2 Rule • 30 Qs",
    description: "Formula: -2 = -10 + 8 (Borrow 10, return 8). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },
  {
    id: "big-friend-minus-1",
    name: "Big Friend Rule (-1)",
    category: "big-friend-sub",
    categoryGroup: "Big Friend Subtraction (-)",
    ruleFormula: "-1 = -10 + 9",
    icon: "🎯",
    badge: "-1 Rule • 30 Qs",
    description: "Formula: -1 = -10 + 9 (Borrow 10, return 9). Exactly one rule event.",
    color: "from-amber-500 to-red-500",
    isPdfWorksheet: true,
    questionCount: 30,
  },

  // --- 6. MULTI-ROW WORKSHEETS ---
  {
    id: "1digit-3row",
    name: "1 Digit 3 Row Worksheet",
    category: "multi-row",
    categoryGroup: "Multi-Row Worksheets",
    icon: "⚡",
    badge: "1D 3 Rows • 20 Qs",
    description: "Single-digit calculations stacked across 3 rows.",
    color: "from-teal-400 to-cyan-600",
    isPdfWorksheet: true,
    questionCount: 20,
  },
  {
    id: "1digit-5row",
    name: "1 Digit 5 Row Worksheet",
    category: "multi-row",
    categoryGroup: "Multi-Row Worksheets",
    icon: "⚡",
    badge: "1D 5 Rows • 20 Qs",
    description: "Continuous 5-row single-digit speed drills.",
    color: "from-cyan-500 to-blue-600",
    isPdfWorksheet: true,
    questionCount: 20,
  },
  {
    id: "1digit-7row",
    name: "1 Digit 7 Row Worksheet",
    level: 1,
    category: "multi-row",
    categoryGroup: "Multi-Row Worksheets",
    icon: "🏆",
    badge: "1D 7 Rows",
    description: "7-row endurance calculation worksheet.",
    color: "from-indigo-500 to-violet-600",
    digits: 1,
    rowCount: 7,
  },

  // ============================================================
  // LEVEL 2 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l2-1digit-10row",
    name: "1 Digit 10 Row Calculation",
    level: 2,
    category: "multi-row",
    categoryGroup: "1 Digit Multi-Row Calculations",
    icon: "🔟",
    badge: "Level 2 • 10 Rows",
    description: "10-row continuous single-digit calculation drills.",
    color: "from-sky-400 to-blue-500",
    digits: 1,
    rowCount: 10,
  },
  {
    id: "l2-1digit-12row",
    name: "1 Digit 12 Row Calculation",
    level: 2,
    category: "multi-row",
    categoryGroup: "1 Digit Multi-Row Calculations",
    icon: "⚡",
    badge: "Level 2 • 12 Rows",
    description: "12-row continuous calculation with mixed positive and negative numbers.",
    color: "from-blue-500 to-indigo-600",
    digits: 1,
    rowCount: 12,
  },
  {
    id: "l2-1digit-15row",
    name: "1 Digit 15 Row Calculation",
    level: 2,
    category: "multi-row",
    categoryGroup: "1 Digit Multi-Row Calculations",
    icon: "🎯",
    badge: "Level 2 • 15 Rows",
    description: "Advanced 15-row single-digit concentration challenge.",
    color: "from-indigo-500 to-violet-600",
    digits: 1,
    rowCount: 15,
  },
  {
    id: "l2-2digit-3row",
    name: "2 Digit 3 Row Calculation",
    level: 2,
    category: "multi-row",
    categoryGroup: "2 Digit Multi-Row Calculations",
    icon: "🔢",
    badge: "Level 2 • 2D 3 Rows",
    description: "Two-digit column additions and subtractions across 3 rows.",
    color: "from-teal-400 to-emerald-500",
    digits: 2,
    rowCount: 3,
  },
  {
    id: "l2-2digit-5row",
    name: "2 Digit 5 Row Calculation",
    level: 2,
    category: "multi-row",
    categoryGroup: "2 Digit Multi-Row Calculations",
    icon: "🔥",
    badge: "Level 2 • 2D 5 Rows",
    description: "Two-digit 5-row sequential arithmetic.",
    color: "from-amber-400 to-orange-600",
    digits: 2,
    rowCount: 5,
  },
  {
    id: "l2-2digit-8row",
    name: "2 Digit 8 Row Calculation",
    level: 2,
    category: "multi-row",
    categoryGroup: "2 Digit Multi-Row Calculations",
    icon: "👑",
    badge: "Level 2 • 2D 8 Rows",
    description: "Two-digit 8-row championship speed test.",
    color: "from-rose-500 to-pink-600",
    digits: 2,
    rowCount: 8,
  },

  // ============================================================
  // LEVEL 3 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l3-1digit-20row",
    name: "1 Digit 20 Row Calculation",
    level: 3,
    category: "multi-row",
    categoryGroup: "1 Digit Long Rows",
    icon: "⚡",
    badge: "Level 3 • 20 Rows",
    description: "20-row continuous rapid single-digit calculation.",
    color: "from-purple-400 to-indigo-500",
    digits: 1,
    rowCount: 20,
  },
  {
    id: "l3-1digit-25row",
    name: "1 Digit 25 Row Calculation",
    level: 3,
    category: "multi-row",
    categoryGroup: "1 Digit Long Rows",
    icon: "🔥",
    badge: "Level 3 • 25 Rows",
    description: "25-row grand endurance challenge.",
    color: "from-indigo-500 to-violet-600",
    digits: 1,
    rowCount: 25,
  },
  {
    id: "l3-2digit-10row",
    name: "2 Digit 10 Row Calculation",
    level: 3,
    category: "multi-row",
    categoryGroup: "2 Digit Multi-Row Calculations",
    icon: "🔟",
    badge: "Level 3 • 2D 10 Rows",
    description: "10 rows of 2-digit numbers.",
    color: "from-violet-500 to-purple-600",
    digits: 2,
    rowCount: 10,
  },
  {
    id: "l3-2digit-12row",
    name: "2 Digit 12 Row Calculation",
    level: 3,
    category: "multi-row",
    categoryGroup: "2 Digit Multi-Row Calculations",
    icon: "💫",
    badge: "Level 3 • 2D 12 Rows",
    description: "12 rows of 2-digit numbers.",
    color: "from-fuchsia-500 to-pink-600",
    digits: 2,
    rowCount: 12,
  },
  {
    id: "l3-3digit-3row",
    name: "3 Digit 3 Row Calculation",
    level: 3,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🔢",
    badge: "Level 3 • 3D 3 Rows",
    description: "Hundreds column coordination across 3 rows.",
    color: "from-cyan-500 to-blue-600",
    digits: 3,
    rowCount: 3,
  },
  {
    id: "l3-3digit-5row",
    name: "3 Digit 5 Row Calculation",
    level: 3,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🏆",
    badge: "Level 3 • 3D 5 Rows",
    description: "5 rows of 3-digit numbers.",
    color: "from-emerald-500 to-teal-600",
    digits: 3,
    rowCount: 5,
  },

  // ============================================================
  // LEVEL 4 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l4-1digit-30row",
    name: "1 Digit 30 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "1 Digit Marathon",
    icon: "⚡",
    badge: "Level 4 • 30 Rows",
    description: "30-row extreme speed marathon.",
    color: "from-emerald-400 to-teal-600",
    digits: 1,
    rowCount: 30,
  },
  {
    id: "l4-2digit-15row",
    name: "2 Digit 15 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "2 Digit Long Rows",
    icon: "🔥",
    badge: "Level 4 • 2D 15 Rows",
    description: "15 rows of 2-digit calculations.",
    color: "from-teal-500 to-cyan-600",
    digits: 2,
    rowCount: 15,
  },
  {
    id: "l4-2digit-20row",
    name: "2 Digit 20 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "2 Digit Long Rows",
    icon: "🎯",
    badge: "Level 4 • 2D 20 Rows",
    description: "20 rows of 2-digit calculations.",
    color: "from-cyan-500 to-blue-600",
    digits: 2,
    rowCount: 20,
  },
  {
    id: "l4-3digit-7row",
    name: "3 Digit 7 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🔢",
    badge: "Level 4 • 3D 7 Rows",
    description: "7 rows of 3-digit calculations.",
    color: "from-indigo-500 to-purple-600",
    digits: 3,
    rowCount: 7,
  },
  {
    id: "l4-3digit-10row",
    name: "3 Digit 10 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🔟",
    badge: "Level 4 • 3D 10 Rows",
    description: "10 rows of 3-digit calculations.",
    color: "from-purple-500 to-pink-600",
    digits: 3,
    rowCount: 10,
  },
  {
    id: "l4-4digit-3row",
    name: "4 Digit 3 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "4 Digit Calculations",
    icon: "💎",
    badge: "Level 4 • 4D 3 Rows",
    description: "Thousands column abacus manipulation.",
    color: "from-pink-500 to-rose-600",
    digits: 4,
    rowCount: 3,
  },
  {
    id: "l4-4digit-5row",
    name: "4 Digit 5 Row Calculation",
    level: 4,
    category: "multi-row",
    categoryGroup: "4 Digit Calculations",
    icon: "👑",
    badge: "Level 4 • 4D 5 Rows",
    description: "5 rows of 4-digit numbers.",
    color: "from-amber-400 to-orange-600",
    digits: 4,
    rowCount: 5,
  },

  // ============================================================
  // LEVEL 5 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l5-2digit-25row",
    name: "2 Digit 25 Row Calculation",
    level: 5,
    category: "multi-row",
    categoryGroup: "2 Digit High Rows",
    icon: "⚡",
    badge: "Level 5 • 2D 25 Rows",
    description: "25 rows of 2-digit numbers.",
    color: "from-rose-400 to-red-500",
    digits: 2,
    rowCount: 25,
  },
  {
    id: "l5-3digit-12row",
    name: "3 Digit 12 Row Calculation",
    level: 5,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🔢",
    badge: "Level 5 • 3D 12 Rows",
    description: "12 rows of 3-digit numbers.",
    color: "from-orange-400 to-amber-500",
    digits: 3,
    rowCount: 12,
  },
  {
    id: "l5-3digit-15row",
    name: "3 Digit 15 Row Calculation",
    level: 5,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🔥",
    badge: "Level 5 • 3D 15 Rows",
    description: "15 rows of 3-digit numbers.",
    color: "from-amber-500 to-yellow-600",
    digits: 3,
    rowCount: 15,
  },
  {
    id: "l5-4digit-7row",
    name: "4 Digit 7 Row Calculation",
    level: 5,
    category: "multi-row",
    categoryGroup: "4 Digit Calculations",
    icon: "💎",
    badge: "Level 5 • 4D 7 Rows",
    description: "7 rows of 4-digit numbers.",
    color: "from-emerald-500 to-teal-600",
    digits: 4,
    rowCount: 7,
  },
  {
    id: "l5-mult-2dx1d",
    name: "Multiplication (2 Digit × 1 Digit)",
    level: 5,
    category: "multiplication",
    categoryGroup: "Multiplication",
    icon: "✖️",
    badge: "Level 5 • 2D × 1D",
    description: "Abacus rod setting for 2-digit by 1-digit multiplication.",
    color: "from-indigo-500 to-blue-600",
    digits: 2,
    operation: "*",
  },

  // ============================================================
  // LEVEL 6 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l6-2digit-30row",
    name: "2 Digit 30 Row Calculation",
    level: 6,
    category: "multi-row",
    categoryGroup: "2 Digit Marathon",
    icon: "⚡",
    badge: "Level 6 • 2D 30 Rows",
    description: "30 rows of 2-digit numbers.",
    color: "from-teal-400 to-emerald-600",
    digits: 2,
    rowCount: 30,
  },
  {
    id: "l6-3digit-20row",
    name: "3 Digit 20 Row Calculation",
    level: 6,
    category: "multi-row",
    categoryGroup: "3 Digit Calculations",
    icon: "🔢",
    badge: "Level 6 • 3D 20 Rows",
    description: "20 rows of 3-digit numbers.",
    color: "from-emerald-500 to-teal-700",
    digits: 3,
    rowCount: 20,
  },
  {
    id: "l6-4digit-8row",
    name: "4 Digit 8 Row Calculation",
    level: 6,
    category: "multi-row",
    categoryGroup: "4 Digit Calculations",
    icon: "💎",
    badge: "Level 6 • 4D 8 Rows",
    description: "8 rows of 4-digit numbers.",
    color: "from-cyan-500 to-blue-600",
    digits: 4,
    rowCount: 8,
  },
  {
    id: "l6-4digit-10row",
    name: "4 Digit 10 Row Calculation",
    level: 6,
    category: "multi-row",
    categoryGroup: "4 Digit Calculations",
    icon: "🔟",
    badge: "Level 6 • 4D 10 Rows",
    description: "10 rows of 4-digit numbers.",
    color: "from-blue-500 to-indigo-600",
    digits: 4,
    rowCount: 10,
  },
  {
    id: "l6-5digit-3row",
    name: "5 Digit 3 Row Calculation",
    level: 6,
    category: "multi-row",
    categoryGroup: "5 Digit Calculations",
    icon: "🌟",
    badge: "Level 6 • 5D 3 Rows",
    description: "Ten-thousands column abacus calculation.",
    color: "from-indigo-500 to-purple-600",
    digits: 5,
    rowCount: 3,
  },
  {
    id: "l6-5digit-5row",
    name: "5 Digit 5 Row Calculation",
    level: 6,
    category: "multi-row",
    categoryGroup: "5 Digit Calculations",
    icon: "👑",
    badge: "Level 6 • 5D 5 Rows",
    description: "5 rows of 5-digit numbers.",
    color: "from-purple-500 to-pink-600",
    digits: 5,
    rowCount: 5,
  },
  {
    id: "l6-mult-3dx1d",
    name: "Multiplication (3 Digit × 1 Digit)",
    level: 6,
    category: "multiplication",
    categoryGroup: "Multiplication",
    icon: "✖️",
    badge: "Level 6 • 3D × 1D",
    description: "3-digit multiplied by 1-digit on abacus.",
    color: "from-orange-500 to-amber-600",
    digits: 3,
    operation: "*",
  },
  {
    id: "l6-mult-4dx1d",
    name: "Multiplication (4 Digit × 1 Digit)",
    level: 6,
    category: "multiplication",
    categoryGroup: "Multiplication",
    icon: "✖️",
    badge: "Level 6 • 4D × 1D",
    description: "4-digit multiplied by 1-digit on abacus.",
    color: "from-amber-500 to-yellow-600",
    digits: 4,
    operation: "*",
  },
  {
    id: "l6-mult-2dx2d",
    name: "Multiplication (2 Digit × 2 Digit)",
    level: 6,
    category: "multiplication",
    categoryGroup: "Multiplication",
    icon: "✖️",
    badge: "Level 6 • 2D × 2D",
    description: "2D × 2D cross-column multiplication.",
    color: "from-pink-500 to-rose-600",
    digits: 2,
    operation: "*",
  },
  {
    id: "l6-div-2d1d",
    name: "Division (2 Digit ÷ 1 Digit)",
    level: 6,
    category: "division",
    categoryGroup: "Division",
    icon: "➗",
    badge: "Level 6 • 2D ÷ 1D",
    description: "Quotient estimation and remainder placement.",
    color: "from-sky-500 to-blue-600",
    digits: 2,
    operation: "/",
  },

  // ============================================================
  // LEVEL 7 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l7-3digit-25row",
    name: "3 Digit 25 Row Calculation",
    level: 7,
    category: "multi-row",
    categoryGroup: "3 Digit High Rows",
    icon: "⚡",
    badge: "Level 7 • 3D 25 Rows",
    description: "25 rows of 3-digit numbers.",
    color: "from-amber-500 to-orange-600",
    digits: 3,
    rowCount: 25,
  },
  {
    id: "l7-4digit-15row",
    name: "4 Digit 15 Row Calculation",
    level: 7,
    category: "multi-row",
    categoryGroup: "4 Digit High Rows",
    icon: "🔥",
    badge: "Level 7 • 4D 15 Rows",
    description: "15 rows of 4-digit numbers.",
    color: "from-orange-500 to-rose-600",
    digits: 4,
    rowCount: 15,
  },
  {
    id: "l7-5digit-10row",
    name: "5 Digit 10 Row Calculation",
    level: 7,
    category: "multi-row",
    categoryGroup: "5 Digit Calculations",
    icon: "🌟",
    badge: "Level 7 • 5D 10 Rows",
    description: "10 rows of 5-digit numbers.",
    color: "from-rose-500 to-red-600",
    digits: 5,
    rowCount: 10,
  },
  {
    id: "l7-mult-3dx2d",
    name: "Multiplication (3 Digit × 2 Digit)",
    level: 7,
    category: "multiplication",
    categoryGroup: "Advanced Multiplication",
    icon: "✖️",
    badge: "Level 7 • 3D × 2D",
    description: "Multi-step cross multiplication.",
    color: "from-violet-500 to-purple-600",
    digits: 3,
    operation: "*",
  },
  {
    id: "l7-mult-3dx3d",
    name: "Multiplication (3 Digit × 3 Digit)",
    level: 7,
    category: "multiplication",
    categoryGroup: "Advanced Multiplication",
    icon: "✖️",
    badge: "Level 7 • 3D × 3D",
    description: "Championship 3D × 3D calculations.",
    color: "from-purple-600 to-pink-600",
    digits: 3,
    operation: "*",
  },
  {
    id: "l7-div-3d1d",
    name: "Division (3 Digit ÷ 1 Digit)",
    level: 7,
    category: "division",
    categoryGroup: "Advanced Division",
    icon: "➗",
    badge: "Level 7 • 3D ÷ 1D",
    description: "3-digit division on abacus.",
    color: "from-teal-500 to-emerald-600",
    digits: 3,
    operation: "/",
  },
  {
    id: "l7-div-3d2d",
    name: "Division (3 Digit ÷ 2 Digit)",
    level: 7,
    category: "division",
    categoryGroup: "Advanced Division",
    icon: "➗",
    badge: "Level 7 • 3D ÷ 2D",
    description: "Complex 2-digit divisor operations.",
    color: "from-emerald-500 to-cyan-600",
    digits: 3,
    operation: "/",
  },

  // ============================================================
  // LEVEL 8 WORKSHEETS (Exact Syllabus)
  // ============================================================
  {
    id: "l8-flash-anzan",
    name: "Flash Anzan Mental Math",
    level: 8,
    category: "mental",
    categoryGroup: "Mental Calculations",
    icon: "⚡",
    badge: "Level 8 • Flash Anzan",
    description: "Rapid flashing numbers calculated mentally in seconds.",
    color: "from-violet-600 to-purple-700",
    digits: 1,
    rowCount: 5,
  },
  {
    id: "l8-mental-multirow",
    name: "Mental Multi-Row Addition & Subtraction",
    level: 8,
    category: "mental",
    categoryGroup: "Mental Calculations",
    icon: "🧠",
    badge: "Level 8 • Mental 10-20R",
    description: "Calculate 10 to 20 rows mentally with zero physical abacus.",
    color: "from-purple-600 to-indigo-700",
    digits: 2,
    rowCount: 10,
  },
  {
    id: "l8-competition-speed",
    name: "International Competition Speed Mental Math",
    level: 8,
    category: "mental",
    categoryGroup: "Mental Calculations",
    icon: "👑",
    badge: "Level 8 • Speed Anzan",
    description: "Championship standard speed arithmetic trials.",
    color: "from-amber-500 to-yellow-600",
    digits: 2,
    rowCount: 15,
  },
];

// Helper to sum numbers
function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Procedural multi-row numbers generator ensuring valid positive abacus running total
export function generateMultiRowNumbers(digits: number, rowCount: number): number[] {
  const minVal = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const maxVal = Math.pow(10, digits) - 1;

  const numbers: number[] = [];
  let currentTotal = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  numbers.push(currentTotal);

  for (let r = 1; r < rowCount; r++) {
    const canBeNegative = currentTotal > minVal * 2;
    const isNegative = canBeNegative && Math.random() < 0.35;

    let nextVal: number;
    if (isNegative) {
      const maxSub = Math.min(maxVal, currentTotal - 1);
      const minSub = Math.min(minVal, maxSub);
      nextVal = -(Math.floor(Math.random() * (maxSub - minSub + 1)) + minSub);
    } else {
      nextVal = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    }

    currentTotal += nextVal;
    numbers.push(nextVal);
  }

  return numbers;
}

// Helper to construct official PDF practice question
function makePdfQuestion(
  optionId: string,
  optionName: string,
  formula: string,
  section: "A" | "B" | "C",
  col: number,
  numbers: number[],
  targetAnswer: number
): PracticeQuestion {
  const digits: 1 | 2 = numbers.some((n) => Math.abs(n) >= 10) ? 2 : 1;
  const optionsSet = new Set<number>([targetAnswer]);
  for (const delta of [-2, -1, 1, 2, -10, 10, -5, 5]) {
    const val = targetAnswer + delta;
    if (val >= 0 && val !== targetAnswer) optionsSet.add(val);
    if (optionsSet.size === 4) break;
  }
  let extra = 3;
  while (optionsSet.size < 4) {
    optionsSet.add(Math.max(0, targetAnswer + extra++));
  }

  const formulaStr = numbers
    .map((n, i) => (i === 0 ? String(n) : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`))
    .join(" ");

  return {
    id: `pdf-${optionId}-${section.toLowerCase()}-${col}`,
    level: 1,
    title: `${optionName} (Section ${section}, Q${col})`,
    category: optionName,
    categoryId: optionId,
    ruleType: "big-friend",
    digits,
    rowCount: numbers.length,
    numbers,
    targetAnswer,
    questionType: "vertical-calc",
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    ruleHint: `Rule: ${formula}`,
    explanation: `Official PDF Question (Section ${section}, Q${col}): ${formulaStr} = ${targetAnswer} (using formula ${formula}).`,
  };
}

// ============================================================
// AUTHENTIC 1-DIGIT DIRECT CALCULATION QUESTION DATASETS
// Set 1: 20 Questions (3 Rows)
// Set 2: 20 Questions (5 Rows)
// ============================================================
export const SIMPLE_1DIGIT_SET_1_NUMBERS: number[][] = [
  [8, 1, -5],
  [1, 7, -3],
  [4, 5, -2],
  [4, -1, 6],
  [7, 1, -6],
  [8, -5, 6],
  [3, 6, -1],
  [5, 2, -1],
  [3, 1, -2],
  [4, -3, 2],
  [1, 6, -1],
  [5, 3, -5],
  [2, 6, -1],
  [8, -5, 1],
  [2, 7, -5],
  [4, 5, -8],
  [8, 1, -8],
  [1, 3, -2],
  [1, 8, -4],
  [3, 6, -3],
];

export const SIMPLE_1DIGIT_SET_2_NUMBERS: number[][] = [
  [9, -2, -5, -2, 6],
  [8, -1, 2, -3, 2],
  [6, -1, 2, -7, 1],
  [6, -1, 2, -5, 1],
  [1, 3, -4, 3, -1],
  [3, -2, 8, -1, -3],
  [4, -3, 7, -6, 1],
  [6, 3, -9, 8, -1],
  [8, -2, -6, 2, 6],
  [8, -6, 2, -3, 2],
  [9, -6, -2, 5, 3],
  [4, -3, 8, -9, 2],
  [6, 3, -8, 5, 3],
  [6, 2, -7, 1, 6],
  [6, -5, 3, 5, -7],
  [4, -2, 1, 5, -3],
  [7, 2, -3, -5, 8],
  [4, 5, -6, -3, 2],
  [7, -6, 7, -3, 4],
  [3, 5, -8, 6, 2],
];

function makeDirectSimpleQuestion(
  optionId: string,
  optionName: string,
  section: "A" | "B",
  col: number,
  numbers: number[],
  targetAnswer: number
): PracticeQuestion {
  const optionsSet = new Set<number>([targetAnswer]);
  for (const delta of [-2, 2, -1, 1, -3, 3, 4, -4]) {
    const val = targetAnswer + delta;
    if (val >= 0 && val <= 9 && val !== targetAnswer) optionsSet.add(val);
    if (optionsSet.size === 4) break;
  }
  let extra = 1;
  while (optionsSet.size < 4) {
    const val = (targetAnswer + extra++) % 10;
    optionsSet.add(val);
  }

  const formulaStr = numbers
    .map((n, i) => (i === 0 ? String(n) : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`))
    .join(" ");

  const rowLabel = numbers.length === 3 ? "3-Row" : "5-Row";

  return {
    id: `direct-1d-${optionId}-${section.toLowerCase()}-${col}`,
    level: 1,
    title: `${optionName} (${section === "A" ? "Set 1: 3-Row" : "Set 2: 5-Row"}, Q${col})`,
    category: optionName,
    categoryId: optionId,
    ruleType: "direct",
    digits: 1,
    rowCount: numbers.length,
    numbers,
    targetAnswer,
    questionType: "vertical-calc",
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    ruleHint: "Direct Calculation: Move upper (value 5) and lower (value 1) beads directly without formulas.",
    explanation: `Direct Calculation (${rowLabel}, Q${col}): ${formulaStr} = ${targetAnswer}.`,
  };
}

export const SIMPLE_2DIGIT_EXISTING_PAIRS: number[][] = [
  [12, 21], [23, 11], [31, 12], [42, 52], [51, 23],
  [22, 22], [65, 23], [74, 15], [33, 11], [88, -22],
  [44, -13], [95, -40], [56, 21], [14, 30],
];

export const SIMPLE_2DIGIT_SET_3ROW_NUMBERS: number[][] = [
  [52, 17, -11],
  [88, -72, 31],
  [24, 75, -31],
  [82, -80, 61],
  [89, -81, 41],
  [43, -42, 55],
  [84, -34, 18],
  [13, -12, 20],
  [40, 54, -41],
  [20, 18, -17],
  [93, -92, 98],
  [89, -87, 77],
  [12, 75, -16],
  [84, -60, 55],
  [48, 51, -58],
  [83, -81, 42],
  [66, -55, 87],
  [23, -12, 88],
  [54, -52, 20],
  [72, -11, 17],
];

export const SIMPLE_2DIGIT_SET_5ROW_NUMBERS: number[][] = [
  [28, -13, 21, 63, -61],
  [13, 65, 21, -48, 40],
  [11, 27, -23, 83, -36],
  [26, 23, -29, 10, 53],
  [47, -21, 20, -15, 18],
  [11, 63, -62, 11, 50],
  [70, 12, 10, -20, 12],
  [17, 80, -86, 38, -24],
  [84, -30, -54, 96, -11],
  [79, -28, 43, -44, 23],
  [27, 21, -26, 77, -10],
  [52, 42, -51, -43, 97],
  [54, 45, -21, -78, 38],
  [13, -10, 55, 31, -54],
  [89, -23, -65, 98, -71],
  [30, 11, -41, 12, 50],
  [60, 29, -27, 36, -86],
  [98, -37, 17, -68, 88],
  [85, -30, -55, 78, -51],
  [35, -15, 18, -37, 23],
];

function makeDirect2DSimpleQuestion(
  optionId: string,
  optionName: string,
  section: "A" | "B" | "C",
  col: number,
  numbers: number[],
  targetAnswer: number
): PracticeQuestion {
  const optionsSet = new Set<number>([targetAnswer]);
  for (const delta of [-10, 10, -2, 2, -1, 1, -5, 5]) {
    const val = targetAnswer + delta;
    if (val >= 0 && val <= 100 && val !== targetAnswer) optionsSet.add(val);
    if (optionsSet.size === 4) break;
  }
  let extra = 3;
  while (optionsSet.size < 4) {
    optionsSet.add(Math.max(0, (targetAnswer + extra++) % 100));
  }

  const formulaStr = numbers
    .map((n, i) => (i === 0 ? String(n) : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`))
    .join(" ");

  const rowLabel = `${numbers.length}-Row`;

  return {
    id: `direct-2d-${optionId}-${section.toLowerCase()}-${col}`,
    level: 1,
    title: `${optionName} (Section ${section}: ${rowLabel}, Q${col})`,
    category: optionName,
    categoryId: optionId,
    ruleType: "direct",
    digits: 2,
    rowCount: numbers.length,
    numbers,
    targetAnswer,
    questionType: "vertical-calc",
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    ruleHint: "Direct 2-Digit Calculation: Coordinate tens and units columns simultaneously without formulas.",
    explanation: `Direct 2-Digit Calculation (${rowLabel}, Q${col}): ${formulaStr} = ${targetAnswer}.`,
  };
}

// ============================================================
// EXACT QUESTIONS FROM OFFICIAL USER-UPLOADED PDFs & SYLLABUS
// (BFR = Big Friend Rule, SFR = Small Friend Rule, Direct)
// ============================================================
export const PDF_EXACT_WORKSHEETS: Record<string, PracticeQuestion[]> = {
  // ------------------------------------------------------------
  // Simple Calculation 1 Digit (Set 1: 20 3-Row Qs, Set 2: 20 5-Row Qs)
  // ------------------------------------------------------------
  "simple-1digit": [
    ...SIMPLE_1DIGIT_SET_1_NUMBERS.map((nums, idx) =>
      makeDirectSimpleQuestion("simple-1digit", "Simple Calculation 1 Digit", "A", idx + 1, nums, sum(nums))
    ),
    ...SIMPLE_1DIGIT_SET_2_NUMBERS.map((nums, idx) =>
      makeDirectSimpleQuestion("simple-1digit", "Simple Calculation 1 Digit", "B", idx + 1, nums, sum(nums))
    ),
  ],
  "1digit-3row": SIMPLE_1DIGIT_SET_1_NUMBERS.map((nums, idx) =>
    makeDirectSimpleQuestion("1digit-3row", "1 Digit 3 Row Worksheet", "A", idx + 1, nums, sum(nums))
  ),
  "1digit-5row": SIMPLE_1DIGIT_SET_2_NUMBERS.map((nums, idx) =>
    makeDirectSimpleQuestion("1digit-5row", "1 Digit 5 Row Worksheet", "B", idx + 1, nums, sum(nums))
  ),
  // ------------------------------------------------------------
  // Simple Calculation 2 Digits (54 Authentic Qs: 2-Row, 3-Row & 5-Row)
  // ------------------------------------------------------------
  "simple-2digits": [
    ...SIMPLE_2DIGIT_EXISTING_PAIRS.map((nums, idx) =>
      makeDirect2DSimpleQuestion("simple-2digits", "Simple Calculation 2 Digits", "A", idx + 1, nums, sum(nums))
    ),
    ...SIMPLE_2DIGIT_SET_3ROW_NUMBERS.map((nums, idx) =>
      makeDirect2DSimpleQuestion("simple-2digits", "Simple Calculation 2 Digits", "B", idx + 1, nums, sum(nums))
    ),
    ...SIMPLE_2DIGIT_SET_5ROW_NUMBERS.map((nums, idx) =>
      makeDirect2DSimpleQuestion("simple-2digits", "Simple Calculation 2 Digits", "C", idx + 1, nums, sum(nums))
    ),
  ],
  // ------------------------------------------------------------
  // Big Friend Rule: +1 = -9 + 10 (media_1790697446368.pdf)
  // ------------------------------------------------------------
  "big-friend-plus-1": [
    // Section A (3 rows)
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 1, [4, 5, 1], 10),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 2, [9, 1, 3], 13),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 3, [5, 4, 1], 10),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 4, [7, 2, 1], 10),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 5, [8, 1, 1], 10),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 6, [12, 7, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 7, [19, 1, 10], 30),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 8, [6, 3, 1], 10),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 9, [12, 17, 1], 30),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "A", 10, [3, 6, 1], 10),
    // Section B (4 rows)
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 1, [1, 3, 5, 1], 10),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 2, [7, 2, 1, -10], 0),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 3, [9, 1, 9, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 4, [13, 5, 1, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 5, [5, 4, 1, 5], 15),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 6, [3, 15, 1, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 7, [8, 2, 1, 1], 12),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 8, [3, 5, 1, 11], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 9, [11, 18, 1, -10], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "B", 10, [8, 1, 10, 1], 20),
    // Section C (4 rows)
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 1, [11, 7, 1, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 2, [5, 13, 1, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 3, [13, 15, 1, 1], 30),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 4, [15, 2, 2, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 5, [10, 4, 5, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 6, [9, 10, 1, 2], 22),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 7, [8, 1, 1, 8], 18),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 8, [2, 7, 1, 3], 13),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 9, [12, 6, 1, 1], 20),
    makePdfQuestion("big-friend-plus-1", "Big Friend Rule (+1)", "+1 = -9 + 10", "C", 10, [9, 10, 1, 5], 25),
  ],

  // ------------------------------------------------------------
  // Big Friend Rule: +2 = -8 + 10 (media_1790697446369.pdf)
  // ------------------------------------------------------------
  "big-friend-plus-2": [
    // Section A (3 rows)
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 1, [8, 2, 2], 12),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 2, [9, 2, 3], 14),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 3, [3, 5, 2], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 4, [5, 3, 2], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 5, [15, 4, 2], 21),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 6, [2, 6, 2], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 7, [16, 2, 2], 20),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 8, [7, 1, 2], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 9, [12, 15, 2], 29),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "A", 10, [3, 6, 2], 11),
    // Section B (4 rows)
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 1, [3, 5, 2, 2], 12),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 2, [7, 2, 2, -10], 1),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 3, [9, 2, 5, 2], 18),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 4, [13, 5, 2, -10], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 5, [5, 4, 2, 5], 16),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 6, [3, 15, 2, 4], 24),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 7, [8, 2, -1, 12], 21),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 8, [3, 5, 2, 3], 13),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 9, [11, 17, 2, -10], 20),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "B", 10, [8, 5, 5, 2], 20),
    // Section C (4 rows)
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 1, [11, 7, 2, 3], 23),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 2, [5, 13, 2, 2], 22),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 3, [13, 15, 2, -20], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 4, [15, 5, 8, 2], 30),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 5, [10, 4, 5, 2], 21),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 6, [5, 10, 3, 2], 20),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 7, [8, 2, 8, 2], 20),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 8, [2, 8, 8, 2], 20),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 9, [12, 6, 2, -10], 10),
    makePdfQuestion("big-friend-plus-2", "Big Friend Rule (+2)", "+2 = -8 + 10", "C", 10, [9, 10, 2, 5], 26),
  ],

  // ------------------------------------------------------------
  // Big Friend Rule: +3 = -7 + 10 (media_1790697446498.pdf)
  // ------------------------------------------------------------
  "big-friend-plus-3": [
    // Section A (3 rows)
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 1, [8, 3, 2], 13),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 2, [6, 2, 3], 11),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 3, [3, 5, 3], 11),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 4, [9, 3, -2], 10),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 5, [10, 8, 3], 21),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 6, [13, 6, 3], 22),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 7, [16, 2, 3], 21),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 8, [7, 3, 4], 14),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 9, [2, 5, 3], 10),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "A", 10, [2, 6, 3], 11),
    // Section B (4 rows)
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 1, [3, 5, 3, 2], 13),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 2, [7, 3, -10, 11], 11),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 3, [9, 3, 5, -7], 10),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 4, [13, 5, 3, -10], 11),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 5, [5, 4, 3, 5], 17),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 6, [2, 15, 3, -7], 13),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 7, [8, 3, -5, 12], 18),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 8, [5, 2, 3, 3], 13),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 9, [11, 17, 3, -10], 21),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "B", 10, [8, 5, 5, 3], 21),
    // Section C (4 rows)
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 1, [11, 6, 3, 3], 23),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 2, [5, 12, 3, 2], 22),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 3, [12, 15, 3, -20], 10),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 4, [15, 5, 8, 3], 31),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 5, [10, 4, 5, 3], 22),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 6, [5, 10, 3, 3], 21),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 7, [8, 3, 6, 3], 20),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 8, [13, 5, 3, -20], 1),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 9, [12, 5, 3, -10], 10),
    makePdfQuestion("big-friend-plus-3", "Big Friend Rule (+3)", "+3 = -7 + 10", "C", 10, [9, 10, 3, 5], 27),
  ],

  // ------------------------------------------------------------
  // Big Friend Rule: -2 = -10 + 8 (media_1790697446386.pdf)
  // ------------------------------------------------------------
  "big-friend-minus-2": [
    // Section A (3 rows)
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 1, [10, -2, -5], 3),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 2, [5, 6, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 3, [11, -2, -3], 6),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 4, [17, -6, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 5, [5, 5, -2], 8),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 6, [21, -2, -15], 4),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 7, [16, -5, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 8, [8, 3, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 9, [3, 8, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "A", 10, [7, 4, -2], 9),
    // Section B (4 rows)
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 1, [4, 4, 3, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 2, [3, 6, 2, -2], 9),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 3, [1, 10, -2, -5], 4),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 4, [11, -2, -3, -5], 1),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 5, [13, -2, -2, -2], 7),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 6, [27, -5, -2, -2], 18),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 7, [32, -2, -2, -3], 25),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 8, [24, -4, -2, -5], 13),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 9, [22, -2, -2, -8], 10),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "B", 10, [6, 5, -2, -4], 5),
    // Section C (4 rows)
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 1, [10, 2, -2, -2], 8),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 2, [6, 6, -2, -2], 8),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 3, [12, -1, -2, -6], 3),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 4, [11, 11, -2, -2], 18),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 5, [20, -8, -2, -2], 8),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 6, [11, 10, -2, -8], 11),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 7, [17, -7, -2, 10], 18),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 8, [22, -2, -2, -3], 15),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 9, [12, 10, -2, -2], 18),
    makePdfQuestion("big-friend-minus-2", "Big Friend Rule (-2)", "-2 = -10 + 8", "C", 10, [6, 10, -5, -2], 9),
  ],
};

// ============================================================
// PRECISE QUESTION GENERATOR FOR ALL 31 WORKSHEET TYPES
// ============================================================
export function generateUntimedWorksheetQuestions(
  optionId: string,
  count: number = 30
): PracticeQuestion[] {
  // If this worksheet has an authentic PDF dataset provided by the user, return ONLY the exact PDF questions!
  if (PDF_EXACT_WORKSHEETS[optionId]) {
    const pdfQuestions = PDF_EXACT_WORKSHEETS[optionId];
    return count && count < pdfQuestions.length ? pdfQuestions.slice(0, count) : [...pdfQuestions];
  }

  // If this is one of the 26 authentic Small Friend or Big Friend rules, return the verified authentic single-rule questions!
  const ruleQuestions = getQuestionsForRule(optionId);
  if (ruleQuestions && ruleQuestions.length > 0) {
    return count && count < ruleQuestions.length ? ruleQuestions.slice(0, count) : [...ruleQuestions];
  }

  const option = UNTIMED_WORKSHEET_OPTIONS.find((o) => o.id === optionId) || UNTIMED_WORKSHEET_OPTIONS[0];
  const questions: PracticeQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const qId = `untimed-${optionId}-${i + 1}-${Date.now()}`;
    let numbers: number[] = [];
    let explanation = "";
    let ruleHint: string | undefined = option.ruleFormula;
    let digits: 1 | 2 | 3 | 4 | 5 = (option.digits as any) || 1;
    let rowCount = option.rowCount || 3;
    let questionType: QuestionType = "vertical-calc";
    let operation: "+" | "-" | "*" | "/" | undefined = option.operation;
    let factorA: number | undefined;
    let factorB: number | undefined;
    let dividend: number | undefined;
    let divisor: number | undefined;
    let targetAnswer = 0;

    // 1. SIMPLE 1 DIGIT (Direct)
    if (optionId === "simple-1digit") {
      digits = 1;
      const combined = [...SIMPLE_1DIGIT_SET_1_NUMBERS, ...SIMPLE_1DIGIT_SET_2_NUMBERS];
      numbers = [...combined[i % combined.length]];
      rowCount = numbers.length;
      const ans = sum(numbers);
      explanation = `Direct bead movement: ${numbers.join(" ")} = ${ans}`;
    }

    // 2. SIMPLE 2 DIGITS (Direct)
    else if (optionId === "simple-2digits") {
      digits = 2;
      const combined = [
        ...SIMPLE_2DIGIT_EXISTING_PAIRS,
        ...SIMPLE_2DIGIT_SET_3ROW_NUMBERS,
        ...SIMPLE_2DIGIT_SET_5ROW_NUMBERS,
      ];
      numbers = [...combined[i % combined.length]];
      rowCount = numbers.length;
      const ans = sum(numbers);
      explanation = `Direct 2-digit bead calculation on tens & units: ${numbers.join(" ")} = ${ans}`;
    }

    // 3. SMALL FRIEND +4 (+4 = +5 - 1)
    else if (optionId === "small-friend-plus-4") {
      const bases = [1, 2, 3, 4, 11, 21, 32, 43];
      const start = bases[i % bases.length];
      const rem = start > 10 ? -2 : i % 2 === 0 ? -1 : 2;
      numbers = [start, 4, rem];
      const ans = sum(numbers);
      ruleHint = "+4 = +5 - 1";
      explanation = `Step: add 4 using formula (+5 - 1). Total: ${ans}.`;
    }

    // 4. SMALL FRIEND +3 (+3 = +5 - 2)
    else if (optionId === "small-friend-plus-3") {
      const bases = [2, 3, 4, 12, 23, 34, 42];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -2 : 1;
      numbers = [start, 3, rem];
      const ans = sum(numbers);
      ruleHint = "+3 = +5 - 2";
      explanation = `Step: add 3 using formula (+5 - 2). Total: ${ans}.`;
    }

    // 5. SMALL FRIEND +2 (+2 = +5 - 3)
    else if (optionId === "small-friend-plus-2") {
      const bases = [3, 4, 13, 24, 33, 44];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -1 : 2;
      numbers = [start, 2, rem];
      const ans = sum(numbers);
      ruleHint = "+2 = +5 - 3";
      explanation = `Step: add 2 using formula (+5 - 3). Total: ${ans}.`;
    }

    // 6. SMALL FRIEND +1 (+1 = +5 - 4)
    else if (optionId === "small-friend-plus-1") {
      const bases = [4, 14, 24, 34, 44, 4];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -3 : 2;
      numbers = [start, 1, rem];
      const ans = sum(numbers);
      ruleHint = "+1 = +5 - 4";
      explanation = `Step: add 1 using formula (+5 - 4). Total: ${ans}.`;
    }

    // 7. SMALL FRIEND -4 (-4 = -5 + 1)
    else if (optionId === "small-friend-minus-4") {
      const bases = [5, 6, 7, 8, 15, 26, 37];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 2 : -1;
      numbers = [start, -4, rem];
      const ans = sum(numbers);
      ruleHint = "-4 = -5 + 1";
      explanation = `Step: subtract 4 using formula (-5 + 1). Total: ${ans}.`;
    }

    // 8. SMALL FRIEND -3 (-3 = -5 + 2)
    else if (optionId === "small-friend-minus-3") {
      const bases = [5, 6, 7, 15, 26, 37, 5];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 3 : -2;
      numbers = [start, -3, rem];
      const ans = sum(numbers);
      ruleHint = "-3 = -5 + 2";
      explanation = `Step: subtract 3 using formula (-5 + 2). Total: ${ans}.`;
    }

    // 9. SMALL FRIEND -2 (-2 = -5 + 3)
    else if (optionId === "small-friend-minus-2") {
      const bases = [5, 6, 15, 26, 35, 46];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 2 : -1;
      numbers = [start, -2, rem];
      const ans = sum(numbers);
      ruleHint = "-2 = -5 + 3";
      explanation = `Step: subtract 2 using formula (-5 + 3). Total: ${ans}.`;
    }

    // 10. SMALL FRIEND -1 (-1 = -5 + 4)
    else if (optionId === "small-friend-minus-1") {
      const bases = [5, 15, 25, 35, 45, 5];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 2 : -3;
      numbers = [start, -1, rem];
      const ans = sum(numbers);
      ruleHint = "-1 = -5 + 4";
      explanation = `Step: subtract 1 using formula (-5 + 4). Total: ${ans}.`;
    }

    // 11. BIG FRIEND +9 (+9 = -1 + 10)
    else if (optionId === "big-friend-plus-9") {
      const bases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 23];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -3 : 2;
      numbers = [start, 9, rem];
      const ans = sum(numbers);
      ruleHint = "+9 = -1 + 10";
      explanation = `Step: add 9 using formula (-1 + 10). Total: ${ans}.`;
    }

    // 12. BIG FRIEND +8 (+8 = -2 + 10)
    else if (optionId === "big-friend-plus-8") {
      const bases = [2, 3, 4, 5, 6, 7, 8, 13, 24];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -4 : 1;
      numbers = [start, 8, rem];
      const ans = sum(numbers);
      ruleHint = "+8 = -2 + 10";
      explanation = `Step: add 8 using formula (-2 + 10). Total: ${ans}.`;
    }

    // 13. BIG FRIEND +7 (+7 = -3 + 10)
    else if (optionId === "big-friend-plus-7") {
      const bases = [3, 4, 5, 6, 7, 8, 9, 14];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -2 : 3;
      numbers = [start, 7, rem];
      const ans = sum(numbers);
      ruleHint = "+7 = -3 + 10";
      explanation = `Step: add 7 using formula (-3 + 10). Total: ${ans}.`;
    }

    // 14. BIG FRIEND +6 (+6 = -4 + 10)
    else if (optionId === "big-friend-plus-6") {
      const bases = [4, 5, 6, 7, 8, 9, 14, 24];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -3 : 2;
      numbers = [start, 6, rem];
      const ans = sum(numbers);
      ruleHint = "+6 = -4 + 10";
      explanation = `Step: add 6 using formula (-4 + 10). Total: ${ans}.`;
    }

    // 15. BIG FRIEND +5 (+5 = -5 + 10)
    else if (optionId === "big-friend-plus-5") {
      const bases = [5, 6, 7, 8, 9, 15, 25];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -4 : 3;
      numbers = [start, 5, rem];
      const ans = sum(numbers);
      ruleHint = "+5 = -5 + 10";
      explanation = `Step: add 5 using formula (-5 + 10). Total: ${ans}.`;
    }

    // 16. BIG FRIEND +4 (+4 = -6 + 10)
    else if (optionId === "big-friend-plus-4") {
      const bases = [6, 7, 8, 9, 16, 27, 38];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -5 : 2;
      numbers = [start, 4, rem];
      const ans = sum(numbers);
      ruleHint = "+4 = -6 + 10";
      explanation = `Step: add 4 using formula (-6 + 10). Total: ${ans}.`;
    }

    // 17. BIG FRIEND +3 (+3 = -7 + 10)
    else if (optionId === "big-friend-plus-3") {
      const bases = [7, 8, 9, 17, 28, 39];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -3 : 2;
      numbers = [start, 3, rem];
      const ans = sum(numbers);
      ruleHint = "+3 = -7 + 10";
      explanation = `Step: add 3 using formula (-7 + 10). Total: ${ans}.`;
    }

    // 18. BIG FRIEND +2 (+2 = -8 + 10)
    else if (optionId === "big-friend-plus-2") {
      const bases = [8, 9, 18, 29, 38];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -4 : 1;
      numbers = [start, 2, rem];
      const ans = sum(numbers);
      ruleHint = "+2 = -8 + 10";
      explanation = `Step: add 2 using formula (-8 + 10). Total: ${ans}.`;
    }

    // 19. BIG FRIEND +1 (+1 = -9 + 10)
    else if (optionId === "big-friend-plus-1") {
      const bases = [9, 19, 29, 39, 49, 9];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? -5 : 3;
      numbers = [start, 1, rem];
      const ans = sum(numbers);
      ruleHint = "+1 = -9 + 10";
      explanation = `Step: add 1 using formula (-9 + 10). Total: ${ans}.`;
    }

    // 20. BIG FRIEND -9 (-9 = -10 + 1)
    else if (optionId === "big-friend-minus-9") {
      const bases = [10, 11, 12, 13, 14, 15, 16, 20, 25];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 3 : -1;
      numbers = [start, -9, rem];
      const ans = sum(numbers);
      ruleHint = "-9 = -10 + 1";
      explanation = `Step: subtract 9 using formula (-10 + 1). Total: ${ans}.`;
    }

    // 21. BIG FRIEND -8 (-8 = -10 + 2)
    else if (optionId === "big-friend-minus-8") {
      const bases = [10, 11, 12, 13, 14, 15, 20, 24];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 4 : -2;
      numbers = [start, -8, rem];
      const ans = sum(numbers);
      ruleHint = "-8 = -10 + 2";
      explanation = `Step: subtract 8 using formula (-10 + 2). Total: ${ans}.`;
    }

    // 22. BIG FRIEND -7 (-7 = -10 + 3)
    else if (optionId === "big-friend-minus-7") {
      const bases = [10, 11, 12, 13, 14, 15, 21, 23];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 2 : -3;
      numbers = [start, -7, rem];
      const ans = sum(numbers);
      ruleHint = "-7 = -10 + 3";
      explanation = `Step: subtract 7 using formula (-10 + 3). Total: ${ans}.`;
    }

    // 23. BIG FRIEND -6 (-6 = -10 + 4)
    else if (optionId === "big-friend-minus-6") {
      const bases = [10, 11, 12, 13, 14, 15, 22, 24];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 3 : -2;
      numbers = [start, -6, rem];
      const ans = sum(numbers);
      ruleHint = "-6 = -10 + 4";
      explanation = `Step: subtract 6 using formula (-10 + 4). Total: ${ans}.`;
    }

    // 24. BIG FRIEND -5 (-5 = -10 + 5)
    else if (optionId === "big-friend-minus-5") {
      const bases = [10, 11, 12, 13, 14, 20, 23];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 4 : -1;
      numbers = [start, -5, rem];
      const ans = sum(numbers);
      ruleHint = "-5 = -10 + 5";
      explanation = `Step: subtract 5 using formula (-10 + 5). Total: ${ans}.`;
    }

    // 25. BIG FRIEND -4 (-4 = -10 + 6)
    else if (optionId === "big-friend-minus-4") {
      const bases = [10, 11, 12, 13, 20, 22, 23];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 2 : -3;
      numbers = [start, -4, rem];
      const ans = sum(numbers);
      ruleHint = "-4 = -10 + 6";
      explanation = `Step: subtract 4 using formula (-10 + 6). Total: ${ans}.`;
    }

    // 26. BIG FRIEND -3 (-3 = -10 + 7)
    else if (optionId === "big-friend-minus-3") {
      const bases = [10, 11, 12, 20, 21, 22];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 3 : -2;
      numbers = [start, -3, rem];
      const ans = sum(numbers);
      ruleHint = "-3 = -10 + 7";
      explanation = `Step: subtract 3 using formula (-10 + 7). Total: ${ans}.`;
    }

    // 27. BIG FRIEND -2 (-2 = -10 + 8)
    else if (optionId === "big-friend-minus-2") {
      const bases = [10, 11, 20, 21, 30, 31];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 2 : -4;
      numbers = [start, -2, rem];
      const ans = sum(numbers);
      ruleHint = "-2 = -10 + 8";
      explanation = `Step: subtract 2 using formula (-10 + 8). Total: ${ans}.`;
    }

    // 28. BIG FRIEND -1 (-1 = -10 + 9)
    else if (optionId === "big-friend-minus-1") {
      const bases = [10, 20, 30, 40, 10, 20];
      const start = bases[i % bases.length];
      const rem = i % 2 === 0 ? 3 : -5;
      numbers = [start, -1, rem];
      const ans = sum(numbers);
      ruleHint = "-1 = -10 + 9";
      explanation = `Step: subtract 1 using formula (-10 + 9). Total: ${ans}.`;
    }

    // 29. 1 DIGIT 3 ROW WORKSHEET
    else if (optionId === "1digit-3row") {
      digits = 1;
      rowCount = 3;
      numbers = [...SIMPLE_1DIGIT_SET_1_NUMBERS[i % SIMPLE_1DIGIT_SET_1_NUMBERS.length]];
      const ans = sum(numbers);
      explanation = `3-Row Single Digit: ${numbers.join(" ")} = ${ans}`;
    }

    // 30. 1 DIGIT 5 ROW WORKSHEET
    else if (optionId === "1digit-5row") {
      digits = 1;
      rowCount = 5;
      numbers = [...SIMPLE_1DIGIT_SET_2_NUMBERS[i % SIMPLE_1DIGIT_SET_2_NUMBERS.length]];
      const ans = sum(numbers);
      explanation = `5-Row Single Digit: ${numbers.join(" ")} = ${ans}`;
    }

    // 31. 1 DIGIT 7 ROW WORKSHEET
    else if (optionId === "1digit-7row") {
      digits = 1;
      rowCount = 7;
      let cur = Math.floor(Math.random() * 4) + 3;
      numbers = [cur];
      for (let r = 1; r < 7; r++) {
        if (cur >= 6 && Math.random() > 0.45) {
          const sub = Math.floor(Math.random() * 4) + 1;
          numbers.push(-sub);
          cur -= sub;
        } else {
          const add = Math.floor(Math.random() * 3) + 1;
          numbers.push(add);
          cur += add;
        }
      }
      const ans = sum(numbers);
      explanation = `7-Row Single Digit: ${numbers.join(" ")} = ${ans}`;
    }

    // MULTIPLICATION WORKSHEETS (Levels 5, 6, 7)
    else if (option.operation === "*") {
      let f1 = 10;
      let f2 = 2;
      if (option.id === "l5-mul-2d-1d") {
        f1 = Math.floor(Math.random() * 90) + 10;
        f2 = Math.floor(Math.random() * 8) + 2;
      } else if (option.id === "l6-mul-3d-1d") {
        f1 = Math.floor(Math.random() * 900) + 100;
        f2 = Math.floor(Math.random() * 8) + 2;
      } else if (option.id === "l6-mul-4d-1d") {
        f1 = Math.floor(Math.random() * 9000) + 1000;
        f2 = Math.floor(Math.random() * 8) + 2;
      } else if (option.id === "l6-mul-2d-2d") {
        f1 = Math.floor(Math.random() * 90) + 10;
        f2 = Math.floor(Math.random() * 90) + 10;
      } else if (option.id === "l7-mul-3d-2d") {
        f1 = Math.floor(Math.random() * 900) + 100;
        f2 = Math.floor(Math.random() * 90) + 10;
      } else if (option.id === "l7-mul-3d-3d") {
        f1 = Math.floor(Math.random() * 900) + 100;
        f2 = Math.floor(Math.random() * 900) + 100;
      } else {
        f1 = Math.floor(Math.random() * 90) + 10;
        f2 = Math.floor(Math.random() * 8) + 2;
      }
      factorA = f1;
      factorB = f2;
      numbers = [f1, f2];
      questionType = "multiplication";
      targetAnswer = f1 * f2;
      explanation = `Multiplication: ${f1} × ${f2} = ${targetAnswer}`;
    }

    // DIVISION WORKSHEETS (Levels 6, 7)
    else if (option.operation === "/") {
      let div = 2;
      let quot = 5;
      if (option.id === "l6-div-2d-1d") {
        div = Math.floor(Math.random() * 8) + 2;
        quot = Math.floor(Math.random() * 40) + 5;
        while (div * quot >= 100 || div * quot < 10) {
          quot = Math.floor(Math.random() * 8) + 2;
        }
      } else if (option.id === "l7-div-3d-1d") {
        div = Math.floor(Math.random() * 8) + 2;
        quot = Math.floor(Math.random() * 300) + 50;
        while (div * quot >= 1000 || div * quot < 100) {
          quot = Math.floor(Math.random() * 80) + 12;
        }
      } else if (option.id === "l7-div-3d-2d") {
        div = Math.floor(Math.random() * 80) + 11;
        quot = Math.floor(Math.random() * 8) + 2;
        while (div * quot >= 1000 || div * quot < 100) {
          div = Math.floor(Math.random() * 40) + 11;
        }
      }
      dividend = div * quot;
      divisor = div;
      numbers = [dividend, divisor];
      questionType = "division";
      targetAnswer = quot;
      explanation = `Division: ${dividend} ÷ ${divisor} = ${quot}`;
    }

    // MULTI-ROW ADDITION & SUBTRACTION (Levels 2 - 8)
    else {
      digits = (option.digits as any) || 1;
      rowCount = option.rowCount || 3;
      numbers = generateMultiRowNumbers(digits, rowCount);
      targetAnswer = sum(numbers);
      questionType = "vertical-calc";
      explanation = `${rowCount}-Row (${digits}-Digit): ${numbers.map((n, idx) => (idx === 0 ? String(n) : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`)).join(" ")} = ${targetAnswer}`;
    }

    if (option.operation !== "*" && option.operation !== "/") {
      targetAnswer = sum(numbers);
    }

    let ruleType: RuleType = "direct";
    if (option.category.startsWith("small")) ruleType = "small-friend";
    else if (option.category.startsWith("big")) ruleType = "big-friend";
    else if (option.category === "multiplication") ruleType = "multiplication";
    else if (option.category === "division") ruleType = "division";
    else if (option.category === "mental") ruleType = "mental";

    questions.push({
      id: qId,
      level: option.level || 1,
      title: option.name,
      category: option.name,
      categoryId: option.id,
      ruleType,
      digits,
      rowCount: numbers.length,
      numbers,
      targetAnswer,
      questionType,
      operation,
      factorA,
      factorB,
      dividend,
      divisor,
      ruleHint,
      explanation,
    });
  }

  return questions;
}
