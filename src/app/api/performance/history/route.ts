import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import PerformanceService from "@/services/performanceService";

export const dynamic = "force-dynamic";

/**
 * GET /api/performance/history
 * Retrieves unified chronological attempt history across Practice and Homework:
 * - date of attempt
 * - score & total questions
 * - accuracy & time taken
 * - status (Mastered, Completed, Needs Review)
 * - query param: ?limit=20
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const limitParam = searchParams.get("limit");
    const typeFilter = searchParams.get("type"); // "practice" | "homework"

    const limit = limitParam ? parseInt(limitParam, 10) : 30;
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    let history = await PerformanceService.getHistory(targetStudentId, limit);

    if (typeFilter && ["practice", "homework"].includes(typeFilter)) {
      history = history.filter((h) => h.type === typeFilter);
    }

    return NextResponse.json(
      {
        success: true,
        count: history.length,
        data: history,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/performance/history Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
