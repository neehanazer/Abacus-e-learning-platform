import mongoose from "mongoose";
import {
  Student,
  Level,
  Lesson,
  StudentLessonProgress,
  PracticeAttempt,
  HomeworkAttempt,
  Homework,
  Exam,
  ExamAttempt,
  ProctoringEvent,
  Certificate,
} from "@/models";

export interface DynamicLevelProgressItem {
  levelId: string;
  levelName: string;
  order: number;
  status: "Completed" | "In Progress" | "Not Started";
  startedDate: string | null;
  completionDate: string | null;
  totalLessons: number;
  completedLessons: number;
}

export interface StudentProgressSummary {
  currentLevel: string;
  completedLevels: string[];
  levelProgress: DynamicLevelProgressItem[];
  lessonsCompleted: number;
  videosWatched: number;
  practiceAttempts: number;
  homeworkSummary: {
    assigned: number;
    submitted: number;
    evaluated: number;
    pending: number;
  };
  examSummary: {
    totalAttended: number;
    passed: number;
    failed: number;
  };
}

/**
 * Calculates dynamic level completion and learning metrics for a student
 * using existing MongoDB data (StudentLessonProgress, Lesson, Level, ExamAttempt).
 */
export async function calculateStudentProgress(
  studentId: string | mongoose.Types.ObjectId,
  studentSelectedLevel?: string
): Promise<StudentProgressSummary> {
  const studentObjId =
    typeof studentId === "string" ? new mongoose.Types.ObjectId(studentId) : studentId;

  // 1. Fetch all levels in order
  const levels = await Level.find().sort({ order: 1 }).lean();

  // 2. Fetch all lessons
  const lessons = await Lesson.find({ status: "active" }).lean();

  // 3. Fetch all lesson progress for this student
  const progresses = await StudentLessonProgress.find({
    studentId: studentObjId,
  }).lean();

  // Map lessonId string -> progress
  const progressMap = new Map<string, any>();
  for (const p of progresses) {
    progressMap.set(String(p.lessonId), p);
  }

  // Group lessons by levelId
  const levelLessonsMap = new Map<string, any[]>();
  for (const l of lessons) {
    const lvlIdStr = String(l.levelId);
    if (!levelLessonsMap.has(lvlIdStr)) {
      levelLessonsMap.set(lvlIdStr, []);
    }
    levelLessonsMap.get(lvlIdStr)!.push(l);
  }

  // 4. Also check passed final exams and issued certificates to confirm completion
  const examAttempts = await ExamAttempt.find({
    studentId: studentObjId,
    status: { $in: ["submitted", "evaluated"] },
  })
    .populate("examId", "title levelId type")
    .lean();

  const certificates = await Certificate.find({
    studentId: studentObjId,
    status: { $in: ["issued", "active"] },
  }).lean();

  const completedLevelIds = new Set<string>();
  const completedLevelDates = new Map<string, Date>();

  for (const att of examAttempts) {
    if (att.isPassed && att.examId && (att.examId as any).levelId) {
      const lvlStr = String((att.examId as any).levelId);
      completedLevelIds.add(lvlStr);
      const examDate = att.submittedAt || att.createdAt;
      if (examDate) {
        completedLevelDates.set(lvlStr, new Date(examDate));
      }
    }
  }

  for (const cert of certificates) {
    if (cert.levelId) {
      const lvlStr = String((cert.levelId as any)._id || cert.levelId);
      completedLevelIds.add(lvlStr);
      const cDate = cert.issueDate || cert.createdAt;
      if (cDate && (!completedLevelDates.has(lvlStr) || new Date(cDate) > completedLevelDates.get(lvlStr)!)) {
        completedLevelDates.set(lvlStr, new Date(cDate));
      }
    }
  }

  const levelProgress: DynamicLevelProgressItem[] = [];
  const completedLevelNames: string[] = [];
  let detectedCurrentLevel = "";

  for (const lvl of levels) {
    const lvlIdStr = String(lvl._id);
    const lvlLessons = levelLessonsMap.get(lvlIdStr) || [];
    const totalLessons = lvlLessons.length;

    let completedLessonsCount = 0;
    let startedLessonsCount = 0;
    let earliestStarted: Date | null = null;
    let latestCompleted: Date | null = null;

    for (const l of lvlLessons) {
      const p = progressMap.get(String(l._id));
      if (p) {
        if (p.started || p.videoProgress > 0) {
          startedLessonsCount++;
          const pStart = p.createdAt ? new Date(p.createdAt) : null;
          if (pStart && (!earliestStarted || pStart < earliestStarted)) {
            earliestStarted = pStart;
          }
        }
        if (p.completed) {
          completedLessonsCount++;
          const pComp = p.completedAt ? new Date(p.completedAt) : p.updatedAt ? new Date(p.updatedAt) : null;
          if (pComp && (!latestCompleted || pComp > latestCompleted)) {
            latestCompleted = pComp;
          }
        }
      }
    }

    // Determine completion status
    const isExamPassed = completedLevelIds.has(lvlIdStr);
    const allLessonsDone = totalLessons > 0 && completedLessonsCount >= totalLessons;

    let status: "Completed" | "In Progress" | "Not Started" = "Not Started";
    let finalCompletionDate: string | null = null;
    let finalStartedDate: string | null = earliestStarted ? earliestStarted.toISOString() : null;

    if (allLessonsDone || isExamPassed) {
      status = "Completed";
      completedLevelNames.push(lvl.levelName);
      const compDate = completedLevelDates.get(lvlIdStr) || latestCompleted || new Date();
      finalCompletionDate = compDate.toISOString();
    } else if (startedLessonsCount > 0 || completedLessonsCount > 0) {
      status = "In Progress";
      if (!detectedCurrentLevel) {
        detectedCurrentLevel = lvl.levelName;
      }
    }

    levelProgress.push({
      levelId: lvlIdStr,
      levelName: lvl.levelName,
      order: lvl.order,
      status,
      startedDate: finalStartedDate,
      completionDate: finalCompletionDate,
      totalLessons,
      completedLessons: completedLessonsCount,
    });
  }

  // If no level is in progress, find the next level after the last completed one
  if (!detectedCurrentLevel) {
    const firstNotStarted = levelProgress.find((lp) => lp.status === "Not Started");
    if (firstNotStarted) {
      detectedCurrentLevel = firstNotStarted.levelName;
    } else if (completedLevelNames.length > 0) {
      detectedCurrentLevel = completedLevelNames[completedLevelNames.length - 1];
    } else {
      detectedCurrentLevel = studentSelectedLevel || (levels[0] ? levels[0].levelName : "Level 1");
    }
  }

  // 5. Calculate additional learning metrics
  const lessonsCompleted = progresses.filter((p) => p.completed).length;
  const videosWatched = progresses.filter(
    (p) => p.started || (p.videoProgress && p.videoProgress >= 80)
  ).length;

  const practiceAttempts = await PracticeAttempt.countDocuments({
    studentId: studentObjId,
  });

  // Homework status calculation
  // Automatically ensure homework catalog is seeded if fewer than 10 homework assignments exist
  let hwCount = await Homework.countDocuments();
  if (hwCount < 10) {
    try {
      const { seedHomeworkData } = await import("@/lib/homeworkSeedData");
      await seedHomeworkData();
      hwCount = await Homework.countDocuments();
    } catch {
      // Ignore
    }
  }

  // The total homework count includes all homework assignments in the system:
  // expired, active, pending, submitted, and evaluated.
  const totalHomeworkAssigned = Math.max(hwCount, 10);

  const studentHomeworkAttempts = await HomeworkAttempt.find({
    studentId: studentObjId,
  }).lean();

  const completedHomeworkIdSet = new Set(
    studentHomeworkAttempts
      .filter((a) => a.status === "submitted" || a.status === "evaluated")
      .map((a) => String((a.homeworkId as any)?._id || a.homeworkId))
  );
  let homeworkSubmitted = completedHomeworkIdSet.size;

  const evaluatedHomeworkIdSet = new Set(
    studentHomeworkAttempts
      .filter((a) => a.status === "evaluated")
      .map((a) => String((a.homeworkId as any)?._id || a.homeworkId))
  );
  let homeworkEvaluated = evaluatedHomeworkIdSet.size;

  // Fallback to student profile completedWorksheets if attempts records aren't populated yet
  if (homeworkSubmitted === 0) {
    const studentDoc = await Student.findById(studentObjId).lean();
    if (studentDoc && (studentDoc as any).completedWorksheets > 0) {
      homeworkSubmitted = Math.min((studentDoc as any).completedWorksheets, totalHomeworkAssigned);
      homeworkEvaluated = homeworkSubmitted;
    }
  }

  const homeworkPending = Math.max(0, totalHomeworkAssigned - homeworkSubmitted);

  // Exam summary
  const totalExamsAttended = examAttempts.length;
  const passedExams = examAttempts.filter((a) => a.isPassed).length;
  const failedExams = totalExamsAttended - passedExams;

  return {
    currentLevel: detectedCurrentLevel,
    completedLevels: completedLevelNames,
    levelProgress,
    lessonsCompleted,
    videosWatched,
    practiceAttempts,
    homeworkSummary: {
      assigned: totalHomeworkAssigned,
      submitted: homeworkSubmitted,
      evaluated: homeworkEvaluated,
      pending: homeworkPending,
    },
    examSummary: {
      totalAttended: totalExamsAttended,
      passed: passedExams,
      failed: failedExams,
    },
  };
}

