import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import Lesson from "@/models/Lesson";
import Homework from "@/models/Homework";
import HomeworkQuestion from "@/models/HomeworkQuestion";
import Student from "@/models/Student";
import HomeworkAttempt from "@/models/HomeworkAttempt";
import { INITIAL_HOMEWORK_LIST, HomeworkTask } from "@/data/homeworkData";

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
  recommendedTime: number;
  dueDateDaysAhead: number;
  status: "pending" | "inProgress" | "submitted" | "evaluated";
  questions: SeedHomeworkQuestionDef[];
}

/**
 * HOMEWORK_CATALOG derived directly from the official homework section list
 */
export const HOMEWORK_CATALOG: SeedHomeworkDef[] = INITIAL_HOMEWORK_LIST.map((task) => ({
  _id: `67a900000000000000${task.homeworkNumber.toString().padStart(6, "0")}`,
  homeworkNumber: task.homeworkNumber,
  title: task.title,
  description: task.instructions || task.title,
  levelOrder: task.level || 1,
  levelId: `67890000000000000000000${task.level || 1}`,
  topicId: task.topicId || "678900000000000000010001",
  lessonId: task.relatedLessonId || "678900000000000001000001",
  lessonNumber: task.homeworkNumber,
  recommendedTime: task.recommendedMinutes || 15,
  dueDateDaysAhead: task.level === 1 ? -5 : 10 + task.homeworkNumber * 2,
  status: task.level === 1 || task.homeworkNumber === 8 ? "evaluated" : "pending",
  questions: (task.questions || []).map((q, idx) => ({
    _id: `67aa00000000000000${task.homeworkNumber.toString().padStart(3, "0")}${(idx + 1).toString().padStart(3, "0")}`,
    question: (q as any).prompt || (q as any).question || `Calculate on abacus: ${(q.numbers || []).join(" ")}`,
    questionType: "numberInput",
    numbers: q.numbers || [],
    correctAnswer: (q as any).targetAnswer ?? (q as any).correctAnswer ?? 0,
    options: (q as any).options || [(q as any).targetAnswer ?? (q as any).correctAnswer ?? 0],
    difficulty: (q as any).difficulty || "medium",
    marks: (q as any).marks || 1,
    operation: (q as any).operation || "+",
    ruleHint: q.ruleHint || "",
    explanation: q.explanation || "",
    order: idx + 1,
  })),
}));

/**
 * Seeds Homework and HomeworkQuestion collections directly from the homework section (INITIAL_HOMEWORK_LIST).
 */
