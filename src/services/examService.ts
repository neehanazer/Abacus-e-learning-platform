import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Exam, { IExam } from "@/models/Exam";
import ExamQuestion, { IExamQuestion } from "@/models/ExamQuestion";
import ExamAttempt, { IExamAttempt } from "@/models/ExamAttempt";
import ExamAnswer, { IExamAnswer } from "@/models/ExamAnswer";
import ProctoringEvent, {
  IProctoringEvent,
  ProctoringEventType,
  ProctoringSeverity,
} from "@/models/ProctoringEvent";
import { EXAM_CATALOG, SeedExamDef } from "@/lib/examSeedData";
import PerformanceService from "./performanceService";
import CertificateService from "./certificateService";
import {
  IProctoringSummary,
  IExamAnswerItem,
} from "@/types";

export interface StartExamResult {
  attemptId: string;
  attemptNumber: number;
  exam: {
    id: string;
    title: string;
    description: string;
    type: "mock" | "final";
    duration: number; // in minutes
    totalQuestions: number;
    totalMarks: number;
    passingMarks: number;
  };
  startedAt: string;
  questions: {
    id: string;
    questionNumber: number;
    questionText: string;
    numbers?: number[];
    operations?: string[];
    options?: (string | number)[];
    marks: number;
    ruleType?: string;
  }[];
}

export interface SubmitExamPayload {
  attemptId?: string;
  timeTaken: number; // in seconds
  answers: {
    questionId: string;
    userAnswer: string | number | null;
    timeSpent?: number;
  }[];
}

export interface ExamEvaluationResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  examType: "mock" | "final";
  studentId: string;
  score: number;
  totalMarks: number;
  passingMarks: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  timeTaken: number; // seconds
  isPassed: boolean;
  status: "evaluated";
  submittedAt: string;
  proctoringSummary?: IProctoringSummary;
  answers: {
    questionId: string;
    questionText: string;
    userAnswer: string | number | null;
    correctAnswer: string | number;
    isCorrect: boolean;
    marksAwarded: number;
    marksPossible: number;
    timeSpent: number;
    explanation?: string;
    ruleType?: string;
  }[];
  certificate?: any;
}

// In-memory fallback state for offline / disconnected environments (shared across Next.js route chunks via globalThis)
const globalForExam = globalThis as unknown as {
  __exam_inMemoryAttempts?: Map<string, any>;
  __exam_inMemoryAnswers?: Map<string, any[]>;
  __exam_inMemoryProctoringEvents?: Map<string, any[]>;
};

const inMemoryAttempts: Map<string, any> =
  globalForExam.__exam_inMemoryAttempts ||
  (globalForExam.__exam_inMemoryAttempts = new Map());

const inMemoryAnswers: Map<string, any[]> =
  globalForExam.__exam_inMemoryAnswers ||
  (globalForExam.__exam_inMemoryAnswers = new Map());

const inMemoryProctoringEvents: Map<string, any[]> =
  globalForExam.__exam_inMemoryProctoringEvents ||
  (globalForExam.__exam_inMemoryProctoringEvents = new Map());

export class ExamService {
  /**
   * Helper to ensure seed data is available if collection is empty
   */
  private static async ensureCatalogSeeded(): Promise<void> {
    try {
      if (mongoose.connection?.readyState === 1) {
        const mockCount = await Exam.countDocuments({ type: "mock", status: "active" });
        const totalCount = await Exam.countDocuments();
        if (totalCount === 0 || mockCount !== 1) {
          const { seedExams } = await import("@/lib/examSeedData");
          await seedExams();
        }
      }
    } catch {
      // offline fallback
    }
  }

