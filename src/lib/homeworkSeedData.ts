import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import Lesson from "@/models/Lesson";
import Homework, { IHomework } from "@/models/Homework";
import HomeworkQuestion, { IHomeworkQuestion } from "@/models/HomeworkQuestion";

export interface SeedHomeworkQuestionDef {
  _id: string;
  question: string;
  questionType: "multipleChoice" | "numberInput" | "abacus";
  numbers: number[];
  correctAnswer: number;
  options: number[];
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  operation: string;
  ruleHint?: string;
  explanation: string;
  order: number;
}

export interface SeedHomeworkDef {
  _id: string;
  homeworkNumber: number;
  title: string;
  description: string;
  levelOrder: number;
  levelId: string;
  topicId: string;
  lessonId: string;
  lessonNumber: number;
  recommendedTime: number; // in minutes
  dueDateDaysAhead: number;
  status: "pending" | "inProgress" | "submitted" | "evaluated";
  questions: SeedHomeworkQuestionDef[];
}

export const HOMEWORK_CATALOG: SeedHomeworkDef[] = [
  // =========================================================================
  // HOMEWORK 1: Linked to Lesson 1 (Introduction & Direct 1-Digit Calculation)
  // =========================================================================
  {
    _id: "67a900000000000000000001",
    homeworkNumber: 1,
    title: "Homework 01: Direct 1-Digit Calculation",
    description:
      "Complete the following 10 single-digit addition and subtraction questions using direct finger movements on your unit rod. No formulas needed!",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    topicId: "678900000000000000010001",
    lessonId: "678900000000000001000001",
    lessonNumber: 1,
    recommendedTime: 10,
    dueDateDaysAhead: 7,
    status: "pending",
    questions: [
      {
        _id: "67aa00000000000000001001",
        question: "Calculate on unit rod: +1 + 2",
        questionType: "numberInput",
        numbers: [1, 2],
        correctAnswer: 3,
        options: [2, 3, 4, 5],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Direct thumb flick: Push 1 bead up, then push 2 beads up.",
        explanation: "1 + 2 = 3 using direct lower bead movements.",
        order: 1,
      },
      {
        _id: "67aa00000000000000001002",
        question: "Calculate on unit rod: +2 + 2",
        questionType: "numberInput",
        numbers: [2, 2],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Direct thumb: push 2 lower beads, then 2 more lower beads.",
        explanation: "2 + 2 = 4 on the unit rod.",
        order: 2,
      },
      {
        _id: "67aa00000000000000001003",
        question: "Calculate on unit rod: +4 - 3",
        questionType: "numberInput",
        numbers: [4, -3],
        correctAnswer: 1,
        options: [1, 2, 0, 3],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "Direct index finger: Pull 3 lower beads down away from the beam.",
        explanation: "4 - 3 = 1.",
        order: 3,
      },
      {
        _id: "67aa00000000000000001004",
        question: "Calculate on unit rod: +3 - 1 + 2",
        questionType: "numberInput",
        numbers: [3, -1, 2],
        correctAnswer: 4,
        options: [4, 5, 3, 2],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Direct: push 3 up, pull 1 down, push 2 up.",
        explanation: "3 - 1 + 2 = 4.",
        order: 4,
      },
      {
        _id: "67aa00000000000000001005",
        question: "Calculate on unit rod: +1 + 1 + 2",
        questionType: "numberInput",
        numbers: [1, 1, 2],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Consecutive thumb flicks upward.",
        explanation: "1 + 1 + 2 = 4.",
        order: 5,
      },
      {
        _id: "67aa00000000000000001006",
        question: "Calculate on unit rod: +4 - 2 - 1",
        questionType: "numberInput",
        numbers: [4, -2, -1],
        correctAnswer: 1,
        options: [1, 2, 3, 0],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "Push 4 up with thumb, pull 2 down with index, pull 1 down with index.",
        explanation: "4 - 2 - 1 = 1.",
        order: 6,
      },
      {
        _id: "67aa00000000000000001007",
        question: "Calculate on unit rod: +2 + 1 - 3",
        questionType: "numberInput",
        numbers: [2, 1, -3],
        correctAnswer: 0,
        options: [0, 1, 2, 3],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "All beads cleared from beam. Result is zero.",
        explanation: "2 + 1 - 3 = 0.",
        order: 7,
      },
      {
        _id: "67aa00000000000000001008",
        question: "Calculate on unit rod: +3 + 1 - 2 + 1",
        questionType: "numberInput",
        numbers: [3, 1, -2, 1],
        correctAnswer: 3,
        options: [2, 3, 4, 1],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "Follow bead order carefully: +3, +1 (=4), -2 (=2), +1 (=3).",
        explanation: "3 + 1 - 2 + 1 = 3.",
        order: 8,
      },
      {
        _id: "67aa00000000000000001009",
        question: "Calculate on unit rod: +1 + 3 - 4 + 2",
        questionType: "numberInput",
        numbers: [1, 3, -4, 2],
        correctAnswer: 2,
        options: [1, 2, 3, 4],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "Direct movements only.",
        explanation: "1 + 3 = 4, 4 - 4 = 0, 0 + 2 = 2.",
        order: 9,
      },
      {
        _id: "67aa00000000000000001010",
        question: "Calculate on unit rod: +2 + 2 - 1 - 2",
        questionType: "numberInput",
        numbers: [2, 2, -1, -2],
        correctAnswer: 1,
        options: [1, 2, 3, 0],
        difficulty: "medium",
        marks: 1,
        operation: "-",
        ruleHint: "Push 2, push 2, pull 1, pull 2.",
        explanation: "2 + 2 - 1 - 2 = 1.",
        order: 10,
      },
    ],
  },

  // =========================================================================
  // HOMEWORK 2: Linked to Lesson 2 (Direct Addition & Subtraction (1 to 4))
  // =========================================================================
  {
    _id: "67a900000000000000000002",
    homeworkNumber: 2,
    title: "Homework 02: 2-Digit Direct Manipulations",
    description:
      "Practice 2-digit numbers using simultaneous left-hand (tens rod) and right-hand (unit rod) finger flicks.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    topicId: "678900000000000000010001",
    lessonId: "678900000000000001000002",
    lessonNumber: 2,
    recommendedTime: 12,
    dueDateDaysAhead: 7,
    status: "pending",
    questions: [
      {
        _id: "67aa00000000000000002001",
        question: "Calculate across tens & units: +12 + 21",
        questionType: "numberInput",
        numbers: [12, 21],
        correctAnswer: 33,
        options: [31, 33, 34, 43],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Tens rod: 1 + 2 = 3. Units rod: 2 + 1 = 3.",
        explanation: "12 + 21 = 33.",
        order: 1,
      },
      {
        _id: "67aa00000000000000002002",
        question: "Calculate: +23 + 11",
        questionType: "numberInput",
        numbers: [23, 11],
        correctAnswer: 34,
        options: [34, 35, 44, 33],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Tens rod: 2 + 1 = 3. Units rod: 3 + 1 = 4.",
        explanation: "23 + 11 = 34.",
        order: 2,
      },
      {
        _id: "67aa00000000000000002003",
        question: "Calculate: +44 - 22",
        questionType: "numberInput",
        numbers: [44, -22],
        correctAnswer: 22,
        options: [22, 20, 24, 18],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "Pull 2 beads down on both tens and units rods.",
        explanation: "44 - 22 = 22.",
        order: 3,
      },
      {
        _id: "67aa00000000000000002004",
        question: "Calculate: +31 + 12 - 21",
        questionType: "numberInput",
        numbers: [31, 12, -21],
        correctAnswer: 22,
        options: [22, 24, 21, 23],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "Step 1: 31 + 12 = 43. Step 2: 43 - 21 = 22.",
        explanation: "31 + 12 - 21 = 22.",
        order: 4,
      },
      {
        _id: "67aa00000000000000002005",
        question: "Calculate: +11 + 22 + 11",
        questionType: "numberInput",
        numbers: [11, 22, 11],
        correctAnswer: 44,
        options: [44, 43, 34, 42],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "Direct flicks on both rods up to 4 beads each.",
        explanation: "11 + 22 + 11 = 44.",
        order: 5,
      },
      {
        _id: "67aa00000000000000002006",
        question: "Calculate: +43 - 12 - 21",
        questionType: "numberInput",
        numbers: [43, -12, -21],
        correctAnswer: 10,
        options: [10, 11, 12, 9],
        difficulty: "medium",
        marks: 1,
        operation: "-",
        ruleHint: "Tens rod: 4 - 1 - 2 = 1. Units rod: 3 - 2 - 1 = 0.",
        explanation: "43 - 12 - 21 = 10.",
        order: 6,
      },
      {
        _id: "67aa00000000000000002007",
        question: "Calculate: +20 + 14 - 12",
        questionType: "numberInput",
        numbers: [20, 14, -12],
        correctAnswer: 22,
        options: [22, 24, 21, 20],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "Keep track of zero on units rod in step 1.",
        explanation: "20 + 14 = 34; 34 - 12 = 22.",
        order: 7,
      },
      {
        _id: "67aa00000000000000002008",
        question: "Calculate: +13 + 31 - 24",
        questionType: "numberInput",
        numbers: [13, 31, -24],
        correctAnswer: 20,
        options: [20, 22, 18, 24],
        difficulty: "hard",
        marks: 1,
        operation: "-",
        ruleHint: "13 + 31 = 44. Then 44 - 24 = 20.",
        explanation: "13 + 31 - 24 = 20.",
        order: 8,
      },
    ],
  },

  // =========================================================================
  // HOMEWORK 3: Linked to Lesson 3 (Heaven Bead Activations - The Number 5)
  // =========================================================================
  {
    _id: "67a900000000000000000003",
    homeworkNumber: 3,
    title: "Homework 03: Heaven Bead 5 Manipulations",
    description:
      "Practice activating and deactivating the 5-bead in the upper deck using the index finger combined with lower earth beads.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    topicId: "678900000000000000010001",
    lessonId: "678900000000000001000003",
    lessonNumber: 3,
    recommendedTime: 12,
    dueDateDaysAhead: 7,
    status: "pending",
    questions: [
      {
        _id: "67aa00000000000000003001",
        question: "Calculate on unit rod: +5 + 3",
        questionType: "numberInput",
        numbers: [5, 3],
        correctAnswer: 8,
        options: [7, 8, 9, 6],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Index finger pulls 5 down to beam, thumb pushes 3 earth beads up.",
        explanation: "5 + 3 = 8.",
        order: 1,
      },
      {
        _id: "67aa00000000000000003002",
        question: "Calculate: +5 + 4 - 2",
        questionType: "numberInput",
        numbers: [5, 4, -2],
        correctAnswer: 7,
        options: [6, 7, 8, 5],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "5 + 4 = 9 (full rod). Pull 2 earth beads away.",
        explanation: "5 + 4 - 2 = 7.",
        order: 2,
      },
      {
        _id: "67aa00000000000000003003",
        question: "Calculate: +9 - 5 + 1",
        questionType: "numberInput",
        numbers: [9, -5, 1],
        correctAnswer: 5,
        options: [4, 5, 6, 3],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Clear 5-bead up with index: 9 - 5 = 4. Then 4 + 1... wait: 4 + 1 is 5.",
        explanation: "9 - 5 = 4; 4 + 1 = 5 (or using small friend: 5).",
        order: 3,
      },
      {
        _id: "67aa00000000000000003004",
        question: "Calculate: +2 + 5 - 1",
        questionType: "numberInput",
        numbers: [2, 5, -1],
        correctAnswer: 6,
        options: [6, 7, 5, 8],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "Push 2, bring down 5 (=7), pull down 1 (=6).",
        explanation: "2 + 5 - 1 = 6.",
        order: 4,
      },
      {
        _id: "67aa00000000000000003005",
        question: "Calculate: +8 - 3 + 2",
        questionType: "numberInput",
        numbers: [8, -3, 2],
        correctAnswer: 7,
        options: [7, 6, 8, 5],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "8 = (5 + 3). Remove 3 earth beads (=5). Add 2 earth beads (=7).",
        explanation: "8 - 3 + 2 = 7.",
        order: 5,
      },
      {
        _id: "67aa00000000000000003006",
        question: "Calculate: +7 - 2 - 5 + 3",
        questionType: "numberInput",
        numbers: [7, -2, -5, 3],
        correctAnswer: 3,
        options: [3, 2, 4, 1],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "7 - 2 = 5. 5 - 5 = 0. 0 + 3 = 3.",
        explanation: "7 - 2 - 5 + 3 = 3.",
        order: 6,
      },
      {
        _id: "67aa00000000000000003007",
        question: "Calculate: +6 + 3 - 5 - 2",
        questionType: "numberInput",
        numbers: [6, 3, -5, -2],
        correctAnswer: 2,
        options: [2, 1, 3, 4],
        difficulty: "medium",
        marks: 1,
        operation: "-",
        ruleHint: "6 + 3 = 9. 9 - 5 = 4. 4 - 2 = 2.",
        explanation: "6 + 3 - 5 - 2 = 2.",
        order: 7,
      },
      {
        _id: "67aa00000000000000003008",
        question: "Calculate: +5 + 2 + 1 - 6",
        questionType: "numberInput",
        numbers: [5, 2, 1, -6],
        correctAnswer: 2,
        options: [2, 1, 3, 0],
        difficulty: "hard",
        marks: 1,
        operation: "-",
        ruleHint: "5 + 2 + 1 = 8. Subtract 6 (open pinch 5 and 1) = 2.",
        explanation: "8 - 6 = 2.",
        order: 8,
      },
    ],
  },

  // =========================================================================
  // HOMEWORK 4: Linked to Lesson 4 (Small Friend Addition +4 = +5 - 1)
  // =========================================================================
  {
    _id: "67a900000000000000000004",
    homeworkNumber: 4,
    title: "Homework 04: Small Friends Addition (+4 Rule)",
    description:
      "Apply the Small Friend formula (+4 = +5 - 1) whenever there are not enough lower beads to add 4 directly.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    topicId: "678900000000000000010002",
    lessonId: "678900000000000001000004",
    lessonNumber: 4,
    recommendedTime: 15,
    dueDateDaysAhead: 7,
    status: "pending",
    questions: [
      {
        _id: "67aa00000000000000004001",
        question: "Calculate: +1 + 4",
        questionType: "numberInput",
        numbers: [1, 4],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "+4 = +5 - 1 (Pull down 5 with index, pull down 1 with index).",
        explanation: "1 + 4 = 5 using small friend rule +5 - 1.",
        order: 1,
      },
      {
        _id: "67aa00000000000000004002",
        question: "Calculate: +2 + 4",
        questionType: "numberInput",
        numbers: [2, 4],
        correctAnswer: 6,
        options: [5, 6, 7, 8],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "+4 = +5 - 1. 2 + 5 - 1 = 6.",
        explanation: "2 + 4 = 6.",
        order: 2,
      },
      {
        _id: "67aa00000000000000004003",
        question: "Calculate: +3 + 4 - 2",
        questionType: "numberInput",
        numbers: [3, 4, -2],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "3 + 4 = 7 (+5 - 1). Then 7 - 2 = 5.",
        explanation: "3 + 4 - 2 = 5.",
        order: 3,
      },
      {
        _id: "67aa00000000000000004004",
        question: "Calculate: +4 + 4 - 3",
        questionType: "numberInput",
        numbers: [4, 4, -3],
        correctAnswer: 5,
        options: [5, 6, 4, 3],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "4 + 4 (+5 - 1) = 8. Then 8 - 3 = 5.",
        explanation: "4 + 4 - 3 = 5.",
        order: 4,
      },
      {
        _id: "67aa00000000000000004005",
        question: "Calculate: +1 + 4 + 2 - 1",
        questionType: "numberInput",
        numbers: [1, 4, 2, -1],
        correctAnswer: 6,
        options: [5, 6, 7, 8],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "1 + 4 = 5. 5 + 2 = 7. 7 - 1 = 6.",
        explanation: "1 + 4 + 2 - 1 = 6.",
        order: 5,
      },
      {
        _id: "67aa00000000000000004006",
        question: "Calculate: +2 + 4 - 5 + 3",
        questionType: "numberInput",
        numbers: [2, 4, -5, 3],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "hard",
        marks: 1,
        operation: "+",
        ruleHint: "2 + 4 = 6. 6 - 5 = 1. 1 + 3 = 4.",
        explanation: "2 + 4 - 5 + 3 = 4.",
        order: 6,
      },
    ],
  },

  // =========================================================================
  // HOMEWORK 5: Linked to Lesson 5 (Small Friend Addition +3, +2, +1)
  // =========================================================================
  {
    _id: "67a900000000000000000005",
    homeworkNumber: 5,
    title: "Homework 05: Small Friends Addition (+3, +2, +1)",
    description:
      "Practice formulas (+3 = +5 - 2), (+2 = +5 - 3), and (+1 = +5 - 4) with multi-row arithmetic.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    topicId: "678900000000000000010002",
    lessonId: "678900000000000001000005",
    lessonNumber: 5,
    recommendedTime: 15,
    dueDateDaysAhead: 7,
    status: "pending",
    questions: [
      {
        _id: "67aa00000000000000005001",
        question: "Calculate: +2 + 3",
        questionType: "numberInput",
        numbers: [2, 3],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "+3 = +5 - 2.",
        explanation: "2 + 3 = 5.",
        order: 1,
      },
      {
        _id: "67aa00000000000000005002",
        question: "Calculate: +3 + 3",
        questionType: "numberInput",
        numbers: [3, 3],
        correctAnswer: 6,
        options: [5, 6, 7, 8],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "+3 = +5 - 2. 3 + 5 - 2 = 6.",
        explanation: "3 + 3 = 6.",
        order: 2,
      },
      {
        _id: "67aa00000000000000005003",
        question: "Calculate: +3 + 2",
        questionType: "numberInput",
        numbers: [3, 2],
        correctAnswer: 5,
        options: [4, 5, 6, 7],
        difficulty: "easy",
        marks: 1,
        operation: "+",
        ruleHint: "+2 = +5 - 3.",
        explanation: "3 + 2 = 5.",
        order: 3,
      },
      {
        _id: "67aa00000000000000005004",
        question: "Calculate: +4 + 2 - 1",
        questionType: "numberInput",
        numbers: [4, 2, -1],
        correctAnswer: 5,
        options: [5, 6, 4, 7],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "4 + 2 (+5 - 3) = 6. 6 - 1 = 5.",
        explanation: "4 + 2 - 1 = 5.",
        order: 4,
      },
      {
        _id: "67aa00000000000000005005",
        question: "Calculate: +4 + 1 + 2",
        questionType: "numberInput",
        numbers: [4, 1, 2],
        correctAnswer: 7,
        options: [6, 7, 8, 5],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "+1 = +5 - 4. 4 + 1 = 5. 5 + 2 = 7.",
        explanation: "4 + 1 + 2 = 7.",
        order: 5,
      },
      {
        _id: "67aa00000000000000005006",
        question: "Calculate: +3 + 3 + 2 - 5",
        questionType: "numberInput",
        numbers: [3, 3, 2, -5],
        correctAnswer: 3,
        options: [2, 3, 4, 5],
        difficulty: "hard",
        marks: 1,
        operation: "+",
        ruleHint: "3 + 3 = 6 (+5 - 2). 6 + 2 = 8. 8 - 5 = 3.",
        explanation: "3 + 3 + 2 - 5 = 3.",
        order: 6,
      },
    ],
  },

  // =========================================================================
  // HOMEWORK 6: Linked to Lesson 6 (Small Friend Subtraction -4..-1)
  // =========================================================================
  {
    _id: "67a900000000000000000006",
    homeworkNumber: 6,
    title: "Homework 06: Small Friends Subtraction (-4 to -1)",
    description:
      "Master subtracting from 5 using reverse friend formulas: -4 = -5 + 1, -3 = -5 + 2, -2 = -5 + 3, -1 = -5 + 4.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    topicId: "678900000000000000010002",
    lessonId: "678900000000000001000006",
    lessonNumber: 6,
    recommendedTime: 15,
    dueDateDaysAhead: 7,
    status: "pending",
    questions: [
      {
        _id: "67aa00000000000000006001",
        question: "Calculate: +5 - 4",
        questionType: "numberInput",
        numbers: [5, -4],
        correctAnswer: 1,
        options: [1, 2, 0, 3],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "-4 = -5 + 1 (Index finger pushes 5 up, thumb pushes 1 up).",
        explanation: "5 - 4 = 1.",
        order: 1,
      },
      {
        _id: "67aa00000000000000006002",
        question: "Calculate: +6 - 4",
        questionType: "numberInput",
        numbers: [6, -4],
        correctAnswer: 2,
        options: [1, 2, 3, 4],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "6 - 4: -5 + 1. 6 - 5 + 1 = 2.",
        explanation: "6 - 4 = 2.",
        order: 2,
      },
      {
        _id: "67aa00000000000000006003",
        question: "Calculate: +5 - 3",
        questionType: "numberInput",
        numbers: [5, -3],
        correctAnswer: 2,
        options: [1, 2, 3, 0],
        difficulty: "easy",
        marks: 1,
        operation: "-",
        ruleHint: "-3 = -5 + 2.",
        explanation: "5 - 3 = 2.",
        order: 3,
      },
      {
        _id: "67aa00000000000000006004",
        question: "Calculate: +7 - 3",
        questionType: "numberInput",
        numbers: [7, -3],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "medium",
        marks: 1,
        operation: "-",
        ruleHint: "7 - 3: -5 + 2. 7 - 5 + 2 = 4.",
        explanation: "7 - 3 = 4.",
        order: 4,
      },
      {
        _id: "67aa00000000000000006005",
        question: "Calculate: +5 - 2 + 1",
        questionType: "numberInput",
        numbers: [5, -2, 1],
        correctAnswer: 4,
        options: [3, 4, 5, 2],
        difficulty: "medium",
        marks: 1,
        operation: "+",
        ruleHint: "-2 = -5 + 3. 5 - 2 = 3. 3 + 1 = 4.",
        explanation: "5 - 2 + 1 = 4.",
        order: 5,
      },
      {
        _id: "67aa00000000000000006006",
        question: "Calculate: +5 - 1 + 3",
        questionType: "numberInput",
        numbers: [5, -1, 3],
        correctAnswer: 7,
        options: [6, 7, 8, 5],
        difficulty: "hard",
        marks: 1,
        operation: "+",
        ruleHint: "-1 = -5 + 4. 5 - 1 = 4. 4 + 3 = 7 (+5 - 2).",
        explanation: "5 - 1 + 3 = 7.",
        order: 6,
      },
    ],
  },
];

