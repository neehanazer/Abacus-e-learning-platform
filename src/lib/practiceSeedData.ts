import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import PracticeWorksheet, { IPracticeWorksheet } from "@/models/PracticeWorksheet";
import PracticeQuestion, { IPracticeQuestion } from "@/models/PracticeQuestion";
import { SYLLABUS_CATALOG } from "@/lib/seedData";

export interface SeedWorksheetDef {
  _id: string;
  title: string;
  description: string;
  levelOrder: number;
  category: string;
  ruleType: string;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
  timeLimit: number;
  order: number;
  questions: {
    _id: string;
    question: string;
    questionType: "multipleChoice" | "numberInput" | "abacus";
    numbers: number[];
    correctAnswer: number;
    options: number[];
    difficulty: "easy" | "medium" | "hard";
    marks: number;
    ruleHint?: string;
    explanation: string;
  }[];
}

/**
 * Authentic Abacus practice worksheets and questions dataset.
 * Covers Simple 1D, 2D, Small Friends, Big Friends, Multi-row, Multiplication, and Division.
 */
export const PRACTICE_CATALOG: SeedWorksheetDef[] = [
  // =========================================================================
  // WORKSHEET 1: Simple 1-Digit Calculations (Without Rules)
  // =========================================================================
  {
    _id: "679900000000000000000001",
    title: "Simple 1-Digit Direct Calculations",
    description: "Direct addition and subtraction on single unit rod without formulas (1 to 4 and 5 bead).",
    levelOrder: 1,
    category: "Simple 1 Digit Calculations (Without Rules)",
    ruleType: "direct",
    difficulty: "easy",
    totalQuestions: 10,
    timeLimit: 300,
    order: 1,
    questions: [
      {
        _id: "679900000000000000001001",
        question: "Calculate on Abacus: +1 + 2",
        questionType: "numberInput",
        numbers: [1, 2],
        correctAnswer: 3,
        options: [2, 3, 4, 1],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Direct thumb flick upward",
        explanation: "Set 1 lower bead using thumb, then push 2 more lower beads up. Total = 3.",
      },
      {
        _id: "679900000000000000001002",
        question: "Calculate on Abacus: +2 + 2",
        questionType: "numberInput",
        numbers: [2, 2],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Direct lower bead addition",
        explanation: "Set 2 lower beads, add 2 lower beads using right thumb. Total = 4.",
      },
      {
        _id: "679900000000000000001003",
        question: "Calculate on Abacus: +4 - 3",
        questionType: "numberInput",
        numbers: [4, -3],
        correctAnswer: 1,
        options: [1, 2, 0, 3],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Direct index pull downward",
        explanation: "Set 4 lower beads, pull down 3 beads with index finger. Total = 1.",
      },
      {
        _id: "679900000000000000001004",
        question: "Calculate on Abacus: +3 + 1 - 2",
        questionType: "abacus",
        numbers: [3, 1, -2],
        correctAnswer: 2,
        options: [1, 2, 3, 4],
        difficulty: "easy",
        marks: 1,
        ruleHint: "3 + 1 = 4, then 4 - 2 = 2",
        explanation: "Set 3, push up 1 bead to make 4, pull down 2 beads with index finger = 2.",
      },
      {
        _id: "679900000000000000001005",
        question: "Calculate on Abacus: +5 + 3",
        questionType: "multipleChoice",
        numbers: [5, 3],
        correctAnswer: 8,
        options: [7, 8, 9, 6],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Heaven bead 5 + 3 earth beads",
        explanation: "Activate upper deck 5-bead with index, push 3 lower beads up with thumb = 8.",
      },
      {
        _id: "679900000000000000001006",
        question: "Calculate on Abacus: +7 - 2",
        questionType: "numberInput",
        numbers: [7, -2],
        correctAnswer: 5,
        options: [4, 5, 6, 3],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Direct subtraction from 7",
        explanation: "7 is 5-bead + 2 lower beads. Pull down 2 lower beads. Only 5-bead remains = 5.",
      },
      {
        _id: "679900000000000000001007",
        question: "Calculate on Abacus: +2 + 5 + 2",
        questionType: "numberInput",
        numbers: [2, 5, 2],
        correctAnswer: 9,
        options: [8, 9, 7, 10],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Direct 3-row calculation",
        explanation: "Push 2, bring down 5 with index, push 2 more lower beads up = 9.",
      },
      {
        _id: "679900000000000000001008",
        question: "Calculate on Abacus: +9 - 5 - 3",
        questionType: "abacus",
        numbers: [9, -5, -3],
        correctAnswer: 1,
        options: [1, 2, 0, 3],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Clear upper 5 bead and lower 3 beads",
        explanation: "Start at 9 (all beads active). Push up 5 bead (-5), pull down 3 lower beads (-3) = 1.",
      },
      {
        _id: "679900000000000000001009",
        question: "Calculate on Abacus: +1 + 1 + 2 - 3",
        questionType: "numberInput",
        numbers: [1, 1, 2, -3],
        correctAnswer: 1,
        options: [0, 1, 2, 3],
        difficulty: "medium",
        marks: 1,
        ruleHint: "4-row direct calculation",
        explanation: "1 + 1 = 2; + 2 = 4; - 3 = 1.",
      },
      {
        _id: "679900000000000000001010",
        question: "Calculate on Abacus: +6 + 3 - 7",
        questionType: "multipleChoice",
        numbers: [6, 3, -7],
        correctAnswer: 2,
        options: [1, 2, 3, 0],
        difficulty: "medium",
        marks: 1,
        ruleHint: "6 + 3 = 9; 9 - 7 = 2",
        explanation: "Pinch 6 (+6), add 3 lower beads (+3 = 9), unpinch 7 (-7 = 5 + 2 beads removed) = 2.",
      },
    ],
  },

  // =========================================================================
  // WORKSHEET 2: Simple 2-Digit Direct Calculations
  // =========================================================================
  {
    _id: "679900000000000000000002",
    title: "Simple 2-Digit Direct Calculations",
    description: "Two-digit simultaneous column calculation across Tens and Units columns without rules.",
    levelOrder: 1,
    category: "Simple 2 Digit Calculations (Without Rules)",
    ruleType: "direct",
    difficulty: "medium",
    totalQuestions: 8,
    timeLimit: 360,
    order: 2,
    questions: [
      {
        _id: "679900000000000000002001",
        question: "Calculate on Abacus: 12 + 21",
        questionType: "numberInput",
        numbers: [12, 21],
        correctAnswer: 33,
        options: [32, 33, 34, 23],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Tens: 1+2=3, Units: 2+1=3",
        explanation: "On tens column: 1 + 2 = 3. On units column: 2 + 1 = 3. Final answer = 33.",
      },
      {
        _id: "679900000000000000002002",
        question: "Calculate on Abacus: 23 + 51",
        questionType: "numberInput",
        numbers: [23, 51],
        correctAnswer: 74,
        options: [73, 74, 84, 64],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Tens: 2+5=7, Units: 3+1=4",
        explanation: "Tens column: 2 + 5 = 7. Units column: 3 + 1 = 4. Result = 74.",
      },
      {
        _id: "679900000000000000002003",
        question: "Calculate on Abacus: 44 + 55",
        questionType: "multipleChoice",
        numbers: [44, 55],
        correctAnswer: 99,
        options: [88, 99, 98, 100],
        difficulty: "easy",
        marks: 1,
        ruleHint: "Simultaneous 5-bead activation",
        explanation: "Add 50 on tens rod, add 5 on units rod. 44 + 55 = 99.",
      },
      {
        _id: "679900000000000000002004",
        question: "Calculate on Abacus: 78 - 26",
        questionType: "numberInput",
        numbers: [78, -26],
        correctAnswer: 52,
        options: [51, 52, 53, 42],
        difficulty: "medium",
        marks: 1,
        ruleHint: "Tens: 7-2=5, Units: 8-6=2",
        explanation: "Tens rod: 7 - 2 = 5. Units rod: 8 - 6 = 2. Result = 52.",
      },
      {
        _id: "679900000000000000002005",
        question: "Calculate on Abacus: 11 + 22 + 55",
        questionType: "numberInput",
        numbers: [11, 22, 55],
        correctAnswer: 88,
        options: [87, 88, 78, 99],
        difficulty: "medium",
        marks: 1,
        ruleHint: "3-row 2-digit direct sum",
        explanation: "11 + 22 = 33; 33 + 55 = 88.",
      },
      {
        _id: "679900000000000000002006",
        question: "Calculate on Abacus: 99 - 55 - 22",
        questionType: "abacus",
        numbers: [99, -55, -22],
        correctAnswer: 22,
        options: [21, 22, 33, 11],
        difficulty: "medium",
        marks: 1,
        ruleHint: "Direct subtraction in both rods",
        explanation: "99 - 55 = 44; 44 - 22 = 22.",
      },
      {
        _id: "679900000000000000002007",
        question: "Calculate on Abacus: 13 + 31 - 24",
        questionType: "multipleChoice",
        numbers: [13, 31, -24],
        correctAnswer: 20,
        options: [19, 20, 21, 22],
        difficulty: "hard",
        marks: 2,
        ruleHint: "13 + 31 = 44; 44 - 24 = 20",
        explanation: "13 + 31 = 44; 44 - 24: tens rod 4 - 2 = 2, units rod 4 - 4 = 0. Answer = 20.",
      },
      {
        _id: "679900000000000000002008",
        question: "Calculate on Abacus: 25 + 52 - 16",
        questionType: "numberInput",
        numbers: [25, 52, -16],
        correctAnswer: 61,
        options: [60, 61, 62, 51],
        difficulty: "hard",
        marks: 2,
        ruleHint: "25 + 52 = 77; 77 - 16 = 61",
        explanation: "25 + 52 = 77. Deduct 10 from tens rod (7 - 1 = 6) and 6 from units rod (7 - 6 = 1) = 61.",
      },
    ],
  },

  // =========================================================================
  // WORKSHEET 3: Small Friends Addition (+4, +3, +2, +1)
  // =========================================================================
  {
    _id: "679900000000000000000003",
    title: "Small Friends Addition (+4, +3, +2, +1)",
    description: "Complements to 5 addition rules when fewer than necessary lower beads are available.",
    levelOrder: 1,
    category: "Small Friend Rules (+4,+3,+2,+1,-4,-3,-2,-1)",
    ruleType: "small-friend",
    difficulty: "medium",
    totalQuestions: 8,
    timeLimit: 360,
    order: 3,
    questions: [
      {
        _id: "679900000000000000003001",
        question: "Calculate using Small Friend rule: 4 + 4",
        questionType: "numberInput",
        numbers: [4, 4],
        correctAnswer: 8,
        options: [7, 8, 9, 6],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+4 = +5 - 1",
        explanation: "Since only 0 lower beads are free, use +4 = +5 - 1. Add 5, subtract 1 = 8.",
      },
      {
        _id: "679900000000000000003002",
        question: "Calculate using Small Friend rule: 3 + 4",
        questionType: "numberInput",
        numbers: [3, 4],
        correctAnswer: 7,
        options: [6, 7, 8, 9],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+4 = +5 - 1",
        explanation: "Only 1 lower bead free. Apply +4 = +5 - 1. 3 + 5 - 1 = 7.",
      },
      {
        _id: "679900000000000000003003",
        question: "Calculate using Small Friend rule: 2 + 3",
        questionType: "multipleChoice",
        numbers: [2, 3],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+3 = +5 - 2",
        explanation: "Apply rule +3 = +5 - 2. Push 5-bead down, pull 2 lower beads down = 5.",
      },
      {
        _id: "679900000000000000003004",
        question: "Calculate using Small Friend rule: 4 + 3",
        questionType: "numberInput",
        numbers: [4, 3],
        correctAnswer: 7,
        options: [6, 7, 8, 9],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+3 = +5 - 2",
        explanation: "Apply formula: +3 = +5 - 2. 4 + 5 - 2 = 7.",
      },
      {
        _id: "679900000000000000003005",
        question: "Calculate using Small Friend rule: 3 + 2",
        questionType: "numberInput",
        numbers: [3, 2],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "medium",
        marks: 1,
        ruleHint: "+2 = +5 - 3",
        explanation: "Apply formula: +2 = +5 - 3. 3 + 5 - 3 = 5.",
      },
      {
        _id: "679900000000000000003006",
        question: "Calculate using Small Friend rule: 4 + 2",
        questionType: "abacus",
        numbers: [4, 2],
        correctAnswer: 6,
        options: [5, 6, 7, 8],
        difficulty: "medium",
        marks: 1,
        ruleHint: "+2 = +5 - 3",
        explanation: "Apply formula: +2 = +5 - 3. 4 + 5 - 3 = 6.",
      },
      {
        _id: "679900000000000000003007",
        question: "Calculate using Small Friend rule: 4 + 1",
        questionType: "numberInput",
        numbers: [4, 1],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+1 = +5 - 4",
        explanation: "Apply formula: +1 = +5 - 4. 4 + 5 - 4 = 5.",
      },
      {
        _id: "679900000000000000003008",
        question: "Calculate: 3 + 4 + 2",
        questionType: "multipleChoice",
        numbers: [3, 4, 2],
        correctAnswer: 9,
        options: [8, 9, 10, 7],
        difficulty: "hard",
        marks: 2,
        ruleHint: "Apply +4 = +5 - 1, then direct +2",
        explanation: "3 + 4 = 7 (using +5 - 1). Then direct +2 = 9.",
      },
    ],
  },

  // =========================================================================
  // WORKSHEET 4: Small Friends Subtraction (-4, -3, -2, -1)
  // =========================================================================
  {
    _id: "679900000000000000000004",
    title: "Small Friends Subtraction (-4, -3, -2, -1)",
    description: "Borrowing from the upper 5 bead when lower beads are insufficient.",
    levelOrder: 1,
    category: "Small Friend Rules (+4,+3,+2,+1,-4,-3,-2,-1)",
    ruleType: "small-friend",
    difficulty: "medium",
    totalQuestions: 8,
    timeLimit: 360,
    order: 4,
    questions: [
      {
        _id: "679900000000000000004001",
        question: "Calculate on Abacus: 5 - 4",
        questionType: "numberInput",
        numbers: [5, -4],
        correctAnswer: 1,
        options: [0, 1, 2, 3],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-4 = -5 + 1",
        explanation: "No lower beads are active. Clear upper 5 bead and push up 1 lower bead: -5 + 1 = 1.",
      },
      {
        _id: "679900000000000000004002",
        question: "Calculate on Abacus: 6 - 4",
        questionType: "numberInput",
        numbers: [6, -4],
        correctAnswer: 2,
        options: [1, 2, 3, 4],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-4 = -5 + 1",
        explanation: "Only 1 lower bead is active. Apply -4 = -5 + 1. 6 - 5 + 1 = 2.",
      },
      {
        _id: "679900000000000000004003",
        question: "Calculate on Abacus: 7 - 4",
        questionType: "multipleChoice",
        numbers: [7, -4],
        correctAnswer: 3,
        options: [2, 3, 4, 1],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-4 = -5 + 1",
        explanation: "Apply formula: -4 = -5 + 1. 7 - 5 + 1 = 3.",
      },
      {
        _id: "679900000000000000004004",
        question: "Calculate on Abacus: 5 - 3",
        questionType: "numberInput",
        numbers: [5, -3],
        correctAnswer: 2,
        options: [1, 2, 3, 0],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-3 = -5 + 2",
        explanation: "Apply formula: -3 = -5 + 2. Clear 5-bead and raise 2 lower beads = 2.",
      },
      {
        _id: "679900000000000000004005",
        question: "Calculate on Abacus: 6 - 3",
        questionType: "abacus",
        numbers: [6, -3],
        correctAnswer: 3,
        options: [2, 3, 4, 5],
        difficulty: "medium",
        marks: 1,
        ruleHint: "-3 = -5 + 2",
        explanation: "6 - 5 + 2 = 3.",
      },
      {
        _id: "679900000000000000004006",
        question: "Calculate on Abacus: 5 - 2",
        questionType: "numberInput",
        numbers: [5, -2],
        correctAnswer: 3,
        options: [2, 3, 4, 1],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-2 = -5 + 3",
        explanation: "Apply formula: -2 = -5 + 3. 5 - 5 + 3 = 3.",
      },
      {
        _id: "679900000000000000004007",
        question: "Calculate on Abacus: 5 - 1",
        questionType: "numberInput",
        numbers: [5, -1],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-1 = -5 + 4",
        explanation: "Apply formula: -1 = -5 + 4. 5 - 5 + 4 = 4.",
      },
      {
        _id: "679900000000000000004008",
        question: "Calculate: 7 - 3 + 4",
        questionType: "multipleChoice",
        numbers: [7, -3, 4],
        correctAnswer: 8,
        options: [7, 8, 9, 6],
        difficulty: "hard",
        marks: 2,
        ruleHint: "Combine Small Friend subtraction and addition",
        explanation: "7 - 3 = 4 (via -5 + 2); then 4 + 4 = 8 (via +5 - 1) = 8.",
      },
    ],
  },

  // =========================================================================
  // WORKSHEET 5: Big Friends Addition (+9 to +1)
  // =========================================================================
  {
    _id: "679900000000000000000005",
    title: "Big Friends Addition (+9 to +1)",
    description: "Base-10 carrying rules when the unit rod exceeds 9.",
    levelOrder: 1,
    category: "Big Friend Rules (+9..+1, -9..-1)",
    ruleType: "big-friend",
    difficulty: "medium",
    totalQuestions: 8,
    timeLimit: 360,
    order: 5,
    questions: [
      {
        _id: "679900000000000000005001",
        question: "Calculate on Abacus: 9 + 9",
        questionType: "numberInput",
        numbers: [9, 9],
        correctAnswer: 18,
        options: [17, 18, 19, 16],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+9 = -1 + 10",
        explanation: "Unit rod is full. Subtract 1 on unit rod and add 10 on tens rod = 18.",
      },
      {
        _id: "679900000000000000005002",
        question: "Calculate on Abacus: 8 + 8",
        questionType: "numberInput",
        numbers: [8, 8],
        correctAnswer: 16,
        options: [15, 16, 17, 18],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+8 = -2 + 10",
        explanation: "Apply formula: +8 = -2 + 10. Subtract 2 from unit rod, add 1 on tens rod = 16.",
      },
      {
        _id: "679900000000000000005003",
        question: "Calculate on Abacus: 7 + 7",
        questionType: "multipleChoice",
        numbers: [7, 7],
        correctAnswer: 14,
        options: [13, 14, 15, 16],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+7 = -3 + 10",
        explanation: "Apply formula: +7 = -3 + 10. 7 - 3 + 10 = 14.",
      },
      {
        _id: "679900000000000000005004",
        question: "Calculate on Abacus: 6 + 6",
        questionType: "numberInput",
        numbers: [6, 6],
        correctAnswer: 12,
        options: [11, 12, 13, 10],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+6 = -4 + 10",
        explanation: "Apply formula: +6 = -4 + 10. 6 - 4 + 10 = 12.",
      },
      {
        _id: "679900000000000000005005",
        question: "Calculate on Abacus: 5 + 5",
        questionType: "abacus",
        numbers: [5, 5],
        correctAnswer: 10,
        options: [9, 10, 11, 15],
        difficulty: "easy",
        marks: 1,
        ruleHint: "+5 = -5 + 10",
        explanation: "Clear 5 bead on units rod, add 1 on tens rod = 10.",
      },
      {
        _id: "679900000000000000005006",
        question: "Calculate on Abacus: 9 + 4",
        questionType: "numberInput",
        numbers: [9, 4],
        correctAnswer: 13,
        options: [12, 13, 14, 15],
        difficulty: "medium",
        marks: 1,
        ruleHint: "+4 = -6 + 10",
        explanation: "Apply formula: +4 = -6 + 10. 9 - 6 + 10 = 13.",
      },
      {
        _id: "679900000000000000005007",
        question: "Calculate on Abacus: 9 + 3",
        questionType: "numberInput",
        numbers: [9, 3],
        correctAnswer: 12,
        options: [11, 12, 13, 14],
        difficulty: "medium",
        marks: 1,
        ruleHint: "+3 = -7 + 10",
        explanation: "Apply formula: +3 = -7 + 10. 9 - 7 + 10 = 12.",
      },
      {
        _id: "679900000000000000005008",
        question: "Calculate: 9 + 8 + 7",
        questionType: "multipleChoice",
        numbers: [9, 8, 7],
        correctAnswer: 24,
        options: [23, 24, 25, 26],
        difficulty: "hard",
        marks: 2,
        ruleHint: "Sequential Big Friends: +8 = -2+10, +7 = -3+10",
        explanation: "9 + 8 = 17 (via -2 + 10); 17 + 7 = 24 (via -3 + 10). Result = 24.",
      },
    ],
  },

  // =========================================================================
  // WORKSHEET 6: Big Friends Subtraction (-9 to -1)
  // =========================================================================
  {
    _id: "679900000000000000000006",
    title: "Big Friends Subtraction (-9 to -1)",
    description: "Borrowing from the tens column (-10) and compensating on the unit column.",
    levelOrder: 2,
    category: "Big Friends Subtraction (-9 to -1)",
    ruleType: "big-friend",
    difficulty: "medium",
    totalQuestions: 8,
    timeLimit: 360,
    order: 6,
    questions: [
      {
        _id: "679900000000000000006001",
        question: "Calculate on Abacus: 15 - 9",
        questionType: "numberInput",
        numbers: [15, -9],
        correctAnswer: 6,
        options: [5, 6, 7, 8],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-9 = -10 + 1",
        explanation: "Borrow from tens rod (-10), add 1 to units rod (+1): 15 - 10 + 1 = 6.",
      },
      {
        _id: "679900000000000000006002",
        question: "Calculate on Abacus: 12 - 8",
        questionType: "numberInput",
        numbers: [12, -8],
        correctAnswer: 4,
        options: [3, 4, 5, 6],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-8 = -10 + 2",
        explanation: "Retract 1 bead on tens rod (-10), push 2 beads up on units rod (+2) = 4.",
      },
      {
        _id: "679900000000000000006003",
        question: "Calculate on Abacus: 14 - 7",
        questionType: "multipleChoice",
        numbers: [14, -7],
        correctAnswer: 7,
        options: [6, 7, 8, 9],
        difficulty: "easy",
        marks: 1,
        ruleHint: "-7 = -10 + 3",
        explanation: "Retract tens bead (-10), add 3 on units rod (+3) = 7.",
      },
      {
        _id: "679900000000000000006004",
        question: "Calculate on Abacus: 13 - 6",
        questionType: "numberInput",
        numbers: [13, -6],
        correctAnswer: 7,
        options: [6, 7, 8, 9],
        difficulty: "medium",
        marks: 1,
        ruleHint: "-6 = -10 + 4",
        explanation: "Retract 10, add 4 on units rod = 7.",
      },
      {
        _id: "679900000000000000006005",
        question: "Calculate on Abacus: 11 - 5",
        questionType: "abacus",
        numbers: [11, -5],
        correctAnswer: 6,
        options: [5, 6, 7, 4],
        difficulty: "medium",
        marks: 1,
        ruleHint: "-5 = -10 + 5",
        explanation: "Retract 10, activate 5-bead on units rod = 6.",
      },
      {
        _id: "679900000000000000006006",
        question: "Calculate on Abacus: 12 - 4",
        questionType: "numberInput",
        numbers: [12, -4],
        correctAnswer: 8,
        options: [7, 8, 9, 6],
        difficulty: "medium",
        marks: 1,
        ruleHint: "-4 = -10 + 6",
        explanation: "Retract 10, add 6 on units rod = 8.",
      },
      {
        _id: "679900000000000000006007",
        question: "Calculate on Abacus: 11 - 3",
        questionType: "numberInput",
        numbers: [11, -3],
        correctAnswer: 8,
        options: [7, 8, 9, 6],
        difficulty: "medium",
        marks: 1,
        ruleHint: "-3 = -10 + 7",
        explanation: "Retract 10, add 7 on units rod = 8.",
      },
      {
        _id: "679900000000000000006008",
        question: "Calculate: 25 - 9 - 8",
        questionType: "multipleChoice",
        numbers: [25, -9, -8],
        correctAnswer: 8,
        options: [7, 8, 9, 10],
        difficulty: "hard",
        marks: 2,
        ruleHint: "25 - 9 = 16 (via -10+1); 16 - 8 = 8 (via -10+2)",
        explanation: "25 - 9 = 16. Then 16 - 8 = 8. Final answer = 8.",
      },
    ],
  },
];

