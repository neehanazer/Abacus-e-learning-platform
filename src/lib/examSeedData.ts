import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import Exam, { IExam } from "@/models/Exam";
import ExamQuestion, { IExamQuestion } from "@/models/ExamQuestion";

export interface SeedExamQuestionDef {
  _id: string;
  questionNumber: number;
  questionText: string;
  numbers: number[];
  operations: string[];
  options: number[];
  correctAnswer: number;
  marks: number;
  explanation: string;
  ruleType: string;
}

export interface SeedExamDef {
  _id: string;
  title: string;
  description: string;
  levelOrder: number;
  levelId: string;
  type: "mock" | "final";
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  status: "active" | "inactive" | "draft";
  questions: SeedExamQuestionDef[];
}

export const EXAM_CATALOG: SeedExamDef[] = [
  // =========================================================================
  // EXAM 1: Level 1 Mid-Term Mock Exam
  // =========================================================================
  {
    _id: "67b100000000000000000001",
    title: "Level 1: Mid-Term Mock Exam - Direct Movement & Small Friends",
    description:
      "Practice simulation covering direct bead manipulation and basic small friend formulas (+4, +3, +2, +1). Timed 10-minute simulation with live camera & microphone proctoring.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    type: "mock",
    duration: 10,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 60,
    status: "active",
    questions: [
      {
        _id: "67b200000000000000001001",
        questionNumber: 1,
        questionText: "Calculate: 3 + 1 + 5",
        numbers: [3, 1, 5],
        operations: ["+", "+"],
        options: [8, 9, 7, 10],
        correctAnswer: 9,
        marks: 10,
        explanation: "Set 3 directly. Add 1 with thumb (4). Add upper 5 bead with index (9).",
        ruleType: "Direct Calculation",
      },
      {
        _id: "67b200000000000000001002",
        questionNumber: 2,
        questionText: "Calculate: 2 + 4 + 1",
        numbers: [2, 4, 1],
        operations: ["+", "+"],
        options: [6, 7, 8, 9],
        correctAnswer: 7,
        marks: 10,
        explanation: "Set 2. For +4: use small friend rule (+5 - 1 = 6). Then add 1 with thumb (7).",
        ruleType: "Small Friends Addition (+4)",
      },
      {
        _id: "67b200000000000000001003",
        questionNumber: 3,
        questionText: "Calculate: 8 - 5 + 3",
        numbers: [8, -5, 3],
        operations: ["-", "+"],
        options: [5, 6, 7, 8],
        correctAnswer: 6,
        marks: 10,
        explanation: "Set 8 (pinch 5+3). Minus 5: push upper bead up (3). For +3: small friend (+5 - 2 = 6).",
        ruleType: "Small Friends Addition (+3)",
      },
      {
        _id: "67b200000000000000001004",
        questionNumber: 4,
        questionText: "Calculate: 4 + 2 - 1",
        numbers: [4, 2, -1],
        operations: ["+", "-"],
        options: [5, 6, 4, 7],
        correctAnswer: 5,
        marks: 10,
        explanation: "Set 4. For +2: small friend (+5 - 3 = 6). Direct -1 (5).",
        ruleType: "Small Friends Addition (+2)",
      },
      {
        _id: "67b200000000000000001005",
        questionNumber: 5,
        questionText: "Calculate: 4 + 1 + 2",
        numbers: [4, 1, 2],
        operations: ["+", "+"],
        options: [7, 6, 8, 5],
        correctAnswer: 7,
        marks: 10,
        explanation: "Set 4. For +1: small friend (+5 - 4 = 5). Direct +2 (7).",
        ruleType: "Small Friends Addition (+1)",
      },
      {
        _id: "67b200000000000000001006",
        questionNumber: 6,
        questionText: "Calculate: 5 - 4 + 3",
        numbers: [5, -4, 3],
        operations: ["-", "+"],
        options: [4, 3, 2, 5],
        correctAnswer: 4,
        marks: 10,
        explanation: "Set 5. For -4: small friend subtraction (-5 + 1 = 1). Direct +3 (4).",
        ruleType: "Small Friends Subtraction (-4)",
      },
      {
        _id: "67b200000000000000001007",
        questionNumber: 7,
        questionText: "Calculate: 6 - 3 + 2",
        numbers: [6, -3, 2],
        operations: ["-", "+"],
        options: [4, 5, 6, 3],
        correctAnswer: 5,
        marks: 10,
        explanation: "Set 6. For -3: small friend subtraction (-5 + 2 = 3). Direct +2 (5).",
        ruleType: "Small Friends Subtraction (-3)",
      },
      {
        _id: "67b200000000000000001008",
        questionNumber: 8,
        questionText: "Calculate: 7 - 2 - 2",
        numbers: [7, -2, -2],
        operations: ["-", "-"],
        options: [2, 3, 4, 1],
        correctAnswer: 3,
        marks: 10,
        explanation: "Set 7. Direct -2 (5). For -2 from 5: small friend subtraction (-5 + 3 = 3).",
        ruleType: "Small Friends Subtraction (-2)",
      },
      {
        _id: "67b200000000000000001009",
        questionNumber: 9,
        questionText: "Calculate: 12 + 15 + 2",
        numbers: [12, 15, 2],
        operations: ["+", "+"],
        options: [28, 29, 27, 30],
        correctAnswer: 29,
        marks: 10,
        explanation: "Set 12. Add 15 (tens +1, units +5 = 27). Direct +2 on units rod (29).",
        ruleType: "2-Digit Direct Calculation",
      },
      {
        _id: "67b200000000000000001010",
        questionNumber: 10,
        questionText: "Calculate: 35 + 14 - 8",
        numbers: [35, 14, -8],
        operations: ["+", "-"],
        options: [40, 41, 39, 42],
        correctAnswer: 41,
        marks: 10,
        explanation: "Set 35. Add 14 (tens +1=45, units +4 using +5-1 = 49). Minus 8 (41).",
        ruleType: "Mixed Small Friends & Pinch Movement",
      },
    ],
  },

  // =========================================================================
  // EXAM 2: Level 1 Speed & Accuracy Practice Mock Exam
  // =========================================================================
  {
    _id: "67b100000000000000000002",
    title: "Level 1: Speed & Accuracy Mock Drill",
    description:
      "Rapid-fire 10-minute simulation testing calculation velocity under exam conditions. Designed to evaluate readiness for Level 1 Final Certification.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    type: "mock",
    duration: 10,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 65,
    status: "active",
    questions: [
      {
        _id: "67b200000000000000002001",
        questionNumber: 1,
        questionText: "Calculate: 4 + 3 + 2",
        numbers: [4, 3, 2],
        operations: ["+", "+"],
        options: [8, 9, 10, 7],
        correctAnswer: 9,
        marks: 10,
        explanation: "Set 4. +3 (+5-2 = 7). +2 direct = 9.",
        ruleType: "Small Friends Addition (+3)",
      },
      {
        _id: "67b200000000000000002002",
        questionNumber: 2,
        questionText: "Calculate: 7 - 4 + 1",
        numbers: [7, -4, 1],
        operations: ["-", "+"],
        options: [3, 4, 5, 2],
        correctAnswer: 4,
        marks: 10,
        explanation: "Set 7. -4 (-5+1 = 3). +1 direct = 4.",
        ruleType: "Small Friends Subtraction (-4)",
      },
      {
        _id: "67b200000000000000002003",
        questionNumber: 3,
        questionText: "Calculate: 14 + 23 + 12",
        numbers: [14, 23, 12],
        operations: ["+", "+"],
        options: [47, 49, 48, 50],
        correctAnswer: 49,
        marks: 10,
        explanation: "14 + 23 = 37. 37 + 12 = 49.",
        ruleType: "2-Digit Direct Addition",
      },
      {
        _id: "67b200000000000000002004",
        questionNumber: 4,
        questionText: "Calculate: 50 - 20 + 15",
        numbers: [50, -20, 15],
        operations: ["-", "+"],
        options: [40, 45, 35, 55],
        correctAnswer: 45,
        marks: 10,
        explanation: "50 - 20 (on tens rod: -50 + 30 = 30). 30 + 15 = 45.",
        ruleType: "Tens Rod Small Friends",
      },
      {
        _id: "67b200000000000000002005",
        questionNumber: 5,
        questionText: "Calculate: 9 - 5 + 4 - 3",
        numbers: [9, -5, 4, -3],
        operations: ["-", "+", "-"],
        options: [4, 5, 6, 3],
        correctAnswer: 5,
        marks: 10,
        explanation: "9 - 5 = 4. 4 + 4 (+5-1 = 8). 8 - 3 = 5.",
        ruleType: "Mixed Multi-Step Calculation",
      },
      {
        _id: "67b200000000000000002006",
        questionNumber: 6,
        questionText: "Calculate: 6 + 3 - 4",
        numbers: [6, 3, -4],
        operations: ["+", "-"],
        options: [4, 5, 6, 7],
        correctAnswer: 5,
        marks: 10,
        explanation: "6 + 3 = 9. 9 - 4 = 5.",
        ruleType: "Direct Calculation",
      },
      {
        _id: "67b200000000000000002007",
        questionNumber: 7,
        questionText: "Calculate: 2 + 4 + 3",
        numbers: [2, 4, 3],
        operations: ["+", "+"],
        options: [8, 9, 10, 7],
        correctAnswer: 9,
        marks: 10,
        explanation: "2 + 4 (+5-1 = 6). 6 + 3 = 9.",
        ruleType: "Small Friends Addition (+4)",
      },
      {
        _id: "67b200000000000000002008",
        questionNumber: 8,
        questionText: "Calculate: 8 - 3 - 3",
        numbers: [8, -3, -3],
        operations: ["-", "-"],
        options: [2, 3, 1, 4],
        correctAnswer: 2,
        marks: 10,
        explanation: "8 - 3 = 5. 5 - 3 (-5+2 = 2).",
        ruleType: "Small Friends Subtraction (-3)",
      },
      {
        _id: "67b200000000000000002009",
        questionNumber: 9,
        questionText: "Calculate: 25 + 24 - 13",
        numbers: [25, 24, -13],
        operations: ["+", "-"],
        options: [35, 36, 37, 38],
        correctAnswer: 36,
        marks: 10,
        explanation: "25 + 24 = 49. 49 - 13 = 36.",
        ruleType: "2-Digit Calculation",
      },
      {
        _id: "67b200000000000000002010",
        questionNumber: 10,
        questionText: "Calculate: 11 + 33 + 55",
        numbers: [11, 33, 55],
        operations: ["+", "+"],
        options: [99, 98, 89, 97],
        correctAnswer: 99,
        marks: 10,
        explanation: "11 + 33 = 44. 44 + 55 = 99.",
        ruleType: "Double Digit Direct Addition",
      },
    ],
  },

  // =========================================================================
  // EXAM 3: Level 1 Official Final Certification Exam
  // =========================================================================
  {
    _id: "67b100000000000000000003",
    title: "Level 1: Official Level Certification Final Exam",
    description:
      "Formal Level 1 Certification Exam (10 minutes max). Requires meeting readiness criteria before unlocking. Monitored with live camera & microphone AI proctoring.",
    levelOrder: 1,
    levelId: "678900000000000000000001",
    type: "final",
    duration: 10,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 70,
    status: "active",
    questions: [
      {
        _id: "67b200000000000000003001",
        questionNumber: 1,
        questionText: "Calculate: 3 + 4 + 2",
        numbers: [3, 4, 2],
        operations: ["+", "+"],
        options: [8, 9, 7, 10],
        correctAnswer: 9,
        marks: 10,
        explanation: "3 + 4 (+5-1 = 7). 7 + 2 = 9.",
        ruleType: "Small Friends Addition (+4)",
      },
      {
        _id: "67b200000000000000003002",
        questionNumber: 2,
        questionText: "Calculate: 6 - 2 + 4",
        numbers: [6, -2, 4],
        operations: ["-", "+"],
        options: [7, 8, 9, 6],
        correctAnswer: 8,
        marks: 10,
        explanation: "6 - 2 (-5+3 = 4). 4 + 4 (+5-1 = 8).",
        ruleType: "Small Friends Combination",
      },
      {
        _id: "67b200000000000000003003",
        questionNumber: 3,
        questionText: "Calculate: 15 + 24 - 13",
        numbers: [15, 24, -13],
        operations: ["+", "-"],
        options: [25, 26, 27, 28],
        correctAnswer: 26,
        marks: 10,
        explanation: "15 + 24 = 39. 39 - 13 = 26.",
        ruleType: "2-Digit Calculation",
      },
      {
        _id: "67b200000000000000003004",
        questionNumber: 4,
        questionText: "Calculate: 4 + 1 + 3 - 2",
        numbers: [4, 1, 3, -2],
        operations: ["+", "+", "-"],
        options: [5, 6, 7, 8],
        correctAnswer: 6,
        marks: 10,
        explanation: "4 + 1 (+5-4 = 5). 5 + 3 = 8. 8 - 2 = 6.",
        ruleType: "Small Friends Addition & Subtraction",
      },
      {
        _id: "67b200000000000000003005",
        questionNumber: 5,
        questionText: "Calculate: 33 + 14 + 52",
        numbers: [33, 14, 52],
        operations: ["+", "+"],
        options: [98, 99, 97, 96],
        correctAnswer: 99,
        marks: 10,
        explanation: "33 + 14 = 47. 47 + 52 = 99.",
        ruleType: "Multi-Row 2-Digit Addition",
      },
      {
        _id: "67b200000000000000003006",
        questionNumber: 6,
        questionText: "Calculate: 5 - 3 + 4 - 1",
        numbers: [5, -3, 4, -1],
        operations: ["-", "+", "-"],
        options: [4, 5, 6, 3],
        correctAnswer: 5,
        marks: 10,
        explanation: "5 - 3 (-5+2 = 2). 2 + 4 (+5-1 = 6). 6 - 1 = 5.",
        ruleType: "Small Friends Chain",
      },
      {
        _id: "67b200000000000000003007",
        questionNumber: 7,
        questionText: "Calculate: 48 - 26 + 15",
        numbers: [48, -26, 15],
        operations: ["-", "+"],
        options: [36, 37, 38, 35],
        correctAnswer: 37,
        marks: 10,
        explanation: "48 - 26 = 22. 22 + 15 = 37.",
        ruleType: "2-Digit Addition/Subtraction",
      },
      {
        _id: "67b200000000000000003008",
        questionNumber: 8,
        questionText: "Calculate: 7 - 4 + 3 - 1",
        numbers: [7, -4, 3, -1],
        operations: ["-", "+", "-"],
        options: [4, 5, 6, 3],
        correctAnswer: 5,
        marks: 10,
        explanation: "7 - 4 (-5+1 = 3). 3 + 3 (+5-2 = 6). 6 - 1 = 5.",
        ruleType: "Small Friends Advanced Chain",
      },
      {
        _id: "67b200000000000000003009",
        questionNumber: 9,
        questionText: "Calculate: 21 + 24 - 15",
        numbers: [21, 24, -15],
        operations: ["+", "-"],
        options: [29, 30, 31, 28],
        correctAnswer: 30,
        marks: 10,
        explanation: "21 + 24 = 45. 45 - 15 = 30.",
        ruleType: "Direct & Complement Mixed Calculation",
      },
      {
        _id: "67b200000000000000003010",
        questionNumber: 10,
        questionText: "Calculate: 89 - 54 + 14",
        numbers: [89, -54, 14],
        operations: ["-", "+"],
        options: [48, 49, 50, 47],
        correctAnswer: 49,
        marks: 10,
        explanation: "89 - 54 = 35. 35 + 14 = 49.",
        ruleType: "Comprehensive Level 1 Capstone Problem",
      },
    ],
  },
];

/**
 * Seeds exams and exam questions into MongoDB Atlas
 */
export async function seedExams(): Promise<{ examsCount: number; questionsCount: number }> {
  await connectToDatabase();

  let examsCount = 0;
  let questionsCount = 0;

  for (const def of EXAM_CATALOG) {
    const questionIds: mongoose.Types.ObjectId[] = [];

    for (const q of def.questions) {
      const qDoc = await ExamQuestion.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(q._id) },
        {
          examId: new mongoose.Types.ObjectId(def._id),
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          numbers: q.numbers,
          operations: q.operations,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          explanation: q.explanation,
          ruleType: q.ruleType,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      questionIds.push(qDoc._id);
      questionsCount++;
    }

    await Exam.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(def._id) },
      {
        title: def.title,
        description: def.description,
        levelId: new mongoose.Types.ObjectId(def.levelId),
        type: def.type,
        duration: def.duration,
        totalQuestions: def.totalQuestions,
        totalMarks: def.totalMarks,
        passingMarks: def.passingMarks,
        status: def.status,
        questionIds,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    examsCount++;
  }

  return { examsCount, questionsCount };
}
