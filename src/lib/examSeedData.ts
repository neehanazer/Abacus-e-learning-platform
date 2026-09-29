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
  // EXAM 1: Level 1 Official Practice Mock Exam (Single Unified Mock Exam)
  // =========================================================================
  {
    _id: "67b100000000000000000001",
    title: "Level 1: Official Practice Mock Exam",
    description:
      "Comprehensive timed mock exam testing Direct Calculations, Small Friend Rules, Big Friend Rules, and 1-Digit 5-Row Calculations under realistic timed conditions.",
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
        explanation: "Set 3 directly. Add 1 with thumb (4). Add upper 5 bead directly = 9.",
        ruleType: "Direct Calculation",
      },
      {
        _id: "67b200000000000000001002",
        questionNumber: 2,
        questionText: "Calculate: 14 + 5 - 3",
        numbers: [14, 5, -3],
        operations: ["+", "-"],
        options: [15, 16, 17, 18],
        correctAnswer: 16,
        marks: 10,
        explanation: "Set 14. Add 5 directly on units rod (19). Subtract 3 directly on units rod = 16.",
        ruleType: "Direct Calculation",
      },
      {
        _id: "67b200000000000000001003",
        questionNumber: 3,
        questionText: "Calculate: 4 + 3 - 1",
        numbers: [4, 3, -1],
        operations: ["+", "-"],
        options: [5, 6, 7, 8],
        correctAnswer: 6,
        marks: 10,
        explanation: "Set 4. For +3, apply small friend formula (+5 - 2 = 7). Subtract 1 directly = 6.",
        ruleType: "Small Friend Rule (+3 = +5-2)",
      },
      {
        _id: "67b200000000000000001004",
        questionNumber: 4,
        questionText: "Calculate: 6 - 4 + 2",
        numbers: [6, -4, 2],
        operations: ["-", "+"],
        options: [3, 4, 5, 2],
        correctAnswer: 4,
        marks: 10,
        explanation: "Set 6. For -4, apply small friend formula (-5 + 1 = 2). Add 2 directly = 4.",
        ruleType: "Small Friend Rule (-4 = -5+1)",
      },
      {
        _id: "67b200000000000000001005",
        questionNumber: 5,
        questionText: "Calculate: 8 + 4",
        numbers: [8, 4],
        operations: ["+"],
        options: [11, 12, 13, 10],
        correctAnswer: 12,
        marks: 10,
        explanation: "Set 8. For +4 on units rod, apply big friend formula (+10 - 6): add 1 on tens rod, minus 6 on units rod = 12.",
        ruleType: "Big Friend Rule (+4 = +10-6)",
      },
      {
        _id: "67b200000000000000001006",
        questionNumber: 6,
        questionText: "Calculate: 14 - 7",
        numbers: [14, -7],
        operations: ["-"],
        options: [6, 7, 8, 9],
        correctAnswer: 7,
        marks: 10,
        explanation: "Set 14. For -7, apply big friend formula (-10 + 3): subtract 1 on tens rod, add 3 on units rod = 7.",
        ruleType: "Big Friend Rule (-7 = -10+3)",
      },
      {
        _id: "67b200000000000000001007",
        questionNumber: 7,
        questionText: "Calculate: 4 + 2 + 1 - 5 + 3",
        numbers: [4, 2, 1, -5, 3],
        operations: ["+", "+", "-", "+"],
        options: [4, 5, 6, 7],
        correctAnswer: 5,
        marks: 10,
        explanation: "Row 1: 4 | Row 2: +2 (uses +5-3 = 6) | Row 3: +1 (7) | Row 4: -5 (2) | Row 5: +3 (uses +5-2 = 5). Final answer = 5.",
        ruleType: "1-Digit 5-Row Calculation",
      },
      {
        _id: "67b200000000000000001008",
        questionNumber: 8,
        questionText: "Calculate: 2 + 3 + 4 - 6 + 5",
        numbers: [2, 3, 4, -6, 5],
        operations: ["+", "+", "-", "+"],
        options: [7, 8, 9, 6],
        correctAnswer: 8,
        marks: 10,
        explanation: "Row 1: 2 | Row 2: +3 (uses +5-2 = 5) | Row 3: +4 (9) | Row 4: -6 (3) | Row 5: +5 (8). Final answer = 8.",
        ruleType: "1-Digit 5-Row Calculation",
      },
      {
        _id: "67b200000000000000001009",
        questionNumber: 9,
        questionText: "Calculate: 7 - 4 + 3 - 2 + 5",
        numbers: [7, -4, 3, -2, 5],
        operations: ["-", "+", "-", "+"],
        options: [8, 9, 7, 10],
        correctAnswer: 9,
        marks: 10,
        explanation: "Row 1: 7 | Row 2: -4 (uses -5+1 = 3) | Row 3: +3 (uses +5-2 = 6) | Row 4: -2 (4) | Row 5: +5 (9). Final answer = 9.",
        ruleType: "1-Digit 5-Row Calculation",
      },
      {
        _id: "67b200000000000000001010",
        questionNumber: 10,
        questionText: "Calculate: 9 - 5 + 4 - 3 + 2",
        numbers: [9, -5, 4, -3, 2],
        operations: ["-", "+", "-", "+"],
        options: [6, 7, 8, 5],
        correctAnswer: 7,
        marks: 10,
        explanation: "Row 1: 9 | Row 2: -5 (4) | Row 3: +4 (uses +5-1 = 8) | Row 4: -3 (5) | Row 5: +2 (7). Final answer = 7.",
        ruleType: "1-Digit 5-Row Calculation",
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

  // Clean up obsolete mock exams not in catalog
  const catalogExamIds = EXAM_CATALOG.map((def) => new mongoose.Types.ObjectId(def._id));
  await Exam.deleteMany({ type: "mock", _id: { $nin: catalogExamIds } });
  await ExamQuestion.deleteMany({ examId: { $nin: catalogExamIds } });

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
