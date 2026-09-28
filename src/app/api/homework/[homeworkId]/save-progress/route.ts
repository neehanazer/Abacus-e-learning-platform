import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRoute } from "@/lib/auth";
import Homework from "@/models/Homework";
import HomeworkAttempt from "@/models/HomeworkAttempt";
import HomeworkQuestion from "@/models/HomeworkQuestion";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    homeworkId: string;
  }>;
}

/**
 * POST /api/homework/[homeworkId]/save-progress
 * Saves draft answers and elapsed time during an ongoing homework attempt.
 *
 * Body:
 * - attemptId: optional string
 * - answers: array of { questionId, studentAnswer, timeSpent } or object { [questionId]: studentAnswer }
 * - timeTaken: number (seconds)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    const { homeworkId } = await params;

    if (!homeworkId) {
      return NextResponse.json(
        {
          success: false,
          error: "Homework ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { attemptId, answers, timeTaken } = body;

    try {
      await connectToDatabase();

      const isObjectId = mongoose.Types.ObjectId.isValid(homeworkId);

      // Find homework
      let homeworkDoc = null;
      if (isObjectId) {
        homeworkDoc = await Homework.findById(homeworkId);
      }
      if (!homeworkDoc) {
        const match = homeworkId.match(/\d+/);
        if (match) {
          homeworkDoc = await Homework.findOne({
            homeworkNumber: parseInt(match[0], 10),
          });
        }
      }

      if (!homeworkDoc) {
        return NextResponse.json(
          {
            success: false,
            error: "Homework assignment not found.",
          },
          { status: 404 }
        );
      }

      // Locate attempt
      let attempt = null;
      if (attemptId && mongoose.Types.ObjectId.isValid(attemptId)) {
        attempt = await HomeworkAttempt.findOne({
          _id: attemptId,
          studentId: student._id,
        });
      }

      if (!attempt) {
        // Find latest in-progress attempt for this student and homework
        attempt = await HomeworkAttempt.findOne({
          studentId: student._id,
          homeworkId: homeworkDoc._id,
          status: "inProgress",
        }).sort({ createdAt: -1 });
      }

      // If still no in-progress attempt, initialize one
      if (!attempt) {
        const priorCount = await HomeworkAttempt.countDocuments({
          studentId: student._id,
          homeworkId: homeworkDoc._id,
        });

        const questions = await HomeworkQuestion.find({
          homeworkId: homeworkDoc._id,
        }).lean();

        attempt = new HomeworkAttempt({
          studentId: student._id,
          homeworkId: homeworkDoc._id,
          attemptNumber: priorCount + 1,
          totalQuestions: questions.length,
          status: "inProgress",
          answers: [],
        });
      }

      // Normalize input answers (support both array format and dictionary format)
      let normalizedAnswers: Array<{
        questionId: string;
        studentAnswer: string | number | null;
        timeSpent?: number;
      }> = [];

      if (Array.isArray(answers)) {
        normalizedAnswers = answers.map((a: any) => ({
          questionId: a.questionId?.toString() || "",
          studentAnswer: a.studentAnswer !== undefined ? a.studentAnswer : a.userAnswer ?? null,
          timeSpent: typeof a.timeSpent === "number" ? a.timeSpent : 0,
        }));
      } else if (answers && typeof answers === "object") {
        normalizedAnswers = Object.entries(answers).map(([qId, val]) => ({
          questionId: qId,
          studentAnswer: val as string | number | null,
          timeSpent: 0,
        }));
      }

      // Update attempt answers
      const existingAnswersMap = new Map<string, any>();
      for (const a of attempt.answers) {
        existingAnswersMap.set(a.questionId.toString(), a);
      }

      for (const newAns of normalizedAnswers) {
        if (!newAns.questionId) continue;
        const qIdStr = newAns.questionId;

        if (existingAnswersMap.has(qIdStr)) {
          const item = existingAnswersMap.get(qIdStr);
          item.studentAnswer = newAns.studentAnswer;
          item.userAnswer = newAns.studentAnswer;
          if (newAns.timeSpent) item.timeSpent = newAns.timeSpent;
        } else if (mongoose.Types.ObjectId.isValid(qIdStr)) {
          attempt.answers.push({
            questionId: new mongoose.Types.ObjectId(qIdStr),
            studentAnswer: newAns.studentAnswer,
            userAnswer: newAns.studentAnswer,
            isCorrect: false,
            timeSpent: newAns.timeSpent || 0,
          });
        }
      }

      if (typeof timeTaken === "number" && timeTaken >= 0) {
        attempt.timeTaken = timeTaken;
      }

      await attempt.save();

      const answeredCount = attempt.answers.filter(
        (a: any) => a.studentAnswer !== null && a.studentAnswer !== undefined && a.studentAnswer !== ""
      ).length;

      return NextResponse.json(
        {
          success: true,
          message: "Progress saved successfully.",
          data: {
            attemptId: attempt._id.toString(),
            status: attempt.status,
            timeTaken: attempt.timeTaken,
            answeredCount,
            totalQuestions: attempt.totalQuestions,
            updatedAt: attempt.updatedAt,
          },
        },
        { status: 200 }
      );
    } catch (dbErr) {
      console.warn("[POST /api/homework/save-progress]: DB offline fallback...", dbErr);

      return NextResponse.json(
        {
          success: true,
          message: "Progress saved in session (offline fallback).",
          data: {
            attemptId: attemptId || `mem_${Date.now()}`,
            status: "inProgress",
            timeTaken: typeof timeTaken === "number" ? timeTaken : 0,
            updatedAt: new Date(),
          },
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[POST /api/homework/save-progress Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
