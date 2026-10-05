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

// Initial Curated Mock Homework Data Linked to Lessons & Syllabus
export const INITIAL_HOMEWORK_LIST: HomeworkTask[] = [
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
    dueDate: "14 September",
    assignedDate: "08 September",
    status: "evaluated",
    instructions:
      "Complete the following 10 single-digit addition and subtraction questions using direct finger movements on your unit rod. No formulas needed!",
    recommendedMinutes: 10,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[0], 10),
    score: 9,
    accuracy: 90,
    evaluatedFeedback: "Excellent finger technique! You demonstrated solid direct addition and subtraction skills. Keep up the great pace! 🌟",
    evaluatedStars: 50,
    attemptsCount: 2,
    lastAttemptDate: "09 September",
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
    dueDate: "16 September",
    assignedDate: "10 September",
    status: "evaluated",
    instructions:
      "Practice coordinate finger movement across Tens and Units rods simultaneously. Solve all 10 two-digit problems carefully.",
    recommendedMinutes: 12,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[1], 10),
    score: 8,
    accuracy: 80,
    evaluatedFeedback: "Great work on tens column coordination. Double check your subtractions when zero is left on the unit rod! 👍",
    evaluatedStars: 45,
    attemptsCount: 1,
    lastAttemptDate: "10 September",
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
    relatedLessonTitle: "Lesson 3: Complementary Addition & Small Friends (+5 Rule)",
    questionCount: 10,
    dueDate: "18 September",
    assignedDate: "11 September",
    status: "in-progress",
    instructions:
      "Apply the Small Friend complement formulas (+4=+5-1, +3=+5-2, +2=+5-3, +1=+5-4 and subtractions) when lower beads are full.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[2], 10),
    attemptsCount: 0,
  },
  {
    id: "hw-04",
    homeworkNumber: 4,
    title: "Homework 04: Big Friend Rules (Complements to 10)",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Big Friend Rules (+9..+1, -9..-1)",
    topicId: "l1-big-friends",
    relatedLessonId: "lesson-4",
    relatedLessonTitle: "Lesson 4: Base-10 Carrying & Big Friends Formulas",
    questionCount: 10,
    dueDate: "20 September",
    assignedDate: "11 September",
    status: "pending",
    instructions:
      "Practice carrying and borrowing using complements to 10 (+9=-1+10, +8=-2+10, etc.) across the unit and tens columns.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[3], 10),
    attemptsCount: 0,
  },
  {
    id: "hw-05",
    homeworkNumber: 5,
    title: "Homework 05: 1-Digit 5-Row Continuous Drills",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "1 Digit 5 Row Calculation",
    topicId: "l1-1digit-5row",
    relatedLessonId: "lesson-6",
    relatedLessonTitle: "Lesson 6: Continuous Multi-Row Rhythm & Speed",
    questionCount: 10,
    dueDate: "22 September",
    assignedDate: "11 September",
    status: "pending",
    instructions:
      "Maintain concentration through 5 rows of continuous addition and subtraction without losing your place on the abacus.",
    recommendedMinutes: 12,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[5], 10),
    attemptsCount: 0,
  },
  {
    id: "hw-06",
    homeworkNumber: 6,
    title: "Homework 06: 2-Digit 5-Row Challenge",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "2 Digit 5 Row Calculation",
    topicId: "l2-2digit-5row",
    relatedLessonId: "lesson-8",
    relatedLessonTitle: "Lesson 8: Level 2 Multi-Row Concentration",
    questionCount: 10,
    dueDate: "25 September",
    assignedDate: "11 September",
    status: "pending",
    instructions:
      "Challenge yourself with two-digit numbers across 5 continuous calculation rows. Sync both hands smoothly.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(
      PRACTICE_CATEGORIES.find((c) => c.id === "l2-2digit-5row") || PRACTICE_CATEGORIES[0],
      10
    ),
    attemptsCount: 0,
  },
  {
    id: "hw-07",
    homeworkNumber: 7,
    title: "Homework 07: Small Friends Addition (+4 Rule)",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Small Friends Addition (+4 Rule)",
    topicId: "l1-small-friends",
    relatedLessonId: "lesson-3",
    relatedLessonTitle: "Lesson 3: Complementary Addition & Small Friends (+5 Rule)",
    questionCount: 10,
    dueDate: "28 September",
    assignedDate: "15 September",
    status: "pending",
    instructions:
      "Practice adding 4 using formula +4 = +5 - 1 when lower earth beads are unavailable.",
    recommendedMinutes: 12,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[2], 10),
    attemptsCount: 0,
  },
  {
    id: "hw-08",
    homeworkNumber: 8,
    title: "Homework 08: Small Friends Subtraction (-4 to -1)",
    level: 1,
    levelName: "Level 1 — Foundations",
    topic: "Small Friends Subtraction (-4 to -1)",
    topicId: "l1-small-friends",
    relatedLessonId: "lesson-4",
    relatedLessonTitle: "Lesson 4: Small Friends Subtraction Drills",
    questionCount: 10,
    dueDate: "02 October",
    assignedDate: "18 September",
    status: "pending",
    instructions:
      "Apply reverse complement formulas: -4 = -5 + 1, -3 = -5 + 2, -2 = -5 + 3, -1 = -5 + 4.",
    recommendedMinutes: 14,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[2], 10),
    attemptsCount: 0,
  },
  {
    id: "hw-09",
    homeworkNumber: 9,
    title: "Homework 09: Mixed Combination Formulas",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "Big Friend Rules (+9..+1, -9..-1)",
    topicId: "l1-big-friends",
    relatedLessonId: "lesson-5",
    relatedLessonTitle: "Lesson 5: Base-10 Carrying & Big Friends Formulas",
    questionCount: 10,
    dueDate: "15 October",
    assignedDate: "01 October",
    status: "pending",
    instructions:
      "Master carrying and borrowing across 10 rod combinations with high accuracy.",
    recommendedMinutes: 15,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[3], 10),
    attemptsCount: 0,
  },
  {
    id: "hw-10",
    homeworkNumber: 10,
    title: "Homework 10: Mental Abacus Flash Visualization",
    level: 2,
    levelName: "Level 2 — Explorer",
    topic: "1 Digit 5 Row Calculation",
    topicId: "l1-1digit-5row",
    relatedLessonId: "lesson-7",
    relatedLessonTitle: "Lesson 7: Mental Abacus Imagery (Anzan Basics)",
    questionCount: 10,
    dueDate: "20 October",
    assignedDate: "03 October",
    status: "pending",
    instructions:
      "Perform Anzan mental abacus calculations without touching a physical soroban.",
    recommendedMinutes: 10,
    questions: generateQuestionsForHomework(PRACTICE_CATEGORIES[5], 10),
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