/**
 * Fetches complete exam history for a student with proctoring counts
 */
export async function getStudentExamHistory(
  studentId: string | mongoose.Types.ObjectId
) {
  const studentObjId =
    typeof studentId === "string" ? new mongoose.Types.ObjectId(studentId) : studentId;

  const student = await Student.findById(studentObjId).lean();

  const attempts = await ExamAttempt.find({
    studentId: studentObjId,
  })
    .populate({
      path: "examId",
      populate: {
        path: "levelId",
        select: "levelName order",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const totalAttemptsCount = attempts.length;
  const results = [];
  for (let idx = 0; idx < attempts.length; idx++) {
    const att = attempts[idx];
    const exam: any = att.examId || {};
    const level: any = exam.levelId || {};

    const proctoringCount = await ProctoringEvent.countDocuments({
      examAttemptId: att._id,
    });

    const isComplete = att.status === "submitted" || att.status === "evaluated";

    results.push({
      attemptId: String(att._id),
      studentName: student ? student.name : "Student",
      studentEmail: student ? student.email : "",
      level: level.levelName || "Standard Level",
      levelOrder: level.order || 1,
      examId: exam._id ? String(exam._id) : "",
      examName: exam.title || "Abacus Exam",
      examType: exam.type || "final",
      date: att.submittedAt
        ? new Date(att.submittedAt).toISOString()
        : att.createdAt
        ? new Date(att.createdAt).toISOString()
        : new Date().toISOString(),
      marks: isComplete ? `${att.score}/${att.totalMarks || 100}` : "In Progress",
      score: att.score || 0,
      totalMarks: att.totalMarks || 100,
      percentage: isComplete ? att.percentage || 0 : 0,
      result: isComplete ? (att.isPassed ? "PASS" : "FAIL") : "IN PROGRESS",
      isPassed: Boolean(att.isPassed),
      attempt: att.attemptNumber || 1,
      overallAttempt: totalAttemptsCount - idx,
      status: att.status || "evaluated",
      timeTaken: att.timeTaken || 0,
      proctoringEventsCount: proctoringCount,
    });
  }

  return results;
}