/**
 * Fallback helpers when MongoDB is offline / pending IP whitelist
 */
export function getFallbackWorksheets(filter?: {
  levelOrder?: number;
  ruleType?: string;
  difficulty?: string;
}) {
  let list = PRACTICE_CATALOG;

  if (filter?.levelOrder) {
    list = list.filter((w) => w.levelOrder === filter.levelOrder);
  }
  if (filter?.ruleType && filter.ruleType !== "all") {
    list = list.filter((w) => w.ruleType === filter.ruleType);
  }
  if (filter?.difficulty && filter.difficulty !== "all") {
    list = list.filter((w) => w.difficulty === filter.difficulty);
  }

  return list.map((w) => ({
    _id: w._id,
    title: w.title,
    description: w.description,
    levelOrder: w.levelOrder,
    category: w.category,
    ruleType: w.ruleType,
    difficulty: w.difficulty,
    totalQuestions: w.totalQuestions,
    timeLimit: w.timeLimit,
    order: w.order,
    status: "active",
  }));
}

export function getFallbackWorksheet(worksheetId: string) {
  const w = PRACTICE_CATALOG.find((item) => item._id === worksheetId);
  if (!w) return null;
  return {
    _id: w._id,
    title: w.title,
    description: w.description,
    levelOrder: w.levelOrder,
    category: w.category,
    ruleType: w.ruleType,
    difficulty: w.difficulty,
    totalQuestions: w.totalQuestions,
    timeLimit: w.timeLimit,
    order: w.order,
    status: "active",
    questions: w.questions,
  };
}

