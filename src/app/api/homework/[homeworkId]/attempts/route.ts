import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRoute } from "@/lib/auth";
import Homework from "@/models/Homework";
import HomeworkAttempt from "@/models/HomeworkAttempt";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    homeworkId: string;
  }>;
}

/**
 * GET /api/homework/[homeworkId]/attempts
 * Retrieves all attempts made by the authenticated student for the specified homework.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    try {
      await connectToDatabase();

      const isObjectId = mongoose.Types.ObjectId.isValid(homeworkId);

      // Find homework
      let homeworkDoc = null;
      if (isObjectId) {
        homeworkDoc = await Homework.findById(homeworkId).lean();
      }
      if (!homeworkDoc) {
        const match = homeworkId.match(/\d+/);
        if (match) {
          homeworkDoc = await Homework.findOne({
            homeworkNumber: parseInt(match[0], 10),
          }).lean();
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

      // Fetch all attempts by this student for this homework
      const attempts = await HomeworkAttempt.find({
        studentId: student._id,
        homeworkId: homeworkDoc._id,
      })
        .sort({ attemptNumber: -1, createdAt: -1 })
        .lean();

      const totalAttempts = attempts.length;
      const bestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.score ?? 0)) : 0;
      const bestAccuracy =
        totalAttempts > 0 ? Math.max(...attempts.map((a) => a.accuracy ?? 0)) : 0;
      const latestAttempt = totalAttempts > 0 ? attempts[0] : null;

      return NextResponse.json(
        {
          success: true,
          count: totalAttempts,
          data: {
            homeworkId: homeworkDoc._id.toString(),
            homeworkTitle: homeworkDoc.title,
            attempts,
            bestScore,
            bestAccuracy,
            latestAttempt,
          },
          source: "database",
        },
        { status: 200 }
      );
    } catch (dbErr) {
      console.warn("[GET /api/homework/[homeworkId]/attempts]: DB offline fallback...", dbErr);

      return NextResponse.json(
        {
          success: true,
          count: 0,
          data: {
            homeworkId,
            homeworkTitle: `Homework ${homeworkId}`,
            attempts: [],
            bestScore: 0,
            bestAccuracy: 0,
            latestAttempt: null,
          },
          source: "fallback",
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/homework/[homeworkId]/attempts Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
