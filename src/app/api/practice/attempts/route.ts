import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { authenticateRoute } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import PracticeAttempt from "@/models/PracticeAttempt";
import PracticeWorksheet from "@/models/PracticeWorksheet";
import PracticeQuestion from "@/models/PracticeQuestion";
import Student from "@/models/Student";
import { getFallbackWorksheet, getFallbackQuestions } from "@/lib/practiceSeedData";

export const dynamic = "force-dynamic";

// In-memory attempts store for dev fallback when Atlas IP whitelist is pending
const memoryAttemptsStore: any[] = [];

/**
 * GET /api/practice/attempts
 * Retrieves attempt history for the authenticated student.
 * Optional query parameter: ?worksheetId=...
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    const { searchParams } = new URL(req.url);
    const worksheetId = searchParams.get("worksheetId");

    try {
      await connectToDatabase();

      const query: any = { studentId: student._id };
      if (worksheetId && mongoose.Types.ObjectId.isValid(worksheetId)) {
        query.worksheetId = worksheetId;
      }

      // Ensure model is registered for populate
      const _wsModel = PracticeWorksheet;

      const attempts = await PracticeAttempt.find(query)
        .sort({ submittedAt: -1 })
        .populate("worksheetId", "title category ruleType difficulty totalQuestions")
        .lean();

      return NextResponse.json(
        {
          success: true,
          count: attempts.length,
          data: attempts,
          source: "database",
        },
        { status: 200 }
      );
    } catch (dbErr) {
      console.warn("[GET /api/practice/attempts]: DB offline, serving in-memory attempts...");
    }

    // Memory fallback
    const studentIdStr = student._id.toString();
    let userAttempts = memoryAttemptsStore.filter(
      (a) => a.studentId.toString() === studentIdStr
    );
    if (worksheetId) {
      userAttempts = userAttempts.filter(
        (a) => a.worksheetId.toString() === worksheetId
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: userAttempts.length,
        data: userAttempts,
        source: "memory_fallback",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/practice/attempts Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch practice attempts";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practice/attempts
 * Submits a new practice attempt for a worksheet.
 * Body:
 * {
 *   "worksheetId": string,
 *   "answers": [{ "questionId": string, "userAnswer": number | string, "timeSpent"?: number }],
 *   "timeTaken": number // in seconds
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const { worksheetId, answers, timeTaken } = body;

    if (!worksheetId) {
      return NextResponse.json(
        {
          success: false,
          error: "worksheetId is required.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        {
          success: false,
          error: "answers must be an array of user responses.",
        },
        { status: 400 }
      );
    }

    let questionsList: any[] = [];
    let worksheetTitle = "Abacus Practice Worksheet";

    try {
      await connectToDatabase();

      if (mongoose.Types.ObjectId.isValid(worksheetId)) {
        const wsDoc = await PracticeWorksheet.findById(worksheetId).lean();
        if (wsDoc) {
          worksheetTitle = wsDoc.title;
          questionsList = await PracticeQuestion.find({
            worksheetId: wsDoc._id,
          }).lean();
        }
      }
    } catch {
      // ignore
    }

    // Catalog fallback if not found in DB
    if (questionsList.length === 0) {
      const fallbackWs = getFallbackWorksheet(worksheetId);
      if (fallbackWs) {
        worksheetTitle = fallbackWs.title;
        questionsList = fallbackWs.questions;
      }
    }

    // Build question lookup map
    const questionMap = new Map<string, any>();
    for (const q of questionsList) {
      questionMap.set(q._id.toString(), q);
    }

    let correctAnswersCount = 0;
    let totalScore = 0;
    const processedAnswers: any[] = [];

    for (const userAns of answers) {
      const qId = userAns.questionId?.toString();
      const question = questionMap.get(qId);

      const rawUserAns = userAns.userAnswer;
      const rawCorrectAns = question ? question.correctAnswer : null;

      // Smart equality check (handles numbers and trimmed strings)
      let isCorrect = false;
      if (question && rawUserAns !== null && rawUserAns !== undefined) {
        if (typeof rawCorrectAns === "number") {
          isCorrect = Number(rawUserAns) === Number(rawCorrectAns);
        } else {
          isCorrect =
            String(rawUserAns).trim().toLowerCase() ===
            String(rawCorrectAns).trim().toLowerCase();
        }
      }

      if (isCorrect) {
        correctAnswersCount++;
        totalScore += question?.marks || 1;
      }

      processedAnswers.push({
        questionId: question ? question._id : qId,
        userAnswer: rawUserAns,
        correctAnswer: rawCorrectAns,
        isCorrect,
        timeSpent: userAns.timeSpent || 0,
      });
    }

    const totalQuestions = questionsList.length || answers.length || 1;
    const accuracy = Math.round((correctAnswersCount / totalQuestions) * 100);
    const timeTakenSeconds = Math.max(1, Number(timeTaken) || 0);
    const submittedAt = new Date();

    try {
      await connectToDatabase();

      // Determine attempt number for this student on this worksheet
      const previousAttemptsCount = await PracticeAttempt.countDocuments({
        studentId: student._id,
        worksheetId: new mongoose.Types.ObjectId(worksheetId),
      });

      const attemptDoc = await PracticeAttempt.create({
        studentId: student._id,
        worksheetId: new mongoose.Types.ObjectId(worksheetId),
        answers: processedAnswers,
        score: totalScore,
        correctAnswers: correctAnswersCount,
        totalQuestions,
        accuracy,
        attemptNumber: previousAttemptsCount + 1,
        timeTaken: timeTakenSeconds,
        submittedAt,
      });

      // Update student overall stats in background
      try {
        await Student.findByIdAndUpdate(student._id, {
          $inc: {
            totalPracticeMinutes: Math.round(timeTakenSeconds / 60) || 1,
            completedWorksheets: 1,
          },
        });
      } catch {
        // non-blocking
      }

      return NextResponse.json(
        {
          success: true,
          message: "Practice attempt submitted successfully!",
          data: attemptDoc,
          source: "database",
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn("[POST /api/practice/attempts]: DB offline, saving attempt in memory fallback...");

      // Count in memory
      const previousCount = memoryAttemptsStore.filter(
        (a) =>
          a.studentId.toString() === student._id.toString() &&
          a.worksheetId.toString() === worksheetId
      ).length;

      const memAttempt = {
        _id: new mongoose.Types.ObjectId().toString(),
        studentId: student._id,
        worksheetId,
        worksheetTitle,
        answers: processedAnswers,
        score: totalScore,
        correctAnswers: correctAnswersCount,
        totalQuestions,
        accuracy,
        attemptNumber: previousCount + 1,
        timeTaken: timeTakenSeconds,
        submittedAt,
        createdAt: submittedAt,
      };

      memoryAttemptsStore.unshift(memAttempt);

      return NextResponse.json(
        {
          success: true,
          message: "Practice attempt saved successfully!",
          data: memAttempt,
          source: "memory_fallback",
        },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    console.error("[POST /api/practice/attempts Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to record practice attempt";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