export async function seedHomeworkData() {
  await connectToDatabase();

  // Ensure levels, lessons, topics exist in DB so we can bind accurate ObjectIds
  const dbLevels = await Level.find().lean();
  const dbLessons = await Lesson.find().lean();
  const dbTopics = await Topic.find().lean();

  // Remove obsolete/stray homeworks like 'Daily Abacus Practice - Bead Additions'
  await Homework.deleteMany({ title: { $regex: /Daily Abacus Practice/i } });

  let createdHomeworkCount = 0;
  let createdQuestionCount = 0;

  for (const hwTask of INITIAL_HOMEWORK_LIST) {
    const levelOrder = hwTask.level || 1;
    const targetLevelDoc = dbLevels.find((l) => l.order === levelOrder);
    const resolvedLevelId = targetLevelDoc
      ? targetLevelDoc._id
      : new mongoose.Types.ObjectId(`67890000000000000000000${levelOrder}`);

    // Match lesson in DB
    const matchingLesson =
      dbLessons.find((l) => l.lessonNumber === hwTask.homeworkNumber && l.levelId?.toString() === resolvedLevelId.toString()) ||
      dbLessons.find((l) => l.levelId?.toString() === resolvedLevelId.toString());

    const resolvedLessonId = matchingLesson ? matchingLesson._id : resolvedLevelId;

    const matchingTopic = dbTopics.find((t) => t.levelId?.toString() === resolvedLevelId.toString());
    const resolvedTopicId = matchingTopic ? matchingTopic._id : resolvedLevelId;

    // Use consistent ObjectId based on homeworkNumber
    const homeworkHexId = `67a900000000000000${hwTask.homeworkNumber.toString().padStart(6, "0")}`;
    const homeworkObjectId = new mongoose.Types.ObjectId(homeworkHexId);

    const questionIds: mongoose.Types.ObjectId[] = [];

    // Create questions
    const taskQuestions = hwTask.questions || [];
    for (let qIdx = 0; qIdx < taskQuestions.length; qIdx++) {
      const qDef = taskQuestions[qIdx];
      const qOrder = qIdx + 1;
      const qHexId = `67aa00000000000000${hwTask.homeworkNumber.toString().padStart(3, "0")}${qOrder.toString().padStart(3, "0")}`;
      const questionId = new mongoose.Types.ObjectId(qHexId);
      questionIds.push(questionId);

      const targetAns = (qDef as any).targetAnswer ?? (qDef as any).correctAnswer ?? 0;
      const qText = (qDef as any).prompt || (qDef as any).question || `Calculate on abacus: ${(qDef.numbers || []).join(" ")}`;

      await HomeworkQuestion.findOneAndUpdate(
        { _id: questionId },
        {
          _id: questionId,
          homeworkId: homeworkObjectId,
          question: qText,
          questionType: "numberInput",
          options: (qDef as any).options || [targetAns],
          correctAnswer: targetAns,
          numbers: qDef.numbers || [],
          operation: (qDef as any).operation || "+",
          difficulty: (qDef as any).difficulty || "medium",
          marks: (qDef as any).marks || 1,
          ruleHint: qDef.ruleHint || "",
          explanation: qDef.explanation || "",
          order: qOrder,
        },
        { upsert: true, new: true }
      );
      createdQuestionCount++;
    }

    // Determine due date: Level 1 completed in Sep/Oct; Level 2 active
    let dueDate: Date;
    let assignedDate: Date;
    if (levelOrder === 1) {
      assignedDate = new Date(`2026-09-${(10 + hwTask.homeworkNumber * 2).toString().padStart(2, "0")}T00:00:00.000Z`);
      dueDate = new Date(`2026-10-${(1 + hwTask.homeworkNumber * 2).toString().padStart(2, "0")}T23:59:59.000Z`);
    } else {
      assignedDate = new Date("2026-10-05T00:00:00.000Z");
      dueDate = new Date(Date.now() + (hwTask.homeworkNumber * 2 + 5) * 24 * 60 * 60 * 1000);
    }

    await Homework.findOneAndUpdate(
      { homeworkNumber: hwTask.homeworkNumber },
      {
        _id: homeworkObjectId,
        title: hwTask.title,
        description: hwTask.instructions || hwTask.title,
        levelId: resolvedLevelId,
        levelOrder: levelOrder,
        topicId: resolvedTopicId,
        lessonId: resolvedLessonId,
        questionIds,
        recommendedTime: hwTask.recommendedMinutes || 15,
        dueDate,
        assignedDate,
        status: levelOrder === 1 || hwTask.homeworkNumber === 8 ? "evaluated" : "pending",
        homeworkNumber: hwTask.homeworkNumber,
        order: hwTask.homeworkNumber,
      },
      { upsert: true, new: true }
    );
    createdHomeworkCount++;
  }

  // Delete any homework documents beyond catalog
  await Homework.deleteMany({ homeworkNumber: { $gt: INITIAL_HOMEWORK_LIST.length } });

  // Update student evaluated attempts for Neeha Nazer (neehanaz226@gmail.com)
  try {
    const student = await Student.findOne({ email: "neehanaz226@gmail.com" });
    if (student) {
      // Level 1 homeworks (1 to 7) are evaluated
      const l1Homeworks = await Homework.find({ levelOrder: 1 });
      for (const hw of l1Homeworks) {
        await HomeworkAttempt.findOneAndUpdate(
          { studentId: student._id, homeworkId: hw._id },
          {
            studentId: student._id,
            homeworkId: hw._id,
            answers: [],
            attemptNumber: 1,
            score: 10,
            totalQuestions: 10,
            accuracy: 100,
            timeTaken: 300,
            submittedAt: new Date("2026-10-04T10:00:00.000Z"),
            status: "evaluated",
          },
          { upsert: true, new: true }
        );
      }

      // Level 2 Homework 8 is evaluated
      const hw8 = await Homework.findOne({ homeworkNumber: 8 });
      if (hw8) {
        await HomeworkAttempt.findOneAndUpdate(
          { studentId: student._id, homeworkId: hw8._id },
          {
            studentId: student._id,
            homeworkId: hw8._id,
            answers: [],
            attemptNumber: 1,
            score: 9,
            totalQuestions: 10,
            accuracy: 90,
            timeTaken: 360,
            submittedAt: new Date("2026-10-08T15:00:00.000Z"),
            status: "evaluated",
          },
          { upsert: true, new: true }
        );
      }

      // Ensure student profile has completedLevels: [1], currentLevel: 2
      await Student.findByIdAndUpdate(student._id, {
        $addToSet: { completedLevels: 1 },
        $set: {
          currentLevel: 2,
          selectedLevel: "Level 2: Two-Digit Operations & Big Friend Subtraction",
          completedWorksheets: 8,
        },
      });
    }
  } catch (attErr) {
    console.warn("Could not seed student homework attempts:", attErr);
  }

  return {
    message: `Successfully synced ${createdHomeworkCount} homework assignments and ${createdQuestionCount} questions from the homework section directly into database.`,
    homeworkCount: createdHomeworkCount,
    questionCount: createdQuestionCount,
  };
}