export function getFallbackQuestions(worksheetId: string) {
  const w = PRACTICE_CATALOG.find((item) => item._id === worksheetId);
  return w ? w.questions : [];
}

/**
 * Seeds practice worksheets and questions directly into MongoDB collections.
 */
export async function seedPracticeData(force = false) {
  await connectToDatabase();

  const existingCount = await PracticeWorksheet.countDocuments();
  if (existingCount > 0 && !force) {
    return {
      message: `Practice already seeded with ${existingCount} worksheets.`,
      seeded: false,
      count: existingCount,
    };
  }

  if (force) {
    await PracticeQuestion.deleteMany({});
    await PracticeWorksheet.deleteMany({});
  }

  let totalWorksheets = 0;
  let totalQuestions = 0;

  for (const wDef of PRACTICE_CATALOG) {
    // Find matching level
    let levelDoc = await Level.findOne({ order: wDef.levelOrder });
    if (!levelDoc) {
      // Find or default
      levelDoc = await Level.findOne().sort({ order: 1 });
    }

    const levelId = levelDoc?._id || new mongoose.Types.ObjectId("678900000000000000000001");

    const worksheetDoc = await PracticeWorksheet.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(wDef._id) },
      {
        $set: {
          title: wDef.title,
          description: wDef.description,
          levelId,
          category: wDef.category,
          ruleType: wDef.ruleType,
          difficulty: wDef.difficulty,
          totalQuestions: wDef.questions.length,
          timeLimit: wDef.timeLimit,
          order: wDef.order,
          status: "active",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    totalWorksheets++;

    for (const qDef of wDef.questions) {
      await PracticeQuestion.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(qDef._id) },
        {
          $set: {
            levelId,
            worksheetId: worksheetDoc._id,
            question: qDef.question,
            questionType: qDef.questionType,
            numbers: qDef.numbers,
            correctAnswer: qDef.correctAnswer,
            options: qDef.options,
            difficulty: qDef.difficulty,
            marks: qDef.marks,
            ruleHint: qDef.ruleHint || "",
            explanation: qDef.explanation,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      totalQuestions++;
    }
  }

  return {
    message: "Practice worksheets and questions successfully seeded into MongoDB!",
    seeded: true,
    totalWorksheets,
    totalQuestions,
  };
}