/**
 * Seeds Homework and HomeworkQuestion collections in MongoDB.
 */
export async function seedHomeworkData() {
  await connectToDatabase();

  const count = await Homework.countDocuments();
  if (count > 0) {
    return {
      message: `Homework catalog already seeded (${count} homework assignments exist).`,
      count,
    };
  }

  // Ensure levels and lessons exist in DB so we can bind accurate ObjectIds
  const dbLevels = await Level.find().lean();
  const dbLessons = await Lesson.find().lean();
  const dbTopics = await Topic.find().lean();

  let createdHomeworkCount = 0;
  let createdQuestionCount = 0;

  for (const hwDef of HOMEWORK_CATALOG) {
    // Match corresponding lesson in DB if possible, or fallback to the seed lessonId
    const matchingLesson = dbLessons.find(
      (l) => l.lessonNumber === hwDef.lessonNumber || l._id.toString() === hwDef.lessonId
    );
    const resolvedLessonId = matchingLesson
      ? matchingLesson._id
      : new mongoose.Types.ObjectId(hwDef.lessonId);

    const resolvedLevelId = matchingLesson
      ? matchingLesson.levelId
      : dbLevels[0]?._id || new mongoose.Types.ObjectId(hwDef.levelId);

    const resolvedTopicId = matchingLesson
      ? matchingLesson.topicId
      : dbTopics[0]?._id || new mongoose.Types.ObjectId(hwDef.topicId);

    const homeworkId = new mongoose.Types.ObjectId(hwDef._id);
    const questionIds: mongoose.Types.ObjectId[] = [];

    // Create questions first
    for (const qDef of hwDef.questions) {
      const questionId = new mongoose.Types.ObjectId(qDef._id);
      questionIds.push(questionId);

      await HomeworkQuestion.findOneAndUpdate(
        { _id: questionId },
        {
          _id: questionId,
          homeworkId,
          question: qDef.question,
          questionType: qDef.questionType,
          options: qDef.options,
          correctAnswer: qDef.correctAnswer,
          numbers: qDef.numbers,
          operation: qDef.operation,
          difficulty: qDef.difficulty,
          marks: qDef.marks,
          ruleHint: qDef.ruleHint || "",
          explanation: qDef.explanation,
          order: qDef.order,
        },
        { upsert: true, new: true }
      );
      createdQuestionCount++;
    }

    // Create Homework assignment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + hwDef.dueDateDaysAhead);

    await Homework.findOneAndUpdate(
      { _id: homeworkId },
      {
        _id: homeworkId,
        title: hwDef.title,
        description: hwDef.description,
        levelId: resolvedLevelId,
        topicId: resolvedTopicId,
        lessonId: resolvedLessonId,
        questionIds,
        recommendedTime: hwDef.recommendedTime,
        dueDate,
        status: hwDef.status,
        homeworkNumber: hwDef.homeworkNumber,
        order: hwDef.homeworkNumber,
      },
      { upsert: true, new: true }
    );
    createdHomeworkCount++;
  }

  return {
    message: `Successfully seeded ${createdHomeworkCount} homework assignments and ${createdQuestionCount} questions.`,
    homeworkCount: createdHomeworkCount,
    questionCount: createdQuestionCount,
  };
}