/**
 * Fallback helpers for memory/offline mode
 */
export function getFallbackHomeworkList() {
  return INITIAL_HOMEWORK_LIST.map((hw) => ({
    _id: `67a900000000000000${hw.homeworkNumber.toString().padStart(6, "0")}`,
    id: hw.id,
    homeworkNumber: hw.homeworkNumber,
    title: hw.title,
    description: hw.instructions || hw.title,
    levelId: {
      _id: `67890000000000000000000${hw.level}`,
      levelName: hw.levelName,
      order: hw.level,
    },
    topicId: {
      _id: hw.topicId,
      topicName: hw.topic,
      order: 1,
    },
    lessonId: {
      _id: hw.relatedLessonId,
      title: hw.relatedLessonTitle,
      lessonNumber: hw.homeworkNumber,
    },
    questionIds: (hw.questions || []).map((q) => q.id),
    questionCount: (hw.questions || []).length,
    recommendedTime: hw.recommendedMinutes,
    dueDate: hw.dueDate,
    status: hw.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function getFallbackHomework(hwId: string) {
  const hw = INITIAL_HOMEWORK_LIST.find(
    (h) =>
      h.id === hwId ||
      `hw-${h.homeworkNumber.toString().padStart(2, "0")}` === hwId ||
      h.homeworkNumber === Number(hwId)
  );
  if (!hw) return null;

  return {
    _id: `67a900000000000000${hw.homeworkNumber.toString().padStart(6, "0")}`,
    id: hw.id,
    homeworkNumber: hw.homeworkNumber,
    title: hw.title,
    description: hw.instructions || hw.title,
    levelId: {
      _id: `67890000000000000000000${hw.level}`,
      levelName: hw.levelName,
      order: hw.level,
    },
    topicId: {
      _id: hw.topicId,
      topicName: hw.topic,
      order: 1,
    },
    lessonId: {
      _id: hw.relatedLessonId,
      title: hw.relatedLessonTitle,
      lessonNumber: hw.homeworkNumber,
    },
    questionIds: (hw.questions || []).map((q) => q.id),
    questions: hw.questions,
    questionCount: (hw.questions || []).length,
    recommendedTime: hw.recommendedMinutes,
    dueDate: hw.dueDate,
    status: hw.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
