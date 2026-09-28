import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ examAttemptId: string }>;
}

/**
 * GET /api/proctoring/[examAttemptId]/events
 * Retrieves all logged proctoring anomaly events for an exam attempt,
 * including event breakdown, severity counts, and overall calculated integrity score.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { examAttemptId } = await params;

    const authResult = await authenticateRoute(req);
    // Authentication confirmed

    if (!examAttemptId) {
      return NextResponse.json(
        { success: false, error: "examAttemptId parameter is required" },
        { status: 400 }
      );
    }

    const summary = await ExamService.getProctoringEvents(examAttemptId);

    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/proctoring/[examAttemptId]/events Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