/**
 * Fallback helpers for memory/offline mode
 */
export function getFallbackHomeworkList() {
  return HOMEWORK_CATALOG.map((hw) => ({
    _id: hw._id,
    id: hw._id,
    homeworkNumber: hw.homeworkNumber,
    title: hw.title,
    description: hw.description,
    levelId: {
      _id: hw.levelId,
      levelName: `Level ${hw.levelOrder}`,
      order: hw.levelOrder,
    },
    topicId: {
      _id: hw.topicId,
      topicName: hw.title.split(": ")[1] || "Practice Topic",
      order: 1,
    },
    lessonId: {
      _id: hw.lessonId,
      title: `Lesson ${hw.lessonNumber}`,
      lessonNumber: hw.lessonNumber,
    },
    questionIds: hw.questions.map((q) => q._id),
    questionCount: hw.questions.length,
    recommendedTime: hw.recommendedTime,
    dueDate: new Date(Date.now() + hw.dueDateDaysAhead * 86400000).toISOString(),
    status: hw.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function getFallbackHomework(hwId: string) {
  const hw = HOMEWORK_CATALOG.find(
    (h) =>
      h._id === hwId ||
      `hw-${h.homeworkNumber.toString().padStart(2, "0")}` === hwId ||
      h.homeworkNumber === Number(hwId)
  );
  if (!hw) return null;

  return {
    _id: hw._id,
    id: hw._id,
    homeworkNumber: hw.homeworkNumber,
    title: hw.title,
    description: hw.description,
    levelId: {
      _id: hw.levelId,
      levelName: `Level ${hw.levelOrder}`,
      order: hw.levelOrder,
    },
    topicId: {
      _id: hw.topicId,
      topicName: hw.title.split(": ")[1] || "Practice Topic",
      order: 1,
    },
    lessonId: {
      _id: hw.lessonId,
      title: `Lesson ${hw.lessonNumber}`,
      lessonNumber: hw.lessonNumber,
    },
    questionIds: hw.questions.map((q) => q._id),
    questions: hw.questions,
    questionCount: hw.questions.length,
    recommendedTime: hw.recommendedTime,
    dueDate: new Date(Date.now() + hw.dueDateDaysAhead * 86400000).toISOString(),
    status: hw.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
