import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import PracticeAttempt from "@/models/PracticeAttempt";
import PracticeWorksheet from "@/models/PracticeWorksheet";

export const dynamic = "force-dynamic";

/**
 * GET /api/practice/progress
 * Retrieves comprehensive practice statistics for the authenticated student:
 * - score (total score)
 * - accuracy (average accuracy)
 * - best score
 * - latest score
 * - attempt history
 * - worksheets completed
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    let attempts: any[] = [];
    let dataSource = "database";

    try {
      await connectToDatabase();

      // Ensure model is registered for populate
      const _wsModel = PracticeWorksheet;

      attempts = await PracticeAttempt.find({ studentId: student._id })
        .sort({ submittedAt: -1 })
        .populate("worksheetId", "title category ruleType difficulty totalQuestions")
        .lean();
    } catch (dbErr) {
      console.warn("[GET /api/practice/progress]: DB offline, returning empty or fallback progress...");
      dataSource = "memory_fallback";
    }

    const totalAttempts = attempts.length;
    const completedWorksheetIds = new Set<string>();
    let totalScore = 0;
    let totalAccuracySum = 0;
    let bestScore = 0;
    let totalTimeTakenSeconds = 0;

    for (const a of attempts) {
      const wsId = a.worksheetId?._id?.toString() || a.worksheetId?.toString();
      if (wsId) {
        completedWorksheetIds.add(wsId);
      }

      const score = a.score || 0;
      totalScore += score;
      totalAccuracySum += a.accuracy || 0;
      totalTimeTakenSeconds += a.timeTaken || 0;

      if (score > bestScore) {
        bestScore = score;
      }
    }

    const latestAttempt = attempts.length > 0 ? attempts[0] : null;
    const latestScore = latestAttempt ? latestAttempt.score : 0;
    const latestAccuracy = latestAttempt ? latestAttempt.accuracy : 0;
    const averageAccuracy =
      totalAttempts > 0 ? Math.round(totalAccuracySum / totalAttempts) : 0;

    return NextResponse.json(
      {
        success: true,
        source: dataSource,
        data: {
          totalAttempts,
          worksheetsCompleted: completedWorksheetIds.size,
          score: totalScore,
          bestScore,
          latestScore,
          latestAccuracy,
          accuracy: averageAccuracy,
          totalPracticeMinutes: Math.round(totalTimeTakenSeconds / 60),
          attemptHistory: attempts.slice(0, 20).map((a) => ({
            id: a._id,
            worksheetId: a.worksheetId?._id || a.worksheetId,
            worksheetTitle: a.worksheetId?.title || a.worksheetTitle || "Practice Worksheet",
            category: a.worksheetId?.category || "Practice",
            difficulty: a.worksheetId?.difficulty || "medium",
            score: a.score,
            correctAnswers: a.correctAnswers,
            totalQuestions: a.totalQuestions,
            accuracy: a.accuracy,
            attemptNumber: a.attemptNumber,
            timeTaken: a.timeTaken,
            submittedAt: a.submittedAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/practice/progress Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to calculate practice progress";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
