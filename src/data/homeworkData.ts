import {
  PracticeQuestion,
  generateQuestionForCategory,
  PRACTICE_CATEGORIES,
  PracticeCategoryOption,
} from "./practiceData";

export type HomeworkStatus = "pending" | "in-progress" | "submitted" | "evaluated";

export interface HomeworkTask {
  id: string;
  homeworkNumber: number;
  title: string;
  level: number;
  levelName: string;
  topic: string;
  topicId: string;
  relatedLessonId: string;
  relatedLessonTitle: string;
  questionCount: number;
  dueDate: string;
  assignedDate: string;
  status: HomeworkStatus;
  instructions: string;
  recommendedMinutes: number;
  questions: PracticeQuestion[];
  score?: number;
  accuracy?: number;
  evaluatedFeedback?: string;
  evaluatedStars?: number;
  attemptsCount: number;
  lastAttemptDate?: string;
}

export interface HomeworkAttempt {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  timestamp: number;
  dateFormatted: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  answers: {
    questionId: string;
    questionNumbers: number[];
    correctAnswer: number;
    userAnswer: number | null;
    isCorrect: boolean;
    ruleHint?: string;
  }[];
}

// Generate question set for a specific practice category
export function generateQuestionsForHomework(
  category: PracticeCategoryOption,
  count: number = 10
): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateQuestionForCategory(category, i + 1));
  }
  return questions;
}

// Check if due date is passed
export function isDueDateOver(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  const now = new Date();

  // 1. Direct ISO or standard date parse
  let parsed = new Date(dueDateStr);
  if (!isNaN(parsed.getTime())) {
    if (!dueDateStr.includes("T") && !dueDateStr.includes(":")) {
      parsed.setHours(23, 59, 59, 999);
    }
    return now.getTime() > parsed.getTime();
  }

  // 2. Parse format like "18 September" or "18 September 2026"
  const currentYear = now.getFullYear();
  parsed = new Date(`${dueDateStr} ${currentYear}`);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(23, 59, 59, 999);
    return now.getTime() > parsed.getTime();
  }

  return false;
}

// Check if due date is today
export function isDueDateToday(dueDateStr?: string | Date): boolean {
  if (!dueDateStr) return false;
  const now = new Date();
  const lower = typeof dueDateStr === "string" ? dueDateStr.toLowerCase().trim() : "";
  if (lower === "today") return true;

  let parsed: Date;
  if (dueDateStr instanceof Date) {
    parsed = dueDateStr;
  } else {
    parsed = new Date(dueDateStr);
    if (isNaN(parsed.getTime())) {
      parsed = new Date(`${dueDateStr} ${now.getFullYear()}`);
    }
  }

  if (isNaN(parsed.getTime())) return false;

  return (
    now.getFullYear() === parsed.getFullYear() &&
    now.getMonth() === parsed.getMonth() &&
    now.getDate() === parsed.getDate()
  );
}

const findCategory = (id: string): PracticeCategoryOption =>
  PRACTICE_CATEGORIES.find((c) => c.id === id) || PRACTICE_CATEGORIES[0];