  /**
   * GET /api/exams/mock
   * Retrieves all available mock exams with student attempt status
   */
  static async getMockExams(studentId: string) {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
          ? new mongoose.Types.ObjectId(studentId)
          : null;

        const mockExams = await Exam.find({ type: "mock", status: "active" })
          .populate("levelId", "levelName order")
          .sort({ createdAt: 1 })
          .lean();

        if (mockExams.length > 0) {
          const result = await Promise.all(
            mockExams.map(async (exam: any) => {
              let attemptsCount = 0;
              let bestScore = 0;
              let latestAttempt: any = null;

              if (studentObjectId) {
                const attempts = await ExamAttempt.find({
                  studentId: studentObjectId,
                  examId: exam._id,
                  status: "evaluated",
                })
                  .sort({ submittedAt: -1 })
                  .lean();

                attemptsCount = attempts.length;
                if (attemptsCount > 0) {
                  latestAttempt = attempts[0];
                  bestScore = Math.max(...attempts.map((a: any) => a.score || 0));
                }
              }

              return {
                id: exam._id.toString(),
                title: exam.title,
                description: exam.description || "",
                levelName: exam.levelId?.levelName || "Level 1",
                type: "mock",
                duration: exam.duration,
                totalQuestions: exam.totalQuestions,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                status: exam.status,
                attemptsCount,
                bestScore,
                latestScore: latestAttempt?.score ?? null,
                latestPercentage: latestAttempt?.percentage ?? null,
                isPassed: latestAttempt?.isPassed ?? false,
                lastAttemptDate: latestAttempt?.submittedAt || null,
              };
            })
          );

          return result;
        }
      } catch (err) {
        console.warn("[ExamService]: Failed fetching mock exams from DB:", err);
      }
    }

    // Offline / fallback mock catalog
    return EXAM_CATALOG.filter((e) => e.type === "mock").map((e) => {
      const attempts = Array.from(inMemoryAttempts.values()).filter(
        (a) => a.examId === e._id && a.studentId === studentId && a.status === "evaluated"
      );
      const latest = attempts[attempts.length - 1];
      const best = attempts.reduce((max, a) => Math.max(max, a.score), 0);

      return {
        id: e._id,
        title: e.title,
        description: e.description,
        levelName: "Level 1",
        type: "mock",
        duration: Math.min(e.duration || 10, 10),
        totalQuestions: e.totalQuestions,
        totalMarks: e.totalMarks,
        passingMarks: e.passingMarks,
        status: e.status,
        attemptsCount: attempts.length,
        bestScore: best,
        latestScore: latest?.score ?? null,
        latestPercentage: latest?.percentage ?? null,
        isPassed: latest?.isPassed ?? false,
        lastAttemptDate: latest?.submittedAt || null,
      };
    });
  }

  /**
   * GET /api/exams/[examId]
   * Retrieves exam details. If final, validates readiness requirements.
   */
  static async getExamById(examId: string, studentId: string) {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    let examDoc: any = null;
    let questionsDocs: any[] = [];

    if (mongoose.connection?.readyState === 1 && mongoose.Types.ObjectId.isValid(examId)) {
      try {
        examDoc = await Exam.findById(examId)
          .populate("levelId", "levelName order")
          .lean();

        if (examDoc) {
          questionsDocs = await ExamQuestion.find({ examId: examDoc._id })
            .sort({ questionNumber: 1 })
            .select("-correctAnswer") // don't leak answer
            .lean();
        }
      } catch (err) {
        console.warn("[ExamService]: DB error in getExamById:", err);
      }
    }

    // Fallback if not found in DB
    if (!examDoc) {
      const found = EXAM_CATALOG.find((e) => e._id === examId);
      if (found) {
        examDoc = {
          _id: found._id,
          title: found.title,
          description: found.description,
          levelId: { levelName: "Level 1", order: found.levelOrder },
          type: found.type,
          duration: found.duration,
          totalQuestions: found.totalQuestions,
          totalMarks: found.totalMarks,
          passingMarks: found.passingMarks,
          status: found.status,
        };
        questionsDocs = found.questions.map((q) => ({
          _id: q._id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          numbers: q.numbers,
          operations: q.operations,
          options: q.options,
          marks: q.marks,
          ruleType: q.ruleType,
        }));
      }
    }

    if (!examDoc) {
      throw new Error(`Exam not found with ID: ${examId}`);
    }

    // READINESS CHECK: Final exam access requires meeting readiness requirements
    let readinessInfo: any = null;
    let isLocked = false;
    let lockReason = "";

    if (examDoc.type === "final") {
      const readiness = await PerformanceService.getReadiness(studentId);
      readinessInfo = readiness;

      // Final exam requires at least 70% readiness
      if (readiness.readinessScore < 70) {
        isLocked = true;
        lockReason = `You need a readiness score of at least 70% to unlock the Final Certification Exam. Current readiness: ${readiness.readinessScore}%. Please complete more practice worksheets and homework.`;
      }
    }

    return {
      id: examDoc._id.toString(),
      title: examDoc.title,
      description: examDoc.description || "",
      levelName: examDoc.levelId?.levelName || "Level 1",
      type: examDoc.type as "mock" | "final",
      duration: Math.min(examDoc.duration || 10, 10),
      totalQuestions: examDoc.totalQuestions,
      totalMarks: examDoc.totalMarks,
      passingMarks: examDoc.passingMarks,
      status: examDoc.status,
      isLocked,
      lockReason: isLocked ? lockReason : undefined,
      readiness: readinessInfo,
      questions: isLocked
        ? []
        : questionsDocs.map((q: any) => ({
            id: q._id.toString(),
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            numbers: q.numbers,
            operations: q.operations,
            // options should not be given for exam questions
            marks: q.marks,
            ruleType: q.ruleType,
          })),
    };
  }

  /**
   * POST /api/exams/[examId]/start
   * Starts a new exam attempt and returns the exam paper
   */
  static async startExam(examId: string, studentId: string): Promise<StartExamResult> {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    const examData = await this.getExamById(examId, studentId);

    // Explicit Final Exam Readiness Check
    if (examData.type === "final") {
      const readiness = await PerformanceService.getReadiness(studentId);
      if (readiness.readinessScore < 70) {
        throw new Error(
          `Final Exam locked: Readiness requirements not met. Minimum score required: 70%, Current readiness: ${readiness.readinessScore}%. Please complete prerequisite practice worksheets and homework.`
        );
      }
    }

    if (examData.isLocked) {
      throw new Error(examData.lockReason || "Readiness requirements not met for this Final Exam.");
    }

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;
    const examObjectId = mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : null;

    let attemptNumber = 1;
    let attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date();

    if (mongoose.connection?.readyState === 1 && studentObjectId && examObjectId) {
      try {
        const prevCount = await ExamAttempt.countDocuments({
          studentId: studentObjectId,
          examId: examObjectId,
        });
        attemptNumber = prevCount + 1;

        const newAttempt = await ExamAttempt.create({
          studentId: studentObjectId,
          examId: examObjectId,
          attemptNumber,
          totalQuestions: examData.totalQuestions,
          totalMarks: examData.totalMarks,
          status: "in_progress",
          startedAt,
        });

        attemptId = newAttempt._id.toString();
      } catch (err) {
        console.warn("[ExamService]: Could not persist ExamAttempt to DB, using memory fallback:", err);
      }
    }

    // In-memory fallback cache
    inMemoryAttempts.set(attemptId, {
      id: attemptId,
      studentId,
      examId,
      attemptNumber,
      totalQuestions: examData.totalQuestions,
      totalMarks: examData.totalMarks,
      passingMarks: examData.passingMarks,
      status: "in_progress",
      startedAt,
      answers: [],
    });

    return {
      attemptId,
      attemptNumber,
      exam: {
        id: examData.id,
        title: examData.title,
        description: examData.description,
        type: examData.type,
        duration: examData.duration,
        totalQuestions: examData.totalQuestions,
        totalMarks: examData.totalMarks,
        passingMarks: examData.passingMarks,
      },
      startedAt: startedAt.toISOString(),
      questions: examData.questions,
    };
  }

  /**
   * POST /api/exams/[examId]/submit
   * Evaluates submitted exam answers, stores attempt and each answer, calculates score, percentage, pass/fail
   */
  static async submitExam(
    examId: string,
    studentId: string,
    payload: SubmitExamPayload
  ): Promise<ExamEvaluationResult> {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    // Fetch official questions with correct answers
    let officialQuestions: any[] = [];
    let examDoc: any = null;

    if (mongoose.connection?.readyState === 1 && mongoose.Types.ObjectId.isValid(examId)) {
      try {
        examDoc = await Exam.findById(examId).lean();
        if (examDoc) {
          officialQuestions = await ExamQuestion.find({ examId: examDoc._id })
            .sort({ questionNumber: 1 })
            .lean();
        }
      } catch (err) {
        console.warn("[ExamService]: Failed fetching questions for grading:", err);
      }
    }

    // Fallback catalog questions
    if (officialQuestions.length === 0) {
      const found = EXAM_CATALOG.find((e) => e._id === examId);
      if (found) {
        examDoc = found;
        officialQuestions = found.questions.map((q) => ({
          _id: q._id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          explanation: q.explanation,
          ruleType: q.ruleType,
        }));
      }
    }

    if (!examDoc || officialQuestions.length === 0) {
      throw new Error(`Exam questions not found for examId: ${examId}`);
    }

    const answersMap = new Map<string, { userAnswer: any; timeSpent: number }>();
    for (const ans of payload.answers || []) {
      answersMap.set(ans.questionId.toString(), {
        userAnswer: ans.userAnswer,
        timeSpent: ans.timeSpent || 0,
      });
    }

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredCount = 0;
    const evaluatedAnswers: any[] = [];
    const answerSummariesForAttempt: IExamAnswerItem[] = [];

    const totalMarks = examDoc.totalMarks || 100;
    const passingMarks = examDoc.passingMarks || 60;
    const totalQuestions = officialQuestions.length;

    for (const q of officialQuestions) {
      const qIdStr = q._id.toString();
      const submission = answersMap.get(qIdStr);
      const userAnswer = submission?.userAnswer ?? null;
      const timeSpent = submission?.timeSpent ?? 0;
      const marksPossible = q.marks || Math.round(totalMarks / totalQuestions) || 10;

      let isCorrect = false;
      if (userAnswer !== null && userAnswer !== undefined && userAnswer !== "") {
        const normalizedUser = String(userAnswer).trim().toLowerCase();
        const normalizedCorrect = String(q.correctAnswer).trim().toLowerCase();
        if (normalizedUser === normalizedCorrect) {
          isCorrect = true;
        }
      }

      if (userAnswer === null || userAnswer === undefined || userAnswer === "") {
        unansweredCount++;
      } else if (isCorrect) {
        correctAnswers++;
        score += marksPossible;
      } else {
        incorrectAnswers++;
      }

      const marksAwarded = isCorrect ? marksPossible : 0;

      evaluatedAnswers.push({
        questionId: qIdStr,
        questionText: q.questionText,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded,
        marksPossible,
        timeSpent,
        explanation: q.explanation,
        ruleType: q.ruleType,
      });

      answerSummariesForAttempt.push({
        questionId: qIdStr,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded,
        timeSpent,
      });
    }

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const isPassed = score >= passingMarks;
    const submittedAt = new Date();
    const timeTaken = payload.timeTaken || 0;
    const failedAt = !isPassed ? submittedAt : null;
    const reExamEligibleAt = !isPassed ? new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000) : null;

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;
    const examObjectId = mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : null;

    let attemptId = payload.attemptId || `att_${Date.now()}`;

    // Persist attempt and answers into MongoDB
    if (mongoose.connection?.readyState === 1 && studentObjectId && examObjectId) {
      try {
        let attemptDoc: any = null;
        if (payload.attemptId && mongoose.Types.ObjectId.isValid(payload.attemptId)) {
          attemptDoc = await ExamAttempt.findById(payload.attemptId);
        }

        if (attemptDoc) {
          attemptDoc.score = score;
          attemptDoc.totalMarks = totalMarks;
          attemptDoc.percentage = percentage;
          attemptDoc.totalQuestions = totalQuestions;
          attemptDoc.correctAnswers = correctAnswers;
          attemptDoc.incorrectAnswers = incorrectAnswers;
          attemptDoc.unansweredCount = unansweredCount;
          attemptDoc.timeTaken = timeTaken;
          attemptDoc.isPassed = isPassed;
          attemptDoc.status = "evaluated";
          attemptDoc.submittedAt = submittedAt;
          attemptDoc.failedAt = failedAt;
          attemptDoc.reExamEligibleAt = reExamEligibleAt;
          attemptDoc.answers = answerSummariesForAttempt;
          await attemptDoc.save();
          attemptId = attemptDoc._id.toString();
        } else {
          const created = await ExamAttempt.create({
            studentId: studentObjectId,
            examId: examObjectId,
            score,
            totalMarks,
            percentage,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            unansweredCount,
            timeTaken,
            isPassed,
            status: "evaluated",
            startedAt: new Date(Date.now() - timeTaken * 1000),
            submittedAt,
            failedAt,
            reExamEligibleAt,
            answers: answerSummariesForAttempt,
          });
          attemptId = created._id.toString();
        }

        // Store each answer in ExamAnswer collection
        const attemptObjectId = new mongoose.Types.ObjectId(attemptId);
        const answerDocs = evaluatedAnswers.map((ea) => ({
          examAttemptId: attemptObjectId,
          questionId: new mongoose.Types.ObjectId(ea.questionId),
          studentId: studentObjectId,
          userAnswer: ea.userAnswer,
          correctAnswer: ea.correctAnswer,
          isCorrect: ea.isCorrect,
          marksAwarded: ea.marksAwarded,
          timeSpent: ea.timeSpent,
        }));

        // Upsert answers
        for (const doc of answerDocs) {
          await ExamAnswer.findOneAndUpdate(
            { examAttemptId: doc.examAttemptId, questionId: doc.questionId },
            doc,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      } catch (dbErr) {
        console.warn("[ExamService]: Error saving evaluated attempt to DB:", dbErr);
      }
    }

    // In-memory fallback record
    inMemoryAttempts.set(attemptId, {
      id: attemptId,
      studentId,
      examId,
      score,
      totalMarks,
      percentage,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredCount,
      timeTaken,
      isPassed,
      failedAt,
      reExamEligibleAt,
      status: "evaluated",
      submittedAt,
      answers: answerSummariesForAttempt,
    });
    inMemoryAnswers.set(attemptId, evaluatedAnswers);

    // Certificate auto-creation: ONLY after successful final exam completion
    let certificate = null;
    if (isPassed && (examDoc.type === "final" || (examDoc as any).type === "final")) {
      try {
        certificate = await CertificateService.createCertificateForFinalExam({
          studentId,
          levelId: examDoc.levelId?._id?.toString() || examDoc.levelId?.toString() || "lvl_1",
          examId: examDoc._id?.toString() || examDoc._id || examId,
          score,
          totalMarks,
        });
      } catch (certErr) {
        console.warn("[ExamService]: Failed auto-creating certificate:", certErr);
      }
    }

    // Fetch Proctoring Summary
    const proctoringSummary = await this.getProctoringEvents(attemptId);

    return {
      attemptId,
      examId,
      examTitle: examDoc.title,
      examType: examDoc.type as "mock" | "final",
      studentId,
      score,
      totalMarks,
      passingMarks,
      percentage,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredCount,
      timeTaken,
      isPassed,
      status: "evaluated",
      submittedAt: submittedAt.toISOString(),
      proctoringSummary,
      certificate: certificate || undefined,
      answers: evaluatedAnswers,
    };
  }

  /**
   * GET /api/exams/[examId]/result
   * Retrieves evaluated result for the latest or specific attempt
   */
  static async getExamResult(examId: string, studentId: string, attemptId?: string): Promise<ExamEvaluationResult> {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    let attemptDoc: any = null;
    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;
    const examObjectId = mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : null;

    if (mongoose.connection?.readyState === 1 && studentObjectId && examObjectId) {
      try {
        if (attemptId && mongoose.Types.ObjectId.isValid(attemptId)) {
          attemptDoc = await ExamAttempt.findOne({
            _id: new mongoose.Types.ObjectId(attemptId),
            studentId: studentObjectId,
          })
            .populate("examId", "title type totalMarks passingMarks")
            .lean();
        } else {
          attemptDoc = await ExamAttempt.findOne({
            examId: examObjectId,
            studentId: studentObjectId,
            status: "evaluated",
          })
            .sort({ submittedAt: -1 })
            .populate("examId", "title type totalMarks passingMarks")
            .lean();
        }
      } catch (err) {
        console.warn("[ExamService]: Failed retrieving attempt from DB:", err);
      }
    }

    // Memory fallback
    if (!attemptDoc) {
      if (attemptId && inMemoryAttempts.has(attemptId)) {
        attemptDoc = inMemoryAttempts.get(attemptId);
      } else {
        const matches = Array.from(inMemoryAttempts.values()).filter(
          (a) => a.examId === examId && (a.studentId === studentId || !studentId) && a.status === "evaluated"
        );
        attemptDoc = matches[matches.length - 1];
      }
    }

    if (!attemptDoc) {
      throw new Error(`No evaluated result found for exam: ${examId}`);
    }

    const resolvedAttemptId = attemptDoc._id ? attemptDoc._id.toString() : (attemptDoc.id || attemptId || "");
    const examDef = EXAM_CATALOG.find((e) => e._id === examId);
    const examTitle = attemptDoc.examId?.title || attemptDoc.examTitle || examDef?.title || "Abacus Exam";
    const examType = attemptDoc.examId?.type || attemptDoc.examType || examDef?.type || "mock";
    const totalMarks = attemptDoc.totalMarks || attemptDoc.examId?.totalMarks || examDef?.totalMarks || 100;
    const passingMarks = attemptDoc.examId?.passingMarks || attemptDoc.passingMarks || examDef?.passingMarks || 60;

    // Load question text & details
    const storedAnswers = inMemoryAnswers.get(resolvedAttemptId) || [];
    let formattedAnswers = storedAnswers;

    if (formattedAnswers.length === 0 && attemptDoc.answers) {
      // Reconstitute from attempt answers
      formattedAnswers = attemptDoc.answers.map((a: any) => ({
        questionId: a.questionId?.toString() || "",
        questionText: `Question ${a.questionId}`,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect,
        marksAwarded: a.marksAwarded,
        marksPossible: 10,
        timeSpent: a.timeSpent || 0,
      }));
    }

    const proctoringSummary = await this.getProctoringEvents(resolvedAttemptId);

    return {
      attemptId: resolvedAttemptId,
      examId,
      examTitle,
      examType,
      studentId,
      score: attemptDoc.score,
      totalMarks,
      passingMarks,
      percentage: attemptDoc.percentage,
      totalQuestions: attemptDoc.totalQuestions,
      correctAnswers: attemptDoc.correctAnswers,
      incorrectAnswers: attemptDoc.incorrectAnswers,
      unansweredCount: attemptDoc.unansweredCount || 0,
      timeTaken: attemptDoc.timeTaken || 0,
      isPassed: attemptDoc.isPassed,
      status: "evaluated",
      submittedAt: attemptDoc.submittedAt
        ? new Date(attemptDoc.submittedAt).toISOString()
        : new Date().toISOString(),
      proctoringSummary,
      answers: formattedAnswers,
    };
  }

  /**
   * GET /api/exams/history
   * Retrieves chronological history of student's exam attempts
   */
  static async getExamHistory(studentId: string) {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
          ? new mongoose.Types.ObjectId(studentId)
          : null;

        if (studentObjectId) {
          const attempts = await ExamAttempt.find({
            studentId: studentObjectId,
            status: "evaluated",
          })
            .populate("examId", "title type totalMarks passingMarks")
            .sort({ submittedAt: -1 })
            .lean();

          if (attempts.length > 0) {
            return attempts.map((a: any) => ({
              id: a._id.toString(),
              examId: a.examId?._id?.toString() || a.examId?.toString(),
              examTitle: a.examId?.title || "Abacus Exam",
              examType: a.examId?.type || "mock",
              attemptNumber: a.attemptNumber || 1,
              score: a.score,
              totalMarks: a.totalMarks,
              percentage: a.percentage,
              totalQuestions: a.totalQuestions,
              correctAnswers: a.correctAnswers,
              incorrectAnswers: a.incorrectAnswers,
              timeTaken: a.timeTaken,
              isPassed: a.isPassed,
              submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : null,
            }));
          }
        }
      } catch (err) {
        console.warn("[ExamService]: Failed fetching history from DB:", err);
      }
    }

    // Memory fallback
    const memAttempts = Array.from(inMemoryAttempts.values())
      .filter((a) => (a.studentId === studentId || !studentId || a.studentId === "std_demo_101" || studentId === "std_demo_101") && a.status === "evaluated")
      .map((a) => {
        const examDef = EXAM_CATALOG.find((e) => e._id === a.examId);
        return {
          id: a.id,
          examId: a.examId,
          examTitle: examDef?.title || "Abacus Mock Exam",
          examType: examDef?.type || "mock",
          attemptNumber: a.attemptNumber || 1,
          score: a.score,
          totalMarks: a.totalMarks,
          percentage: a.percentage,
          totalQuestions: a.totalQuestions,
          correctAnswers: a.correctAnswers,
          incorrectAnswers: a.incorrectAnswers,
          timeTaken: a.timeTaken,
          isPassed: a.isPassed,
          submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : new Date().toISOString(),
        };
      });

    return memAttempts.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  /**
   * POST /api/proctoring/events
   * Stores an AI proctoring incident event.
   * IMPORTANT: Does NOT automatically fail the student.
   */
  static async recordProctoringEvent(payload: {
    examAttemptId: string;
    studentId?: string;
    eventType: ProctoringEventType;
    timestamp?: Date | string;
    confidence?: number;
    severity?: ProctoringSeverity;
    description: string;
    metadata?: Record<string, any>;
  }) {
    const {
      examAttemptId,
      studentId,
      eventType,
      timestamp = new Date(),
      confidence = 0.9,
      severity = "medium",
      description,
      metadata = {},
    } = payload;

    const eventDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

    try {
      await connectToDatabase();
    } catch {
      // offline fallback
    }

    let savedId = `proc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (
      mongoose.connection?.readyState === 1 &&
      mongoose.Types.ObjectId.isValid(examAttemptId)
    ) {
      try {
        const studentObjectId =
          studentId && mongoose.Types.ObjectId.isValid(studentId)
            ? new mongoose.Types.ObjectId(studentId)
            : undefined;

        const doc = await ProctoringEvent.create({
          examAttemptId: new mongoose.Types.ObjectId(examAttemptId),
          studentId: studentObjectId,
          eventType,
          timestamp: eventDate,
          confidence,
          severity,
          description,
          metadata,
        });
        savedId = doc._id.toString();
      } catch (err) {
        console.warn("[ExamService]: Failed saving ProctoringEvent to DB:", err);
      }
    }

    // In-memory fallback
    const currentList = inMemoryProctoringEvents.get(examAttemptId) || [];
    const eventObj = {
      _id: savedId,
      id: savedId,
      examAttemptId,
      studentId,
      eventType,
      timestamp: eventDate,
      confidence,
      severity,
      description,
      metadata,
    };
    currentList.push(eventObj);
    inMemoryProctoringEvents.set(examAttemptId, currentList);

    return eventObj;
  }

  /**
   * GET /api/proctoring/[examAttemptId]/events
   * Returns list of proctoring events and summary assessment
   */
  static async getProctoringEvents(examAttemptId: string): Promise<IProctoringSummary> {
    try {
      await connectToDatabase();
    } catch {
      // offline fallback
    }

    let events: any[] = [];

    if (
      mongoose.connection?.readyState === 1 &&
      mongoose.Types.ObjectId.isValid(examAttemptId)
    ) {
      try {
        events = await ProctoringEvent.find({
          examAttemptId: new mongoose.Types.ObjectId(examAttemptId),
        })
          .sort({ timestamp: 1 })
          .lean();
      } catch (err) {
        console.warn("[ExamService]: Failed fetching ProctoringEvents from DB:", err);
      }
    }

    if (events.length === 0 && inMemoryProctoringEvents.has(examAttemptId)) {
      events = inMemoryProctoringEvents.get(examAttemptId) || [];
    }

    let highSeverityCount = 0;
    let mediumSeverityCount = 0;
    let lowSeverityCount = 0;
    let penaltyPoints = 0;

    for (const ev of events) {
      if (ev.severity === "critical" || ev.severity === "high") {
        highSeverityCount++;
        penaltyPoints += 15;
      } else if (ev.severity === "medium") {
        mediumSeverityCount++;
        penaltyPoints += 5;
      } else {
        lowSeverityCount++;
        penaltyPoints += 2;
      }
    }

    const integrityScore = Math.max(0, 100 - penaltyPoints);
    let status: "verified" | "needs_review" | "suspicious" = "verified";

    if (highSeverityCount >= 3 || integrityScore < 60) {
      status = "suspicious";
    } else if (highSeverityCount > 0 || mediumSeverityCount >= 2 || integrityScore < 85) {
      status = "needs_review";
    }

    return {
      totalEvents: events.length,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      integrityScore,
      status,
      events: events.map((ev: any) => ({
        _id: ev._id?.toString() || ev.id,
        examAttemptId: ev.examAttemptId?.toString() || examAttemptId,
        studentId: ev.studentId?.toString(),
        eventType: ev.eventType,
        timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
        confidence: ev.confidence ?? 0.9,
        severity: ev.severity,
        description: ev.description,
        metadata: ev.metadata,
        createdAt: ev.createdAt || ev.timestamp || new Date(),
      })),
    };
  }

  /**
   * GET /api/exams/re-exam-status
   * Checks student eligibility for re-examination under the 24-hour rule.
   * If student fails:
   * - preserve failed attempt
   * - record failure date
   * - allow re-enrollment after 24 hours
   * - preserve complete exam history
   */
  static async getReExamStatus(examId?: string, studentId: string = "std_demo_101") {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;
    const examObjectId = examId && mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : null;

    let dbAttempts: any[] = [];
    if (mongoose.connection?.readyState === 1 && studentObjectId) {
      try {
        const query: any = { studentId: studentObjectId };
        if (examObjectId) {
          query.examId = examObjectId;
        }
        dbAttempts = await ExamAttempt.find(query)
          .populate("examId", "title type duration totalMarks passingMarks")
          .sort({ createdAt: -1 })
          .lean();
      } catch (err) {
        console.warn("[ExamService]: Error retrieving attempts for re-exam status:", err);
      }
    }

    // Merge with in-memory attempts
    const memAttempts = Array.from(inMemoryAttempts.values()).filter((a) => {
      const matchStudent = a.studentId === studentId || !studentId;
      const matchExam = !examId || a.examId === examId;
      return matchStudent && matchExam;
    });

    const combined = [...dbAttempts];
    for (const ma of memAttempts) {
      const exists = combined.some(
        (ca) => (ca._id?.toString() || ca.id) === (ma._id?.toString() || ma.id)
      );
      if (!exists) combined.push(ma);
    }

    // Sort newest first
    combined.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt || a.startedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.createdAt || b.startedAt || 0).getTime();
      return dateB - dateA;
    });

    // Complete history preserved
    const history = combined.map((a: any) => {
      const failureDate =
        a.failedAt || (!a.isPassed && a.status === "evaluated" ? a.submittedAt || a.createdAt : null);
      const COOLDOWN_MS = 24 * 60 * 60 * 1000;
      const eligibleAt = failureDate ? new Date(new Date(failureDate).getTime() + COOLDOWN_MS) : null;

      return {
        attemptId: a._id?.toString() || a.id,
        attemptNumber: a.attemptNumber || 1,
        examId: a.examId?._id?.toString() || a.examId?.toString() || a.examId,
        examTitle: a.examId?.title || a.examTitle || "Abacus Exam",
        score: a.score || 0,
        totalMarks: a.totalMarks || 100,
        percentage: a.percentage || 0,
        isPassed: !!a.isPassed,
        status: a.status,
        failureDate: failureDate ? new Date(failureDate).toISOString() : null,
        reExamEligibleAt: eligibleAt ? eligibleAt.toISOString() : null,
        submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : null,
        timeTaken: a.timeTaken || 0,
      };
    });

    // If specific exam was queried:
    if (examId) {
      if (history.length === 0) {
        return {
          examId,
          studentId,
          hasAttempted: false,
          canReEnroll: true,
          isPassed: false,
          attemptsCount: 0,
          message: "No previous attempts found. Eligible to take exam.",
          history: [],
        };
      }

      // Check if student has already passed
      const passedAttempt = history.find((h) => h.isPassed);
      if (passedAttempt) {
        return {
          examId,
          studentId,
          hasAttempted: true,
          canReEnroll: false,
          isPassed: true,
          attemptsCount: history.length,
          latestScore: passedAttempt.score,
          message: "Exam has already been passed successfully.",
          history,
        };
      }

      // Latest attempt failed
      const latest = history[0];
      const failureDate = latest.failureDate ? new Date(latest.failureDate) : new Date();
      const COOLDOWN_MS = 24 * 60 * 60 * 1000;
      const eligibleAt = new Date(failureDate.getTime() + COOLDOWN_MS);
      const now = Date.now();
      const isEligible = now >= eligibleAt.getTime();
      const diffMs = Math.max(0, eligibleAt.getTime() - now);

      const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secondsRemaining = Math.floor((diffMs % (1000 * 60)) / 1000);

      return {
        examId,
        studentId,
        hasAttempted: true,
        canReEnroll: isEligible,
        isPassed: false,
        attemptsCount: history.length,
        latestAttempt: {
          attemptId: latest.attemptId,
          attemptNumber: latest.attemptNumber,
          score: latest.score,
          percentage: latest.percentage,
          failureDate: failureDate.toISOString(),
        },
        cooldown: {
          cooldownHours: 24,
          isEligible,
          failureDate: failureDate.toISOString(),
          eligibleAt: eligibleAt.toISOString(),
          hoursRemaining,
          minutesRemaining,
          secondsRemaining,
        },
        message: isEligible
          ? "24-hour cooldown period elapsed. You are eligible to re-enroll for re-examination."
          : `Re-examination cooldown active. You can re-enroll after 24 hours (${hoursRemaining}h ${minutesRemaining}m remaining).`,
        history,
      };
    }

    // General overall status across all exams
    return {
      studentId,
      totalAttempts: history.length,
      history,
    };
  }

  /**
   * POST /api/exams/[examId]/re-enroll
   * Re-enrolls a student for a failed exam after the 24-hour cooldown period.
   * - Preserves failed attempt and complete exam history.
   * - Verifies 24-hour cooldown has elapsed.
   * - Creates a new exam attempt with incremented attemptNumber.
   */
  static async reEnrollExam(examId: string, studentId: string = "std_demo_101") {
    try {
      await connectToDatabase();
      await this.ensureCatalogSeeded();
    } catch {
      // offline fallback
    }

    // Check re-exam status & 24-hour rule
    const status: any = await this.getReExamStatus(examId, studentId);

    if (status.hasAttempted && status.isPassed) {
      throw new Error("Student has already passed this exam. Re-enrollment is not required.");
    }

    if (status.hasAttempted && !status.canReEnroll) {
      const rem = status.cooldown || {};
      throw new Error(
        `Re-examination cooldown active. Re-enrollment is only allowed 24 hours after failure. Please wait ${rem.hoursRemaining || 0}h ${rem.minutesRemaining || 0}m.`
      );
    }

    // Fetch exam details and questions
    let examData = await this.getExamById(examId, studentId);
    const newAttemptNumber = (status.attemptsCount || 0) + 1;
    const attemptId = `att_re_${Date.now()}`;
    const startedAt = new Date();

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;
    const examObjectId = mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : null;

    let createdAttemptId = attemptId;

    if (mongoose.connection?.readyState === 1 && studentObjectId && examObjectId) {
      try {
        const newAttempt = await ExamAttempt.create({
          studentId: studentObjectId,
          examId: examObjectId,
          attemptNumber: newAttemptNumber,
          status: "in_progress",
          totalQuestions: examData.totalQuestions,
          totalMarks: examData.totalMarks,
          startedAt,
          answers: [],
        });
        createdAttemptId = newAttempt._id.toString();
      } catch (err) {
        console.warn("[ExamService]: DB error creating re-enroll attempt:", err);
      }
    }

    // In-memory fallback record
    inMemoryAttempts.set(createdAttemptId, {
      id: createdAttemptId,
      studentId,
      examId,
      attemptNumber: newAttemptNumber,
      totalQuestions: examData.totalQuestions,
      totalMarks: examData.totalMarks,
      passingMarks: examData.passingMarks,
      status: "in_progress",
      startedAt,
      answers: [],
    });

    return {
      attemptId: createdAttemptId,
      attemptNumber: newAttemptNumber,
      exam: {
        id: examData.id,
        title: examData.title,
        description: examData.description,
        type: examData.type,
        duration: examData.duration,
        totalQuestions: examData.totalQuestions,
        totalMarks: examData.totalMarks,
        passingMarks: examData.passingMarks,
      },
      startedAt: startedAt.toISOString(),
      questions: examData.questions,
      previousAttemptsCount: status.attemptsCount || 0,
      isReExam: true,
    };
  }
}

export default ExamService;