// =========================================================================
// OFFICIAL MULTI-LEVEL HOMEWORK LIST (LEVELS 1 TO 8)
// Level 1: Completed & evaluated (since student was promoted)
// Level 2: Active, pending with future due dates for immediate attendance
// Levels 3-8: Upgraded syllabus homework tasks
// =========================================================================
export const INITIAL_HOMEWORK_LIST: HomeworkTask[] = [
  // ------------------------------------------------------------
  // LEVEL 1 (Foundations — Pending for new students)
  // ------------------------------------------------------------
  {
    id: "hw-01",
    homeworkNumber: 1,
    title: "Homework 01: Direct 1-Digit Calculation",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Simple 1 Digit Calculations (Without Rules)",
    topicId: "l1-simple-1digit",
    relatedLessonId: "lesson-1",
    relatedLessonTitle: "Lesson 1: Introduction & Direct Single-Digit Arithmetic",
    questionCount: 10,
    dueDate: "20 October 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Complete 10 single-digit addition and subtraction questions using direct finger movements.",
    recommendedMinutes: 10,
    questions: generateQuestionsForHomework(findCategory("l1-simple-1digit"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-02",
    homeworkNumber: 2,
    title: "Homework 02: 2-Digit Direct Manipulations",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Simple 2 Digit Calculations (Without Rules)",
    topicId: "l1-simple-2digit",
    relatedLessonId: "lesson-2",
    relatedLessonTitle: "Lesson 2: 2-Digit Bead Counting & Column Alignment",
    questionCount: 10,
    dueDate: "24 October 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Coordinate finger movement across Tens and Units rods simultaneously.",
    recommendedMinutes: 12,
    questions: generateQuestionsForHomework(findCategory("l1-simple-2digit"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-03",
    homeworkNumber: 3,
    title: "Homework 03: Small Friend Rules (+5 & -5)",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Small Friend Rules (+4,+3,+2,+1,-4,-3,-2,-1)",
    topicId: "l1-small-friends",
    relatedLessonId: "lesson-3",
    relatedLessonTitle: "Lesson 3: Complementary Addition & Small Friends",
    questionCount: 10,
    dueDate: "28 October 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Apply Small Friend formulas (+5 complements) when lower beads are full.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l1-small-friends"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-04",
    homeworkNumber: 4,
    title: "Homework 04: Big Friend Rules (Base-10 Carrying)",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Big Friend Rules (+9..+1, -9..-1)",
    topicId: "l1-big-friends",
    relatedLessonId: "lesson-4",
    relatedLessonTitle: "Lesson 4: Base-10 Carrying & Big Friends Formulas",
    questionCount: 10,
    dueDate: "02 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Practice carrying and borrowing using complements to 10 across units and tens.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l1-big-friends"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-05",
    homeworkNumber: 5,
    title: "Homework 05: 1-Digit 3-Row Speed Rhythm",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "1 Digit 3 Row Calculation",
    topicId: "l1-1digit-3row",
    relatedLessonId: "lesson-5",
    relatedLessonTitle: "Lesson 5: 3-Row Continuous Calculations",
    questionCount: 10,
    dueDate: "06 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Maintain fast finger rhythm across 3 rows of single-digit calculations.",
    recommendedMinutes: 10,
    questions: generateQuestionsForHomework(findCategory("l1-1digit-3row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-06",
    homeworkNumber: 6,
    title: "Homework 06: 1-Digit 5-Row Continuous Drills",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "1 Digit 5 Row Calculation",
    topicId: "l1-1digit-5row",
    relatedLessonId: "lesson-6",
    relatedLessonTitle: "Lesson 6: Continuous Multi-Row Rhythm & Speed",
    questionCount: 10,
    dueDate: "10 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "5 continuous rows of addition and subtraction.",
    recommendedMinutes: 12,
    questions: generateQuestionsForHomework(findCategory("l1-1digit-5row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-07",
    homeworkNumber: 7,
    title: "Homework 07: 1-Digit 7-Row Championship Drills",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "1 Digit 7 Row Calculation",
    topicId: "l1-1digit-7row",
    relatedLessonId: "lesson-7",
    relatedLessonTitle: "Lesson 7: Championship 7-Row Climax",
    questionCount: 10,
    dueDate: "14 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Solve 7 continuous rows of addition and subtraction under time limits.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l1-1digit-7row"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 2 (Active & Pending with Future Due Dates)
  // ------------------------------------------------------------
  {
    id: "hw-201",
    homeworkNumber: 8,
    title: "Homework 08: 1-Digit 10-Row Continuous Calculations",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "1 Digit 10 Row Calculation",
    topicId: "l2-1digit-10row",
    relatedLessonId: "lesson-8",
    relatedLessonTitle: "Lesson 8: 10-Row Continuous Multi-Row Rhythm",
    questionCount: 10,
    dueDate: "28 October 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions:
      "Maintain concentration across 10 continuous rows of single-digit addition and subtraction. Focus on steady bead pacing without resetting.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l2-1digit-10row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-202",
    homeworkNumber: 9,
    title: "Homework 09: 1-Digit 12-Row Concentration Drills",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "1 Digit 12 Row Calculation",
    topicId: "l2-1digit-12row",
    relatedLessonId: "lesson-9",
    relatedLessonTitle: "Lesson 9: 12-Row Deep Focus & Speed Drills",
    questionCount: 10,
    dueDate: "05 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions:
      "Push your multi-row stamina to 12 continuous calculations per question. Keep your eyes on the abacus beam.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l2-1digit-12row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-203",
    homeworkNumber: 10,
    title: "Homework 10: 1-Digit 15-Row Endurance Master",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "1 Digit 15 Row Calculation",
    topicId: "l2-1digit-15row",
    relatedLessonId: "lesson-10",
    relatedLessonTitle: "Lesson 10: 15-Row Grand Endurance Mastery",
    questionCount: 10,
    dueDate: "12 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions:
      "Master the supreme 15-row single-digit challenge. Combine Small Friend and Big Friend rules seamlessly.",
    recommendedMinutes: 18,
    questions: generateQuestionsForHomework(findCategory("l2-1digit-15row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-204",
    homeworkNumber: 11,
    title: "Homework 11: 2-Digit 3-Row Column Synchronization",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "2 Digit 3 Row Calculation",
    topicId: "l2-2digit-3row",
    relatedLessonId: "lesson-11",
    relatedLessonTitle: "Lesson 11: 2-Digit Multi-Row Coordination",
    questionCount: 10,
    dueDate: "19 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions:
      "Coordinate tens and units movements across 3 continuous rows of two-digit numbers.",
    recommendedMinutes: 14,
    questions: generateQuestionsForHomework(findCategory("l2-2digit-3row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-205",
    homeworkNumber: 12,
    title: "Homework 12: 2-Digit 5-Row Continuous Beads Flow",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "2 Digit 5 Row Calculation",
    topicId: "l2-2digit-5row",
    relatedLessonId: "lesson-12",
    relatedLessonTitle: "Lesson 12: 2-Digit 5-Row Rapid Calculation",
    questionCount: 10,
    dueDate: "26 November 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions:
      "Solve 5 continuous rows of two-digit numbers. Keep thumb and index fingers coordinated across both columns.",
    recommendedMinutes: 16,
    questions: generateQuestionsForHomework(findCategory("l2-2digit-5row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-206",
    homeworkNumber: 13,
    title: "Homework 13: 2-Digit 8-Row Championship Practice",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "2 Digit 8 Row Calculation",
    topicId: "l2-2digit-8row",
    relatedLessonId: "lesson-13",
    relatedLessonTitle: "Lesson 13: Level 2 Championship 8-Row Drills",
    questionCount: 10,
    dueDate: "03 December 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions:
      "The pinnacle of Level 2! Eight continuous rows of two-digit addition and subtraction. Speed and precision are essential.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l2-2digit-8row"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 3
  // ------------------------------------------------------------
  {
    id: "hw-301",
    homeworkNumber: 14,
    title: "Homework 14: 1-Digit 20-Row Rapid Calculation",
    level: 3,
    levelName: "Level 3 — Intermediate",
    topic: "1 Digit 20 Row Calculation",
    topicId: "l3-1digit-20row",
    relatedLessonId: "lesson-14",
    relatedLessonTitle: "Level 3 Lesson 1: 20-Row Stamina",
    questionCount: 10,
    dueDate: "10 December 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Solve 20 continuous rows of single-digit calculations without stopping.",
    recommendedMinutes: 18,
    questions: generateQuestionsForHomework(findCategory("l3-1digit-20row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-302",
    homeworkNumber: 15,
    title: "Homework 15: 1-Digit 25-Row Grand Endurance",
    level: 3,
    levelName: "Level 3 — Intermediate",
    topic: "1 Digit 25 Row Calculation",
    topicId: "l3-1digit-25row",
    relatedLessonId: "lesson-15",
    relatedLessonTitle: "Level 3 Lesson 2: 25-Row Challenge",
    questionCount: 10,
    dueDate: "17 December 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "25 rows continuous addition and subtraction.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l3-1digit-25row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-303",
    homeworkNumber: 16,
    title: "Homework 16: 2-Digit 10-Row Multi-Column Drills",
    level: 3,
    levelName: "Level 3 — Intermediate",
    topic: "2 Digit 10 Row Calculation",
    topicId: "l3-2digit-10row",
    relatedLessonId: "lesson-16",
    relatedLessonTitle: "Level 3 Lesson 3: 2-Digit 10-Row Mastery",
    questionCount: 10,
    dueDate: "24 December 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "10 rows of 2-digit numbers.",
    recommendedMinutes: 18,
    questions: generateQuestionsForHomework(findCategory("l3-2digit-10row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-304",
    homeworkNumber: 17,
    title: "Homework 17: 2-Digit 12-Row Deep Coordination",
    level: 3,
    levelName: "Level 3 — Intermediate",
    topic: "2 Digit 12 Row Calculation",
    topicId: "l3-2digit-12row",
    relatedLessonId: "lesson-17",
    relatedLessonTitle: "Level 3 Lesson 4: 2-Digit 12-Row Drills",
    questionCount: 10,
    dueDate: "31 December 2026",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "12 rows of 2-digit numbers.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l3-2digit-12row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-305",
    homeworkNumber: 18,
    title: "Homework 18: 3-Digit 3-Row Column Expansion",
    level: 3,
    levelName: "Level 3 — Intermediate",
    topic: "3 Digit 3 Row Calculation",
    topicId: "l3-3digit-3row",
    relatedLessonId: "lesson-18",
    relatedLessonTitle: "Level 3 Lesson 5: 3-Digit Column Positioning",
    questionCount: 10,
    dueDate: "07 January 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "3 rows of 3-digit numbers across Hundreds, Tens, and Units.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l3-3digit-3row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-306",
    homeworkNumber: 19,
    title: "Homework 19: 3-Digit 5-Row Comprehensive Drills",
    level: 3,
    levelName: "Level 3 — Intermediate",
    topic: "3 Digit 5 Row Calculation",
    topicId: "l3-3digit-5row",
    relatedLessonId: "lesson-19",
    relatedLessonTitle: "Level 3 Lesson 6: 3-Digit 5-Row Mastery",
    questionCount: 10,
    dueDate: "14 January 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "5 rows of 3-digit numbers.",
    recommendedMinutes: 18,
    questions: generateQuestionsForHomework(findCategory("l3-3digit-5row"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 4
  // ------------------------------------------------------------
  {
    id: "hw-401",
    homeworkNumber: 20,
    title: "Homework 20: 1-Digit 30-Row Marathon Drills",
    level: 4,
    levelName: "Level 4 — Advanced",
    topic: "1 Digit 30 Row Calculation",
    topicId: "l4-1digit-30row",
    relatedLessonId: "lesson-20",
    relatedLessonTitle: "Level 4 Lesson 1: 30-Row Continuous Endurance",
    questionCount: 10,
    dueDate: "21 January 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Maintain unbroken focus across 30 continuous calculation rows.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l4-1digit-30row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-402",
    homeworkNumber: 21,
    title: "Homework 21: 2-Digit 15-Row Precision Drills",
    level: 4,
    levelName: "Level 4 — Advanced",
    topic: "2 Digit 15 Row Calculation",
    topicId: "l4-2digit-15row",
    relatedLessonId: "lesson-21",
    relatedLessonTitle: "Level 4 Lesson 2: 2-Digit 15-Row Drills",
    questionCount: 10,
    dueDate: "28 January 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "15 rows of two-digit numbers.",
    recommendedMinutes: 18,
    questions: generateQuestionsForHomework(findCategory("l4-2digit-15row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-403",
    homeworkNumber: 22,
    title: "Homework 22: 4-Digit 3-Row Thousands Rod Alignment",
    level: 4,
    levelName: "Level 4 — Advanced",
    topic: "4 Digit 3 Row Calculation",
    topicId: "l4-4digit-3row",
    relatedLessonId: "lesson-22",
    relatedLessonTitle: "Level 4 Lesson 3: 4-Digit Abacus Navigation",
    questionCount: 10,
    dueDate: "04 February 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Work smoothly across Thousands, Hundreds, Tens, and Units rods.",
    recommendedMinutes: 16,
    questions: generateQuestionsForHomework(findCategory("l4-4digit-3row"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-404",
    homeworkNumber: 23,
    title: "Homework 23: 4-Digit 5-Row Mastery",
    level: 4,
    levelName: "Level 4 — Advanced",
    topic: "4 Digit 5 Row Calculation",
    topicId: "l4-4digit-5row",
    relatedLessonId: "lesson-23",
    relatedLessonTitle: "Level 4 Lesson 4: 4-Digit 5-Row Drills",
    questionCount: 10,
    dueDate: "11 February 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "5 rows of four-digit arithmetic.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l4-4digit-5row"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 5
  // ------------------------------------------------------------
  {
    id: "hw-501",
    homeworkNumber: 24,
    title: "Homework 24: Abacus Multiplication (2-Digit × 1-Digit)",
    level: 5,
    levelName: "Level 5 — Senior Expert",
    topic: "Multiplication (2 Digit * 1 Digit)",
    topicId: "l5-mult-2x1",
    relatedLessonId: "lesson-24",
    relatedLessonTitle: "Level 5 Lesson 1: Multiplication on Soroban",
    questionCount: 10,
    dueDate: "18 February 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Place multiplicand and multiplier on separate rods, then accumulate products accurately.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l5-mult-2x1"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-502",
    homeworkNumber: 25,
    title: "Homework 25: 4-Digit 7-Row Grand Calculations",
    level: 5,
    levelName: "Level 5 — Senior Expert",
    topic: "4 Digit 7 Row Calculation",
    topicId: "l5-4digit-7row",
    relatedLessonId: "lesson-25",
    relatedLessonTitle: "Level 5 Lesson 2: 4-Digit Multi-Row Endurance",
    questionCount: 10,
    dueDate: "25 February 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Solve 7 rows of 4-digit numbers with high precision.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l5-4digit-7row"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 6
  // ------------------------------------------------------------
  {
    id: "hw-601",
    homeworkNumber: 26,
    title: "Homework 26: 3-Digit × 1-Digit & 2-Digit × 2-Digit Multiplication",
    level: 6,
    levelName: "Level 6 — Master",
    topic: "Multiplication (3D×1D, 2D×2D)",
    topicId: "l6-mult-2x2",
    relatedLessonId: "lesson-26",
    relatedLessonTitle: "Level 6 Lesson 1: Multi-Digit Multiplication",
    questionCount: 10,
    dueDate: "04 March 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Multiply multi-digit factors using systematic rod indexing.",
    recommendedMinutes: 18,
    questions: generateQuestionsForHomework(findCategory("l6-mult-2x2"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-602",
    homeworkNumber: 27,
    title: "Homework 27: Abacus Division (2-Digit ÷ 1-Digit)",
    level: 6,
    levelName: "Level 6 — Master",
    topic: "Division (2 Digit / 1 Digit)",
    topicId: "l6-div-2x1",
    relatedLessonId: "lesson-27",
    relatedLessonTitle: "Level 6 Lesson 2: Division on the Abacus",
    questionCount: 10,
    dueDate: "11 March 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Practice division quotient placement and subtraction of subtrahends.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(findCategory("l6-div-2x1"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 7
  // ------------------------------------------------------------
  {
    id: "hw-701",
    homeworkNumber: 28,
    title: "Homework 28: Advanced Division (3-Digit ÷ 1-Digit & 2-Digit)",
    level: 7,
    levelName: "Level 7 — Champion",
    topic: "Division (3D÷1D, 3D÷2D)",
    topicId: "l7-div-3x2",
    relatedLessonId: "lesson-28",
    relatedLessonTitle: "Level 7 Lesson 1: Advanced Long Division",
    questionCount: 10,
    dueDate: "18 March 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Divide 3-digit dividends by 2-digit divisors with mental trial quotients.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l7-div-3x2"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-702",
    homeworkNumber: 29,
    title: "Homework 29: 3-Digit × 2-Digit & 3D × 3D Multiplication",
    level: 7,
    levelName: "Level 7 — Champion",
    topic: "Multiplication (3D×2D, 3D×3D)",
    topicId: "l7-mult-3x2",
    relatedLessonId: "lesson-29",
    relatedLessonTitle: "Level 7 Lesson 2: Master Class Multiplications",
    questionCount: 10,
    dueDate: "25 March 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "High-level multi-digit multiplication drills.",
    recommendedMinutes: 20,
    questions: generateQuestionsForHomework(findCategory("l7-mult-3x2"), 10),
    attemptsCount: 0,
  },

  // ------------------------------------------------------------
  // LEVEL 8
  // ------------------------------------------------------------
  {
    id: "hw-801",
    homeworkNumber: 30,
    title: "Homework 30: Flash Anzan Rapid Mental Arithmetic",
    level: 8,
    levelName: "Level 8 — Grand Master",
    topic: "Flash Anzan Mental Calculations",
    topicId: "l8-flash-anzan",
    relatedLessonId: "lesson-30",
    relatedLessonTitle: "Level 8 Lesson 1: Flash Anzan Mastery",
    questionCount: 10,
    dueDate: "01 April 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Perform calculations entirely inside your mind using mental soroban imagery.",
    recommendedMinutes: 10,
    questions: generateQuestionsForHomework(findCategory("l8-flash-anzan"), 10),
    attemptsCount: 0,
  },
  {
    id: "hw-802",
    homeworkNumber: 31,
    title: "Homework 31: Competition Speed Mental Arithmetic",
    level: 8,
    levelName: "Level 8 — Grand Master",
    topic: "Competition Speed Mental",
    topicId: "l8-competition-speed",
    relatedLessonId: "lesson-31",
    relatedLessonTitle: "Level 8 Lesson 2: Grand Master Championship",
    questionCount: 10,
    dueDate: "08 April 2027",
    assignedDate: "05 October 2026",
    status: "pending",
    instructions: "Solve complex arithmetic with lightning mental speed for national competitions.",
    recommendedMinutes: 12,
    questions: generateQuestionsForHomework(findCategory("l8-competition-speed"), 10),
    attemptsCount: 0,
  },
];

// Helper to create new custom homework from practice syllabus
export function createHomeworkFromPractice(
  category: PracticeCategoryOption,
  questionCount: number = 10,
  dueDate: string = "Next Week",
  instructions?: string
): HomeworkTask {
  const newId = `hw-${Date.now()}`;
  const customQuestions = generateQuestionsForHomework(category, questionCount);

  return {
    id: newId,
    homeworkNumber: Math.floor(Math.random() * 90) + 10,
    title: `Homework: ${category.name}`,
    level: category.level,
    levelName: `Level ${category.level} Syllabus`,
    topic: category.name,
    topicId: category.id,
    relatedLessonId: `lesson-${category.level}`,
    relatedLessonTitle: `Level ${category.level} Video Lesson Series`,
    questionCount,
    dueDate,
    assignedDate: "Today",
    status: "pending",
    instructions:
      instructions ||
      `Complete these ${questionCount} questions based on your ${category.name} practice. Remember to visualize the beads!`,
    recommendedMinutes: Math.round(questionCount * 1.5),
    questions: customQuestions,
    attemptsCount: 0,
  };
}
